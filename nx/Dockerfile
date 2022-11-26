# syntax=docker/dockerfile:1
FROM node:16-alpine
# RUN apk add --no-cache python2 g++ make
ENV CLIENT_PORT=4200
# ENV SERVER_PORT=3333
# ENV SOCKET_PORT=4444
EXPOSE ${CLIENT_PORT} 
# EXPOSE ${CLIENT_PORT} ${SERVER_PORT} ${SOCKET_PORT}
WORKDIR /home/cristian/repos/kyss/nx
COPY . .
# CMD ls
CMD ["npx", "nx", "run-many", "--target=serve", "--projects=server,client", "--configuration=production"]


#### run these instructions from /nx 
# nx run-many --target=build --projects=server,client
# docker build . -t us-west1-docker.pkg.dev/elite-dreamer-369602/artifact-reg-repo/test-xword
# docker push us-west1-docker.pkg.dev/elite-dreamer-369602/artifact-reg-repo/test-xword

#### run this on the machine running the docker container
# docker run -dp 80:4200 -p 4200:4200 us-west1-docker.pkg.dev/elite-dreamer-369602/artifact-reg-repo/test-xword