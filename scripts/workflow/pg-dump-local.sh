#!/usr/bin/env bash

#######################################################################################################################
# Dump the local postgres database to SQL
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

OUTPUT_FILENAME="db-dump.sql"
# ---------------------------------------------------------------------------------------------------------------------

# reference:
# PGPASSWORD="postgres" pg_dump --no-owner --inserts --column-inserts --quote-all-identifiers -h localhost -p 5482 -U postgres fxnx > data.sql

PGPASSWORD="$LOCAL_PG_PASSWORD" pg_dump --no-owner --inserts --column-inserts --quote-all-identifiers \
  -h $LOCALHOST_URI \
  -p $LOCAL_PG_PORT \
  -U $LOCAL_PG_USER \
  $LOCAL_PG_DATABASE > "$GIT_REPO_ROOT/$OUTPUT_FILENAME"

# notes:
# - the --inserts flags will generate INSERT statements vs. default dump behavior of COPY which is less ideal in dev scenario
