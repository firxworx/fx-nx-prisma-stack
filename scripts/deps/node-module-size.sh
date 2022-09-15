#!/usr/bin/env bash

#######################################################################################################################
# Print a list of node_modules/* paths >1M in descending order by size
#######################################################################################################################

set -euo pipefail
IFS=$'\n\t'

GIT_REPO_ROOT=$(git rev-parse --show-toplevel)
NODE_MODULES_PATH="$GIT_REPO_ROOT/node_modules"

du -sh $NODE_MODULES_PATH/* | sort -nr | grep '[0-9]\+\.\?[0-9]\+M.*'
