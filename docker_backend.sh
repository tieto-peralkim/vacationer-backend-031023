#!/bin/bash
INSTANCE=backend
echo "Sign in to AWS"
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 629517020360.dkr.ecr.eu-west-1.amazonaws.com/
echo "Pull the new $INSTANCE image"
docker pull 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$INSTANCE":latest
echo "Stopping old $INSTANCE"
docker stop vacationer-"$INSTANCE"
echo "Removing old $INSTANCE"
docker rm vacationer-"$INSTANCE";
echo "Run the new $INSTANCE image"
PORTS=3001:3001
ENV0="REACT_APP_ENVIRONMENT=qa"
ENV1="REACT_APP_MONGODB_URI=mongodb://$1@docdb-sandbox.c9qzwnhx4tes.eu-west-1.docdb.amazonaws.com:27017/vacationer-app-database?tls=true&tlsCAFile=rds-combined-ca-bundle.pem&retryWrites=false"
ENV2=(REACT_APP_SLACK_URI="$2")
ENV3=(REACT_APP_GHUB_ID="$3")
ENV4=(REACT_APP_GHUB_SECRET="$4")
ENV5=(REACT_APP_JWT_SECRET="$5")
ENV6=(REACT_APP_FRONT_ADDRESS="$6")
docker run -d -p $PORTS -e "$ENV0" -e "$ENV1" -e "$ENV2" -e "$ENV3" -e "$ENV4" -e "$ENV5" -e "$ENV6" --name=vacationer-"$INSTANCE" 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$INSTANCE":latest
echo "Docker $INSTANCE run done, exiting EC2"
exit