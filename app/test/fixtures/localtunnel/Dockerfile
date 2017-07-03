FROM node:6.10-alpine

RUN mkdir -p /localtunnel
WORKDIR /localtunnel

RUN npm install localtunnel --production && npm cache clean
ENTRYPOINT ["node", "node_modules/localtunnel/bin/client"]
