# Solution of Qvantel test

#### Table of content

1. [Overview](#overview)
2. [Dependencies](#dependencies)
3. [Demo environment](#demo-environment)
4. [Run](#run)

## Overview
This is order management back-end which provide the OM REST point and also do the back-end integration operation. It has seven sub project. Six out of them will be used in finally. The external-server-simulator simulate NMS and NW provisioning servers.

## Dependecies
The service relies on Apache Kafka, and by default, it assumes the zookeeper is running on 127.0.0.1:2181. Java is a dependency for Apache kafka. The project is written in Node.js and managed by Pm2 via a processes.json file. The address of the zookeeper is configurable from the processes.json file.

## Demo environment
The Order Management(OM) REST point is [192.168.16.115:10010/docs](http://192.168.16.115:10010/docs/). At this point only the post operation is working. An example request schama is given in the [request.json](http://git.tecnotree.com/lampaju/ordermanagement/blob/master/request.json) file.

Placed Order status can be seen with OM test UI at [10.4.12.33:10010](http://10.4.12.33:10010/).
To varify the creation of accounts and contracts in NGB and SAP CC server, NGB REST point at [http://192.168.11.29:46668/ngb/](http://192.168.11.29:46668/ngb/) with api key OTAzODU= and SAP CC REST point at [http://192.168.16.113:10090/docs/.](http://192.168.16.113:10090/docs/) All the Ids are avaiable in the test UI success message.

For status query use the following REST point at [http://192.168.16.115:10011/swagger-ui/](http://192.168.16.115:10011/swagger-ui/). The orderId is the id returnd by OM REST point when placing the order.

## Run
 1. `npm install pm2 -g`
 2. Nevigate to each module
 	do `npm install`
 3. Nevigate to the root folder then  
 	`pm2 start processes.json`
 	or you can start all the module separately
