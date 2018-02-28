pragma solidity ^0.4.2;
contract owned
{
    function owned() { owner = msg.sender; }
    address owner;
}


contract mortal is owned {
    function kill()
    {
        if (msg.sender == owner) selfdestruct(owner);
    }
}

contract EtherTrackNS is owned, mortal {

    struct NamedNodeInfo
    {
        string name;
        uint64 weight;
    }

    event updateEntries (address owner, string name);

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

    ///getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function getNameByNodeAddress(address node) public view returns(string _name)
    {
        if (registeredByNode[node])
            _name = InfoByNode[node].name;

        return _name;
    }

    function registerName(string name) public payable returns(bool registered)
    {
        if (!registeredByNode[msg.sender])
        {
            /// Name already used
            if (nodeByName[name] == address(0))
            {
                /// Mark as registered
                registeredByNode[msg.sender] = true;
                /// Update info
                InfoByNode[msg.sender].name = name;
                InfoByNode[msg.sender].weight = 0;

                registered = true;

                require(registered);
                // _parent.registerName();
            }
            else
            {
                registered = false;
            }

            return registered;
        }
    }

    /// Delegate name
    function delegate (address to) public {
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
