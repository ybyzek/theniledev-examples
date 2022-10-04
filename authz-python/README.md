# Authorization

![image](../images/Nile-text-logo.png)

## Overview

This example uses Python and the NILE REST API to demonstrate authorization features in Nile in the following workflow:

- List policies
- Create a new policy that denies the user access to instances of the type `DB` (organization is provided in the request)

  ```json
  {
    "actions": [ "deny" ],
    "resource": { "type": "DB" },
    "subject": { "email": "nora@demo.io" }
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
