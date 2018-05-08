# EtherTrack
Traceability system based on Ethereum Blockchain

Live at : https://ethertrack.firebaseapp.com/

Travis CI + JSHint status : ![alt text](https://api.travis-ci.org/SunPaz/EtherTrack.svg?branch=master)

## What is traceability ?
Identify, follow and authenticate a product throught its whole life cycle.

## What is the blockchain ?
You can see the blockchain as a decentralized database composed of nodes that uses peer-to-peer to exchange data.
Each transaction issued on the blockchain is validated by severales nodes and added to other blocks of validated transaction.
Validated transactions are unalterable and publicly available.
Ethereum blockchain allow the creation of "Smart Contract", autonomous programs hosted in the decentralized network.
EtherTrack use various types of smart contract to :
 1. Register companies
 2. Modify traceability unit state
 3. Record traceability unit movements
 4. Ensure traceability unit / owner identity
 
## Why would I want to use a traceability sytem based on Ethereum Blockchain ?
The nature of the blockchain system address a lot of issues that you must face when you work with traceability, for example :
* Descentralized architecture to ensure data integrity
* Smart-Contract source code can be read and approved by everyone, data can not be tampered with.
* Data format is publicly available, anyone can build an interface and get data from the chain.

## Current version
Current version features :
* 3 Contracts : EtherTrackNS (Naming Service) EtherTrackWarehouse (Manage traceability Unit) and EtherTrackDatastore (a data store proxy)
* A basic web site designed with Bootstrap 4 to use with Metamask. It can deploy contracts and do basic contracts calls.
* Truffle deploy scripts and refactored contracts.

## Installing

Clone repository :
```
git clone https://github.com/SunPaz/EtherTrack
```
Start Node.js web server :
```
node Firebase/www/NodeJS/node-server.js
```
Compile contracts using Truffle :
```
truffle compile
```
(optional)

Launch truffle test network :
```
truffle develop
```
Migrate contracts to network (in truffle develop console) :
```
migrate --reset
```
Launch you browser on http://localhost:8081/ and you are done !
	
## Built with :
* [Truffle](https://github.com/trufflesuite/truffle) : Ethereum development framework 
* [Remix](https://remix.ethereum.org/) : Solidity IDE
* [JQuery](https://jquery.com/) : Javascript library
* [Solidity](https://solidity.readthedocs.io/en/v0.4.21/) : Smart contract language
* [Web3.js](https://github.com/ethereum/web3.js) : Ethereum JavaScript API
* [MetaMask](https://github.com/MetaMask) : Ethereum chrome extension
* [Node.js](https://nodejs.org/en/) : Asynchronous event driven JavaScript runtime
* [Express](http://expressjs.com/) : Web framework for Node.js
* [Firebase](https://firebase.google.com/) : Google's mobile platform, used to cache user preferences
* [JSHint](http://jshint.com/) : Used as a JS linter
