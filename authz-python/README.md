# Authorization

![image](../images/Nile-text-logo.png)

## Overview

This example uses Python and the NILE REST API to demonstrate authorization features in Nile in the following workflow:

- List rules
- Create a new rule that denies the user access to instances of the type `SkyNet` (organization is provided in the request)

  ```json
  {
    "actions": [ "deny" ],
    "resource": { "type": "SkyNet" },
    "subject": { "email": "nora@demo.io" }
  }
  ```

- Delete the rule


## Install Dependencies

Note that this example has been validated with Python 3.8.9 so please ensure you are using a compatible version.

Run the following command:

```
pip3 install -r requirements.txt
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
python authz.py
```
