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

async function loginDeveloper() {

  if (!process.env.NILE_DEVELOPER_TOKEN) {
    if (!process.env.NILE_DEVELOPER_EMAIL || !process.env.NILE_DEVELOPER_PASSWORD) {
      console.error(emoji.get('x'), `Error: please provide NILE_DEVELOPER_TOKEN or {NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD} in .env .  See .env.defaults for more info and copy it to .env with your values`);
      process.exit(1);
    }
  }

  nile = await Nile({
    basePath: NILE_URL,
    workspace: NILE_WORKSPACE,
  }).connect(process.env.NILE_DEVELOPER_TOKEN ?? { email: process.env.NILE_DEVELOPER_EMAIL, password: process.env.NILE_DEVELOPER_PASSWORD });

  nile.authToken = nile.developers.authToken;
  if (nile.authToken) {
    console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile as developer`);
    console.log(`export NILE_ACCESS_TOKEN=${nile.authToken}`);
  } else {
    console.error(emoji.get('x'), ` Could not log into Nile.  Did you follow the instructions in https://github.com/TheNileDev/examples/blob/main/README.md#setup , create your Nile workspace, and set valid parameter values in a local .env file?`);
    process.exit(1);
  }

}

async function createWorkspace() {

  await loginDeveloper();

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
          } else {
            console.error(error);
            process.exit(1);
          }
        });
  }

}

createWorkspace();
