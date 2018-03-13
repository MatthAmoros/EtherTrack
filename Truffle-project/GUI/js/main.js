var etherTrackNS_ABI;
const myABI_PROVIDER_EtherTrackNS = "http://192.168.2.243/Content/Applications/EtherTrackNS.json";
const myABI_PROVIDER_EtherTrackWarehouse = "http://192.168.2.243/Content/Applications/EtherTrackWarehouse.json";
const EtherTrackNS_Address = "0x9fbda871d559710256a2502a2517b794b482db40";
const EtherTrackWarehouse_Address = "0xfb88de099e13c3ed21f80a7a1e49f8caecf10df6";

window.addEventListener("load", function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== "undefined") {
        // Use Mist/MetaMask's provider
        var context = new Web3(web3.currentProvider);
        //Start DApp
        startDapp(context);
    } else {
        console.log("MetaMask/Mist not detected, trying to contact local node...");
        var Web3 = require("web3");

        var provider = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
        provider.sendAsync = Web3.providers.HttpProvider.prototype.send

        if (typeof provider !== "undefined") {
            console.log("Connected to : " + provider.currentProvider.host);

            startDapp(provider);
        }
    }
});

function startDapp(provider) {

    if (!provider.isConnected()) {
        console.log("Not connected")
        return;
    }

    //Parsing ABI from JSON file (can be a bit long...)
    $.getJSON(myABI_PROVIDER_EtherTrackNS, function (data) {
        console.log("Parsing done, waiting for events.. (NS)");
        //Declare contract according to parsed ABI
        var myNSContract = TruffleContract(data);
        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(provider.currentProvider);

        //Get deployed contract (ABI contains address) or at specified address
        var contractTarget = buildPromise(myNSContract, EtherTrackNS_Address);

        contractTarget.then(function (instance) {
            console.log("EtherTrackNS detected at : " + instance.address);
            //Initiate watch for 'updateEntries' events
            instance.updateEntries().watch((err, response) => {
                console.log(response.args.GS1_GLN + " owned by " + response.args.owner);
                logEvents("EtherTrackNS", "updateEntries", response.args.GS1_GLN + " owned by " + response.args.owner);
            });
        });
    }
    );

    //Parsing ABI from JSON file (can be a bit long...)
    $.getJSON(myABI_PROVIDER_EtherTrackWarehouse, function (data) {
        console.log("Parsing done, waiting for events... (Warehouse)");
        //Declare contract according to parsed ABI
        var myWHContract = TruffleContract(data);
        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(provider.currentProvider);

        //Get deployed contract (ABI contains address) or at specified address
        var contractTarget = buildPromise(myWHContract, EtherTrackWarehouse_Address);

        contractTarget.then(function (instance) {
            console.log("EtherTrackWarehouse detected at : " + instance.address);
            //Initiate watch for 'unitReceived' events
            instance.unitReceived().watch((err, response) => {
                console.log(response.args.hashedUnit + " received from " + response.args.from);
                logEvents("EtherTrackWarehouse", "unitReceived", response.args.hashedUnit + " from " + response.args.from);
            });
        });
    }
    );

}

//Log events to grid
function logEvents(contract, eventType, description) {
    $('#eventsTable > tbody:last-child').append("<tr><th>" + contract + "</th>" +
        "<th>" + eventType + "</th>" +
        "<th>" + description + "</th>" + 
        "</tr> ");
}

//Build contract promise
function buildPromise(contract, at_address) {
    //Get deployed contract (ABI contains address) or at specified address
    var contractTarget;
    if (contract.isDeployed())
        contractTarget = contract.deployed(); //ABI address
    else
        contractTarget = contract.at(at_address); //Specified address

    return contractTarget;
}


