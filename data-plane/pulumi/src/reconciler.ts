import Reconcile from "./commands/reconcile/index"

import * as dotenv from "dotenv";

dotenv.config()

const basePath = process.env.NILE_URL || '';
const workspace = process.env.NILE_WORKSPACE_NAME || '';
const email = process.env.NILE_DEVELOPER_EMAIL || '';
const password = process.env.NILE_DEVELOPER_PASSWORD || '';
const organization = process.env.NILE_ORGANIZATION_ID || '';
const entity = process.env.NILE_ENTITY_NAME || '';

console.log ("email (env): ", process.env.NILE_DEVELOPER_EMAIL)

console.log ("basePath: ", basePath)
console.log ("workspace: ", workspace)
console.log ("email: ", email)
console.log ("password: ", password)
console.log ("organization: ", organization)
console.log ("entity: ", entity)


async function run() {

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
