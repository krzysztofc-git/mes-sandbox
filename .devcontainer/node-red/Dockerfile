FROM nodered/node-red:latest

WORKDIR /data
COPY .devcontainer/node-red/package.json /data

# Configurable items are labelled with comments like "[item]",
# list of steps to do ("- ...") are above items.

# ---
# - Import node_modules for Node-RED
#   - Un-comment the "COPY ..." line if you have "node_modules" folder in ".devcontainer/node-red/"
#   - Then comment the "RUN npm install ..." line

# [Node-RED]
# COPY .devcontainer/node-red/node_modules/. /data/node_modules
RUN npm install --no-update-notifier --no-fund --only=production
# ---

WORKDIR /usr/src/node-red
COPY node-red-library/ /data/lib/

COPY node-red-uibuilder/ /data/uibuilder_temp/
# Complete imported uibuilder projects with the template dependencies
RUN find /data/uibuilder_temp -mindepth 1 -maxdepth 1 -type d -exec cp -r -n /data/node_modules/node-red-contrib-uibuilder/templates/blank/* {} \;
# Import uibuilder projects
RUN cp -r /data/uibuilder_temp/ /data/uibuilder/

# ---
# - Complete imported React uibuilder projects with their node_modules
#   - Un-comment the "COPY ..." line below every item ([*-react]) if you have "node_modules_react" folder in ".devcontainer/node-red/"
#   - Then comment the "RUN npm install" lines

# [scanserial-ui-react]
WORKDIR /data/uibuilder/scanserial-ui-react
# COPY .devcontainer/node-red/node_modules_react/. /data/uibuilder_temp/scanserial-ui-react/node_modules
RUN npm install
RUN chmod +x add_dependency_files.sh && ./add_dependency_files.sh
RUN npm run build
RUN sed -i 's|"mock-uibuilder.js"|"../uibuilder/uibuilder.iife.min.js"|g' src/index.html
WORKDIR /usr/src/node-red
# ---