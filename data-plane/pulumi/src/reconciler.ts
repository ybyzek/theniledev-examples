import Reconcile from "./commands/reconcile/index"

import * as dotenv from "dotenv";

dotenv.config({ override: true })

const basePath = process.env.NILE_URL || '';
const workspace = process.env.NILE_WORKSPACE_NAME || '';
const email = process.env.NILE_DEVELOPER_EMAIL || '';
const password = process.env.NILE_DEVELOPER_PASSWORD || '';
const organization = process.env.NILE_ORGANIZATION_ID || '';
const entity = process.env.NILE_ENTITY_NAME || '';

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
