# Nile Examples

![image](images/Nile-text-logo.png)

## Contents

* [Overview](#overview)
* [Setup](#setup)
* [Examples](#examples)
  * [Quickstart](#quickstart)
  * [Multi-tenancy](#multi-tenancy)
  * [Data Plane](#data-plane)
  * [Authorization](#authorization)
  * [Webapp](#webapp)
  * [Other](#other)
* [Advanced Configuration](#advanced-configuration)

## Overview

This collection of examples demonstrates how to use Nile as a control plane for an Infrastructure SaaS product.
Nile provides an entity system, event system, and tenant-aware metrics.

### Where to start

Run the Quickstart to setup your control plane in Nile.
Follow on with any of the other modules for different use cases.
The modules can also be run sequentially to build on top of one another, in which case, we recommend running them in the order presented here to build up your SaaS as you go.
Don't forget to run the webapp which builds on the control plane; it includes a front-end for self-service provisioning, where a user can log in to view and create new entity instances, for example:

![image](webapp/images/instances.png)

And view metrics for each of their instances:

![image](webapp/images/metrics.png)

## Setup

1. Navigate your web browser of choice to the [Nile Admin Dashboard](https://nad.thenile.dev/) and click `Continue with Google` to login via SSO. (Don't want SSO? Go to the [Nile website](https://thenile.dev), enter your email address, and click `Talk to us`, then someone from Nile will contact you to setup up an email and password for you)

2. If you don't already have a Nile workspace, create it now. From the dashboard, click `Create a workspace`, and in the textbox enter the name of a new workspace. This represents your control plane where your SaaS application lives.

3. From the dashboard, get your [workspace access token](https://www.thenile.dev/docs/current/quick-start-ui#more-examples).  This token enables you to programmatically run the examples in this repo.

4. From a terminal window, clone the [theniledev/examples](https://github.com/theniledev/examples) repo and change into the new directory.

   ```bash
   git clone git@github.com:TheNileDev/examples.git
   cd examples
   ```

4. To run any example, you need a local `.env` file with your Nile configuration.
At the top-level of the examples, copy the [.env.defaults](.env.defaults) file to a new file `.env`, and then edit the values in the `.env` file to match what you created in the dashboard. In particular, set the values of your Nile workspace and credentials to match what you have in the Nile Admin Dashboard.

   ```bash
   cp .env.defaults .env     # edit file (set NILE_WORKSPACE, and {NILE_WORKSPACE_ACCESS_TOKEN} or {NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD})
   ```

5. For the Javascript examples, validate your environment has the minimum required Node version v18.0.0 or higher. If you are running earlier versions, you may encounter errors such as `ReferenceError: fetch is not defined`. (If you use `nvm`, run `nvm use`).
   
> Note: the languages presented below are an indication just of which examples have been developed, not of what's available.
> Please see the Nile API and SDK documentation for details.

## Examples

### Quickstart

Start with the quickstart to configure a base Nile control plane.
This provides a simple setup to learn the concepts but also serves as the foundation for the other examples below.

- [Quickstart with JS](quickstart) | JS SDK | Setup a minimal Nile control plane with a single tenant
- [Quickstart with Python](quickstart-python) | Python SDK | Setup a minimal Nile control plane with a single tenant

### Multi-tenancy

Tenants have access to specific organizations that have isolated sets of resources.
Users are allowed to access only the entity instances in the organizations to which they have been added.

- [Multi-tenancy](multi-tenancy/) | JS SDK | Setup the Nile control plane with multiple tenants and users

### Data Plane

These examples show how to synchronize, e.g. reconcile, your data plane and control plane in real time with Nile events.
As instances are created or destroyed from the control plane, the example reconciler creates or destroys data plane deployments.
Even if you're using another deployment tool like Kubernetes or Terraform, similar principles apply as they do for Pulumi.

- [Data Plane with Pulumi via JS](data-plane/pulumi/) | JS SDK | Synchronize your data plane and control plane
- [Data Plane with Apache Flink and Kubernetes via JS](data-plane/k8s/) | JS SDK | Synchronize a control plane built with Nile with data plane that uses Apache Flink and Kubernetes
- [Data Plane with Apache Flink and Kubernetes via Python](data-plane-python/k8s/) | Python SDK | Synchronize a control plane built with Nile with data plane that uses Apache Flink and Kubernetes

### Authorization

Attribute-based access control (ABAC) is an authorization model that gives you fine-grained authorization capabilities.
You can configure these in the control plane so that they are aligned to your business's security policies.

- [Authorization with JS](authz/) | JS SDK | Use ABAC to grant and revoke permissions to resources
- [Authorization with Python](authz-python/) | Python SDK | Use ABAC to grant and revoke permissions to resources
- [Authorization App Backend with JS](authz-be/) | JS SDK | Authorize users against Nile control plane for your backend applications

### Webapp

Configure a front-end web application that is customizable on a per-tenant basis.
The webapp includes Nile React components for metrics, because it is critical for any SaaS to be able to measure and monitor consumption and do accurate tenant billing.
These metrics can be exposed externally to the end user as well as internally for business operations.

- [Webapp](webapp/) | JS SDK | Builds a self-service frontend that integrates with Nile on the backend

### Other

Here are additional examples that you can refer to.

- [Python + Flask Todo List Webapp](python-flask-todo-list/) | Python REST | Take a basic Todo List webapp written in Python and Flask and turn it to a PLG SaaS product with Nile APIs

## Advanced Configuration

The default scenario in these examples is a company that provides a database as SaaS. 
But you can modify the `NILE_ENTITY_NAME` parameter in your `.env` file (see [Setup](#setup)) to change it to be any other type of service offering, one of:

- [Database as a Service](usecases/DB/) (same as in the Nile Quickstart): `NILE_ENTITY_NAME=DB`
- [SkyNet as a Service](usecases/SkyNet/): `NILE_ENTITY_NAME=SkyNet`
- [Banking as a Service](usecases/Banking/): `NILE_ENTITY_NAME=Banking`
- [Workload as a Service](usecases/Workload/): `NILE_ENTITY_NAME=Workload`
- [YOLO](usecases/README.md#yolo)
