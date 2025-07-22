#!/bin/sh
#git pull

sudo docker stop Instrument_Converter > /dev/null 2>&1
sudo docker rm Instrument_Converter > /dev/null 2>&1

sudo docker build -t instruments_converter .

sudo docker run -d --name Instrument_Converter --restart=always -p 9447:443 instruments_converter
