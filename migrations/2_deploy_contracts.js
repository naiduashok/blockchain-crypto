const V2softToken = artifacts.require("V2softToken");
const V2softTokenSale = artifacts.require("V2softTokenSale");

module.exports = function(deployer) {
  deployer.deploy(V2softToken,1000000).then(function(){
    var tokenPrice = 1000000000000000 //0.001 eth
    return deployer.deploy(V2softTokenSale, V2softToken.address, tokenPrice);
  });
  
};
