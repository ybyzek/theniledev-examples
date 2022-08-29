import { Reconciler } from './src/command/reconciler';

import * as dotenv from "dotenv";

async function run() {

  dotenv.config()
  //console.log ("(TO REMOVE) test env: ", process.env)

  const basePath = process.env.NILE_URL
  const workspace = process.env.NILE_WORKSPACE
  const email = process.env.NILE_DEVELOPER_EMAIL
  const password = process.env.NILE_DEVELOPER_PASSWORD
  const organization = process.env.NILE_ORGANIZATION_ID
  const entity = process.env.NILE_ENTITY_NAME

  await Reconciler.run([
    '--basePath', basePath,
    '--workspace', workspace,
    '--email', email,
    '--password', password,
    '--organization', organization,
    '--entity', entity
  ])

}

run()
