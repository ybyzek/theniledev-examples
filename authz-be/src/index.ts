import Nile from '@theniledev/js';

const fs = require('fs');
const EntityDefinition = JSON.parse(fs.readFileSync('../quickstart/src/models/SaaSDB_Entity_Definition.json'));

var nileUtils = require('../../utils-module-js/').nileUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_DEVELOPER_EMAIL",
  "NILE_DEVELOPER_PASSWORD",
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
const NILE_ENTITY_NAME = EntityDefinition.name;

const usersJson = require('../../quickstart/src/datasets/userList.json');
// Load first user only
const index=0
const email = usersJson[index].email;
const NILE_TENANT_PASSWORD = usersJson[index].password;

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});


async function listPolicies(orgID : string) {
  // List policies
  const body = {
    org: orgID,
  };
  await nile.access
    .listPolicies(body)
    .then((data) => {
      console.log(`List of policies for ${orgID}:\n`, data);
    })
    .catch((error: any) => console.error(error));
}

async function createAccessPolicy(email: string, orgName: string, dbName: string, actions: string[]) {

  let createIfNot = false;
  let orgID = await nileUtils.maybeCreateOrg (nile, orgName, createIfNot);
  if (!orgID) {
    console.error ("Error: cannot determine the ID of the organization from the provided name :" + orgName)
    process.exit(1);
  } 

  // Find instance
  var instance_id;
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  });
  let maybeInstance = myInstances.find( instance => instance.type == NILE_ENTITY_NAME && instance.properties.dbName == dbName );
  if (maybeInstance) {
    console.log(emoji.get('dart'), "Entity instance " + NILE_ENTITY_NAME + " exists with id " + maybeInstance.id);
    instance_id = maybeInstance.id;
  } else {
    console.error(emoji.get('x'), `Error: cannot find instance of type ${NILE_ENTITY_NAME} where dbName is ${dbName}`);
    process.exit(1);
  }

  // Create policy
  var policyID;
  const body = {
    org: orgID,
    createPolicyRequest: {
      actions: actions,
      resource: {
        type: NILE_ENTITY_NAME,
        id: instance_id
      },
      subject: { email : email },
    },
  };
  console.log("Creating policy with body: " + JSON.stringify(body, null, 2));
  await nile.access
    .createPolicy(body)
    .then((data) => {
      policyID = JSON.stringify(data.id, null, 2).replace(/['"]+/g, '');
      console.log(emoji.get('white_check_mark'), `Created policy with id ${policyID} for subject ${email} for entity ${NILE_ENTITY_NAME}`);
    })
    .catch((error: any) => console.error(error));

}

async function run() {

  // For ease of demo: the Nile developer creates all the access policies
  // However, in practice, the organization's admin user can create the necessary policies
  await nileUtils.loginAsDev(nile, NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD);

  var actions;
  const pagesJson = require('../../quickstart/src/datasets/pageList.json');
  const usersJson = require('../../quickstart/src/datasets/userList.json');
  for (let index = 0 ; index < pagesJson.length ; index++) {
    let pageOrg = pagesJson[index].org;
    for (let index2 = 0 ; index2 < usersJson.length ; index2++) {
      if (usersJson[index2].org == pageOrg) {
        if (usersJson[index2].role == "admin") {
          actions = ["write", "read"];
        } else if (usersJson[index2].role == "dev") {
          actions = ["write"];
        } else if (usersJson[index2].role == "billing") {
          actions = ["read"];
        } else {
          actions = ["deny"];
        }
        await createAccessPolicy(usersJson[index2].email, pageOrg, pagesJson[index].dbName, actions);
      }
    }
    // List policies
    let createIfNot = false;
    let orgID = await nileUtils.maybeCreateOrg (nile, pageOrg, createIfNot);
    await listPolicies(orgID);
  }
}

run();
