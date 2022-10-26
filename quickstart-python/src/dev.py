#! /usr/bin/env python

import json
import os
import sys

from dotenv import load_dotenv
from emoji import emojize

from nile_api import AuthenticatedClient, Client
from nile_api.api.developers import create_developer
from nile_api.api.users import create_user, list_users
from nile_api.models.create_user_request import CreateUserRequest

GOOD = emojize(":check_mark_button:")
BAD = emojize(":red_circle:")
DART = emojize(":dart:", language="alias")
ARROW_RIGHT = emojize(":arrow_right:", language="alias")

load_dotenv(override=True)
params = {
    param: os.environ.get(param)
    for param in [
        "NILE_URL",
        "NILE_WORKSPACE",
        "NILE_DEVELOPER_EMAIL",
        "NILE_DEVELOPER_PASSWORD",
    ]
}
NILE_ENTITY_NAME = "DB"

for name, value in params.items():
    if not value:
        print(
            f"{BAD} Error: missing environment variable {name}. See .env.defaults for more info and copy it to .env with your values",  # noqa: E501
        )
        sys.exit(1)


def run():
    # Signup developer
    response = create_developer.sync_detailed(
        client=Client(base_url=params["NILE_URL"]),
        json_body=CreateUserRequest(
            email=params["NILE_DEVELOPER_EMAIL"],
            password=params["NILE_DEVELOPER_PASSWORD"],
        ),
    )
    if response.parsed is not None:
        print(f"{GOOD} Signed up for Nile at {params['NILE_URL']} as developer {params['NILE_DEVELOPER_EMAIL']}")
    else:
        error = json.loads(response.content)
        if error["message"] == "user already exists":
            print(f"{DART} Developer {params['NILE_DEVELOPER_EMAIL']} already exists")
        else:
            print(f"{BAD} Error: {error.message}")
            sys.exit(1)


if __name__ == "__main__":
    run()
