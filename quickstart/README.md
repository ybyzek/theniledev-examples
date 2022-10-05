# Quickstart

![image](../images/Nile-text-logo.png)

## Overview

This quickstart setups up your [Nile](https://thenile.dev/) control plane.
The mock scenario in these examples is a company that provides SaaS, one of the following offerings:

- [Database as a Service](../usecases/DB/)
- [SkyNet as a Service](../usecases/SkyNet/)
- [Banking as a Service](../usecases/Banking/)
- [Clusters as a Service](../usecases/clusters/)
- [YOLO](../usecases/README.md#yolo)

When you run this quickstart, it creates (or validates the existence of) the following control plane in Nile:

- Sign up a new developer
- Create a workspace, which must be globally unique
- Create an entity type called that corresponds to whatever `NILE_ENTITY_NAME` is defined in your `.env` file (many are also available as a template from the Nile Admin Dashboard).  The available entity types are [here](../usecases/).
- Create an organization with a user 
- Create a entity instance in the organization, with a value that matches the schema defined earlier

## Install Dependencies

Run the following command:

```
yarn install
```

Your output should resemble:

```bash
yarn install v1.22.19
warning package.json: No license field
warning No license field
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
✨  Done in 2.26s.
```

## Setup

For all examples, you need a local file with your Nile configuration.
For that purpose, at the top-level of the examples, copy the `.env.defaults` file to `.env`:

```bash
# From the top level of the examples folder
$ examples> cp .env.defaults .env
```

Set the values in this `.env` file to match the values you want in your control plane.

To match the Nile quickstart from the docs, set `NILE_ENTITY_NAME=clusters` (see [Clusters as a Service](../usecases/clusters/) for details). 

## Execute

To execute the workflow, run the following command:

```
yarn start
```

## Validate

Log into the [Nile Admin Dashboard](https://nad.thenile.dev/) to see the control plane and entity instances.
For the email and password, use the `NILE_DEVELOPER_EMAIL` and `NILE_DEVELOPER_PASSWORD` values you specified in the `.env` file.

Your dashboard should resemble below:

![image](images/nad.png)

Nile automatically generates the OpenAPI spec for the new entity, see the `OPENAPI` tab in the dashboard.
