import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
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

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

const usersJson = require('./datasets/userList.json');
const index = 0;
const NILE_ORGANIZATION_NAME = usersJson[index].org;

async function run() {

  await nileUtils.loginAsDev(nile, NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD);

  const usersJson = require('./datasets/userList.json');
  const index=0
  const userEmail = usersJson[index].email;
  const userPassword = usersJson[index].password;

  // Get orgID
  await nileUtils.loginAsUser(nile, userEmail, userPassword);
  let createIfNot = false;
  let orgID = await nileUtils.maybeCreateOrg (nile, NILE_ORGANIZATION_NAME, false);
  if (!orgID) {
    console.error(emoji.get('x'), "Cannot find org id for " + NILE_ORGANIZATION_NAME)
    process.exit(1);
  }

  // Find instance with matching name
  var instances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME
  })
  if ( instances.find( i => i.properties.greeting.startsWith('page')) != null) {
    console.log (emoji.get('dart'), `Entity instance ${NILE_ENTITY_NAME} exists`);
  } else {
    console.error (`Error: could not find entity instance for ${NILE_ENTITY_NAME}`)
    return process.exit(1)
  }

}

run()
