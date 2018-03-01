pragma solidity ^0.4.2;
/// Owned contract as defined in Solidity documentation
contract owned
{
    function owned() internal { owner = msg.sender; }
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

contract EtherTrackNS is owned, mortal {

    /// Structure for names storage
    struct NamedNodeInfo
    {
        string name;
        uint64 weight;
    }
    
    /// Fired on entries update
    event  updateEntries (address owner, string name);

    /// Hash table that pair address with public name
    mapping(address => NamedNodeInfo) public InfoByNode;
    mapping(address => bool)  registeredByNode;
    mapping(string => address)  nodeByName;
    
    /// EtherTrackNS parent to forward queries
    address _parent;

    ///Fallback function
    function() public payable {}

    /// Constructor
    /// Create a new ballot with $(_numProposals) different proposals.
    function EtherTrackNS(address parent) public {
        _parent = parent;
    }
    
    /// updateRegisters
    /// Upadtes registry with the provided node/name pair
    function updateRegisters(address node, string name) internal returns(bool registered)
    {
        if (!registeredByNode[node])
        {
            /// Name already used
            if (nodeByName[name] == address(0))
            {
                /// Mark as registered
                registeredByNode[node] = true;
                /// Update info
                InfoByNode[node].name = name;
                InfoByNode[node].weight = 0;

                registered = true;

                require(registered);
                updateEntries(node, name);
            }
            else
            {
                registered = false;
            }

            return registered;
        }
    }

    /*
     * ==== EXTERNAL ====
     */

    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function getNameByNodeAddress(address node) external view returns(string _name)
    {
        if (registeredByNode[node])
            _name = InfoByNode[node].name;

        return _name;
    }
    
    /// registerName
    /// Registers name and asociate it to caller address
    function registerName(string name) external payable returns(bool registered)
    {
        return updateRegisters(msg.sender, name);
    }

    /// delegate
    /// Delegate name to specified address
    function delegate (address to) external payable {
        if(registeredByNode[msg.sender] && !registeredByNode[to])
        {
            string storage callerNodeName = InfoByNode[msg.sender].name;

            
            ///Update entries
            InfoByNode[to].name = callerNodeName;
            InfoByNode[to].weight = 0;
            nodeByName[callerNodeName] = to;
            
            InfoByNode[msg.sender].name = "";
                        
            registeredByNode[to] = true;
        }
    }
}