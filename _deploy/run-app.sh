#!/bin/bash
# Script to start truffle and node web server
cd Truffle-project
truffle compile
truffle develop | migrate --reset
cd NodeJS
node node-server.js