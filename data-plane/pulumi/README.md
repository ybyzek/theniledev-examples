# Nile Data Plane Example #

## Table of Contents

* [Overview](#overview)
* [Prerequisites](#prerequisites)
* [Configure the Control Plane](#configure-the-control-plane)
* [Configure the Data Plane](#configure-the-data-plane)
* [Run the reconciler](#run-the-reconciler)
* [Explanation](#Explanation)
* [Add or remove instances](#add-or-remove-instances)


## Overview

This example demonstrates how to synchronize (i.e., `reconcile`) the data
plane and control plane in real time with Nile events.

Nile doesn't prescribe any particular deployment solution, but here we'll be
using [Pulumi](https://app.pulumi.com/) to deploy objects into AWS. 

> If you're using another tool like Kubernetes or Terraform, replace
> the [`PulumiAwsDeployment`](./src/commands/reconcile/lib/pulumi/PulumiAwsDeployment.ts) 
> class in this example with your own deployment implementation.

## Prerequisites ##

This example assumes you have:

* [An AWS account](https://aws.amazon.com/free/)
* [A Pulumi account](https://app.pulumi.com/signup) that's
  [connected to your AWS account](https://www.pulumi.com/docs/get-started/aws/begin/)
* [The Pulumi CLI installed](https://www.pulumi.com/docs/reference/cli/)
* A Nile developer account using an email address and password

## Configure the Control Plane ##

> If you're not familiar with the terminology used below, be sure to read the
> [Nile Quickstart](https://www.thenile.dev/docs/current/quick-start-ui).

1. Login to the [Nile Admin Dashboard](https://nad.thenile.dev/).
2. If there isn't one already, create a workspace named "clustify".
3. Create an entity type named "SkyNet". For this example, the entity defintion can have a simple schema:

```json
{
  "name": "SkyNet",
  "schema": {
    "type": "object",
    "properties": {
      "greeting": {
        "type": "string"
      }
    },
    "required": [
      "greeting"
    ]
  }
}
```

4. Create an organization in the workspace named "sac-norad".
5. Create a "SkyNet" instance in the organization, with a value that matches 
   the schema defined earlier:

```json
{
  "greeting": "Come with me if you want to live."
}
```

## Configure the Data Plane ##

> These instructions summarize how to [get started with Pulumi](https://www.pulumi.com/docs/get-started/aws/begin/)
> on AWS. See their docs for a more complete setup.

1. Set up a new Pulumi project called `pulumi-clustify`:

```bash
mkdir pulumi-clustify && cd pulumi-clustify
pulumi new aws-typescript
```

When prompted, accept the defaults:

```
project name: (pulumi-clustify)
project description: (A minimal AWS TypeScript Pulumi program) 
Created project 'pulumi-clustify'

Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
stack name: (dev) 
Created stack 'dev'

aws:region: The AWS region to deploy into: (us-east-1)
Saved config
```

2. Run `pulumi up` to validate that Pulumi is configured correctly. This will
create a new Pulumi stack named `dev`. We won't be using this stack, but its
presence verifies that you're ready to proceed.

```bash
pulumi up
```

## Run the reconciler ##

There are several ways to run the reconciler, as described in the following sections.

For any of these options, back up in the `data-plane/pulumi` directory, first copy the `.env.defaults` file to `.env`:

```bash
cp .env.defaults .env
```

And then set the values in this `.env` file to match the values used in the setup of the control plane.
One of the values required is `NILE_ORGANIZATION_ID` which is not visible in the NAD yet, but can be obtained in NAD from the URL when you select an org.
For example, in the URL `https://nad.thenile.dev/clustify/organization/org_02qfJTCBve6bw0XlxC92CG`, the organization id is `org_02qfJTCBve6bw0XlxC92CG`.

### Using `yarn`

1. Back up in the `data-plane/pulumi` directory, create the executable command binary with the following command

```bash
yarn install && yarn build
```

2. Run the reconciler:

```bash
yarn start
```

### Executable binary

1. Back up in the `data-plane/pulumi` directory, create the executable command binary with the following command

```bash
yarn install && yarn build
```

2. Source the `.env` parameters into your shell.

```bash
source .env
```

3. Run the following reconciler executable:

```bash
 ./bin/dev reconcile --basePath $NILE_URL \
 --workspace $NILE_WORKSPACE_NAME \
 --entity $NILE_ENTITY_NAME \
 --organization $NILE_ORGANIZATION_ID \
 --email $NILE_DEVELOPER_EMAIL \
 --password $NILE_DEVELOPER_PASSWORD
 ```

### Docker

1. Back up in the `data-plane/pulumi` directory, run the reconciler Docker image, taking note to validate the 3 input parameters required to connect to S3 and Pulumi:

```bash
docker run --init --rm \
  --env-file .env \
  -e AWS_ACCESS_KEY_ID=$(aws configure get aws_access_key_id) \
  -e AWS_SECRET_ACCESS_KEY=$(aws configure get aws_secret_access_key) \
  -e PULUMI_ACCESS_TOKEN=$PULUMI_ACCESS_TOKEN \
  theniledev/reconciler:v0.1
```

## Explanation

The reconciler will immediately find the newly instantiated SkyNet instance in the Nile
control plane and create a Pulumi stack that represents it, defined by the
[`pulumis3` program](./src/commands/reconcile/lib/pulumi/pulumiS3.ts). This
includes a new S3 bucket containing a static website and a bucket policy that
allows public access.

The reconciler will also log out the instance properties, including the 
`websiteUrl` of the object created by the [`pulumis3` program](./src/commands/reconcile/lib/pulumi/pulumiS3.ts):

```bash
Outputs:

    bucketPolicy: {
        // ...redacted...
    }
    object      : {
        // ...redacted...
    }
    websiteUrl  : "s3-website-bucket-5c7d7bc.s3-website.us-east-2.amazonaws.com"

Resources:
    + 4 created

Duration: 5s
```

Pull up that `websiteUrl` in-browser and verify you see the provided `greeting`
as well as all of the instance details.

## Add or Remove Instances ##

In the [Nile Admin Dashboard](https://nad.thenile.dev/), add one or
more SkyNet instances to the organization. This will trigger events that the
command receives, and will synchronize accordingly. Deleting an instance in the
control plane will result in destruction of the corresponding Pulumi stack.
