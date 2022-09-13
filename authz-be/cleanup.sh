#!/bin/sh

mongosh <<EOF
use role_auth;
db.users.drop();
db.pages.drop();
EOF
