pragma solidity ^0.4.19;


/// Owned contract as defined in Solidity documentation
contract owned
{
    function owned() public { owner = msg.sender; }
    address owner;
    
        modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}

/// Mortal contract as defined in Solidity documentation
contract mortal is owned {
    function kill() internal onlyOwner {
        selfdestruct(owner);
    }
}

/// Interface
contract EtherTrackNS is owned {
    /// updateRegisters
    /// Upadtes registry with the provided node/name pair and a the secret for futur hashing
    function updateRegisters(address node, uint64 GS1_GLN) internal returns(bool registered);

    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function getNameByNodeAddress(address node) external view returns(uint64 _name);
    
    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function exists(address node) external view returns(bool exists);
    
    /// registerName
    /// Registers name and asociate it to caller address
    function registerName(address node, uint64 GS1_GLN) external payable returns(bool registered);

    /// delegate
    /// Delegate name to specified address
    function delegate (address to) external payable;
}

contract EtherTrackWarehouse is owned, mortal {

    event unitSent(address to, bytes32 hashedUnit);
    event unitReceived(address from, bytes32 hashedUnit);

    string public Name;
    address _etherTrackNS; /// Store naming service contract reference
    
    mapping(bytes32 => bool) internal  _stock; /// Stock
    mapping(address => mapping(bytes32 => bool)) internal _sentBufferByDestination; /// Register units that are in pending reception state
    mapping(address => mapping(bytes32 => bool)) internal _receivedBufferByDestination; /// Register units that are in pending reception state    

    /// Fallback function
    function() public payable { }    

    function EtherTrackWarehouse (string name, address etherTrackNS) public {
        _etherTrackNS = etherTrackNS;

        //Validate that owner is registred on the naming service and that GS1 AI are well formed
        require(etherTrackNS != address(0));
        require(validateNode(owner) == true);

        Name = name;
    }
    
    function createUnit(string unit) public onlyOwner {
        bytes32 hashedUnit = keccak256(unit);
        
        require(_stock[hashedUnit] == false);
        
        _stock[hashedUnit] = true;
	unitReceived(owner, hashedUnit);
    }

    /// Send specified unit to specified warehouse
    function sendUnitTo(string unit, address to) public payable onlyOwner {
        bytes32 hashedUnit = keccak256(unit);
        
        require(to != address(this));
        require(_stock[hashedUnit]); // Is in stock
        require(_sentBufferByDestination[to][hashedUnit] == false); // Not already sent
        
        _sentBufferByDestination[to][hashedUnit] = true;
        EtherTrackWarehouse(to).receiveUnit(hashedUnit);
	unitSent(to, hashedUnit);
    }
    
    /// Confirm unit received (called by sender contract)
    function confirmUnitSent(bytes32 hashedUnit) public payable returns (bytes32) {
        require(_sentBufferByDestination[msg.sender][hashedUnit]); /// Caller got one unit in the _sentBufferByDestination
        
        _sentBufferByDestination[msg.sender][hashedUnit] = false;
        _stock[hashedUnit] = false;
        
        EtherTrackWarehouse(msg.sender).confirmUnitReceived(owner, hashedUnit);
        
        return hashedUnit;
    }
    
    /// Receive unit (called by sender contract)
    function receiveUnit(bytes32 hashedUnit) external payable  {
        require(msg.sender != address(this));
        require(_receivedBufferByDestination[msg.sender][hashedUnit] == false);
        
        _receivedBufferByDestination[msg.sender][hashedUnit] = true;
        
        EtherTrackWarehouse(msg.sender).confirmUnitSent(hashedUnit);
	unitReceived(msg.sender, hashedUnit);
    }
    
    /// Confirm unit received (called by sender contract)
    function confirmUnitReceived(address from, bytes32 hashedUnit) public payable returns (bytes32) {
        require(_receivedBufferByDestination[from][hashedUnit]); /// Caller got one unit in the _sentBufferByDestination
        
        _receivedBufferByDestination[from][hashedUnit] = false;
        //_stock[unit] = true;
        
        return hashedUnit;
    }
    
    /// Validate that provided node exists
    function validateNode(address node) view internal returns (bool) { return EtherTrackNS(_etherTrackNS).exists(node); }
}
