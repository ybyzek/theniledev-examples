# Overview

These are usecases (think: data models and data sets) for running the examples.

## Out of the Box

Nile supports many different use cases.
This examples repo provides a few use cases out-of-the-box for running with Nile:

- [Database as a Service](DB/)
- [SkyNet as a Service](SkyNet/)
- [Banking as a Service](Banking/)

## YOLO

If you decide to adapt the examples for your own usecase, define your own service offering and required assets to run the examples.
Use [Database as a Service](./DB/) as a template, copy the files from that folder into a new folder and then modify the files to fit your needs.

## Folder contents

The contents of the use case folder matches the following directory structure (names must be exact):

```bash
├── FormFields.ts
├── entity_definition.json
├── init
│   ├── Page.js
│   ├── entities.json
│   ├── entity_utils.js
│   └── users.json
└── logo.svg
```

The purpose of each file is as follows:

- `FormFields.ts`: used by the [webapp](../webapp) for creating new and displaying existing instances
- `entity_definition.json`: (required) represents the entity schema
   - In order to use this entity type with the `data-plane/pulumi` example, the schema must include a `status` field
- `init/`: this folder is only used by the examples to initialize the Nile control plane with prepopulated values (not required for real production)
  - `init/Pages.js`: used by the [authz-be](../authz-be) example to create a schema for the local MongoDB table that uses the entity table
  - `init/entity_utils.js`: (required) used by the [quickstart](../quickstart) to check if an entity already exists with some criteria, or create a new instance if not
  - `init/entities.json`: (required) starting list of entities, must adhere to the schema defined in `entity_definition.json`.
     - There must be at least three entities
  - `init/users.json`: (required) starting list of users and their respective organizations
     - There must be at least two users in two different orgs
- `logo.svg`: used by the [webapp](../webapp) to customize the UI
