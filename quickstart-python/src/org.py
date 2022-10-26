#! /usr/bin/env python

import os
import sys

from dotenv import load_dotenv
from emoji import emojize

from nile_api import AuthenticatedClient, Client
from nile_api.api.users import login_user
from nile_api.api.organizations import create_organization, list_organizations
from nile_api.models.login_info import LoginInfo
from nile_api.models.create_organization_request import CreateOrganizationRequest

GOOD = emojize(":check_mark_button:")
BAD = emojize(":red_circle:")
DART = emojize(":dart:", language="alias")
ARROW_RIGHT = emojize(":arrow_right:", language="alias")

load_dotenv(override=True)
params = {
    param: os.environ.get(param)
    for param in ["NILE_URL", "NILE_WORKSPACE"]
}
NILE_ENTITY_NAME = "DB"

for name, value in params.items():
    if not value:
        print(
            f"{BAD} Error: missing environment variable {name}. See .env.defaults for more info and copy it to .env with your values",  # noqa: E501
        )
        sys.exit(1)


def run():
    email = "shaun@colton.demo"
    password = "password"

    token = login_user.sync(
        client=Client(base_url=params["NILE_URL"]),
        workspace=params["NILE_WORKSPACE"],
        json_body=LoginInfo(email=email, password=password),
    )

    client = AuthenticatedClient(base_url=params["NILE_URL"], token=token.token)

    print(f"\n{ARROW_RIGHT} Logged into Nile as user {email}")
    print(f"export NILE_ACCESS_TOKEN={token.token}")

    # Check if org exists, create if not
    org_name = "Colton Labs"
    organizations = list_organizations.sync(client=client, workspace=params["NILE_WORKSPACE"])
    organization = next(
        (each for each in organizations if each.name == org_name),
        None,
    )
    if organization is not None:
        print(f"{GOOD} Organization {organization.name!r} exists with id {organization.id}")
    else:
        organization = create_organization.sync(
            workspace=params["NILE_WORKSPACE"],
            client=client,
            json_body=CreateOrganizationRequest(name=org_name),
        )
        print(f"{GOOD} Created new org {organization.name!r} with orgID {organization.id}")


if __name__ == "__main__":
    run()
