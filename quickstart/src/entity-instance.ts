import Nile from "@theniledev/js";

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

// Get Nile URL and workspace
if (!process.env.NILE_URL || !process.env.NILE_WORKSPACE) {
  console.error(emoji.get('x'), `Error: missing variable NILE_URL or NILE_WORKSPACE in .env .  See .env.defaults for more info and copy it to .env with your values`);
  process.exit(1);
}
const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
const nile!;

// Get entity schema that defines the service in the data plane
const NILE_ENTITY_NAME = "DB";

async function createInstance() {

  // Set Nile
  nile = Nile({
    basePath: NILE_URL,
    workspace: NILE_WORKSPACE,
  });

  // login as user
  let email = "shaun@colton.demo"
  let password = "password"
  await nile.users.loginUser({
    loginInfo: {
      email: email,
      password: password,
    },
    }).catch((error:any) => {
      console.error(emoji.get('x'), `Error: Failed to login to Nile as user ${email}: ` + error.message);
      process.exit(1);
    });
  nile.authToken = nile.users.authToken;
  console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile as user ${email}`);
  console.log(`export NILE_ACCESS_TOKEN=${nile.authToken}`);

  // Get orgID
  let orgName = "Colton Labs"
  var orgID;
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeOrg = myOrgs.find( org => org.name == orgName);
  if (maybeOrg) {
    orgID = maybeOrg.id
    console.log(emoji.get('dart'), "Org " + orgName + " exists with id " + orgID);
  } else {
    console.error(emoji.get('x'), `Cannot get orgID from ${orgName}`);
    process.exit(1);
  }

  // Check if entity instance already exists, create if not
  let dbName = "myDB-products";
  let cloud = "gcp";
  let environment = "prod";
  let size = 100;
  let org = "Danube Tech";
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  });
  let maybeInstance = myInstances.find( instance => instance.type == NILE_ENTITY_NAME && instance.properties["dbName"] == dbName );
  if (maybeInstance) {
    console.log("Entity instance " + NILE_ENTITY_NAME + ` exists where dbName is ${dbName} (id: ${maybeInstance.id})`);
  } else {
    console.log(myInstances);
    await nile.entities.createInstance({
      org: orgID,
      type: NILE_ENTITY_NAME,
      body: {
        dbName : dbName,
        cloud : cloud,
        environment : environment,
        size : size,
        connection : "server-" + dbName + ":3306",
        status : "Up"
      }
    }).then((entity_instance) => console.log ("Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }

}

createInstance();
