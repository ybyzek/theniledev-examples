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
This example uses Python and the NILE REST API to demonstrate authorization features in Nile in the following workflow:

- List policies
- Create a new policy that denies the user access to instances of the type `DB` (organization is provided in the request)

  ```json
  {
    "actions": [ "deny" ],
    "resource": { "type": "DB" },
    "subject": { "email": "polina@demo.io" }
  }
  ```

- Delete the policy


## Install Dependencies

Note that this example has been validated with Python 3.8.9 so please ensure you are using a compatible version.

Run the following command:

```
pip3 install -r requirements.txt
```

## Setup

1. For all examples, you need a local file with your Nile configuration.
For that purpose, at the top-level of the examples, copy the `.env.defaults` file to `.env`:

```bash
# From the top level of the examples folder
$ examples> cp .env.defaults .env
```

2. Set the values in this `.env` file to match the values you want in your control plane.

3. Configure your Nile control plane manually according to the values above, or by running the quickstart

```
yarn --cwd ../quickstart/ install && yarn --cwd ../quickstart/ start
```


## Execute

To execute the workflow, run the following command:

```
python authz.py
```
