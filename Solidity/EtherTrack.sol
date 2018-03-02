pragma solidity ^0.4.2;
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

contract EtherTrackNS is owned {
    /// Fired on entries update
    event  updateEntries (address owner, uint64 GS1_GLN);

    /// Hash table that pair address with public name
    mapping(address => uint64) public InfoByNode;
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
                InfoByNode[node] = GS1_GLN;

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
            _name = InfoByNode[node];

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
            uint64 callerNodeName = InfoByNode[msg.sender];
            
            ///Update entries
            InfoByNode[to] = callerNodeName;
            nodeByName[callerNodeName] = to;
            
            InfoByNode[msg.sender] = uint64(0);
                        
            registeredByNode[to] = true;
        }
    }
}

/// Example for constructor : "07804652870010","00118292000000000001","123","11894", "0xff36aa89578a13910970367086de0bfcf1783359"
contract TraceabilityUnit is owned, mortal {
    /*
    * According to GS1 standards, the GTIN/SN pair should be unique
    *
    */
    /// Fallback function
    function() public payable { }
    
    struct UnitInfo {
        string GS1_GTIN; /// Global Trade Item Number (GTIN) AI01
        string GS1_GSIN; /// Global Shipment Identification Number (GSIN) 
        string GS1_SSC; /// Serial Shipping Container Code (SSCC)
        string GS1_SN; /// Serial Number (SN) AI21
    }
    
    UnitInfo _info; /// Store unit information
    address _location; /// Store unit location
    address _etherTrackNS; /// Store naming service contract reference
    
    /// Fired on tracebility unit creation
    event notifyCreation(address owner, string gtin, string sn);
    event notifyOwnershipTransfer(address to, string gtin, string sn);
    event notifyLocationChanged(address newLocation, string gtin, string sn);
    
    /// Create a new traceability unit and validate its owner throught EtherTrackNS
    function TraceabilityUnit (string gtin, string sscc, string gsin, string sn, address etherTrackNS) public {
        _etherTrackNS = etherTrackNS;
        
        //Validate that owner is registred on the naming service and that GS1 AI are well formed
        require(validateGS1Constraints(gtin, sn) == true);
        require(etherTrackNS != address(0));
        require(validateNode(owner) == true);

        _info.GS1_GTIN = gtin;
        _info.GS1_GSIN = gsin;
        _info.GS1_SSC = sscc;
        _info.GS1_SN = sn;
        //Set location to owner
        _location = owner;
        
        notifyCreation(owner, _info.GS1_GTIN, _info.GS1_SN);
    }
    
    /// Publicly exposed constraints
    function validateGS1Constraints(string gtin, string sn) internal pure returns (bool) {
        return (bytes(gtin).length == 14 && bytes(sn).length <= 20); 
    }
    
    /// Transfer unit ownership to specified node
    function transferOwnerShip(address to) external payable onlyOwner {
        require(validateNode(to) == true);
        owner = to;
        notifyOwnershipTransfer(owner, _info.GS1_GTIN, _info.GS1_SN);
    }
    
    /// Change unit location to specified node
    function moveTo(address to) external payable onlyOwner {
        require(validateNode(to) == true);
        _location = to;
        
        notifyLocationChanged(to, _info.GS1_GTIN, _info.GS1_SN);
    }
    
    function changeEtherTrackNS(address newEtherTrackNS) external payable onlyOwner {
        // Send exists on new ethertrackNS
        require(EtherTrackNS(newEtherTrackNS).exists(owner) == true);
        _etherTrackNS = newEtherTrackNS;
    }
    
    /// Validate that provided node exists
    function validateNode(address node) view internal returns (bool) { return EtherTrackNS(_etherTrackNS).exists(node); }
}