describe('main', function() {
	
	it('Should detect provider', function() {
		web3 = Web3(new Web3.providers.HttpProvider("http://localhost:9545"));
		expect(provider).not.toBe(undefined);
	});
});
