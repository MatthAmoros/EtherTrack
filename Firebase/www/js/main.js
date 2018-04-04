var etherTrackNS_ABI;
var provider;

$(document).ready(function () {
    $("#btnAddWH").click(function () {
        let contractAddress = $("#whAddress").val();

        if (bindedContract.indexOf(contractAddress) == -1) {
            let wh = new Warehouse(contractAddress, null, null, provider, null, false)
            bindedContract.push(wh);
            toast("Looking for warehouse at " + contractAddress + "...");
        }
        else {
            toast("Already exsits.");
        }
    });
    $("#btnCreatWH").click(function () {
        let NScontractAddress = $("#nsAddress").val();
        let whName = $("#whName").val();

        if (bindedContract.indexOf(whName) == -1) {
            let wh = new Warehouse(null, NScontractAddress, whName, provider, null, false)
            bindedContract.push(wh);
            toast("Warehouse creation request sent, please wait for network response...");
        }
        else {
            toast("Already exsits.");
        }
    });

   $("#btnAddNS").click(function() {
	    let NScontractAddress = $("#nsAddAddress").val();
            let ns = new NameService(NScontractAddress, provider, null, false);
		ns.onCreate = toast;
            bindedContract.push(ns);
            toast("Looking for name service at " + NScontractAddress + " ...");
	});


   $("#btnCreatNS").click(function() {
	    let NScontractAddress = $("#nsAddAddress").val();
            let ns = new NameService("", provider, null, false);
            bindedContract.push(ns);
            toast("Name service creation request sent, please wait for network response...");
	});

//Loading additional views
	$("#header").load("./views/header.html");
//Detect metamask
	detectProvider();
});

function detectProvider() {
if (typeof web3 !== 'undefined') {
	console.log("MetaMask/Mist detected !");
    // Use Mist/MetaMask's provider
    provider = new Web3(web3.currentProvider);
	startDapp(provider);
  }
else if(typeof window.web3 !== 'undefined') {
       console.log("MetaMask/Mist detected !");
    // Use Mist/MetaMask's provider
    provider = new Web3(window.web3.currentProvider);
	startDapp(provider);
}
 else {
   console.log("MetaMask/Mist not detected, trying to contact local node...");
        let Web3 = require("web3");

	//Local node
        provider = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

        if (typeof provider !== "undefined") {
            console.log("Connecting to : " + provider.currentProvider.host);
            startDapp(provider);
        }
    }
}

//Log events to grid
function logEvents(contract, eventType, description) {
    $('#eventsTable > tbody:last-child').append("<tr><th>" + contract + "</th>" +
        "<th>" + eventType + "</th>" +
        "<th>" + description + "</th>" +
        "</tr> ");
}


function displayWarehouse(name, address, savePref) {
    $('#WHList').append("<li class=\"list-group-item\">" + name + " at : " + address +
        "<input type=\"button\" value=\"Send unit\" id=\"whBtnSend-" + address.substring(0, 10) + "\"/>" +
        "<input type=\"button\" value=\"Create unit\" id=\"whBtnCreate-" + address.substring(0, 10) + "\"/>" +
        "<input placeholder=\"Unit code\" id=\"whUniteCode-" + address.substring(0, 10) + "\"/>" +
        "<input placeholder=\"Destination address\" id=\"whDestAddr-" + address.substring(0, 10) + "\"/>" +
        "</li>"
    );

    $("#whBtnCreate-" + address.substring(0, 10)).click(function () {
        let unitCode = $("#whUniteCode-" + address.substring(0, 10)).val();
	let contract = bindedContract.find(x => x.address == address);
	console.log(contract);
        contract.createUnit(unitCode);
    });

    $("#whBtnSend-" + address.substring(0, 10)).click(function () {
        let unitCode = $("#whUniteCode-" + address.substring(0, 10)).val();
        let whAddressTo = $("#whDestAddr-" + address.substring(0, 10)).val();
	let contract = bindedContract.find(x => x.address == address);
	console.log(contract);
        contract.sendUnit(whAddressTo, unitCode, provider);
    });

	if(savePref)
	{
		saveWarehouse(currentAccount, address, name);
	}
}

function displayNameService(name, address, savePref) {
    $('#NSList').append("<li class=\"list-group-item\">" + name + " at : " + address +	
        "<input type=\"button\" value=\"Get GLN address\" id=\"nsBtnLook-" + address.substring(0, 10) + "\"/>" +
	"<input type=\"button\" value=\"RegisterGLN\" id=\"nsBtnReg-" + address.substring(0, 10) + "\"/>" +
        "<input placeholder=\"GLN\" id=\"glnNode-" + address.substring(0, 10) + "\"/>" +
	"<input type=\"button\" value=\"Get Datastore Address\" id=\"nsBtnGetDS-" + address.substring(0, 10) + "\"/>" +
	"<input type=\"button\" value=\"Set Datastore Address\" id=\"nsBtnSetDS-" + address.substring(0, 10) + "\"/>" +
	"<input placeholder=\"Datastore Address\" id=\"dsAddre-" + address.substring(0, 10) + "\"/>" +
        "</li>");

    $("#nsBtnLook-" + address.substring(0, 10)).click(function () {
        let name = $("#glnNode-" + address.substring(0, 10)).val();
	let contract = bindedContract.find(x => x.address == address);
	contract.lookupCallBack = function(result) {displayNodeName(name, result);};
	contract.lookupGLN(name);        
    });

    $("#nsBtnReg-" + address.substring(0, 10)).click(function () {
        let name = $("#glnNode-" + address.substring(0, 10)).val();
	let contract = bindedContract.find(x => x.address == address);

	contract.registerGLN(name);        
    });

    $("#nsBtnGetDS-" + address.substring(0, 10)).click(function () {
	let contract = bindedContract.find(x => x.address == address);

	contract.getDatastoreCallback = displayDataStoreAddres;
	contract.getDatastoreAddress();        
    });

    $("#nsBtnSetDS-" + address.substring(0, 10)).click(function () {
	let contract = bindedContract.find(x => x.address == address);
	let dsAddress = $("#dsAddre-" + address.substring(0, 10)).val();

	contract.setDatastoreAddress(dsAddress);        
    });

	if(savePref)
	{
		saveNameService(currentAccount, address);
	}
}

function savePreference(address) {
	let contract = bindedContract.find(x => x.address == address);
	contract.saveToFirebase();
}

function displayDataStoreAddres(NSaddress, DSaddress) {
	$("#whDestAddr-" + NSaddress.substring(0, 10)).val(DSaddress);
}

function displayNodeName(name, address) {
    $('#nodeList').append("<li class=\"list-group-item\">" + name + " at : " + address + "</li>");
}
