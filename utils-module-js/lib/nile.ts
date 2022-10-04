var emoji = require('node-emoji');

exports.loginAsDev = async function (
  nile: nileAPI, email: string, password: string): Promise< null > {

  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: email,
      password: password,
    },
    }).catch((error:any) => {
      console.error(emoji.get('x'), `Error: Failed to login to Nile as developer ${email}: ` + error.message);
      process.exit(1);
    });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;
  console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile as developer ${email}`);
  //console.log(`export NILE_ACCESS_TOKEN=${nile.authToken}`);
}

exports.loginAsUser = async function (
  nile: nileAPI, email: string, password: string): Promise< null > {

  // Login user
  await nile.users.loginUser({
    loginInfo: {
      email: email,
      password: password,
    },
    }).catch((error:any) => {
      console.error(emoji.get('x'), `Error: Failed to login to Nile as user ${email}: ` + error.message);
      process.exit(1);
    });

  // Get the JWT token
  nile.authToken = nile.users.authToken;
  console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile as user ${email}`);
  //console.log(`export NILE_ACCESS_TOKEN=${nile.authToken}`);
}

exports.maybeCreateUser = async function (
  nile: nileAPI, email: string, password: string, role: string): Promise< string | null > {

  // Check if tenant exists, create if not
  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==email)) {
      console.log(emoji.get('dart'), "User " + email + " exists");
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : email,
        password : password,
        metadata : { "role": role }
      }
    }).then ( (usr) => {
      if (usr != null)
        console.log(emoji.get('white_check_mark'), "Created User: " + usr.email);
    }).catch((error:any) => {
      if (error.message == "user already exists") {
        console.log("User with email " + email + " already exists");
      } else {
        console.error(error);
        process.exit(1);
      }
    })
  }
}

exports.maybeCreateOrg = async function (
  nile: nileAPI, orgName: String, createIfNot: boolean): Promise< string | null > {

  // Check if organization exists
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeOrg = myOrgs.find( org => org.name == orgName);
  if (maybeOrg) {
    console.log(emoji.get('dart'), "Org " + orgName + " exists with id " + maybeOrg.id);
    //console.log(`export NILE_ORGANIZATION_ID=${maybeOrg.id}`);
    return maybeOrg.id;
  } else if (createIfNot == true) {
    await nile.organizations.createOrganization({"createOrganizationRequest" :
    {
      name: orgName,
    }}).then ( (org) => {
      if (org != null) {
        orgID = org.id;
        console.log(emoji.get('white_check_mark'), "Created new org " + org.name + " with orgID " + orgID);
      }
    }).catch((error:any) => {
      if (error.message == "org already exists") {
        console.log("Org with name " + orgName + " already exists but cannot get ID");
        process.exit(1);
      } else {
        console.error(error);
        process.exit(1);
      }
    })
    //console.log(`export NILE_ORGANIZATION_ID=${orgID}`);
    return(orgID);
  } else {
    return null;
  }
  return null;
}

exports.maybeAddUserToOrg = async function (
  nile: nileAPI, email: String, orgID: string): Promise< null > {

  // Add user to organization
  const body = {
    org: orgID,
    addUserToOrgRequest: {
      email: email,
    },
  };
  await nile.organizations
    .addUserToOrg(body)
    .then((data) => {
      console.log(emoji.get('white_check_mark'), `Added tenant ${email} to orgID ${orgID}`);
    }).catch((error:any) => {
      if (error.message.startsWith('User is already in org')) {
        console.log(emoji.get('dart'), `User ${email} exists in orgID ${orgID}`);
      } else {
        console.error(error)
        process.exit(1);
      }
    });
}

exports.getAdminForOrg = function (
  admins: string, orgID: string) {

  for (let index = 0; index < admins.length ; index++) {
    let org = admins[index].org;
    if (org === orgID) {
      return admins[index];
    }
  }
  return null;
}
