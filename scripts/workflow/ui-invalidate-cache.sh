#!/usr/bin/env bash

#######################################################################################################################
# Invalidate the UI's CloudFront cache by creating an invalidation request
#######################################################################################################################

set -euo pipefail
IFS=$'\n\t'

GIT_REPO_ROOT=$(git rev-parse --show-toplevel)

set -o allexport
source "$GIT_REPO_ROOT/.env"
set +o allexport

# ---------------------------------------------------------------------------------------------------------------------
# cloudfront distribution id associated with stack @future lookup this value
CF_DISTRIBUTION_ID="E8OBLTSK8KTHO"
# ---------------------------------------------------------------------------------------------------------------------

# note: cdk deploys a lambda that handles invocations per the specified BucketDeployment.distributionPaths
# the following creates a manual/ad-hoc validation using the aws-cli

aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths '/*'
