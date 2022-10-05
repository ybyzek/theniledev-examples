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
        cluster_name : instanceJson.cluster_name,
        ARN : instanceJson.ARN,
        Endpoint : instanceJson.Endpoint,
        status : "Up"
      }
    }).then((entity_instance) => console.log ("Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }
}

exports.instanceName = "cluster_name";

exports.setDataPlaneReturnProp = "Endpoint";

exports.getDataPlaneReturnValue = function () {
  min = Math.ceil(100000);
  max = Math.floor(999999);
  return (String("foo-" + Math.floor(Math.random() * (max - min + 1)) + min) + ".clrb45fomzui.us-east-2.rds.amazonaws.com:3306");
}
