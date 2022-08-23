import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

// to allow running this script repeatedly
if (process.argv.slice(2) != "") {
	const iteration_id = process.argv.slice(2)
} else {
	const iteration_id = "1"

}
console.log("iteration_id is " + iteration_id)

const NILE_URL = "https://prod.thenile.dev"
const NILE_WORKSPACE = "dwh" + iteration_id
const NILE_DEVELOPER_EMAIL = `dev-mary${iteration_id}@dwh.demo`
const NILE_DEVELOPER_PASSWORD = "password"

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

const entityDefinition: CreateEntityRequest = {
    "name": "dwh",
    "schema": {
      "type": "object",
      "properties": {
        "dwh_name": { "type": "string" },
        "status": { "type": "string" },
        "ARN": { "type": "string" },
        "Endpoint": { "type": "string" }
      },
      "required": ["dwh_name"]
    }
  };

async function quickstart() {

  await nile.developers.createDeveloper({
    createUserRequest : {
      email : NILE_DEVELOPER_EMAIL,
      password : NILE_DEVELOPER_PASSWORD,
    }
  }).catch((error:any) => {
    if (error.message == "user already exists") {
      console.log(`Developer ${NILE_DEVELOPER_EMAIL} already exists`)
    } else {
      console.error(error)
    }
  })

  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
  }).catch((error:any) => {
    console.error(`Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
    process.exit(1);
  });

  nile.authToken = nile.developers.authToken;
  console.log('\x1b[32m%s\x1b[0m', "\u2713", `Successfully logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!\nToken: ` + nile.authToken)

  // check if workspace exists, create if not
  var myWorkspaces = await nile.workspaces.listWorkspaces()
  if ( myWorkspaces.find( ws => ws.name==NILE_WORKSPACE) != null) {
         console.log("Workspace " + NILE_WORKSPACE + " exists");
  } else {
      await nile.workspaces.createWorkspace({
        createOrganizationRequest: { name: NILE_WORKSPACE}, 
      }).then( (ws) => { if (ws != null)  console.log("Successfully created Workspace: " + ws.name)})
  }

  // check if entity exists, create if not
 var myEntities =  await nile.entities.listEntities()
 if (myEntities.find( ws => ws.name==entityDefinition.name)) { 
      console.log("Entity " + entityDefinition.name + " exists");
  } else {
      await nile.entities.createEntity({
        createEntityRequest: entityDefinition
      }).then((data) => 
      {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data, null, 2));
      }).catch((error:any) => console.error(error.message)); 
  }
  
  const NILE_TENANT_EMAIL=`tenant-nora${iteration_id}@customer.io`
  const NILE_TENANT_PASSWORD="password"
    
  // check if user exists, create if not
  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==NILE_TENANT_EMAIL)) {
      console.log("User " + NILE_TENANT_EMAIL + " exists")
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : NILE_TENANT_EMAIL,
        password : NILE_TENANT_PASSWORD
      }
    }).then ( (usr) => {  
      if (usr != null) 
        console.log("User " + usr.email + " was created")
    })
  }

  // Log in as Shaun. The rest of the work will be done from Shaun's POV as a user of Clustify
  
  await nile.users.loginUser({
    loginInfo: {
      email: NILE_TENANT_EMAIL,
      password: NILE_TENANT_PASSWORD
    }
  })

  nile.authToken = nile.users.authToken


  const NILE_TENANT_NAME = "RocketSlides" + iteration_id
  var tenant_id;

  // check if org exists, create if not
  var myOrgs = await nile.organizations.listOrganizations()
  var maybeTenant = myOrgs.find( org => org.name == NILE_TENANT_NAME)
  if (maybeTenant) {
    console.log("Org " + NILE_TENANT_NAME + " exists with id " + maybeTenant.id)
    tenant_id = maybeTenant.id
  } else {
    await nile.organizations.createOrganization({"createOrganizationRequest" : 
    {
      name : NILE_TENANT_NAME,
    }}).then ( (org) => {  
      if (org != null) {
        console.log("Tenant " + org.name + " was created")
        tenant_id = org.id
      }
    }).catch((error:any) => console.error(error.message));
  }

if (!tenant_id) {
  console.log("Unable to find or create organization. The rest of this example requires a tenant, so you will need to fix the problem before proceeding")
  process.exit(1);
}

  // create dwh
  await nile.entities.createInstance({
    org : tenant_id,
    type : entityDefinition.name,
    body : {
      dwh_name : "MyFirstDWH"
    }
  }).then((dwh) => console.log ('\x1b[32m%s\x1b[0m', "\u2713", "dwh was created: " + JSON.stringify(dwh, null, 2)))

  // list dwh
  await nile.entities.listInstances({
    org: tenant_id,
    type: entityDefinition.name
  }).then((dwhs) => {
    console.log("You have the following Data Warehouses:")
    console.log(dwhs)
  })

// handle all past events
console.log('Printing past events and on-going ones.')
console.log('Create or update dwhs to see more events. Ctrl-c to exit')
nile.events.on({type: entityDefinition.name, seq: 0},
  async(e) => console.log(JSON.stringify(e, null, 2)))
}

quickstart()
//console.log("%c \u2713 hi", 'color: green')
//console.log('\x1b[32m%s\x1b[0m', "\u2713", "hi")

