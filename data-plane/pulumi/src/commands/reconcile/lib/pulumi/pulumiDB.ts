import * as aws from '@pulumi/aws';
import * as pulumi from "@pulumi/pulumi";
import { PolicyDocument } from '@pulumi/aws/iam';
import { Instance } from '@theniledev/js';

export const pulumiDB = (instance?: Instance) => {
  return async () => {
    const instanceProps = instance?.properties as { [key: string]: unknown };
    const { instanceName } = require(`../../../../../../../usecases/${instance?.type}/init/entity_utils.js`);

    // Note: must follow convention of DB names (alphanumeric, etc)
    let uniqueValue = "dummy";
    if (String(instanceProps[instanceName]) !== "undefined") {
      uniqueValue = String(instanceProps[instanceName]);
    }

    // Create a DB
    const newDB = new aws.rds.Instance("nile-demo-", {
        allocatedStorage: 10,
        dbName: uniqueValue,
        engine: "mysql",
        engineVersion: "5.7",
        instanceClass: "db.t3.micro",
        parameterGroupName: "default.mysql5.7",
        backupRetentionPeriod: 0,
        username: "foo",
        password: "password",
        publiclyAccessible: true,
        skipFinalSnapshot: true,
    });

    return {
      endpoint: pulumi.interpolate`${newDB.endpoint}`,
      address: pulumi.interpolate`${newDB.address}`,
    };
  };
};
