import { Command } from '@oclif/core';
import Nile, { Instance, NileApi } from '@theniledev/js';

import { ReconciliationPlan } from '../../model/ReconciliationPlan';

import { pulumiS3, PulumiAwsDeployment } from './lib/pulumi';
import { flagDefaults } from './flagDefaults';

export default class Reconcile extends Command {
  static enableJsonFlag = true;
  static description = 'reconcile nile/pulumi deploys';

  static flags = flagDefaults;

  deployment!: PulumiAwsDeployment;
  nile!: NileApi;

  async run(): Promise<unknown> {
    const { flags } = await this.parse(Reconcile);
    const {
      status,
      organizationName,
      entity,
      basePath,
      workspace,
      email,
      password,
      authToken,
    } = flags;

    // nile setup
    this.nile = await Nile({
      basePath,
      workspace,
    }).connect(authToken ?? { email, password });

    if (!organizationName) {
      console.error ("Error: must pass in organizationName");
      process.exit(1);
    }
    let orgID = await this.getOrgIDFromOrgName(organizationName!);
    if (!orgID) {
      console.error ("Error: cannot determine the ID of the organization from the provided name :" + organizationName)
      process.exit(1);
    } else {
      console.log("Organization with name " + organizationName + " exists with id " + orgID)
    }

    // load instances
    const instances = await this.loadNileInstances(
      String(orgID),
      String(entity)
    );

    // pulumi setup
    this.deployment = await PulumiAwsDeployment.create(
      'pulumi-clustify',
      pulumiS3
    );
    const stacks = await this.deployment.loadPulumiStacks();

    // stitch Nile and Pulumi together
    const plan = new ReconciliationPlan(instances, stacks);

    if (status) {
      this.log('Status check only.');
      this.log(
        `Pending destruction: ${plan.destructionIds} (${plan.destructionIds.length})`
      );
      this.log(
        `Pending creation: ${plan.creationIds} (${plan.creationIds.length})`
      );
      return { stacks, instances };
    }

    // load or remove stacks based on Nile
    await this.synchronizeDataPlane(plan);

    // listen to updates from nile and handle stacks accordingly
    await this.listenForNileEvents(
      String(flags.entity),
      this.findLastSeq(Object.values(instances))
    );
  }

  /**
   *  Requests all the instances from a single organization, representing Pulumi stacks
   * @param orgID
   * @param entity
   * @returns Array<Instance> info about Pulumi stacks
   */
  async loadNileInstances(
    orgID: string,
    entity: string
  ): Promise<{ [key: string]: Instance }> {
    const instances = (
      await this.nile.entities.listInstances({
        org: orgID,
        type: entity,
      })
    )
      .filter((value: Instance) => value !== null && value !== undefined)
      .reduce((acc, instance: Instance) => {
        acc[instance.id] = instance;
        return acc;
      }, {} as { [key: string]: Instance });
    this.debug('Nile Instances', instances);
    return instances;
  }

  /**
   *
   * @param instances Array<Instance> info about Pulumi stacks
   * @returns the max value of `seq`, which is the most recent Instance
   */
  private findLastSeq(instances: Instance[]): number {
    return instances
      .map((value: Instance) => value?.seq || 0)
      .reduce((prev: number, curr: number) => {
        return Math.max(prev, curr || 0);
      }, 0);
  }

  /**
   * Parses the reconciliation plan between Nile and Pulumi, to create or destroy stacks based on Nile as the source of truth
   * @param plan ReconciliationPlan
   */
  private async synchronizeDataPlane(plan: ReconciliationPlan) {
    this.debug('Synchronizing data and control planes...');
    this.debug(plan);

    // destroy any stacks that should not exist
    for (const id of plan.destructionIds) {
      await this.deployment.destroyStack(id);
    }

    // create any stacks that should exist
    for (const spec of plan.creationSpecs) {
      await this.deployment.createStack(spec);
    }
  }

  /**
   * listens for Nile emitting events and destroys or creates Pulumi stacks accordingly
   * @param entityType Entity to listen for events
   * @param fromSeq the starting point to begin listening for events (0 is from the beginning of time)
   */
  private async listenForNileEvents(entityType: string, fromSeq: number) {
    this.log(
      `Listening for events for ${entityType} entities from sequence #${fromSeq}`
    );
    await new Promise(() => {
      this.nile.events.on({ type: entityType, seq: fromSeq }, async (e) => {
        this.log(JSON.stringify(e, null, 2));
        if (e.after) {
          const out = await (e.after.deleted
            ? this.deployment.destroyStack(e.after.id)
            : this.deployment.createStack(e.after));

          this.debug('Event Received', out);
        }
      });
    });
  }

  /**
   * looks up the organization ID from the organization name
   * @param orgName name of organization to lookup
   * @returns orgID ID of organization; or null if name not found
   */
  private async getOrgIDFromOrgName(
    orgName: String): Promise< string | null > {
    this.log(
      `Looking up the organization ID from the organization name ${orgName}`
    );

    // Check if organization exists
    var myOrgs = await this.nile.organizations.listOrganizations()
    var maybeOrg = myOrgs.find( org => org.name == orgName)
    if (maybeOrg) {
      return maybeOrg.id
    } else {
      return null
    }
  }

}
