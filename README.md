# Distributed micro service master / slave election manager 

This package is developed for Nodejs applications using PM2 as a runtime process manager.  

# Reason for developing this package
 
If you have 4 applications running in production and want to schedule cron jobs they will run X 4. 

This package allows you to identify the current master application in your network and process the job once. 

A master node is a healthy instance. 

# Usage
.env file add the following 

MQ_MONGODB_URL= <YOUR MONGODB URL>
MQ_MONGODB_NAME= <YOUR MONGODB NAME>

# In your application import 

const {isMasterNode} = require("@d19n/node-mq);




