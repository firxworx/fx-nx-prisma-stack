#!/usr/bin/env bash

#######################################################################################################################
# Create an SSH tunnel from local to RDS instance on private/isolated subnets via bastion
#######################################################################################################################

# @todo make rds tunnel script interactive and hold open then kill tunnel when closed... in the meantime...
# DO NOT FORGET TO KILL THE TUNNEL WHEN DONE: kill $(lsof -t -i :5555)

set -Eeuo pipefail
IFS=$'\n\t'

GIT_REPO_ROOT=$(git rev-parse --show-toplevel)

set -o allexport
source "$GIT_REPO_ROOT/.env"
set +o allexport

# ---------------------------------------------------------------------------------------------------------------------
# available arbitrary local port to use for port forwarding (connect to the RDS database at localhost:REMOTE_PORT)
LOCAL_PORT=5555

# ec2 instance id of the bastion (@future - look it up using the aws cli)
EC2_BASTION_INSTANCE_ID="i-00f9688afd203be0d"

# local ssh public key file to use for EC2 Instance Connect
SSH_PUBLIC_KEY_FILE="~/.ssh/id_ed25519.pub"

# rds endpoint to establish a tunnel to (@future - look it up using the aws cli)
RDS_ENDPOINT_URI="olivia.cn1xcuoynnlj.$DEPLOY_AWS_REGION.rds.amazonaws.com"

# rds port that database is listening on (postgres default port is 5432)
RDS_PORT=5432

# @future - suppress Warning: Permanently added 'i-00f9688afd203be0d' (ECDSA) to the list of known hosts.
# ---------------------------------------------------------------------------------------------------------------------

# EC2 Instance Connect creates a limited 60 second connection window
#
# Note that non-Administrator users require the following IAM permissions:
# @see https://aws.amazon.com/blogs/compute/new-using-amazon-ec2-instance-connect-for-ssh-access-to-your-ec2-instances/

# to use aws-cli to obtain instance id -- refer to NetworkInterfaces > Association > PublicIp:
# aws ec2 describe-instances --region=ca-central-1

# to use aws-cli to get instance fingerprint:
# aws ec2 get-console-output --instance-id instance_id --output text

# @see https://binx.io/2022/04/26/how-to-set-up-an-ssh-tunnel-to-private-aws-rds-and-ec2-instances/
# @see https://aws.amazon.com/blogs/infrastructure-and-automation/toward-a-bastion-less-world/
# @see + thanks to https://codelabs.transcend.io/codelabs/aws-ssh-ssm-rds/index.html#6

# generate a temporary ssh key
echo -e 'y\n' | ssh-keygen -t rsa -f /tmp/temp -N '' >/dev/null 2>&1

# send public key to bastion via EC2 Instance Connect (official aws bastion images support it out-of-the-box)
aws ec2-instance-connect send-ssh-public-key \
  --instance-id $EC2_BASTION_INSTANCE_ID \
  --instance-os-user ec2-user \
  --ssh-public-key file:///tmp/temp.pub

# note: you may also specify --availability-zone flag
# note: the ec2-user is the default user on amazonlinux instances including bastion images

ssh -i /tmp/temp -Nf -M \
  -L $LOCAL_PORT:olivia.cn1xcuoynnlj.ca-central-1.rds.amazonaws.com:$RDS_PORT \
  -o "UserKnownHostsFile=/dev/null" \
  -o "StrictHostKeyChecking=no" \
  -o ProxyCommand="aws ssm start-session --target %h --document AWS-StartSSHSession --parameters portNumber=%p --region=$DEPLOY_AWS_REGION" \
  ec2-user@$EC2_BASTION_INSTANCE_ID

# aws ec2-instance-connect send-ssh-public-key \
# 	--instance-id $EC2_BASTION_INSTANCE_ID \
# 	--instance-os-user ec2-user \
#   --ssh-public-key file://$SSH_PUBLIC_KEY_FILE

# aws ec2-instance-connect send-ssh-public-key \
#   --instance-id `terraform output -raw instance_id` \
#   --availability-zone `terraform output -raw az` \
#   --instance-os-user ubuntu \
#   --ssh-public-key file:///tmp/temp.pub

# {
#     "RequestId": "7694542b-98bf-424b-b1ef-e77f127cbfa0",
#     "Success": true
# }

# note file://~/.ssh/id_ed25519.pub is perfectly valid

# test connection (subtitute in public IP address of bastion):
# ssh -i $SSH_PRIVATE_KEY_FILE -l ec2-user 35.183.235.199

# setup tunnel to RDS
# ssh -i <private-ssh-key> -f -N -L <local-port>:<amazon-rds-dns-host>:<target-port> ec2-user@<bastion-dns-host-or-ip> -v

# # pid of process with open tunnel (what using port 5555):
# lsof -t -i :5555

# kill $(lsof -t -i :5555)
# kill $(lsof -t -i :$RDS_PORT)

