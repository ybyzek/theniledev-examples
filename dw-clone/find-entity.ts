import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";


// const definitions for the demo
const iteration_id = process.argv.slice(2) != "" ? process.argv.slice(2) : "";
const NILE_URL = process.env.NILE_URL || "https://prod.thenile.dev";
const NILE_WORKSPACE = `demo-test-dw${iteration_id}`
const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});
const NILE_DEVELOPER_EMAIL = process.env.NILE_DEVELOPER_EMAIL || `dev-mary${iteration_id}@dw.demo`
console.log(`Logging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`)
const NILE_DEVELOPER_PASSWORD = process.env.NILE_DEVELOPER_PASSWORD || "password"
const NILE_TENANT_NAME = `Tenant${iteration_id}`

async function run() {

  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
  }).catch((error:any) => {
    console.error(`Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
    process.exit(1);
  });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;

  // Find tenant id
  var tenant_id;
  var myOrgs = await nile.organizations.listOrganizations()
  var maybeTenant = myOrgs.find( org => org.name == NILE_TENANT_NAME)
  if (maybeTenant) {
    console.log("Org " + NILE_TENANT_NAME + " exists with id " + maybeTenant.id)
    tenant_id = maybeTenant.id
  } else {
    console.error("Cannot find id for " + NILE_TENANT_NAME)
  }

  // Find instance with matching name
  var instances = await nile.entities.listInstances({
    org: tenant_id,
    type: "dw"
  })
  if ( instances.find( i => i.properties.dw_name == `xxxDW${iteration_id}`) != null) {
    console.log (`Found Data Warehouse entry with name DW${iteration_id}`)
  } else {
    console.error (`Error: could not find Data Warehouse entry with name DW${iteration_id}`)
    return process.exit(1)
  }

}

run()
