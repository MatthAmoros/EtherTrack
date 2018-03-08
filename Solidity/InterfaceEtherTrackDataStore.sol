contract EtherTrackDataStore is owned, mortal {
    	function getNamebyNode (address node) external view returns (uint64);    
    	function getNodebyName (uint64 name) external view returns (address);    
    	function setNamebyNode (address node, uint64 name) external onlyOwner returns (uint64);

	function delegateOwnership(address newOwner) public;
}