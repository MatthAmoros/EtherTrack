var EtherTrackDataStore = artifacts.require("EtherTrackDataStore");
var EtherTrackNS = artifacts.require("EtherTrackNS");
var EtherTrackWarehouse = artifacts.require("EtherTrackWarehouse");


module.exports = function(deployer) {
var storeInstance;
var myNS;
	return deployer.deploy(EtherTrackNS, "", "")
		.then(function(instance)
		{
			//Get deployed instance
			return EtherTrackNS.deployed();
		})
		.then(function(instance)
		{
			myNS = instance;
			//Create datastore
			return myNS.createDataStore();
		})
		.then(function()
		{
			//Return datastore address
			return myNS.getDataStoreAddress();
		})
		.then(function(dsAddress)
		{
			//Log create
			console.log(">> Data store address : " + dsAddress);
			console.log(">> EtherTarckNS address : " + myNS.address);
		})
		.then(function()
		{
			//Register name
			return myNS.registerName("", 0000001).then(function()
			{
				console.log(">> Creating Warehouses");
				deployer.deploy(EtherTrackWarehouse, "Store", myNS.address);
				deployer.deploy(EtherTrackWarehouse, "Facility", myNS.address);

				return 0;
			});
		})
};
