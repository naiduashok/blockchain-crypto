App = {
    web3Provider:null,
    contracts: {},
    v2softToken:null,
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokenSold:0,
    tokenAvailable:750000,
    init:function(){
       // console.log("app initialise");
        //console.log(TruffleContract());
        return App.initWeb3();
    },
    initWeb3: function() {
        //console.log(web3.currentProvider);
        if(typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        }
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);  
        }

        return App.initContracts();
    },

    initContracts: function() {
        $.getJSON("V2softTokenSale.json", function(v2softtokensale){
            //console.log(v2softtokensale);
            App.contracts.v2softtokensale = TruffleContract(v2softtokensale);
            App.contracts.v2softtokensale.setProvider(App.web3Provider);
            App.contracts.v2softtokensale.deployed().then(function(instanceTokenSale) {
                console.log("V2sof @@#@token sale address ",instanceTokenSale.address)
            });
        }).done(function(){
            $.getJSON("V2softToken.json", function(v2softtoken){
                App.contracts.v2softtoken = TruffleContract(v2softtoken);
                App.contracts.v2softtoken.setProvider(App.web3Provider);
                App.contracts.v2softtoken.deployed().then(function(instanceToken) {
                    App.v2softToken = instanceToken;
                    
                    console.log("V2sof 34434token address ",instanceToken.address)
                });
                return App.render();
            });
        })
    },
    buyToken: function(){
        $('#content').hide();
        $('#loader').show();
        var numberOfToken = $('#numberOfTokens').val();
        App.contracts.v2softtokensale.deployed().then(function(instanceTokenSale) {
            
                return instanceTokenSale.buyToken(numberOfToken, {
                    from: App.account,
                    value: numberOfToken * App.tokenPrice,
                    gas: 500000
                }).then(function(result){
                    console.log("Token Bought ");
                    $('form').trigger('reset');
                    $('#content').show();
                    $('#loader').hide();
                });
            
          //  console.log("V2sof token address ",instanceToken.address)
        });
    },
    render: function(){
        if(App.loading) {
            return;
        }
        

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();
        //load account data
        web3.eth.getCoinbase(function(err,account){
            if(err === null) {
                App.account = account;
                //App.account='0x6E7E13adEF4BA5A37866032D404b69feC96ac4C8';
                App.account='0xD6E63172Efb0817F9A08D1dFB6d3c7C4d3C24f82';
              //  App.account = web3.eth.getAccounts();
                console.log(account+"WHAT IS ACCOUNT "+App.account);
                $("#accountAddress").html("Your Account: "+account)
            }
        });

        App.contracts.v2softtokensale.deployed().then(function(instanceTokenSale){
            v2softtokensaleinstance = instanceTokenSale;
            return v2softtokensaleinstance.tokenPrice();
        }).then(function(tokenPrice){
            App.tokenPrice = tokenPrice.toNumber();
            //console.log(tokenPrice);
            $('.token-price').html(web3.fromWei(App.tokenPrice,"ether"));
            return v2softtokensaleinstance.tokenSold();
        }).then(function(tokenSold){
            App.tokenSold = tokenSold.toNumber(); //600000; //tokenSold.toNumber()
            $('.tokens-sold').html(App.tokenSold);
            $('.token-available').html(App.tokenAvailable);
            //return App.v2softToken.balanceOf(App.account);
            var progressPercent = (App.tokenSold / App.tokenAvailable)*100;
            console.log(progressPercent);
            $('#progress').css('width',progressPercent,'%');
            App.contracts.v2softtoken.deployed().then(function(instanceToken) {
                
                v2softToken = instanceToken;
                //return App.v2softToken.totalSupply();
                return App.v2softToken.balanceOf(App.account);
                //console.log("V2sof token address ",instanceToken.address)
            }).then(function(balance){

                console.log(balance.toNumber());
                $('.v2soft-balance').html(balance.toNumber());
                                
                App.loading = false;
                loader.hide();
                content.show();
            });
            //console.log(App.v2softToken.totalSupply());
           // return App.v2softToken.balanceOf(App.account);
        });
        
        // App.loading = false;
        // loader.hide();
        // content.show();
    }
}

$(function(){
    $(window).load(function(){
        App.init();
    });
});