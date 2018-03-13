var EtherTrackDataStore = artifacts.require("./EtherTrackDataStore.sol");

contract('EtherTrackDataStore', function(accounts) {
var globalInstance;
 it("should register name", function() {
    return EtherTrackDataStore.deployed()
.then(function(instance) {
	globalInstance = instance;
	return globalInstance.setNamebyNode.call(accounts[1], 1234);  
})
.then(function(instance) {
	return globalInstance.getNamebyNode.call(accounts[1]);
})
.then(function (name) {
	console.log(name);
	assert.equal(name.toNumber(), 1234);
});

})

  it("should delegate ownership", function() {
    return EtherTrackDataStore.deployed().then(function(instance) {
	globalInstance = instance;
	return globalInstance.delegateOwnership.call(accounts[2]);
}).then(function(result) {
	return globalInstance.getOwnerAddress();
}).then(function (e) {
	assert.equal(e, accounts[2]);
});

})

});
