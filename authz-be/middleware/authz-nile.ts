const User = require("../model/User");

require('dotenv').config({ override: true });
const NILE_URL = process.env.NILE_URL;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE;
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME;

exports.nileAuthz = async (req, res, next) => {

  const role = res.locals.role;
  const email = res.locals.email;
  const url = req.url.substring(1);
  const user = await User.findOne({ "email" : email });
  const orgName = user.org;

  // Map these generic "pages" to the entity instance names
  var urlDBmap = {};
  const entities = require(`../../usecases/${NILE_ENTITY_NAME}/init/entities.json`);
  const { instanceName } = require(`../../usecases/${NILE_ENTITY_NAME}/init/entity_utils.js`);
  urlDBmap["page1"] = entities[0][instanceName];
  urlDBmap["page2"] = entities[1][instanceName];
  urlDBmap["page3"] = entities[2][instanceName];
  const propertyEquivalencyValue = urlDBmap[url];

  console.log("Received: ", role, email, url, propertyEquivalencyValue, orgName);

  const Nile = require('@theniledev/js');
  
  var emoji = require('node-emoji');
  
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
  let maybeInstance = myInstances.find( instance => instance.type === NILE_ENTITY_NAME && instance.properties[instanceName] === propertyEquivalencyValue );
  if (maybeInstance) {
    console.log(emoji.get('white_check_mark'), `Entity type ${NILE_ENTITY_NAME} with ${instanceName} ${propertyEquivalencyValue} (instance ${maybeInstance.id}) granted read access by ${email}!`);
    instance_id = maybeInstance.id;
    next();
  } else {
    console.error(emoji.get('x'), `Entity type ${NILE_ENTITY_NAME} with ${instanceName} ${propertyEquivalencyValue} not allowed to be read by ${email}!`);
    return res.status(401).json({ message: "Not authorized" });
  }

}
