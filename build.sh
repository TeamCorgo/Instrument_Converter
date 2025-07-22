#!/bin/sh
#git pull

sudo docker stop Instruments > /dev/null 2>&1
sudo docker rm Instruments > /dev/null 2>&1

sudo docker build -t instruments .

sudo docker run -d --name Instruments --restart=always -p 9447:443 instruments

