class Warehouse {
    constructor(warehouseAddress, nsAddress, name, provider, fromDatabase) {
        this.address = warehouseAddress;
        this.provider = provider;
        this.nsAddress = nsAddress;
        this.name = name;
        this.saved = fromDatabase;
		this.receivedUnits = [];

        var wh = this;

        $.getJSON(myABI_PROVIDER_EtherTrackWarehouse, function (data) {
            console.log("Parsing ABI done. (Warehouse)");

            wh.abi = data;

            if (wh.address.length == 0) // No address specified, create new one
            {
				console.log("Creating WH ...");
                wh.createWarehouse(wh.nsAddress, wh.name);
            }
            else {
				if(contractListners.indexOf(wh.address) == -1) {
					console.log("Starting WH ...");
					contractListners.push(wh.address);
					wh.startEventsListner();
				}
            }
        });
    }

    //
    // Start contracts events listener
    //
    startEventsListner() {
        console.log("Parsing done, waiting for events... (Warehouse)");
        
        //Declare contract according to parsed ABI
        if (this.truffleContract === undefined) {
            let myWHContract = TruffleContract(this.abi);
            this.truffleContract = myWHContract;
        }
        
        let myWHContract = this.truffleContract;

        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(this.provider.currentProvider);
        var contractInstance;
        var contractName;
        var contractObject = this;
        
        //Prevent events rebounce
        var lastRecvUnit;
        var lastSentUnit;

        myWHContract.at(this.address).then(function (instance) {
            contractInstance = instance;
            return instance.Name.call().then(function (result) { contractName = result; contractObject.name = contractName;console.log("EtherTrackWarehouse " + contractName + " detected at : " + contractInstance.address); });
        })
            .then(function (instance, response) {
                //Initiate watch for 'unitReceived' events
                contractInstance.unitReceived().watch((err, response) => {
					if(lastRecvUnit != response.args.hashedUnit) {
						lastRecvUnit = response.args.hashedUnit;
						console.log(response.args.hashedUnit + " received from " + response.args.from);
						toast("EtherTrackWarehouse (" + contractName + "), unitReceived " + response.args.hashedUnit + " from " + response.args.from);
						contractObject.addIncommingUnit(response.args.hashedUnit, response.args.from, response.transactionHash);
					}
                });
                //Initiate watch for 'unitSent' events
                contractInstance.unitSent().watch((err, response) => {
					if(lastSentUnit != response.args.hashedUnit) {
						lastSentUnit = response.args.hashedUnit;
						console.log(response.args.hashedUnit + " sent to " + response.args.to);
						toast("EtherTrackWarehouse (" + contractName + "), unitSent " + response.args.hashedUnit + " to " + response.args.to);
						contractObject.addSentUnit(response.args.hashedUnit, response.args.to, response.transactionHash);
					}
                });                
            }).then(function () { 
					displayWarehouse(contractName, contractInstance.address); 
					contractObject.saveToFirebase();
				});
    }

    //
    //Send unit to specified address
    //
    sendUnit(to, unit, provider) {
        //Declare contract according to parsed ABI
        if (this.truffleContract === undefined) {
            let myWHContract = TruffleContract(this.abi);
            this.truffleContract = myWHContract;
        }
        let myWHContract = this.truffleContract;

        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(provider.currentProvider);
        var contractInstance;

        myWHContract.at(this.address).then(function (instance) {
            contractInstance = instance;
            return instance.sendUnitTo(unit, to);
        });
    }

    //
    //Create unit in current warehouse
    //
    createUnit(unit) {
        var contractObject = this;
        //Declare contract according to parsed ABI
        let myWHContract = TruffleContract(contractObject.abi);
        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(contractObject.provider.currentProvider);

        console.log("Creating unit : " + unit + " at " + contractObject.address);
        console.log(currentAccount);

        myWHContract.at(contractObject.address, { from: currentAccount, gas: 21000 }).then(function (instance) {
            return instance.createUnit(unit); //Calling contract method
        });
    }

