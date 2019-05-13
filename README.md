# Tempory Fix 
## Type this before starting new submission 
curl -XDELETE 'http://192.168.122.49:9200/questions/question/_query' -d '{"query":{"match_all":{}}' -H 'Content-Type: application/json'
## Indexing for full text search

db.questions.createIndex({ title: "text", body: "text" }, { default_language: "none" })

# Helpful Tutorials

## Postfix: 
Install postfix

https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-on-ubuntu-18-04

Add no-reply to aliases as the following thing says:

https://anandarajpandey.com/2014/09/10/how-to-change-default-root-email-address-linux-postfix-centos/

## RabbitMQ: 
Install RabbitMQ

https://www.rabbitmq.com/install-debian.html

Alternate option / easier to read 

https://tecadmin.net/install-rabbitmq-server-on-ubuntu/


