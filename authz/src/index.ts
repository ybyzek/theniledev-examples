import Nile from '@theniledev/js';

var exampleUtils = require('../../utils-module-js/').exampleUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
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
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME!;

const fs = require('fs');
const EntityDefinition = JSON.parse(fs.readFileSync(`../usecases/${NILE_ENTITY_NAME}/entity_definition.json`));

const users = require(`../../usecases/${NILE_ENTITY_NAME}/init/users.json`);
// Load first user only
const index=0
const NILE_TENANT1_EMAIL = users[index].email;
const NILE_TENANT_PASSWORD = users[index].password;
const NILE_ORGANIZATION_NAME = users[index].org;

var nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

console.log(`export NILE_URL=${NILE_URL}`);
console.log(`export NILE_WORKSPACE=${NILE_WORKSPACE}`);


async function testTenant(orgID : string, expectProd : boolean = true) {

  nile = await exampleUtils.loginAsUser(nile, NILE_TENANT1_EMAIL, NILE_TENANT_PASSWORD);

  // List instances of the service
  await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  }).then((instances) => {
    console.log(`\n--> TENANT: list of allowed instances (expectProd is ${expectProd}):`, instances);
    if (!expectProd) {
      for (let i=0; i<instances.length; i++) {
        if (instances[i].properties.environment == "prod") {
          console.error(emoji.get('x'), `Error: Tenant should not see ${NILE_ENTITY_NAME} instances where environment is 'prod'`);
          process.exit(1);
        }
      }
    }
    if (instances.length == 0) {
      console.error(emoji.get('x'), `Error: Tenant should see more than 0 ${NILE_ENTITY_NAME} instances`);
      process.exit(1);
    }
  }).catch((error: any) => {
      console.error(emoji.get('x'), `Error while calling listInstances for orgID ${orgID} as tenant ${NILE_TENANT1_EMAIL}:\n`, error);
      process.exit(1);
    });

}

async function listPolicies(orgID : string) {

  // Login as user who is the admin for this org
  const admins = require(`../../usecases/${NILE_ENTITY_NAME}/init/admins.json`);
  let admin = exampleUtils.getAdminForOrg(admins, NILE_ORGANIZATION_NAME);
  nile = await exampleUtils.loginAsUser(nile, admin.email, admin.password);

  // List policies
  const body = {
    org: orgID,
  };
  await nile.access
    .listPolicies(body)
    .then((data) => {
      console.log(`\nListed policies for orgID ${orgID}: `, data);
    })
    .catch((error: any) => {
      console.error(emoji.get('x'), `Error while calling listPolicies for orgID ${orgID}:\n`, error);
      process.exit(1);
    });
}


async function run() {

  // Login as user who is the admin for this org
  const admins = require(`../../usecases/${NILE_ENTITY_NAME}/init/admins.json`);
  let admin = exampleUtils.getAdminForOrg(admins, NILE_ORGANIZATION_NAME);
  nile = await exampleUtils.loginAsUser(nile, admin.email, admin.password);

  let createIfNot = false;
  let orgID = await exampleUtils.maybeCreateOrg (nile, NILE_ORGANIZATION_NAME, false);
  if (!orgID) {
    console.error ("Error: cannot determine the ID of the organization from the provided name: " + NILE_ORGANIZATION_NAME)
    process.exit(1);
  }

  // List policies
  listPolicies(orgID);

  var expectProd!;
  expectProd=true;
  await testTenant(orgID, expectProd);

  // Login as user who is the admin for this org
  const admins = require(`../../usecases/${NILE_ENTITY_NAME}/init/admins.json`);
  let admin = exampleUtils.getAdminForOrg(admins, NILE_ORGANIZATION_NAME);
  nile = await exampleUtils.loginAsUser(nile, admin.email, admin.password);

  // Create policy
  var policyID;
  const body = {
    org: orgID,
    createPolicyRequest: {
      actions: ["read"],
      resource: {
        type: NILE_ENTITY_NAME,
        properties: {environment: "dev"},
      },
      subject: { email : NILE_TENANT1_EMAIL },
    },
  };
  console.log("Creating policy with body: " + JSON.stringify(body, null, 2));
  await nile.access
    .createPolicy(body)
    .then((data) => {
      policyID = JSON.stringify(data.id, null, 2).replace(/['"]+/g, '');
      console.log(emoji.get('white_check_mark'), `Created policy with id ${policyID}`);
      //console.log(JSON.stringify(data, (key, value) => value instanceof Set ? Array.from(value) : value));
    }).catch((error: any) => {
      console.error(error);
      process.exit(1);
    });

  // List policies
  listPolicies(orgID);

  expectProd=false;
  await testTenant(orgID, expectProd);

  // Login as user who is the admin for this org
  const admins = require(`../../usecases/${NILE_ENTITY_NAME}/init/admins.json`);
  let admin = exampleUtils.getAdminForOrg(admins, NILE_ORGANIZATION_NAME);
  nile = await exampleUtils.loginAsUser(nile, admin.email, admin.password);

  // Delete policy
  const body = {
    org: orgID,
    policyId: policyID,
  };
  console.log("\nDeleting policy with body: " + JSON.stringify(body, null, 2));
  await nile.access
    .deletePolicy(body)
    .then((data) => {
      console.log(emoji.get('white_check_mark'), `Deleted policy with id ${policyID}`);
    })
    .catch((error: any) => console.error(error));

  // List policies
  listPolicies(orgID);

  expectProd=true;
  await testTenant(orgID, expectProd);
}

run();
