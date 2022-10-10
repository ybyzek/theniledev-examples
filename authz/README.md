# Authorization

![image](../images/Nile-text-logo.png)

## Overview

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

These examples let you choose what kind of SaaS offering is provided, one of:

- [Clusters as a Service](../usecases/clusters/) (same as in the Nile Quickstart)
- [Database as a Service](../usecases/DB/)
- [SkyNet as a Service](../usecases/SkyNet/)
- [Banking as a Service](../usecases/Banking/)
- [YOLO](../usecases/README.md#yolo)

For this service, you can use Nile's built-in entities to enforce access policies.
This example uses the NILE JS SDK to demonstrate authorization features in Nile in the following workflow:

- List the instances of `DB` entity type allowed to be read in a given organization by one of the predefined users from the [usecases](../usecases/)
- Create a new policy that denies the user access to instances of the type `DB` (organization is provided in the request)

  ```json
  {
    "actions": [ "deny" ],
    "resource": { "type": "DB" },
    "subject": { "email": "nora@demo.io" }
  }
  ```

- List the `DB` instances allowed to be read by the user in a given organization: should be none
- Delete the policy
- List the `DB` instances allowed to be read by the user in a given organization


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

## Execute

To execute the workflow, run the following command:

```
yarn start
```
