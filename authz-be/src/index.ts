import Nile from '@theniledev/js';

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_DEVELOPER_EMAIL",
  "NILE_DEVELOPER_PASSWORD",
  "NILE_ORGANIZATION_NAME",
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
const NILE_ORGANIZATION_NAME = process.env.NILE_ORGANIZATION_NAME!;
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME!;

const usersJson = require('../../quickstart/src/datasets/userList.json');
// Load first user only
const index=0
const email = usersJson[index].email;
const NILE_TENANT_PASSWORD = usersJson[index].password;

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});


async function listRules(orgID : string) {
  // List rules
  const body = {
    org: orgID,
  };
  await nile.authz
    .listRules(body)
    .then((data) => {
      console.log('List of rules for: ', data);
    })
    .catch((error: any) => console.error(error));
}

async function login_nile() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`);

  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
    }).catch((error:any) => {
      console.error(emoji.get('x'), `Error: Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
      process.exit(1);
    });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;
  console.log(emoji.get('white_check_mark'), `Logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!\nToken: ` + nile.authToken);
}

async function create_authz_rule(email: string, orgName: string, greeting: string, actions: string[]) {

  var orgID;
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeTenant = myOrgs.find( org => org.name == orgName);
  if (maybeTenant) {
    console.log("Org " + orgName + " exists with id " + maybeTenant.id);
    orgID = maybeTenant.id;
  } 

  console.log(`orgID is ${orgID}`);

  if (!orgID) {
    console.error ("Error: cannot determine the ID of the organization from the provided name :" + orgName)
    process.exit(1);
  } else {
    console.log('Organization with name ' + orgName + ' exists with id ' + orgID);
  }

  // Find instance
  var instance_id;
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  });
  let maybeInstance = myInstances.find( instance => instance.type == NILE_ENTITY_NAME && instance.properties.greeting == greeting );
  if (maybeInstance) {
    console.log(emoji.get('white_check_mark'), "Entity instance " + NILE_ENTITY_NAME + " exists with id " + maybeInstance.id);
    instance_id = maybeInstance.id;
  } else {
    console.error(emoji.get('x'), `Error: cannot find instance of type ${NILE_ENTITY_NAME} where greeting is ${greeting}`);
    process.exit(1);
  }

  // Create rule
  var ruleID;
  const body = {
    org: orgID,
    createRuleRequest: {
      actions: actions,
      resource: {
        type: NILE_ENTITY_NAME,
        id: instance_id
      },
      subject: { email : email },
    },
  };
  console.log("Creating rule with body: " + JSON.stringify(body, null, 2));
  await nile.authz
    .createRule(body)
    .then((data) => {
      ruleID = JSON.stringify(data.id, null, 2).replace(/['"]+/g, '');
      console.log(`Created rule with id ${ruleID} for subject ${email} for entity ${NILE_ENTITY_NAME}`);
    })
    .catch((error: any) => console.error(error));

  // List rules
  await listRules(orgID);
}

async function run() {

  // For ease of demo: the Nile developer creates all the authz rules
  // However, in practice, the organization's admin user can create the necessary rules
  await login_nile();

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
        await create_authz_rule(usersJson[index2].email, pageOrg, pagesJson[index].greeting, actions);
      }
    }
  }
}

run();
