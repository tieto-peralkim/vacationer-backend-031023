#!/bin/bash
INSTANCE=backend
echo "Sign in to AWS"
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 629517020360.dkr.ecr.eu-west-1.amazonaws.com/
echo "Pull the new $INSTANCE image"
docker pull 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$INSTANCE":latest
echo "Stopping old $INSTANCE"
docker stop vacationer-"$$INSTANCE"
echo "Removing old $INSTANCE"
docker rm vacationer-"$INSTANCE";
echo "Run the new $INSTANCE image"
PORTS=3001:3001
ENV1=(REACT_APP_ADDRESS="$2")
ENV2="REACT_APP_MONGODB_URI=mongodb://$3@docdb-sandbox.c9qzwnhx4tes.eu-west-1.docdb.amazonaws.com:27017/vacationer-app-database?tls=true&tlsCAFile=rds-combined-ca-bundle.pem&retryWrites=false"
ENV3=(REACT_APP_SLACK_URI="$4")
docker run -d -p $PORTS -e "$ENV1" -e "$ENV2" -e "$ENV3" --name=vacationer-backend 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$INSTANCE":latest
echo "Docker $INSTANCE run done, exiting EC2"
exit