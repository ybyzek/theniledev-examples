#! /usr/bin/env python

from pathlib import Path
import os
import json
import sys

from dotenv import load_dotenv
from emoji import emojize

from nile_api import AuthenticatedClient, Client
from nile_api.api.access import (
    create_policy,
    delete_policy,
    list_policies,
)
from nile_api.api.users import login_user
from nile_api.api.organizations import list_organizations
from nile_api.api.entities import list_instances
from nile_api.models.login_info import LoginInfo
from nile_api.models.create_policy_request import CreatePolicyRequest
from nile_api.models.action import Action
from nile_api.models.resource import Resource
from nile_api.models.subject import Subject

GOOD = emojize(":check_mark_button:")
BAD = emojize(":red_circle:")

load_dotenv(override=True)
params = {
    param: os.environ.get(param)
    for param in [
        "NILE_URL",
        "NILE_WORKSPACE",
        "NILE_ORGANIZATION_NAME",
        "NILE_ENTITY_NAME",
    ]
}

for name, value in params.items():
    if not value:
        print(
            f"{BAD} Error: missing environment variable {name}. See .env.defaults for more info and copy it to .env with your values"  # noqa: E501
        )
        sys.exit(1)

users_path = Path(__file__).absolute().parent.parent.joinpath(
    "usecases",
    params["NILE_ENTITY_NAME"],
    "init",
    "users.json",
)
try:
    contents = users_path.read_text()
except FileNotFoundError:
    print(f"{BAD} could not find {users_path}")
    sys.exit(1)
else:
    # Load first user only
    user, *_ = json.loads(contents)

NILE_TENANT1_EMAIL = user["email"]
NILE_TENANT_PASSWORD = user["password"]

# Login user (org creator)
admins_path = Path(__file__).absolute().parent.parent.joinpath(
    "usecases",
    params["NILE_ENTITY_NAME"],
    "init",
    "admins.json",
)
try:
    contents = admins_path.read_text()
except FileNotFoundError:
    print(f"{BAD} could not find {admins_path}")
    sys.exit(1)
else:
    # Load first admin only
    admin, *_ = json.loads(contents)
token = login_user.sync(
    client=Client(base_url=params["NILE_URL"]),
    workspace=params["NILE_WORKSPACE"],
    json_body=LoginInfo(email=admin["email"], password=admin["password"]),
)
client = AuthenticatedClient(base_url=params["NILE_URL"], token=token.token)

organizations = list_organizations.sync(
    workspace=params["NILE_WORKSPACE"],
    client=client,
)
matching = (
    organization
    for organization in organizations
    if organization.name == params["NILE_ORGANIZATION_NAME"]
)
org = next(matching, None)
if org is not None:
    print(f"{GOOD} Mapped organization name {org.name} to ID {org.id}")
else:
    print(
        f"{BAD} Could not map organization name {params['NILE_ORGANIZATION_NAME']} to an ID"  # noqa: E501
    )
    sys.exit(1)

policies_start = list_policies.sync(
    client=client,
    workspace=params["NILE_WORKSPACE"],
    org=org.id,
)
for each in policies_start:
    response = delete_policy.sync_detailed(
        client=client,
        workspace=params["NILE_WORKSPACE"],
        org=org.id,
        policy_id=each.id,
    )
    print("policy id {} is deleted".format(each.id))

print("\nPolicies post-delete:")
policies_end = list_policies.sync(
    client=client,
    workspace=params["NILE_WORKSPACE"],
    org=org.id,
)
print([each.name for each in policies_end])

sys.exit(0)
