# Nile Data Plane Example #

This example demonstrates how to synchronize (i.e., `reconcile`) your data
plane and control plane in real time with Nile events.

Nile doesn't prescribe any particular deployment solution, but here we'll be
using [Pulumi](https://app.pulumi.com/) to deploy objects into AWS. 

> If you're using another tool like Kubernetes or Terraform, you could replace
> the [`PulumiAwsDeployment`](./src/commands/reconcile/lib/pulumi/PulumiAwsDeployment.ts) 
> class in this example with your own deployment implementation.

## Prerequisites ##

This example assumes you have:

* [An AWS account](https://aws.amazon.com/free/)
* [A Pulumi account](https://app.pulumi.com/signup) that's
  [connected to your AWS account](https://www.pulumi.com/docs/get-started/aws/begin/)
* [The Pulumi CLI installed](https://www.pulumi.com/docs/reference/cli/)
* A Nile developer account using an email address and password

## Configure Your Control Plane ##

> If you're not familiar with the terminology used below, be sure to read the
> [Nile Quickstart](https://www.thenile.dev/docs/current/quick-start-ui).

1. [Login to the Nile Admin Dashboard](https://nad.thenile.dev/) If you don't
   already have one, create a workspace named "clustify".
2. Create an entity type named "SkyNet". A simple schema is sufficient for
   this example:

```json
{
  "name": "SkyNet",
  "schema": {
    "type": "object",
    "properties": {
      "greeting": {
        "type": "string"
      }
    }
  }
}
```

3. Create an organization in your workspace named "sac-norad".
4. Create a "SkyNet" instance in your organization, with a value that matches 
   the schema defined earlier:

```json
{
  "greeting": "Come with me if you want to live."
}
```

## Configure Your Data Plane ##

> These instructions summarize how to [get started with Pulumi](https://www.pulumi.com/docs/get-started/aws/begin/)
> on AWS. See their docs for a more complete setup.

Set up a new Pulumi project:

```bash
mkdir pulumi-clustify && cd pulumi-clustify
pulumi new aws-typescript
```

and accept the defaults:

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

Run `pulumi up` to ensure that you've configured Pulumi correctly. This will
create a new Pulumi stack named `dev`. We won't be using this stack, but its
presence verifies that you're ready to proceed.

## Create and run the reconciler ##

Back up in the `data-plane/pulumi` directory, run `yarn install && yarn build` to create the executable command binary.

Copy the `.env.defaults` file to `.env`, and set the values of this new file to match the values you used in the setup of your control plane.
One of the values required is the organization ID which is not visible in the NAD yet, but can be obtained from the URL when you select an org.
For example, in the URL `https://nad.thenile.dev/clustify/organization/org_02qfJTCBve6bw0XlxC92CG`, the organization id is `org_02qfJTCBve6bw0XlxC92CG`.

Test the reconciler as follows:

```
yarn install
yarn run start
```

It automatically imports the `.env` file you created earlier and provide the input parameters for the reconciler.
The reconciler will immediately find the newly instantiated SkyNet instance in your Nile
control plane and create a Pulumi stack that represents it, defined by the
[`pulumis3` program](./src/commands/reconcile/lib/pulumi/pulumiS3.ts). This
includes a new S3 bucket containing a static website and a bucket policy that
allows public access.

The command will also log out the instance properties, including the 
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

Pull up that `websiteUrl` in-browser and you'll find your provided `greeting`
as well as all of your instance details.

## Add/Remove Instances ##

In the [Nile Admin Dashboard](https://nad.thenile.dev/), add one or
more SkyNet instances to your organization. This will trigger events that the
command receives, and will synchronize accordingly. Deleting an instance in your
control plane will result in destruction of the corresponding Pulumi stack.
