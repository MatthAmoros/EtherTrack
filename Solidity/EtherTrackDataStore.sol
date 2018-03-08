pragma solidity ^0.4.20;

/// Owned contract as defined in Solidity documentation
contract owned
{
    function owned() public { owner = msg.sender; }
    function delegateOwnership(address newOwner) public onlyOwner { owner = newOwner; } 
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
/// Storage contract
contract EtherTrackDataStore is owned, mortal {
    
    /// Hash table that pair address with public name
    mapping(address => uint64) private nameByNode;
    mapping(address => bool) private registeredByNode;
    mapping(uint64 => address) private nodeByName;
    
    
    function EtherTrackDataStore() public { }
    
    function getNamebyNode (address node) external view returns (uint64) {
        return nameByNode[node];
    }
    
    function getNodebyName (uint64 name) external view returns (address) {
        return nodeByName[name];
    }
    
    function setNamebyNode (address node, uint64 name) external onlyOwner returns (uint64) {
        require(!registeredByNode[node]);
        nameByNode[node] = name;
        nodeByName[name] = node;
        registeredByNode[node] = true;
    }
}