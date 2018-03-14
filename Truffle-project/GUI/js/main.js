var etherTrackNS_ABI;
var provider;
var bindedContract = [];

const myABI_PROVIDER_EtherTrackNS = "http://[SERVER]/Content/Applications/EtherTrackNS.json";
const myABI_PROVIDER_EtherTrackWarehouse = "http://[SERVER]/Content/Applications/EtherTrackWarehouse.json";
const EtherTrackNS_Address = "0xcb152a2aa90055a0d255ca7dbaeb85edfdc86096";
const EtherTrackWarehouse_Address = "0x82d50ad3c1091866e258fd0f1a7cc9674609d254";


window.addEventListener("load", function () {
$("#btnAddWH").click(function () {
	var contractAddress = $("#whAddress").val();

	console.log("Adding warehouse ...");

	if(bindedContract.indexOf(contractAddress) == -1)
	{
		addWarehouse(contractAddress, provider);
		bindedContract.push(contractAddress);
		console.log("Successfully added.");
	}
	else
	{
		console.log("Already exsits.");
	}
});
$("#btnCreatWH").click(function () {
	var NScontractAddress = $("#nsAddress").val();
	var whName = $("#whName").val();

	console.log("Creating warehouse ...");

	if(bindedContract.indexOf(whName) == -1)
	{
		createWarehouse(provider, NScontractAddress, whName);
		bindedContract.push(whName);
		console.log("Successfully added.");
	}
	else
	{
		console.log("Already exsits.");
	}
});

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== "undefined") {
        // Use Mist/MetaMask's provider
        var context = new Web3(web3.currentProvider);
        //Start DApp
        startDapp(context);
    } else {
        console.log("MetaMask/Mist not detected, trying to contact local node...");
        var Web3 = require("web3");

        provider = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
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

	//For tests purpose
	addNameService(EtherTrackNS_Address);
	addWarehouse(EtherTrackWarehouse_Address, provider);
}

//Log events to grid
function logEvents(contract, eventType, description) {
    $('#eventsTable > tbody:last-child').append("<tr><th>" + contract + "</th>" +
        "<th>" + eventType + "</th>" +
        "<th>" + description + "</th>" + 
        "</tr> ");
}


function displayWarehouse(name, address)
{
	$('#WHList').append("<li class=\"list-group-item\">" + name + " at : " + address +
	"<input type=\"button\" value=\"Send unit\"/>" +
	"<input type=\"button\" value=\"Create unit\"/>" +
	"<input placeholder=\"Unit code\" id=\"unitCode\"/>" +
	"<input placeholder=\"Destination address\" id=\"destAddr\"/>" +
	 "</li>" 
	);
}

function displayNameService(name, address)
{
	$('#NSList').append("<li class=\"list-group-item\">" + name + " at : " + address +
	"<input type=\"button\" value=\"Get GLN address\" id=\"nsBtnLook-" + address.substring(0,10) + "\"/>" +
	"<input placeholder=\"GLN\" id=\"glnNode-" + address.substring(0,10) + "\"/>" +	
	 "</li>");

	$("#nsBtnLook-" + address.substring(0,10)).click(function() {
	var name = $("#glnNode-" + address.substring(0,10)).val();
	 displayNodeName(name,lookupGLN(address,name)); 
	});
}

function displayNodeName(name, address)
{
	$('#nodeList').append("<li class=\"list-group-item\">" + name + " at : " + address + "</li>");
}

function createWarehouse(provider, ethNSAddress, name)
{
  //Parsing ABI from JSON file (can be a bit long...)
    $.getJSON(myABI_PROVIDER_EtherTrackWarehouse, function (data) {
        console.log("Parsing done, creating warehouse ...." + name + " NS : " + ethNSAddress);
        //Declare contract according to parsed ABI
        var myWHContract = TruffleContract(data);
        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(provider.currentProvider);
	var contractInstance;
	var contractName;

        myWHContract.new(name, EtherTrackNS_Address, {from: provider.eth.accounts[0], gas: 5000000}).then(function(instance) {
		contractInstance = instance;
		return instance.Name.call().then(function(result) {contractName = result; console.log("EtherTrackWarehouse " + contractName + " detected at : " + contractInstance.address); displayWarehouse(contractName, contractInstance.address);});
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
    );    
}

function addWarehouse(address, provider)
{
    //Parsing ABI from JSON file (can be a bit long...)
    $.getJSON(myABI_PROVIDER_EtherTrackWarehouse, function (data) {
        console.log("Parsing done, waiting for events... (Warehouse)");
        //Declare contract according to parsed ABI
        var myWHContract = TruffleContract(data);
        //Setting contract provider (Metmask / local node)
        myWHContract.setProvider(provider.currentProvider);
	var contractInstance;
	var contractName;

        myWHContract.at(address).then(function(instance) {
		contractInstance = instance;
		return instance.Name.call().then(function(result) {contractName = result; console.log("EtherTrackWarehouse " + contractName + " detected at : " + contractInstance.address);displayWarehouse(contractName, contractInstance.address);});
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
    );
}

function addNameService(address)
{
    //Parsing ABI from JSON file (can be a bit long...)
    $.getJSON(myABI_PROVIDER_EtherTrackNS, function (data) {
        console.log("Parsing done, waiting for events.. (NS)");
        //Declare contract according to parsed ABI
        var myNSContract = TruffleContract(data);
        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(provider.currentProvider);

        //Get deployed contract (ABI contains address) or at specified address
        var contractTarget = buildPromise(myNSContract, address);

        contractTarget.then(function (instance) {
            console.log("EtherTrackNS detected at : " + instance.address);
	    displayNameService("", instance.address);
            //Initiate watch for 'updateEntries' events
            instance.updateEntries().watch((err, response) => {
                console.log(response.args.GS1_GLN + " owned by " + response.args.owner);
                logEvents("EtherTrackNS", "updateEntries", response.args.GS1_GLN + " owned by " + response.args.owner);
		displayNodeName(response.args.GS1_GLN , response.args.owner);
            });
        });
    }
    );
}

function lookupGLN(nsAddress, gln)
{
    var glnNodeAddress;
    //Parsing ABI from JSON file (can be a bit long...)
    $.getJSON(myABI_PROVIDER_EtherTrackNS, function (data) {
        console.log("Parsing done, waiting for events.. (NS)");
        //Declare contract according to parsed ABI
        var myNSContract = TruffleContract(data);
        //Setting contract provider (Metmask / local node)
        myNSContract.setProvider(provider.currentProvider);

        myNSContract.at(nsAddress).then(function (instance) {
	console.log("Querying " + nsAddress + " for " + gln + " ...");
	console.log(instance);
		return instance.getNodeAddressByName(gln);
        }).then(function(result) { 
		glnNodeAddress = result;
		console.log(nsAddress + " : " + result);
		});
    });

	return glnNodeAddress;
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


