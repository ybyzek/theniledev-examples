import Nile, { CreateEntityRequest } from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";
import { EntitySchema } from './models/EntitySchema';

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

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

// Schema for the entity that defines the service in the data plane
const entityDefinition: CreateEntityRequest = {
    "name": NILE_ENTITY_NAME,
    "schema": EntitySchema,
};

// Workflow for the Nile developer
async function setup_workflow_developer() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`);

  // Signup developer
  await nile.developers.createDeveloper({
    createUserRequest : {
      email : NILE_DEVELOPER_EMAIL,
      password : NILE_DEVELOPER_PASSWORD,
    }
  }).catch((error:any) => {
    if (error.message == "user already exists") {
      console.log(`Developer ${NILE_DEVELOPER_EMAIL} already exists`);
    } else {
      console.error(error);
    }
  })

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

  // Check if workspace exists, create if not
  var myWorkspaces = await nile.workspaces.listWorkspaces()
  if ( myWorkspaces.find( ws => ws.name==NILE_WORKSPACE) != null) {
         console.log(emoji.get('white_check_mark'), "Workspace " + NILE_WORKSPACE + " exists");
  } else {
      await nile.workspaces.createWorkspace({
        createWorkspaceRequest: { name: NILE_WORKSPACE },
      }).then( (ws) => { if (ws != null)  console.log(emoji.get('white_check_mark'), "Created workspace: " + ws.name)})
        .catch((error:any) => {
          if (error.message == "workspace already exists") {
            console.error(emoji.get('x'), `Error: workspace ${NILE_WORKSPACE} already exists (workspace names are globally unique)`);
            process.exit(1);
          } else {
            console.error(error);
          }
        });
  }

  // Check if entity exists, create if not
  var myEntities =  await nile.entities.listEntities()
  if (myEntities.find( ws => ws.name==entityDefinition.name)) { 
      console.log(emoji.get('white_check_mark'), "Entity " + entityDefinition.name + " exists");
  } else {
      await nile.entities.createEntity({
        createEntityRequest: entityDefinition
      }).then((data) => 
      {
        console.log(emoji.get('white_check_mark'), 'Created entity: ' + JSON.stringify(data, null, 2));
      }).catch((error:any) => console.error(error.message)); 
  }
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
      type: entityDefinition.name,
      body: {
        greeting : greeting
      }
    }).then((entity_instance) => console.log (emoji.get('white_check_mark'), "Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }

  // List instances
  await nile.entities.listInstances({
    org: orgID,
    type: entityDefinition.name
  }).then((entity_instances) => {
    console.log("The following entity instances exist in orgID: ", orgID);
    console.log(entity_instances);
  });
}


async function add_tenant(email: string, password: string, orgName: string) {

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

  // Check if tenant exists, create if not
  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==email)) {
      console.log(emoji.get('white_check_mark'), "User " + email + " exists");
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : email,
        password : password
      }
    }).then ( (usr) => { 
      if (usr != null)
        console.log(emoji.get('white_check_mark'), "Created User: " + usr.email);
    })
  }

  // Add user to organization
  const body = {
    org: orgID,
    addUserToOrgRequest: {
      email: email,
    },
  };
  console.log(`Trying to add tenant ${email} to orgID ${orgID}`);
  nile.organizations
    .addUserToOrg(body)
    .then((data) => {
      console.log(emoji.get('white_check_mark'), `Added tenant ${email} to orgID ${orgID}`);
    }).catch((error:any) => {
      if (error.message.startsWith('User is already in org')) {
        console.log(emoji.get('white_check_mark'), `User ${email} is already in orgID ${orgID}`);
      } else {
        console.error(error)
        process.exit(1);
      }
    });
}

async function setup_control_plane() {
  // Log in as the Nile developer
  await setup_workflow_developer();

  const pagesJson = require('./datasets/pageList.json');
  // Load first page only
  const index=0
  await add_instance_to_org(pagesJson[index].org, pagesJson[index].greeting);

  const usersJson = require('./datasets/userList.json');
  // Load first user only
  const index=0
  await add_tenant(usersJson[index].email, usersJson[index].password, usersJson[index].org);
}

setup_control_plane();
