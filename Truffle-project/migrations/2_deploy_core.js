var owned = artifacts.require("owned");
var mortal = artifacts.require("mortal");

module.exports = function(deployer) {
  deployer.deploy(owned);
  deployer.deploy(mortal);
};
