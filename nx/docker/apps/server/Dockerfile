# syntax=docker/dockerfile:1
FROM node:16-alpine
# RUN apk add --no-cache python2 g++ make
# ENV CLIENT_PORT=80
ENV SERVER_PORT=3333
ENV SOCKET_PORT=4444
EXPOSE ${CLIENT_PORT} 
EXPOSE ${SERVER_PORT} ${SOCKET_PORT}

COPY ./dist/apps/server .

CMD ["node", "./main.js"]

