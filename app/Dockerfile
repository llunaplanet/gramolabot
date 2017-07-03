FROM node:6.10-alpine
ARG node_env=production

# Create app directory
RUN mkdir -p /opt/gramolabot
WORKDIR /opt/gramolabot

# Install app dependencies
COPY package.json /opt/gramolabot
RUN npm install --$node_env --silent --progress=false && \
    npm cache clean

# Bundle app source
COPY . /opt/gramolabot

EXPOSE 3000
CMD [ "npm", "start" ]
