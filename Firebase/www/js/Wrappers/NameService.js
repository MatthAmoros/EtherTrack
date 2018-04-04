class NameService {

    constructor(nsAddress, provider, name, fromDatabase) {
        this.address = nsAddress;
        this.provider = provider;
        this.name = name;
        this.saved = fromDatabase;
        var ns = this;

        $.getJSON(myABI_PROVIDER_EtherTrackNS, function (data) {
            console.log("Parsing ABI done. (NameService)");

            ns.abi = data;

            if (ns.address.length == 0) // No address specified, create new one
            {
                console.log("Creating NS ...");
                ns.addNameService();
            }
            else {
                console.log("Starting NS ...");
                ns.startEventsListner();
            }
        });
    }

    addNameService() {
        var contractInstance;
        var contractName;
        var contractObject = this;

        console.log("Creating name service ....");
        //Declare contract according to parsed ABI
        if (this.truffleContract === undefined) {
            let myNSContract = TruffleContract(contractObject.abi);
            this.truffleContract = myNSContract;
        }
        let myNSContract = contractObject.truffleContract;

        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(contractObject.provider.currentProvider);

        try {

            myNSContract.new(null, null, { from: currentAccount }).then(function (instance) {
                contractInstance = instance;
                contractObject.address = instance.address;
                return instance.createDataStore();
            })
                .then(function (instance, response) {
                    console.log(instance);
                    contractObject.startEventsListner();
                    contractObject.onCreate(instance.address);
                });
        }
        catch (err) {
            alert(err);
        }
    }

    startEventsListner() {
        //Declare contract according to parsed ABI
        let myNSContract = TruffleContract(this.abi);
        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(this.provider.currentProvider);

        //Get deployed contract (ABI contains address) or at specified address
        var contractTarget = this.buildPromise(myNSContract, this.address);
        var contractInstance;
        var contractObject = this;

        contractTarget.then(function (instance) {
            //Initiate watch for 'updateEntries' events
            instance.updateEntries().watch({ fromBlock: 0, toBlock: 'latest' }, (err, response) => {
                console.log(response.args.GS1_GLN + " owned by " + response.args.owner);
                logEvents("EtherTrackNS", "updateEntries", response.args.GS1_GLN + " owned by " + response.args.owner);
                saveKnownNodes(response.args.GS1_GLN, response.args.owner);
                displayNodeName(response.args.GS1_GLN, response.args.owner);
            });

            displayNameService("", instance.address);
            contractObject.saveToFirebase();
        });
    }

    lookupGLN(gln) {
        var glnNodeAddress;

        var contract = this;
        //Declare contract according to parsed ABI
        let myNSContract = TruffleContract(this.abi);
        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(this.provider.currentProvider);

        myNSContract.at(this.address).then(function (instance) {
            console.log("Querying " + contract.address + " for " + gln + " ...");
            return instance.getNodeAddressByName(gln);
        }).then(function (result) {
            glnNodeAddress = result;
            console.log(contract.address + " : " + result);
            if (contract.lookupCallBack !== undefined)
                contract.lookupCallBack(result);
        });
        return glnNodeAddress;
    }

    getDatastoreAddress() {
        var contract = this;
        //Declare contract according to parsed ABI
        let myNSContract = TruffleContract(this.abi);
        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(this.provider.currentProvider);

        myNSContract.at(this.address).then(function (instance) {
            console.log("Querying " + contract.address + " ...");
            return instance.getDataStoreAddress();
        }).then(function (result) {
            console.log("getDSAddr " + contract.address + " : " + result);
            if (contract.getDatastoreCallback !== undefined)
                contract.getDatastoreCallback(contract.address, result);
        });
    }

    setDatastoreAddress(dsAddress) {
        var contract = this;
        //Declare contract according to parsed ABI
        let myNSContract = TruffleContract(this.abi);
        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(this.provider.currentProvider);

        myNSContract.at(this.address).then(function (instance) {
            console.log("Querying " + contract.address + " ...");
            return instance.setDataStoreAddress(dsAddress);
        }).then(function (result) {
            console.log("setDSAddr " + contract.address + " : " + result);
        });
    }

    registerGLN(gln) {
        var glnNodeAddress;

        var contract = this;
        //Declare contract according to parsed ABI
        let myNSContract = TruffleContract(this.abi);
        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(this.provider.currentProvider);

        myNSContract.at(this.address).then(function (instance) {
            console.log("Querying " + contract.address + " for " + gln + " ...");
            return instance.registerName(contract.provider.eth.defaultAccount, gln);
        }).then(function (result) {
            console.log(contract.address + " : ");
            console.log(result);
        });
    }

    //Build contract promise
    buildPromise(contract, at_address) {
        //Get deployed contract (ABI contains address) or at specified address
        let contractTarget;
        if (contract.isDeployed())
            contractTarget = contract.deployed(); //ABI address
        else
            contractTarget = contract.at(at_address); //Specified address

        return contractTarget;
    }

    saveToFirebase() {
        if (!this.saved) {
            firebase.database().ref('users/' + currentAccount + '/nameservice').push({
                address: this.address
            });
            this.saved = true;
        }
    }
}