## Create an initializer script to execute all setup for the node-mq

#!/bin/sh

echo "Creating database collections"
node -e 'require("@d19n/node-mq").CreateCollections()'

echo "Script file created"
## List the networks
touch ./mq-scripts.js

echo "Script file created"
## List the networks
touch ./mq-scripts.js

## Copy data to file
