import Nile from "@theniledev/js";

var nileUtils = require('../../utils-module-js/').nileUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_DEVELOPER_EMAIL",
  "NILE_DEVELOPER_PASSWORD",
  "NILE_ENTITY_NAME",
]
envParams.forEach( (key: string) => {
  if (!process.env[key]) {
    console.error(emoji.get('x'), `Error: missing environment variable ${ key }. See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }
});

const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
const NILE_DEVELOPER_EMAIL = process.env.NILE_DEVELOPER_EMAIL!;
const NILE_DEVELOPER_PASSWORD = process.env.NILE_DEVELOPER_PASSWORD!;
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME!;

const fs = require('fs');
const EntityDefinition = JSON.parse(fs.readFileSync(`../usecases/${NILE_ENTITY_NAME}/entity_definition.json`));

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

async function getInstances(
  tenantEmail: string,
  orgName: string
): Promise<{ [key: string]: string }> {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as tenant ${tenantEmail}`)

  // Login tenant
  await nileUtils.loginAsUser(nile, tenantEmail, "password");

  let createIfNot = false;
  let orgID = await nileUtils.maybeCreateOrg (nile, orgName, false);
  if (!orgID) {
    return [];
  }

  // List instances of the service
  const instances = (
    await nile.entities.listInstances({
      org: orgID,
      type: NILE_ENTITY_NAME,
    })
  )
    .filter((value: Instance) => value !== null && value !== undefined)
    .reduce((acc, instance: Instance) => {
      acc[instance.id] = instance;
      return acc;
    }, {} as { [key: string]: Instance });
  //console.log('Nile Instances: ', instances);

  return Object.keys(instances).filter(
      (key: string) => key !== null && key !== undefined
  );
}

async function addTenant(
  tenantEmail: string,
  orgName: string
) {

  console.log(`Logging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}, to add ${tenantEmail} to ${orgName}`);

  await nileUtils.loginAsDev(nile, NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD);

  // Get orgID
  let createIfNot = false;
  let orgID = await nileUtils.maybeCreateOrg (nile, orgName, false);
  if (orgID) {
    console.log(emoji.get('white_check_mark'), "Org " + orgName + " exists in org id " + orgID);
  } else {
    console.error(emoji.get('x'), `Error: organization ${orgName} for tenant ${tenantEmail} should have already been configured`);
    process.exit(1);
  }
  //console.log("orgID is: " + orgID);

  // Add user to organization
  await nileUtils.maybeAddUserToOrg(nile, tenantEmail, orgID);

}

function getDifference<T>(a: T[], b: T[]): T[] {
  return a.filter((element) => {
    return !b.includes(element);
  });
}

async function run() {

  const users = require(`../../usecases/${NILE_ENTITY_NAME}/init/users.json`);
  const NILE_ORGANIZATION_NAME1 = users[0].org;
  const NILE_ORGANIZATION_NAME2 = users[1].org;
  const NILE_TENANT1_EMAIL = users[0].email;
  const NILE_TENANT2_EMAIL = users[1].email;
  const NILE_TENANT_PASSWORD = users[0].password;

  // Get instances for NILE_TENANT1_EMAIL
  const instances2a = await getInstances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  // Add tenant1 to tenant2's organization
  console.log(`\nAdding ${NILE_TENANT1_EMAIL} to ${NILE_ORGANIZATION_NAME2}\n`);
  await addTenant(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  // Get instances for NILE_TENANT1_EMAIL
  const instances2b = await getInstances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  // Get instances for NILE_TENANT2_EMAIL
  const instances2c = await getInstances(NILE_TENANT2_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  console.log(`\n-->BEFORE ${NILE_TENANT1_EMAIL} in ${NILE_ORGANIZATION_NAME2} could read:   ${instances2a}`);
  console.log(`-->AFTER  ${NILE_TENANT1_EMAIL} in ${NILE_ORGANIZATION_NAME2} can now read: ${instances2b}`);
  console.log(`-->Compare ${NILE_TENANT2_EMAIL} in ${NILE_ORGANIZATION_NAME2} can read:    ${instances2c}`, "\n");

  if (instances2b == undefined || instances2c == undefined) {
    console.error(emoji.get('x'), `Error in setup, need to troubleshoot.`);
    process.exit(1)
  }
  const diff = getDifference(instances2b, instances2c);
  if (diff != "") {
    console.error(emoji.get('x'), `Error: ${NILE_TENANT1_EMAIL} should see the same instances as ${NILE_TENANT2_EMAIL} in ${NILE_ORGANIZATION_NAME2} after being added to that org`);
    console.log("Diff: " + diff);
    process.exit(1)
  } else {
    console.log(emoji.get('white_check_mark'), `No difference between instances seen by ${NILE_TENANT1_EMAIL} and ${NILE_TENANT2_EMAIL}`);
  }

  // Note: at this time there is no interface to delete a user from an organization

}

run();
