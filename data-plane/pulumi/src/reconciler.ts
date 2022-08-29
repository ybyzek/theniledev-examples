import Reconcile from "./commands/reconcile/index"

import * as dotenv from "dotenv";

async function run() {

  await dotenv.config()
  console.log ("(TO REMOVE) test env: ", process.env)

  const basePath = process.env.NILE_URL
  const workspace = process.env.NILE_WORKSPACE
  const email = process.env.NILE_DEVELOPER_EMAIL
  const password = process.env.NILE_DEVELOPER_PASSWORD
  const organization = process.env.NILE_ORGANIZATION_ID
  const entity = process.env.NILE_ENTITY_NAME

  console.log ("basePath: ", basePath)

  await Reconcile.run([
    '--basePath', basePath,
    '--workspace', workspace,
    '--email', email,
    '--password', password,
    '--organization', organization,
    '--entity', entity
  ])

}

run()
