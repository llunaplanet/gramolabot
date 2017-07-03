FROM node:6.10-alpine

RUN mkdir -p /express
WORKDIR /express
RUN npm install express --production && npm cache clean
COPY . /express
EXPOSE 3000
ENTRYPOINT ["node", "server.js"]
