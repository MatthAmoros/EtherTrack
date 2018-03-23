module.exports = class Warehouse {
    constructor(warehouseAddress, nsAddress, name, provider, abiAddress) {
        this.address = warehouseAddress;
        this.provider = provider;
        this.nsAddress = nsAddress;
        this.name = name;
        this.abiAddress = abiAddress;

        $.getJSON(myABI_PROVIDER_EtherTrackWarehouse, function (data) { this.abi = data; });
        console.log("Parsing ABI done. (Warehouse)");

        if (warehouseAddress == "") // No address specified, create new one
        {
            createWarehouse(this.provider, this.nsAddress, this.name);
        }
    }

    sendUnit(to, unit, provider) {
        //Declare contract according to parsed ABI
        var myWHContract = TruffleContract(this.abi);
        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(provider.currentProvider);
        var contractInstance;
        var contractName;

        myWHContract.at(from).then(function (instance) {
            contractInstance = instance;
            return instance.sendUnitTo(to, unit);
        });
    }

    createUnit(whAddress, unit, provider) {
        //Declare contract according to parsed ABI
        var myWHContract = TruffleContract(this.abi);
        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(provider.currentProvider);
        var contractInstance;
        var contractName;

        myWHContract.at(whAddress).then(function (instance) {
            contractInstance = instance;
            return instance.createUnit(unit); //Calling contract method
        });
    }

    createWarehouse(provider, ethNSAddress, name) {
        console.log("Creating warehouse ...." + name + " NS : " + ethNSAddress);
        //Declare contract according to parsed ABI
        var myWHContract = TruffleContract(data);
        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(provider.currentProvider);
        var contractInstance;
        var contractName;

        myWHContract.new(name, EtherTrackNS_Address, { from: provider.eth.accounts[0], gas: 5000000 }).then(function (instance) {
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
            });
    }
};
