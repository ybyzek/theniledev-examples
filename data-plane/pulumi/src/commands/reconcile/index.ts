import { Command } from '@oclif/core';
import Nile, { Instance, NileApi } from '@theniledev/js';

import { ReconciliationPlan } from '../../model/ReconciliationPlan';

import { pulumiS3, pulumiDB, PulumiAwsDeployment } from './lib/pulumi';

import { flagDefaults } from './flagDefaults';

var emoji = require('node-emoji');

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

    if (!entity) {
      console.error ("Error: must pass in entity");
      process.exit(1);
    }

    // nile setup
    this.nile = await Nile({
      basePath,
      workspace,
    }).connect(authToken ?? { email, password });
    console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile`);

    if (!organizationName) {
      console.error ("Error: must pass in organizationName");
      process.exit(1);
    }
    let orgID = await this.getOrgIDFromOrgName(organizationName!);
    if (!orgID) {
      console.error ("Error: cannot determine the ID of the organization from the provided name: " + organizationName)
      process.exit(1);
    } else {
      console.log(emoji.get('dart'), "Organization with name " + organizationName + " exists with id " + orgID)
    }

    // load instances
    const instances = await this.loadNileInstances(
      String(orgID),
      String(entity)
    );

    // pulumi setup
    // For example purpose only: branch on mode S3 (default) or DB
    let mode = process.env.NILE_RECONCILER_MODE || "S3";
    console.log(emoji.get('dart'), `Running in mode ${mode}`);
    if (mode === "DB") {
       this.deployment = await PulumiAwsDeployment.create(
         'pulumi-clustify',
         pulumiDB
       );
     } else {
       this.deployment = await PulumiAwsDeployment.create(
         'pulumi-clustify',
         pulumiS3
       );
    }
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
    await this.synchronizeDataPlane(orgID, entity, plan);

    // listen to updates from nile and handle stacks accordingly
    await this.listenForNileEvents(
      orgID,
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
  private async synchronizeDataPlane(orgID: string, entityType: string, plan: ReconciliationPlan) {
    this.debug('Synchronizing data and control planes...');
    this.debug(plan);

    // destroy any stacks that should not exist
    for (const id of plan.destructionIds) {
      await this.deployment.destroyStack(id);
    }

    // create any stacks that should exist
    for (const spec of plan.creationSpecs) {
      if (await this.isChangeActionable(orgID, entityType, spec.id, "Submitted")) {
        await this.createAndUpdate(orgID, entityType, spec);
      }
    }
  }

  /**
   * listens for Nile emitting events and destroys or creates Pulumi stacks accordingly
   * @param entityType Entity to listen for events
   * @param fromSeq the starting point to begin listening for events (0 is from the beginning of time)
   */
  private async listenForNileEvents(orgID: string, entityType: string, fromSeq: number) {
    this.log(
      `Listening for events for ${entityType} entities in ${orgID} from sequence #${fromSeq}`
    );
    await new Promise(() => {
      this.nile.events.on({ type: entityType, seq: fromSeq }, async (e) => {
        //this.log(JSON.stringify(e, null, 2));
        if (e.after) {
          console.log("\n");
          console.log(emoji.get('bell'), `Received an event for instance ${e.after.id}!`);
          if (e.after.deleted) {
            // Detected delete instance
            if (await this.isChangeActionable(orgID, entityType, e.after.id, "Deleted")) {
              this.deployment.destroyStack(e.after.id);
              await this.updateInstance(orgID, entityType, e.after.id, "Deleted", "N/A")
            }
          } else {
            // Detected create instance
            if (await this.isChangeActionable(orgID, entityType, e.after.id, "Submitted")) {
              await this.createAndUpdate(orgID, entityType, e.after);
            }
          }
        }
      });
    });
  }

  private async createAndUpdate(orgID: string, entityType: string, instance: Instance) {
    console.log(emoji.get('white_check_mark'), `Creating new stack for Nile instance ${instance.id}`);

    await this.updateInstance(orgID, entityType, instance.id, "Provisioning", "-");

    var createResult = await this.deployment.createStack(instance);
    var endpoint;
    try {
      endpoint = createResult.outputs.endpoint.value;
    } catch {
      const { setDataPlaneReturnProp } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
      if (setDataPlaneReturnProp != null) {
        const { getDataPlaneReturnValue } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
        endpoint = getDataPlaneReturnValue();
      } else {
        endpoint = "Unknown";
      }
    }
    console.log(`DB endpoint: ${endpoint}`);

    await this.updateInstance(orgID, entityType, instance.id, "Up", endpoint);
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


  /**
   * Check metadata change before taking action
   * @param ID name of organization to lookup
   * @param entity type
   * @param instance ID
   * @param statusToActOn value
   * @returns boolean of change detected that data plane should act on
   */
  private async isChangeActionable(
    orgID: string, entityType: string, instanceID: string, statusToActOn: string): Promise< boolean > {

    let change = false;

    // Get current instance properties
    var properties;
    const body1 = {
      org: orgID,
      type: entityType,
      id: instanceID,
    };
    await this.nile.entities
      .getInstance(body1)
      .then((data) => {
        properties = data.properties as { [key: string]: unknown };

        // Compare the status
        if (properties.status == statusToActOn) {
          change = true;
        }

      }).catch((error:any) => {
            console.error(error);
            process.exit(1);
          });

    if (change) {
      console.log(emoji.get('white_check_mark'), `Event analyzed for instance ${instanceID}: change is actionable`);
    } else {
      console.log(emoji.get('x'), `Event analyzed for instance ${instanceID}: change is not actionable`);
    }

    return change;
  }


  /**
   * update a property in the instance
   * @param ID name of organization to lookup
   * @param entity type
   * @param instance ID
   * @param status properties field
   */
  private async updateInstance(
    orgID: string, entityType: string, instanceID: string, status: string, connection: string): Promise< null > {
    //this.log(
     // `Updating Instance ${instanceID}: status=${status}, connection=${connection}`
    //);

    // Get current instance properties
    var properties;
    const body1 = {
      org: orgID,
      type: entityType,
      id: instanceID,
    };
    await this.nile.entities
      .getInstance(body1)
      .then((data) => {
        properties = data.properties as { [key: string]: unknown };

        // For these examples always assume a status field
        properties.status = status;

        if (entityType == "DB") {
          properties.connection = connection;
        } else {
          // Check if there other fields to update in the Control Plane
          const { setDataPlaneReturnProp } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
          if (setDataPlaneReturnProp != null) {
            const { getDataPlaneReturnValue } = require(`../../../../../usecases/${entityType}/init/entity_utils.js`);
            properties[setDataPlaneReturnProp] = getDataPlaneReturnValue();
          }
       }

      }).catch((error:any) => {
            console.error(error);
            process.exit(1);
          });

    if (!properties) {
      console.error (`Error getting properties from current instance ${instanceID}`);
      process.exit(1);
    }
    // Update the instance with the new properties
    const body = {
      org: orgID,
      type: entityType,
      id: instanceID,
      updateInstanceRequest: {
        properties: properties
      },
    };
    await this.nile.entities
      .updateInstance(body)
      .then((data) => {
        console.log(emoji.get('white_check_mark'), `Updated Instance ${instanceID}: status=${status}, connection=${connection}`);
      }).catch((error:any) => {
            console.error(error);
            process.exit(1);
          });

    return null;
  }

}
