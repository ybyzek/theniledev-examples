# Authorization

![image](../images/Nile-text-logo.png)

## Overview

As described in the [top-level README](../README.md), the mock scenario in these examples is a company that provides SaaS.

![image](../images/saas.png)

These examples let you choose what kind of SaaS offering is provided, one of:

- [Database as a Service](../usecases/DB/) (same as in the Nile Quickstart)
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
    "subject": { "email": "polina@demo.io" }
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

You must do all the steps in the [Setup section](../README.md#setup) of the top-level README.md.

:stop_sign: **STOP** :stop_sign: Do not proceed until you have done the above setup :heavy_exclamation_mark:

Then, run the following command to preconfigure the Nile control plane with an entity, organizations, users, and entity instances for the mock usecase, so that you're not starting from scratch.

```bash
yarn setup-nile
```

## Execute

To execute the workflow, run the following command:

```
yarn start
```
