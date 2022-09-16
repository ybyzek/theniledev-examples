# Webapp Frontend

![image](../images/Nile-text-logo.png)

## Overview

This examples uses [Next.js](https://nextjs.org/) to create a frontend for a SaaS appliation integrated with [Nile](https://thenile.dev/).

It was built from from Nile's [Next.js webapp template](https://github.com/TheNileDev/nextjs/generate).

## Setup

1. Create certificates for your local machine and accept them. The Nile backend will only serve cookies to `\*.thenile.dev` domains, which is required for login

- edit `/etc/hosts` and add `127.0.0.1 local.thenile.dev`.
- `mkdir .certificates && cd .certificates`
- add an ssl key (this one lasts 1 year)

   ```bash
   openssl req -x509 -out localhost.crt -keyout localhost.key \
     -days 365 \
     -newkey rsa:2048 -nodes -sha256 \
     -subj '/CN=*.thenile.dev' -extensions EXT -config <( \
     printf "[dn]\nCN=*.thenile.dev\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:*.thenile.dev\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
   ```

2. Opne the certificate just created (`open localhost.crt`), and double click on the certificate in your keychain.

3. From the pop up window, open the dropdown for `Trust` and select `Always Trust`.

4. For all examples, you need a local file with your Nile configuration.
For that purpose, at the top-level of the examples, copy the `.env.defaults` file to `.env`:

```bash
# From the top level of the examples folder
$ examples> cp .env.defaults .env
```

Set the values in this `.env` file to match the values you want in your control plane.

> For this Next.js example, make sure to define the parameters that start with prefix `NEXT_PUBLIC_` to match.

## Install Dependencies

```bash
yarn install
```

## Setup

Setup the Nile control plane

```bash
yarn setup-nile
```

## Run the server locally

```bash
yarn dev
```

## Validate

1. Open [https://local.thenile.dev](http://local.thenile.dev) with your browser and log in a user.
Use one of the available users defined in [userList.json](../quickstart/src/datasets/userList.json).

   The user login screen should resemble below:

   ![image](images/login.png)

2. Log into the [Nile Admin Dashboard](https://nad.thenile.dev/) to see the control plane and entity instances.
For the email and password, use the `NILE_DEVELOPER_EMAIL` and `NILE_DEVELOPER_PASSWORD` values you specified in the `.env` file.

   Your dashboard should resemble below:

   ![image](images/nad.png)
