pragma solidity ^0.4.19;

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

contract EtherTrackNS is owned {
    /// Fired on entries update
    event updateEntries (address owner, uint64 GS1_GLN);

    /// EtherTrackNS parent to forward queries
    address _parent;
    address _dataStore;

    ///Fallback function
    function() public payable {}

    /// Constructor
    function EtherTrackNS(address parent, address dataStore) public {
        _parent = parent;
        _dataStore = dataStore;
    }

    function createDataStore() public returns (address) {
		require(_dataStore == address(0));
        _dataStore = new EtherTrackDataStore();
		return _dataStore;
    }

    // Datastore
    function getDataStoreAddress() public view returns(address) { return  _dataStore;}
    function setDataStoreAddress(address dataStore) public onlyOwner {  _dataStore = dataStore;}

    // NS Parent
    function getParentAddress() public view returns(address) { return  _parent;}
    function setParentAddress(address parent) public onlyOwner {  _parent = parent;}

    /// updateRegisters
    /// Upadtes registry with the provided node/name pair and a the secret for futur hashing
    function updateRegisters(address node, uint64 GS1_GLN) internal
    {
		require(_dataStore != address(0));
        require(!this.exists(node));
		require((EtherTrackDataStore(_dataStore).getNodebyName(GS1_GLN) == address(0)));

		//Update data store
		EtherTrackDataStore(_dataStore).setNamebyNode(node, GS1_GLN);

		if(_parent != address(0))
			EtherTrackNS(_parent).registerName(node, GS1_GLN); //Notify parent

		updateEntries(node, GS1_GLN);        
    }

    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function getNameByNodeAddress(address node) external view returns(uint64 _name)
    {
		require(_dataStore != address(0));
        _name = EtherTrackDataStore(_dataStore).getNamebyNode(node);
        
        if(_parent != address(0) && _name == 0)
            _name = EtherTrackNS(_parent).getNameByNodeAddress(node);
        
        return _name;
    }

    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function getNodeAddressByName(uint64 GS1_GLN) external view returns(address _node)
    {
        _node = EtherTrackDataStore(_dataStore).getNodebyName(GS1_GLN);
        
        if(_parent != address(0) && _node == address(0))
            _node = EtherTrackNS(_parent).getNodeAddressByName(GS1_GLN);
        
        return _node;
    }
    
    /// getNameByNodeAddress
    /// Returns name corresponding to provided node address
    function exists(address node) external view returns(bool exists)
    {
		require(_dataStore != address(0));

        bool isRegistered = (EtherTrackDataStore(_dataStore).getNamebyNode(node) != 0);

        if(!isRegistered && _parent != address(0))
        {
            isRegistered = EtherTrackNS(_parent).exists(node);
        }
        
        return isRegistered;
    }
    
    /// registerName
    /// Registers name and asociate it to caller address
    function registerName(address node, uint64 GS1_GLN) external payable
    {
            updateRegisters(node, GS1_GLN);
    }
    
    function kill() internal onlyOwner {
        //Preserver data
        EtherTrackDataStore(_dataStore).delegateOwnership(owner);
        selfdestruct(owner);
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
    
    function EtherTrackDataStore() public { 

    }
    
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
