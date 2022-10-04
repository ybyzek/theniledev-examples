exports.addInstanceToOrg = async function (nile, orgID, entityName, instanceJson) {

  // Check if entity instance already exists, create if not
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: entityName,
  });
  let maybeInstance = myInstances.find( instance => instance.type == entityName && instance.properties[exports.instanceName] == instanceJson[exports.instanceName] );
  if (maybeInstance) {
    console.log("Entity instance " + entityName + ` exists where ` + exports.instanceName + ` is ${instanceJson[exports.instanceName]} (id: ${maybeInstance.id})`);
  } else {
    console.log(myInstances);
    await nile.entities.createInstance({
      org: orgID,
      type: entityName,
      body: {
        greeting : instanceJson.greeting,
        status : "Up"
      }
    }).then((entity_instance) => console.log ("Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }
}

exports.instanceName = "greeting";

exports.setDataPlaneReturnProp = null;
