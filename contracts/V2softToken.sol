pragma solidity ^0.5.0;

contract V2softToken {
    uint public totalSupply;
    string public name = 'V2soft Token';
    string public symbol = 'V2soft';
    string public standard = 'V2soft token 1.0';
    mapping (address =>uint256) public balanceOf;
    mapping (address => mapping(address => uint256)) public allowance;
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }



    function transfer(address _to, uint256 _value) public returns (bool success){
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender,_spender,_value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        //Require from account has enough token
        require(balanceOf[_from] >= _value);
        
        //require allowance is big enough
        require(allowance[_from][msg.sender] >= _value);

        //change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        //Update the allowance
        allowance[_from][msg.sender] -= _value;
        //transfer event
        emit Transfer(_from, _to, _value);
        return true;
    }
}