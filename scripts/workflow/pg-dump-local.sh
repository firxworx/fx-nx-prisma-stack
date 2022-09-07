#!/usr/bin/env bash

#######################################################################################################################
# Dump the local postgres database to an SQL file in the ./db-dumps folder
#######################################################################################################################

set -euo pipefail
IFS=$'\n\t'

GIT_REPO_ROOT=$(git rev-parse --show-toplevel)

set -o allexport
source "$GIT_REPO_ROOT/.env"
set +o allexport

# ---------------------------------------------------------------------------------------------------------------------
# refer to docker-compose.yml in project root folder to confirm values (@future could read in from the yml)
LOCAL_PG_DATABASE="fxnx"
LOCAL_PG_PORT=5482
LOCAL_PG_USER=postgres
LOCAL_PG_PASSWORD=postgres

# uri to use for localhost (some users may need to set ipv4 127.0.0.1 in case their localhost default maps to ipv6)
LOCALHOST_URI=localhost

# note a datetime string followed by a dash will be prefixed to this value
OUTPUT_FILE_NAME_SUFFIX="pg-dump.sql"
# ---------------------------------------------------------------------------------------------------------------------

# reference:
# PGPASSWORD="postgres" pg_dump --no-owner --inserts --column-inserts --quote-all-identifiers -h localhost -p 5482 -U postgres fxnx > data.sql

DATETIME=$(date +"%Y-%m-%d-%H%M%S%z")
OUTPUT_PATH="$GIT_REPO_ROOT/db-dumps/$DATETIME-$OUTPUT_FILE_NAME_SUFFIX"

# db-dumps path is included in project .gitignore
mkdir -p "$GIT_REPO_ROOT/db-dumps"

PGPASSWORD="$LOCAL_PG_PASSWORD" pg_dump --no-owner --inserts --column-inserts --quote-all-identifiers \
  -h $LOCALHOST_URI \
  -p $LOCAL_PG_PORT \
  -U $LOCAL_PG_USER \
  $LOCAL_PG_DATABASE > "$OUTPUT_PATH"

# notes:
# - the --inserts flags will generate INSERT statements vs. default dump behavior of COPY which is less ideal in dev scenario
