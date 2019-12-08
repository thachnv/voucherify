#!/bin/bash
docker stop voucherify
docker rm voucherify
docker rmi voucherify
docker build -t voucherify .
docker run -d -p 80:80 --rm --name=voucherify voucherify
