const User = require("../model/User");

const fs = require('fs');
const EntityDefinition = JSON.parse(fs.readFileSync('../quickstart/src/models/SaaSDB_Entity_Definition.json'));

exports.nileAuthz = async (req, res, next) => {

  const role = res.locals.role;
  const email = res.locals.email;
  const url = req.url.substring(1);
  const user = await User.findOne({ "email" : email });
  const orgName = user.org;

  var urlDBmap = {};
  urlDBmap["page1"] = "myDB-products";
  urlDBmap["page2"] = "myDB-analytics";
  urlDBmap["page3"] = "myDB-billing";
  const dbName = urlDBmap[url];

  console.log("Received: ", role, email, url, dbName, orgName);

  const Nile = require('@theniledev/js');
  
  var emoji = require('node-emoji');
  
  require('dotenv').config({ override: true });
  const NILE_URL = process.env.NILE_URL;
  const NILE_WORKSPACE = process.env.NILE_WORKSPACE;

  const NILE_ENTITY_NAME = EntityDefinition.name;
  
  const nile = Nile.default({
    basePath: NILE_URL,
    workspace: NILE_WORKSPACE,
  });
  
  // Login user
  await nile.users.loginUser({
    loginInfo: {
      email: email,
      password: 'password'
    }
  }).catch((error) => {
      console.error(emoji.get('x'), `Error: Failed to login to Nile at ${NILE_URL} in workspace ${NILE_WORKSPACE} as user ${email}: ` + error.message);
      return res.status(401).json({ message: "Cannot login" });
  });
  
  // Get the JWT token
  nile.authToken = nile.users.authToken;
  console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile at ${NILE_URL} in workspace ${NILE_WORKSPACE} as user ${email}!`);

  var orgID;
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeTenant = myOrgs.find( org => org.name == orgName);
  if (maybeTenant) {
    orgID = maybeTenant.id;
  } 

  if (!orgID) {
    console.error ("Error: cannot determine the ID of the organization from the provided name: " + orgName)
    return false
  } else {
    console.log(emoji.get('dart'), 'Organization with name ' + orgName + ' exists with id ' + orgID);
  }

  // Find instance -- this is how we test whether a user has READ access
  var instance_id;
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  });
  let maybeInstance = myInstances.find( instance => instance.type === NILE_ENTITY_NAME && instance.properties.dbName === dbName );
  if (maybeInstance) {
    console.log(emoji.get('white_check_mark'), `Entity type ${NILE_ENTITY_NAME} with dbName ${dbName} (instance ${maybeInstance.id}) granted read access by ${email}!`);
    instance_id = maybeInstance.id;
    next();
  } else {
    console.error(emoji.get('x'), `Entity type ${NILE_ENTITY_NAME} wth dbName ${dbName} not allowed to be read by ${email}!`);
    return res.status(401).json({ message: "Not authorized" });
  }

}
