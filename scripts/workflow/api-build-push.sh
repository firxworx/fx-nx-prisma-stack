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
DEPLOY_STAGE_TAG=prod
DOCKER_VERSION_TAG="v0.0.0-alpha.3"

DOCKER_COMPOSE_SERVICE_NAME=basic2-api
# ---------------------------------------------------------------------------------------------------------------------

ECS_CLUSTER_NAME="$PROJECT_TAG-$DEPLOY_STAGE_TAG-cluster"
ECS_SERVICE_NAME="$PROJECT_TAG-$DEPLOY_STAGE_TAG-api"

ECR_REPO_NAME="$PROJECT_TAG-$DEPLOY_STAGE_TAG"
ECR_REPO_URI="$DEPLOY_AWS_ACCOUNT.dkr.ecr.$DEPLOY_AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

docker compose -f "$GIT_REPO_ROOT/docker-compose.yml" build "$DOCKER_COMPOSE_SERVICE_NAME"

docker tag fx/basic2-api fx/basic2-api:$DOCKER_VERSION_TAG
docker tag fx/basic2-api $ECR_REPO_URI:latest
docker tag fx/basic2-api $ECR_REPO_URI:$DOCKER_VERSION_TAG

# push to ecr with both version and 'latest' tags (note: the image itself will only be uploaded once)
docker push $ECR_REPO_URI:$DOCKER_VERSION_TAG
docker push $ECR_REPO_URI:latest

aws ecs update-service --cluster $ECS_CLUSTER_NAME --service $ECS_SERVICE_NAME --force-new-deployment --region $DEPLOY_AWS_REGION
