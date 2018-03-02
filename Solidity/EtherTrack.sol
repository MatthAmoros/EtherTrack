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
        uint64 GS1_GLN; /// GS1 Company Prefix
        uint64 weight;
    }
    
    /// Fired on entries update
    event  updateEntries (address owner, uint64 GS1_GLN);

    /// Hash table that pair address with public name
    mapping(address => NamedNodeInfo) public InfoByNode;
    mapping(address => bool)  registeredByNode;
    mapping(uint64 => address)  nodeByName;
    
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
    function updateRegisters(address node, uint64 GS1_GLN) internal returns(bool registered)
    {
        if (!registeredByNode[node])
        {
            /// Name already used
            if (nodeByName[GS1_GLN] == address(0))
            {
                /// Mark as registered
                registeredByNode[node] = true;
                /// Update info
                InfoByNode[node].GS1_GLN = GS1_GLN;
                InfoByNode[node].weight = 0;

                registered = true;

                require(registered);
                updateEntries(node, GS1_GLN);
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
    function getNameByNodeAddress(address node) external view returns(uint64 _name)
    {
        if (registeredByNode[node])
            _name = InfoByNode[node].GS1_GLN;

        return _name;
    }
    
    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function exists(address node) external view returns(bool exists)
    {
        return registeredByNode[node];
    }
    
    
    /// registerName
    /// Registers name and asociate it to caller address
    function registerName(uint64 GS1_GLN) external payable returns(bool registered)
    {
        return updateRegisters(msg.sender, GS1_GLN);
    }

    /// delegate
    /// Delegate name to specified address
    function delegate (address to) external payable {
        if(registeredByNode[msg.sender] && !registeredByNode[to])
        {
            uint64 callerNodeName = InfoByNode[msg.sender].GS1_GLN;

            
            ///Update entries
            InfoByNode[to].GS1_GLN = callerNodeName;
            InfoByNode[to].weight = 0;
            nodeByName[callerNodeName] = to;
            
            InfoByNode[msg.sender].GS1_GLN = uint64(0);
                        
            registeredByNode[to] = true;
        }
    }
}

contract TraceabilityUnit is owned {
    
    struct UnitInfo {
        uint8 GS1_GTIN; /// Global Trade Item Number (GTIN) AI01
        uint8 GS1_GSIN; /// Global Shipment Identification Number (GSIN) 
        uint8 GS1_SSC; /// Serial Shipping Container Code (SSCC)
        string GS1_SN; /// Serial Number (SN) AI21
    }
    
    UnitInfo _info; /// Store unit information
    address _location; /// Store unit location
    EtherTrackNS _etherTrackNS; /// Store naming service contract reference
    
    /// Fired on tracebility unit creation
    event notifyCreation(address owner, uint8 gtin, string sn);
    event notifyOwnershipTransfer(address to, uint8 gtin, string sn);
    event notifyLocationChanged(address newLocation, uint8 gtin, string sn);
    
    /// Create a new traceability unit and validate its owner throught EtherTrackNS
    function TraceabilityUnit (uint8 gtin, uint8 sscc, uint8 gsin, string sn, EtherTrackNS etherTrackNS) public onlyOwner {
        
        //Validate that owner is registred on the naming service
        validateNode(owner);
        
        _info.GS1_GTIN = gtin;
        _info.GS1_GSIN = gsin;
        _info.GS1_SSC = sscc;
        _info.GS1_SN = sn;
        //Set location to owner
        _location = owner;
        _etherTrackNS = etherTrackNS;
        
        
        notifyCreation(owner, _info.GS1_GTIN, _info.GS1_SN);
    }
    
    /// Transfer unit ownership to specified node
    function transferOwnerShip(address to) external payable onlyOwner {
        validateNode(to);
        owner = to;
        notifyOwnershipTransfer(owner, _info.GS1_GTIN, _info.GS1_SN);
    }
    
    /// Change unit location to specified node
    function moveTo(address to) external payable onlyOwner {
        validateNode(to);
        _location = to;
        
        notifyLocationChanged(to, _info.GS1_GTIN, _info.GS1_SN);
    }
    
    /// Validate that provided node exists
    function validateNode(address node) view internal
    {
        require(_etherTrackNS.exists(node));
    }
}