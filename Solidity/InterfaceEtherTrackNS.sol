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