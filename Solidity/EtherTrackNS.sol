pragma solidity ^0.4.20;

/// Owned contract as defined in Solidity documentation
contract owned {
    function owned() public { owner = msg.sender; }
    address owner;
    
        modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}

/// Data store interface
contract EtherTrackDataStore {
    	function getNamebyNode (address node) external view returns (uint64);    
    	function getNodebyName (uint64 name) external view returns (address);    
    	function setNamebyNode (address node, uint64 name) external returns (uint64);

	function delegateOwnership(address newOwner) public;
}

contract EtherTrackNS is owned {
    /// Fired on entries update
    event  updateEntries (address owner, uint64 GS1_GLN);

    /// EtherTrackNS parent to forward queries
    address _parent;
    address _dataStore;

    ///Fallback function
    function() public payable {}

    /// Constructor
    function EtherTrackNS(address parent, address dataStore) public {
	require(dataStore != address(0));
        _parent = parent;
        _dataStore = dataStore;
    }
    
    /// updateRegisters
    /// Upadtes registry with the provided node/name pair and a the secret for futur hashing
    function updateRegisters(address node, uint64 GS1_GLN) internal returns(bool registered)
    {
        if (!this.exists(node))
        {
            /// Name not already used
            if (EtherTrackDataStore(_dataStore).getNodebyName(GS1_GLN) == address(0))
            {
	        	//Update data store
	        	EtherTrackDataStore(_dataStore).setNamebyNode(node, GS1_GLN);

                if(_parent != address(0))
                    EtherTrackNS(_parent).registerName(node, GS1_GLN); //Notify parent
                else
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
        _name = EtherTrackDataStore(_dataStore).getNamebyNode(node);
        
        if(_parent != address(0) && _name == address(0))
            _name = EtherTrackNS(_parent).getNameByNodeAddress(node);
        
        return _name;
    }
    
    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function exists(address node) external view returns(bool exists)
    {
        bool isRegistered = (EtherTrackDataStore(_dataStore).getNamebyNode(node) != 0);
        if(!isRegistered && _parent != address(0))
        {
            isRegistered = EtherTrackNS(_parent).exists(node);
        }
        
        return isRegistered;
    }
    
    /// registerName
    /// Registers name and asociate it to caller address
    function registerName(address node, uint64 GS1_GLN) external payable returns(bool registered)
    {
        if(node == address(0))
            return updateRegisters(msg.sender, GS1_GLN);
        else
            return updateRegisters(node, GS1_GLN);
    }

    /// delegate
    /// Delegate name to specified address
    function delegate (address to) external payable {
        uint64 callerName = EtherTrackDataStore(_dataStore).getNamebyNode(msg.sender);
        if((callerName != 0) && (EtherTrackDataStore(_dataStore).getNamebyNode(to) == 0))
        {
            ///Update entries
            EtherTrackDataStore(_dataStore).setNamebyNode(msg.sender, 0);
            EtherTrackDataStore(_dataStore).setNamebyNode(to, callerName);
        }
    }
    
    function kill() internal onlyOwner {
        //Preserver data
        EtherTrackDataStore(_dataStore).delegateOwnership(owner);
        selfdestruct(owner);
    }
}