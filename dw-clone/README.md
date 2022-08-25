# Data Warehouse clone

An example of a Data Warehouse cloud service built on Nile.

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
✨  Done in 2.58s.
```

## Execute

Run the following command:

```
yarn setup
```

To run it repeatedly with new entries, pass in a unique parameter that will be the suffix:

```
yarn setup 2
```

## Validate

Run the following command:

```
yarn test-setup
```

Log into the [Nile Admin Dashboard](https://nad.thenile.dev/) (default username/password: dev-mary@dw.demo/password) to see the control plane and data plane instances. 
