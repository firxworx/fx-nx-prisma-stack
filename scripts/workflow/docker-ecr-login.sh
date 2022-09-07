#!/usr/bin/env bash

#######################################################################################################################
# Login to AWS ECR - required to push images to ECR
#######################################################################################################################

set -euo pipefail
IFS=$'\n\t'

GIT_REPO_ROOT=$(git rev-parse --show-toplevel)

set -o allexport
source "$GIT_REPO_ROOT/.env"
set +o allexport

# ---------------------------------------------------------------------------------------------------------------------
ECR_REPO_NAME=olivia-prod
# ---------------------------------------------------------------------------------------------------------------------

ECR_REPO_URI="$DEPLOY_AWS_ACCOUNT.dkr.ecr.$DEPLOY_AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

aws ecr get-login-password --region $DEPLOY_AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI
