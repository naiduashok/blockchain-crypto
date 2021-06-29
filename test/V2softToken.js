//var V2softToken = artifacts require("./V2softToken.sol");
var V2softToken = artifacts.require("./V2softToken");

contract('V2softToken',function(accounts){
    var tokenInstance;
    it('initialize the contract with the correct values',function() {
        return V2softToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name,'V2soft Token',' has the correct name');
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol,'V2soft',' has the correct symbol');
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'V2soft token 1.0', 'has the correct standard');
        });
    })
    it('allocates the initial    upon deployment', function(){
        return V2softToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(),1000000,'sets the total supply to 100000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminbalance){
            assert.equal(adminbalance.toNumber(),1000000, 'its admin balance of 1000000');
        });
    });
    

    it('transfer ownership', function(){
        return V2softToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1],'999999999999999999999999999999999')
            //return tokenInstance.totalSupply();
        }).then(assert.fail).catch(function(error){
            //console.log(error.message);
            assert(error.message.indexOf('revert') >= 0,'error message must contain revert');
            //return tokenInstance.transfer.call(accounts[1],250000)
            return true;
            //return tokenInstance.transfer(accounts[1],250000, {from: accounts[0]})
        }).then(function(success){
            assert.equal(success,true,'its return true');
            return tokenInstance.transfer(accounts[1],250000, {from: accounts[0]})
        }).then(function(receipt){
            //console.log(receipt.logs);
            
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer',' should be transfer event');
            assert.equal(receipt.logs[0].args._from,accounts[0],' Logs the account the token are transffer from');
            assert.equal(receipt.logs[0].args._to,accounts[1],' Logs the account the token are transffer to');
            assert.equal(receipt.logs[0].args._value,250000,' log the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance){
            assert.equal(balance.toNumber(),250000,'adds the amount to the receiving account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance){
            assert.equal(balance.toNumber(),750000,'deducts the amount frim the sending amount');   
        });
    });


    it('approves token for delegated transfer', function(){
        return V2softToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1],100)
            //return tokenInstance.totalSupply();
        }).then(function(success){
            assert.equal(success,true,'Its return true');
            return tokenInstance.approve(accounts[1],100)
        }).then(function(receipt){
           // console.log(receipt.logs);
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Approval',' should be transfer event');
            assert.equal(receipt.logs[0].args._owner,accounts[0],' Logs the account the token are transffer from');
            assert.equal(receipt.logs[0].args._spender,accounts[1],' Logs the account the token are transffer to');
            assert.equal(receipt.logs[0].args._value.toNumber(),100,' log the transfer amount');
            return tokenInstance.allowance(accounts[0],accounts[1])
        }).then(function(allowance){
            assert.equal(allowance.toNumber(),100,'store the allowance to delegate transfer');
        });
    });

    it('Handles Delegate transfer', function(){
        return V2softToken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2]; 
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            //transfer some token
            return tokenInstance.transfer(fromAccount, 100, {from:accounts[0]});
            //return tokenInstance.approve.call(accounts[1],100)
            //return tokenInstance.totalSupply();
        }).then(function(receipt){
            //Approve spendingaccount to spend 10 tokens
            return tokenInstance.approve(spendingAccount,10,{from:fromAccount})
        }).then(function(receipt){
            return tokenInstance.transferFrom(fromAccount, toAccount,99999, {from:spendingAccount});
        }).then(assert.fail).catch(function(error){
            //console.log("=========");
            //console.log(error.message.indexOf('revert'));
            //console.log("=========");
            assert(error.message.indexOf('revert') >= 0,'revert can not transfer amount larger than the balance of from account');
            return tokenInstance.transferFrom(fromAccount, toAccount,20, {from:spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0,'revert can not transfer amount greater than approved amount');
            return tokenInstance.transferFrom.call(fromAccount, toAccount,2, {from:spendingAccount});
        }).then(function(success){
            assert.equal(success,true);
            return tokenInstance.transferFrom(fromAccount, toAccount,2, {from:spendingAccount});
        }).then(function(receipt){
//            console.log(receipt.logs);
 //           console.log(receipt.logs);
            assert.equal(receipt.logs.length,1,'triggers one event');
            assert.equal(receipt.logs[0].event,'Transfer',' should be transfer event');
            assert.equal(receipt.logs[0].args._from,fromAccount,' Logs the account the token are transffer from');
            assert.equal(receipt.logs[0].args._to,toAccount,' Logs the account the token are transffer to');
            assert.equal(receipt.logs[0].args._value.toNumber(),2,' log the transfer amount');
            return tokenInstance.balanceOf(fromAccount)
        }).then(function(balance){
           // console.log("=====fromAccount====");
           // console.log(balance.toNumber());
            //console.log()
            //console.log("=========");
            assert.equal(balance.toNumber(),98," From account has 90 as we minus -2");
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance){
            //console.log("====toAccount=====");
            //console.log(balance.toNumber());
            //console.log("=========");
            assert.equal(balance.toNumber(),2," From account has 90 as we minus -2");
            return tokenInstance.balanceOf(spendingAccount);
        }).then(function(balance){
            //console.log("====spendingAccount=====");
            //console.log(balance.toNumber());
           // console.log("=========");
            //assert.equal(balance.toNumber(),98," From account has 90 as we minus -2");
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(),8,'deducts the amount from the allowance')
        });
    });
})