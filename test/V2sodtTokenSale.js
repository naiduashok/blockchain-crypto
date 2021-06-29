var V2softToken = artifacts.require("./V2softToken");
var V2softTokenSale = artifacts.require("./V2softTokenSale");

contract('V2softTokenSale',function(accounts){
    var tokenSaleInstance;
    var tokenInstance;
    var admin = accounts[0];
    var tokenPrice = 1000000000000000; //in wei
    var buyer = accounts[1];
    var tokenavailablee = 750000; //provide to tokensale address contact address
    var numberOfToken;
    it('initialize the contract with the correct values',function() {
        return V2softTokenSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(function(address){
            assert.notEqual(address,null,'address is not null');
            assert.notEqual(address,'','address is not blankc');
            assert.notEqual(address,0x0,'address is not Zero');
            return tokenSaleInstance.tokenContract();
        }).then(function(tokenContractaddress){
            assert.notEqual(tokenContractaddress,0x0,'Token address is not Zero');
            return tokenSaleInstance.tokenPrice()
        }).then(function(price){
            assert.equal(price,tokenPrice, 'token is correct')

        });
    });

    it('faciliate token buying',function() {
        return V2softToken.deployed().then(function(instance){
            tokenInstance = instance;
            return V2softTokenSale.deployed();
        }).then(function(instance){    
            tokenSaleInstance = instance;
            numberOfToken = 10;
            return tokenInstance.transfer(tokenSaleInstance.address, tokenavailablee, {from: admin})
        }).then(function(receipt){
            var value = numberOfToken * tokenPrice;
            return tokenSaleInstance.buyTokens(numberOfToken,{from:buyer , value:value})
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'triggers one event');
            console.log(receipt.logs[0].event);
            assert.equal(receipt.logs[0].event,'Sell',' should be sell event');
            assert.equal(receipt.logs[0].args._buyer,buyer ,' Logs the account the purchase the token');
            assert.equal(receipt.logs[0].args._amount,numberOfToken ,'Logs the account purchased');
            //assert.equal(receipt.logs[0].args._value,250000,' log the transfer amount');
            return tokenSaleInstance.tokenSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(),numberOfToken,'Increatments the number of token sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(balance){
            assert.equal(balance.toNumber(),numberOfToken)
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(),tokenavailablee - numberOfToken)
            return tokenSaleInstance.buyTokens(numberOfToken,{from:buyer , value:1})
           //return tokenSaleInstance.buyTokens(9999999,{from:buyer , value:1})
        }).then(function(amount){
            assert.equal(amount.toNumber(),numberOfToken,'Increatments the number of token sold');
           // return tokenSaleInstance.buyTokens(numberOfToken,{from:buyer , value:1})
           return tokenSaleInstance.buyTokens(9999999,{from:buyer , value:1})
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0,'Can not purchase more than number of available token');
        });
    });

    it('end sale',function() {
        return V2softToken.deployed().then(function(instance){
            tokenInstance = instance;
            return V2softTokenSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({from:buyer});
        }).then(assert.fail).catch(function(error){
            //console.log(error.message)
            //console.log("+++++++++");
            //console.log("***********"+error.message.indexOf('revert'));
            //assert.equal(error.message.indexOf('revert' >= 0,'must be admin to end sale'));
            return tokenSaleInstance.endSale({from:admin});
        }).then(function(receipt){
            //assert.equal(receipt.l)
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            console.log("BALANACE : "+balance.toNumber());
            assert.equal(balance.toNumber(),999990, 'return all unsold v2soft token to admin');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price.toNumber(),0,'token price was reset');
        });
    });
});