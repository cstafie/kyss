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

# run from /nx
# docker build . -t xword
# docker run -p 4200:4200 xword
