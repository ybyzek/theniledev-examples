import Nile from "@theniledev/js";

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

// Setup one tenant
async function setupTenant(userEmail : string, password : string, organizationName : string) {

  console.log(`\nConfiguring tenant ${userEmail} for organizationName ${organizationName}`);

  // Check if tenant exists, create if not
  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==userEmail)) {
      console.log(emoji.get('white_check_mark'), "User " + userEmail + " exists");
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : userEmail,
        password : password
      }
    }).then ( (usr) => {  
      if (usr != null) 
        console.log(emoji.get('white_check_mark'), "Created User: " + usr.email);
    })
  }

  let orgID;

  // Check if organization exists, create if not
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeTenant = myOrgs.find( org => org.name == organizationName);
  if (maybeTenant) {
    console.log(emoji.get('white_check_mark'), "Org " + userEmail + " exists with id " + maybeTenant.id);
    orgID = maybeTenant.id;
  } else {
    await nile.organizations.createOrganization({"createOrganizationRequest" : 
    {
      name : organizationName,
    }}).then ( (org) => {  
      if (org != null) {
        console.log(emoji.get('white_check_mark'), "Created Tenant: " + org.name);
        orgID = org.id;
      }
    }).catch((error:any) => console.error(error.message));
  }

  if (!orgID) {
    console.error(emoji.get('x'), `Unable to find or create organization with name ${organizationName}`);
    process.exit(1);
  }

  // Add user to organization
  const body = {
    org: orgID,
    addUserToOrgRequest: {
      email: userEmail,
    },
  };
  console.log(`Trying to add tenant ${userEmail} to orgID ${orgID}`);
  nile.organizations
    .addUserToOrg(body)
    .then((data) => {
      console.log(emoji.get('white_check_mark'), `Added tenant ${userEmail} to orgID ${orgID}`);
    }).catch((error:any) => {
      if (error.message.startsWith('User is already in org')) {
        console.log(emoji.get('white_check_mark'), `User ${userEmail} is already in ${organizationName}`);
      } else {
        console.error(error)
        process.exit(1);
      }
    });

  // Check if entity instance already exists, create if not
  var myInstances = await nile.entities.listInstances({
        org: orgID,
        type: NILE_ENTITY_NAME,
      })
  var maybeInstance = myInstances.find( instance => instance.type == NILE_ENTITY_NAME)
  if (maybeInstance) {
    console.log(emoji.get('white_check_mark'), "Entity instance " + NILE_ENTITY_NAME + " exists with id " + maybeInstance.id);
  } else {
    console.log(myInstances);
    const identifier = Math.floor(Math.random() * 100000)
    await nile.entities.createInstance({
      org: orgID,
      type: NILE_ENTITY_NAME,
      body: {
        greeting : `Come with me if you want to live: ${identifier}`
      }
    }).then((entity_instance) => console.log (emoji.get('white_check_mark'), "Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }

  // List instances of the service
  await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME
  }).then((instances) => {
    console.log(`The following entity instances of type ${NILE_ENTITY_NAME} already exist:\n`, instances);
  });
}

async function add_instance_to_org(orgName: string, greeting: string) {

  // Check if organization exists, create if not
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeTenant = myOrgs.find( org => org.name == orgName);
  var orgID! : string;

  if (maybeTenant) {
    console.log(emoji.get('white_check_mark'), "Org " + orgName + " exists with id " + maybeTenant.id);
    orgID = maybeTenant.id;
  } else {
    await nile.organizations.createOrganization({"createOrganizationRequest" :
    {
      name: orgName,
    }}).then ( (org) => {
      if (org != null) {
        console.log(emoji.get('white_check_mark'), "Created new org: " + org.name);
        orgID = org.id
      }
    }).catch((error:any) => console.error(error.message));
  }

  // Check if entity instance already exists, create if not
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  });
  let maybeInstance = myInstances.find( instance => instance.type == NILE_ENTITY_NAME && instance.properties.greeting == greeting );
  if (maybeInstance) {
    console.log(emoji.get('white_check_mark'), "Entity instance " + NILE_ENTITY_NAME + " exists with id " + maybeInstance.id);
  } else {
    console.log(myInstances);
    await nile.entities.createInstance({
      org: orgID,
      type: NILE_ENTITY_NAME,
      body: {
        greeting : greeting
      }
    }).then((entity_instance) => console.log (emoji.get('white_check_mark'), "Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }
}

async function setupMultiTenancy() {
  await login_nile();

  const pagesJson = require('../../quickstart/src/datasets/pageList.json');
  for (let index = 0; index < pagesJson.length ; index++) {
    await add_instance_to_org(pagesJson[index].org, pagesJson[index].greeting);
  }

  const usersJson = require('../../quickstart/src/datasets/userList.json');
  for (let index = 0; index < usersJson.length ; index++) {
    await setupTenant(usersJson[index].email, usersJson[index].password, usersJson[index].org);
  }
}

setupMultiTenancy();
