class Warehouse {
    constructor(warehouseAddress, nsAddress, name, provider) {
        this.address = warehouseAddress;
        this.provider = provider;
        this.nsAddress = nsAddress;
        this.name = name;

	var wh = this;

        $.getJSON(myABI_PROVIDER_EtherTrackWarehouse, function (data) {
            console.log("Parsing ABI done. (Warehouse)");

            wh.abi = data;

            if (wh.address == null) // No address specified, create new one
            {
                wh.createWarehouse(wh.nsAddress, wh.name);
            }
	    else
	    {
              wh.startEventsListner();
            }
        });
    }

    //
    // Start contracts events listener
    //
    startEventsListner() {
        console.log("Parsing done, waiting for events... (Warehouse)");
        //Declare contract according to parsed ABI
	if(this.truffleContract === undefined)
	{
        	let myWHContract = TruffleContract(this.abi);
		this.truffleContract = myWHContract;
	}
	let myWHContract = this.truffleContract;

        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(this.provider.currentProvider);
        var contractInstance;
        var contractName;
	var contractObject = this;

        myWHContract.at(this.address).then(function (instance) {
            contractInstance = instance;
            return instance.Name.call().then(function (result) { contractName = result; console.log("EtherTrackWarehouse " + contractName + " detected at : " + contractInstance.address); displayWarehouse(contractName, contractInstance.address); });
        })
            .then(function (instance, response) {
                //Initiate watch for 'unitReceived' events
                contractInstance.unitReceived().watch((err, response) => {
                    console.log(response.args.hashedUnit + " received from " + response.args.from);
                    logEvents("EtherTrackWarehouse (" + contractName + ")", "unitReceived", response.args.hashedUnit + " from " + (response.args.from == contractInstance.address ? "self" : response.args.from));
                });
                //Initiate watch for 'unitSent' events
                contractInstance.unitSent().watch((err, response) => {
                    console.log(response.args.hashedUnit + " sent to " + response.args.to);
                    logEvents("EtherTrackWarehouse (" + contractName + ")", "unitSent", response.args.hashedUnit + " to " + response.args.to);
                });


		//Send update to server
            $.ajax({
                url: '/createWarehouse',
                type: "POST",
                data: JSON.stringify({ address: contractObject.provider.eth.coinbase, whAddress: contractInstance.address, whName: contractName}),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (result) {
                }
            });
            });
    }

    //
    //Send unit to specified address
    //
    sendUnit(to, unit, provider) {
        //Declare contract according to parsed ABI
	if(this.truffleContract === undefined)
	{
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
	console.log(contractObject.provider.eth.accounts[0]);

        myWHContract.at(contractObject.address, {from: contractObject.provider.eth.accounts[0], gas: 21000 }).then(function (instance) {
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
	if(this.truffleContract === undefined)
	{
        	let myWHContract = TruffleContract(contractObject.abi);
		this.truffleContract = myWHContract;
	}
	let myWHContract = contractObject.truffleContract;

        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(contractObject.provider.currentProvider);


        myWHContract.new(name, ethNSAddress, { from: contractObject.provider.eth.accounts[0], gas: 21000 }).then(function (instance) {
            contractInstance = instance;
            return instance.Name.call().then(function (result) { contractName = result; contractObject.address = contractInstance.address; console.log("EtherTrackWarehouse " + contractName + " detected at : " + contractInstance.address);});
        })
            .then(function (instance, response) {
                contractObject.startEventsListner();
            });
    }
}
