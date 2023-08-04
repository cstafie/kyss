#!/bin/bash

git pull
# npm i
npx nx run client:build:production
# npx nx run server:build:production

# kill running docker containers
sudo docker kill $(sudo docker ps -q)
sudo docker system prune


sudo docker compose build --no-cache
sudo docker network create xword
sudo docker run -d --name server --network xword --env-file ./apps/server/.env xword-server 
sudo docker run -dp 8080:80 --network xword xword-client

sudo systemctl restart nginx
  
  