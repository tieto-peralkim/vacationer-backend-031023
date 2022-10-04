#!/bin/bash
if [[ "$1" == "backend" ]] || [[ "$1" == "frontend" ]] ; then
echo "Sign in to AWS"
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 629517020360.dkr.ecr.eu-west-1.amazonaws.com/
echo "Pull the new $1 image"
docker pull 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$1":latest
echo "Stopping old $1"
docker stop vacationer-"$1"
echo "Removing old $1"
docker rm vacationer-"$1";
echo "Run the new $1 image"
if [[ "$1" == "backend" ]] ; then
	ports=3001:3001
	docker run -d -p $ports --name=vacationer-"$1" 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$1":latest
else
  ports=80:80
  envVariables="REACT_APP_ADDRESS=http://34.240.254.109:3001"
  docker run -d -p $ports -e $envVariables --name=vacationer-"$1" 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$1":latest
fi
echo "Docker run done, exiting EC2"
exit
else
	echo "Give the image name as an argument: backend or frontend"
	exit 1
fi