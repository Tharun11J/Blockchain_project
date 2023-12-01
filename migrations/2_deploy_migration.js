var Tracetex = artifacts.require("./contracts/Tracetex.sol");

module.exports = function(deployer) {
  deployer.deploy(Tracetex);
};