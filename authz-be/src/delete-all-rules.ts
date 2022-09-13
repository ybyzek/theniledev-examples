import Nile from '@theniledev/js';

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

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

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

async function delete_rules_org (orgName: string) {

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

  // List rules
  const body = {
    org: orgID,
  };
  await nile.authz
    .listRules(body)
    .then((data) => {
      console.log('Listed rules: ', data);
      for (let i=0; i < data.length; i++) {
        let ruleID = data[i].id;
        console.log(ruleID);
        // Delete rule
        const delBody = {
          org: orgID,
          ruleId: ruleID,
        };
        //console.log("\nDeleting rule with delBody: " + JSON.stringify(delBody, null, 2));
        nile.authz
          .deleteRule(delBody)
          .then((res) => {
            console.log(`Deleted rule: ${ruleID}`);
          })
          .catch((error: any) => console.error(error));
      }
    }).catch((error: any) => console.error(error));

}

async function run() {
  await login_nile();

  var actions;
  const pagesJson = require('../../quickstart/src/datasets/pageList.json');
  const usersJson = require('../../quickstart/src/datasets/userList.json');
  for (let index = 0 ; index < pagesJson.length ; index++) {
    let pageOrg = pagesJson[index].org;
    await delete_rules_org(pageOrg);
  }
}

run();