    //
    //Create a new warehouse
    //
    createWarehouse(ethNSAddress, name) {
        var contractInstance;
        var contractName;
        var contractObject = this;

        console.log("Creating warehouse ...." + name + " NS : " + ethNSAddress);
        //Declare contract according to parsed ABI
        if (this.truffleContract === undefined) {
            let myWHContract = TruffleContract(contractObject.abi);
            this.truffleContract = myWHContract;
        }
        let myWHContract = contractObject.truffleContract;

        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(contractObject.provider.currentProvider);
		
        myWHContract.new(name, ethNSAddress, { from: currentAccount, gas: 900000 }).then(function (instance) {
            contractInstance = instance;
            return instance.Name.call().then(
            function (result) { 
				contractName = result; 
				contractObject.address = contractInstance.address; 
				console.log("EtherTrackWarehouse " + contractName + " detected at : " + contractInstance.address); ;
				contractObject.startEventsListner();
				})
        })
    }

    saveToFirebase() {
        if (!this.saved) {
            firebase.database().ref('users/' + currentAccount + '/warehouse/'+ this.address).set({
                name: this.name,
                address: this.address
            });
            this.saved = true;
        }
    }
    
    addIncommingUnit(unitHash, fromAddress, tx) {
		console.log(tx);
		firebase.database().ref('users/' + currentAccount + '/warehouse/'+ this.address +'/received/').push({
			unitHash: unitHash,
			unitClear: "",
			from: fromAddress,
			tx: tx
		});
	}
	
	bindIncommingUnit(unitHash, unitPlain, fromAddress, tx, key) {
		console.log("=> " + unitHash, +" : " + fromAddress + " | " + tx);

		this.receivedUnits.push({hash: unitHash, clear: unitPlain, from: fromAddress, tx: tx, key: key});
	}
	
	displayIncommingUnits() {
		var myWarehouse = this;
		this.receivedUnits.forEach(function(unit) {
			var unitId;			
			if(typeof unit.clear == 'undefined' || unit.clear.length === 0) {				
				var hash = knownHash.find(x => x.hash == unit.hash);
				if(typeof hash != 'undefined') {
					unitId = hash.plain; 
					
					//Updating firebase
					firebase.database().ref()
					.child('users/' + currentAccount + '/warehouse/'+ myWarehouse.address +'/received/' + unit.key)
					.update({
						unitHash: unit.hash,
						unitClear: hash.plain,
						from: unit.from,
						tx: unit.tx
					});
					
				    $('#UnitList').append("<li class=\"list-group-item\">" + unitId + " from : " + unit.from + "  <a href=\"http://rinkeby.etherscan.io/tx/\ " + unit.tx + "\">[  Voucher  ]</a></li>");
				}
				else {
					unitId = unit.hash;
					$('#hashedUnitList').append("<li class=\"list-group-item\">" + unitId + " from : " + unit.from + "  <a href=\"http://rinkeby.etherscan.io/tx/\ " + unit.tx + "\">[  Voucher  ]</a></li>");
				}
			}
			else {
				unitId = unit.clear;
				$('#UnitList').append("<li class=\"list-group-item\">" + unitId + " from : " + unit.from + "  <a href=\"http://rinkeby.etherscan.io/tx/\ " + unit.tx + "\">[  Voucher  ]</a></li>");
			}			
		});
	}	
	
	displayOutgoingUnit(unitHash, toAddress, tx, key) {
		this.sentUnits = [];
		this.sentUnits.push({hash: unitHash, to: toAddress, tx: tx, key: key});
	}
	
	addSentUnit(unitHash, toAddress, tx) {
		     firebase.database().ref('users/' + currentAccount + '/warehouse/sent/' + this.address + '/sent/').push({
                unitHash: unitHash,
                unitClear: "",
                to: toAddress,
                tx: tx
            });
	}
}
