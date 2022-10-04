import Nile, { CreateEntityRequest } from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

var nileUtils = require('../../utils-module-js/').nileUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

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
try {
  const EntityDefinition = JSON.parse(fs.readFileSync(`../usecases/${NILE_ENTITY_NAME}/entity_definition.json`))
} catch (err) {
  console.error(err);
  console.error(emoji.get('x'), `Did you check that ../usecases/${NILE_ENTITY_NAME}/entity_definition.json exists?`);
  process.exit(1);
}

const NILE_TENANT_MAX = process.env.NILE_TENANT_MAX || false;

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

// Schema for the entity that defines the service in the data plane
const entityDefinition: CreateEntityRequest = EntityDefinition;

// Workflow for the Nile developer
async function setupDeveloper() {

  // Signup developer
  try {
    await nile.developers.createDeveloper({
      createUserRequest : {
        email : NILE_DEVELOPER_EMAIL,
        password : NILE_DEVELOPER_PASSWORD,
      }
    })
    console.log(emoji.get('white_check_mark'), `Signing up for Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`);
  } catch (error:any) {
    if (error.message == "user already exists") {
      console.log(emoji.get('dart'), `Developer ${NILE_DEVELOPER_EMAIL} already exists`);
    } else {
      console.error(error);
    }
  };

  await nileUtils.loginAsDev(nile, NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD);

  // Check if workspace exists, create if not
  var myWorkspaces = await nile.workspaces.listWorkspaces()
  if ( myWorkspaces.find( ws => ws.name==NILE_WORKSPACE) != null) {
         console.log(emoji.get('dart'), "Workspace " + NILE_WORKSPACE + " exists");
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
      console.log(emoji.get('dart'), "Entity " + entityDefinition.name + " exists");
  } else {
      await nile.entities.createEntity({
        createEntityRequest: entityDefinition
      }).then((data) => 
      {
        console.log(emoji.get('white_check_mark'), 'Created entity: ' + JSON.stringify(data, null, 2));
      }).catch((error:any) => console.error(error.message)); 
  }
}

async function setupControlPlane() {

  // Log in as the Nile developer
  await setupDeveloper();

  const users = require(`../../usecases/${NILE_ENTITY_NAME}/init/users.json`);
  let admins = nileUtils.getAdmins(users);
  let limit = NILE_TENANT_MAX ? users.length : 1;

  for (let index = 0; index < limit ; index++) {

    let email = users[index].email;
    let password = users[index].password;
    let role = users[index].role;
    let org = users[index].org;
    let adminEmail = users[admins.get(org)].email;
    let adminPassword = users[admins.get(org)].password;

    if (index < 2) {

      // user is org creator
      await nileUtils.maybeCreateUser(nile, email, password, role);
      await nileUtils.loginAsUser(nile, email, password);
      let createIfNot = true;
      let orgID = await nileUtils.maybeCreateOrg (nile, org, createIfNot);
      await nileUtils.maybeAddUserToOrg(nile, email, orgID);

    } else {

      // user is not org creator; let admin user create and invite them
      await nileUtils.loginAsUser(nile, adminEmail, adminPassword);
      await nileUtils.maybeCreateUser(nile, email, password, role);
      let createIfNot = false;
      let orgID = await nileUtils.maybeCreateOrg (nile, org, createIfNot);
      await nileUtils.maybeAddUserToOrg(nile, email, orgID);

    }
  }

  const entities = require(`../../usecases/${NILE_ENTITY_NAME}/init/entities.json`);
  let limit = NILE_TENANT_MAX ? entities.length : 1;
  for (let index = 0; index < limit ; index++) {

    let adminEmail = users[admins.get(entities[index].org)].email;
    let adminPassword = users[admins.get(entities[index].org)].password;

    // Get orgID
    await nileUtils.loginAsUser(nile, adminEmail, adminPassword);
    let createIfNot = false;
    let orgID = await nileUtils.maybeCreateOrg (nile, entities[index].org, false);

    const { addInstanceToOrg } = require(`../../usecases/${NILE_ENTITY_NAME}/init/entity_utils.js`);
    await addInstanceToOrg(nile, orgID, NILE_ENTITY_NAME, entities[index]);

    // List instances
    await nile.entities.listInstances({
      org: orgID,
      type: entityDefinition.name
    }).then((entity_instances) => {
      console.log(`The following entity instances exist in orgID ${orgID}\n`, entity_instances);
    });
  }

}

setupControlPlane();
