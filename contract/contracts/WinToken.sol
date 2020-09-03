pragma solidity ^0.4.25;

import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract WinToken is StandardToken {
    using SafeMath for uint256;

    string public name = "Winner";
    string public symbol = "WIN";
    uint8 public decimals = 18;

    uint256 public totalSupply = 0;

    uint256 public minETH = 0.5 ether;
    uint256 public coinsPerETh = 100;

    // number of persons
    uint8 public N = 10;

    // ETH amount
    uint256 public M = 5 ether;

    /**
     * Admin
     */
    address private adminWallet = msg.sender;

    uint256 public ethBalance = 0;
    uint256 public participants = 0;

    uint256 private maxChance = 0;
    mapping(uint256 => address) private chances;

    uint256 public test = 0;

    /**
     * @dev Constructor
     */
    constructor() public{

    }

    modifier isAdmin(){
        require(msg.sender == adminWallet);
        _;
    }

    modifier checkMin(){
        require(msg.value >= minETH, "Minimum amount error");
        _;
    }

    function() checkMin public payable{
        uint256 tokenAmount = msg.value.mul(coinsPerETh);
        totalSupply += tokenAmount;

        participants += 1;
        ethBalance += msg.value;

        Transfer(address(0), msg.sender, tokenAmount);
        balances[msg.sender] += tokenAmount;

        uint256 chanceCount = msg.value.div(minETH);
        
        for(uint256 i=0; i < chanceCount; i++){
            chances[maxChance] = msg.sender;
            maxChance += 1;
        }

        if(ethBalance >= M || participants >= N){
            _selectWinner();
        }
    }

    function updateAdmin(address _address) isAdmin public{
        require(_address != address(0), "Invalid address");
        adminWallet = _address;
    }

    function updateN(uint8 _n) isAdmin public{
        N = _n;
    }

    function updateM(uint256 _m) isAdmin public{
        M = _m;
    }

    function updateMinETH(uint256 _minETH) isAdmin public{
        minETH = _minETH;
    }

    function updateNameSymbol(string _name, string _symbol) isAdmin public{
        name = _name;
        symbol = _symbol;
    }

    function updateCoinsPerETh(uint256 _coinsPerETH) isAdmin public{
        coinsPerETh = _coinsPerETH;
    }

    function _selectWinner() private{
        require(ethBalance >= 0);

        uint256 indx = uint256(block.blockhash(block.number-1)) % maxChance;
        address winner = chances[indx];
        winner.transfer(ethBalance.mul(80).div(100));
        adminWallet.transfer(ethBalance.mul(20).div(100));

        ethBalance = 0;
        maxChance = 0;
        participants = 0;

    }

    function selectWinner() isAdmin public{
        _selectWinner();
    }
}
