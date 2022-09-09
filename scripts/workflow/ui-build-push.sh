#!/usr/bin/env bash

#######################################################################################################################
# Build docker image of the 'api' app + tag + push to ECR + force new ECS deployment
#######################################################################################################################

set -euo pipefail
IFS=$'\n\t'

GIT_REPO_ROOT=$(git rev-parse --show-toplevel)

set -o allexport
source "$GIT_REPO_ROOT/.env"
set +o allexport

# ---------------------------------------------------------------------------------------------------------------------
# stack id/name to deploy
CDK_STACK_TO_DEPLOY="ProjectStackProd"
# ---------------------------------------------------------------------------------------------------------------------

# the following implementation flexes the current full dev workflow to assist with dev and help surface any bugs
# realistically a static ui could be exported then via aws-cli: push to s3 + invalidate cloudfront cache

yarn build:infra
yarn export:ui:prod
yarn cdk:deploy $CDK_STACK_TO_DEPLOY
