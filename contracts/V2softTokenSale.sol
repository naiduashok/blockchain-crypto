pragma solidity ^0.5.0;
import "./V2softToken.sol";
contract V2softTokenSale {
    address payable admin;
    V2softToken public tokenContract;
    uint256 public tokenPrice;
    uint public tokenSold = 0;
    
    event Sell(
        address _buyer,
        uint256 _amount
    );
   
    constructor(V2softToken _tokenContract, uint _tokenPrice) public {
        //assign admin
        admin = msg.sender;
        //Token contract
        tokenContract = _tokenContract;
        //Token price
        tokenPrice = _tokenPrice;
    }
    function multiply(uint x, uint y) internal pure returns(uint z){
        require(y == 0 || (z=x*y)/y == x);
    }
    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
      
      require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
      require(tokenContract.transfer(msg.sender,_numberOfTokens));
        tokenSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        selfdestruct(admin);
    }

    
}