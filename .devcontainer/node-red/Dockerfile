FROM nodered/node-red:latest

WORKDIR /data
COPY .devcontainer/node-red/package.json /data

# Un-comment the line below if you have "node_modules" folder in ".devcontainer/node-red/"
# COPY .devcontainer/node-red/node_modules/. /data/node_modules

# Comment the line below if you have "node_modules" folder in ".devcontainer/node-red/"
RUN npm install --no-update-notifier --no-fund --only=production

WORKDIR /usr/src/node-red
COPY node-red-library/ /data/lib/
