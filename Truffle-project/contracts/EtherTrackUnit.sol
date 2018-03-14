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

// Interface
contract EtherTrackNS is owned {
    /// updateRegisters
    /// Upadtes registry with the provided node/name pair and a the secret for futur hashing
    function updateRegisters(address node, uint64 GS1_GLN) internal returns(bool registered);

    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function getNameByNodeAddress(address node) external view returns(uint64 _name);

   /// getNodeAddressByName
   /// Returns node address corresponding to provided name
   function getNodeAddressByName(uint64 GS1_GLN) external view returns(address _node);
    
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

/// Example for constructor : "7804652870003", "12345678901234567890", "118292", "SN0123456789456123457", "123YYñ17", "0xdc04977a2078c8ffdf086d618d1f961b6c546222"
contract EtherTrackUnit is owned, mortal {
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
        bytes32 GS1_hashedData;
    }
    
    UnitInfo _info; /// Store unit information
    address _location; /// Store unit location
    address _etherTrackNS; /// Store naming service contract reference
    
    /// Fired on tracebility unit creation
    event notifyCreation(address owner, string gtin, string sn);
    event notifyOwnershipTransfer(address to, string gtin, string sn);
    event notifyEventOccured(string eventDesc, string gtin, string sn);
    event notifyLocationChanged(address newLocation, string gtin, string sn);
    
    /// Create a new traceability unit and validate its owner throught EtherTrackNS
    function EtherTrackUnit (string gtin, string sscc, string gsin, string sn, address etherTrackNS) public {
        _etherTrackNS = etherTrackNS;

        //Validate that owner is registred on the naming service and that GS1 AI are well formed
        require(validateGS1Constraints(gtin, sn) == true);
        require(etherTrackNS != address(0));
        require(validateNode(owner) == true);
        //require((bytes(secret).length <= 32 ) == true);

        _info.GS1_GTIN = gtin;
        _info.GS1_GSIN = gsin;
        _info.GS1_SSC = sscc;
        _info.GS1_SN = sn;
        //Set location to owner
        _location = owner;
        
        
        notifyCreation(owner, gtin, _info.GS1_SN);
    }
    
    /// Publicly exposed constraints
    function validateGS1Constraints(string gtin, string sn) internal pure returns (bool) {
        return (bytes(gtin).length <= 14 && bytes(sn).length <= 20); 
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
    
        /// Change unit location to specified node
    function addEvent(string eventDesc) external payable onlyOwner {
        require(validateNode(owner) == true);
        notifyEventOccured(_info.GS1_GTIN, _info.GS1_SN, eventDesc);
    }
    
    function changeEtherTrackNS(address newEtherTrackNS) external payable onlyOwner {
        // Send exists on new ethertrackNS
        require(EtherTrackNS(newEtherTrackNS).exists(owner) == true);
        _etherTrackNS = newEtherTrackNS;
    }
    
    /// Validate that provided node exists
    function validateNode(address node) view internal returns (bool) { return EtherTrackNS(_etherTrackNS).exists(node); }
}
