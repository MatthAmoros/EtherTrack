var currentAccount = "";
var bindedContract = [];
var knownHash = [];

function accountUpdate(account)
{
	if(currentAccount != account)
	{
		currentAccount = account;
		provider.eth.defaultAccount = account;
		$("#navbarNavAltMarkup").find("#cntAsAccount").text("User : " + account.substring(0, 10) + "[...]");
		reloadPreference();
	}
}

function startDapp(provider) {
	if (!provider.isConnected()) {
		console.log("Not connected")
		//Metamask needed 
		$('#main').replaceWith('<div><a href="https://metamask.io/"><img src="./img/metamask-required.png" /></a></div>');

		return;
	}

	//Account refresh
	setInterval(() => {
	web3.eth.getAccounts((err, accounts) => {
		console.log("Refresh account ...");
		if (err) return
		accountUpdate(accounts[0]);
	})
	}, 3000);
	accountUpdate(provider.eth.accounts[0]);

        provider.sendAsync = Web3.providers.HttpProvider.prototype.send;
	provider.eth.defaultAccount = provider.eth.accounts[0];

    //Get user preferences
    if (!sessionStorage.accountInformationSent) {

	reloadPreference();
        sessionStorage.accountInformationSent = 1;
    }
}

function reloadPreference()
{
	console.log("Reloading preferences...");
        $.ajax({
            url: '/accountConnected',
            type: "POST",
            data: JSON.stringify({ address: provider.eth.coinbase }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (result) {
		bindedContract = [];
		$('#WHList').empty();
		$('#NSList').empty();

                console.log("Loading user preferences ...");
                result.warehouse.forEach(function (wh) { let myWarehouse = new Warehouse(wh.address, null, null, provider); bindedContract.push(myWarehouse);});
                result.ns.forEach(function (ns) { let myNameService = new NameService(ns.address, provider, null); bindedContract.push(myNameService);});
            }
        })
}

function generateHash() {
	let codeToHash = $("#strToHash").val();
	let hashed = keccak256(codeToHash);
	knownHash.push({hash: hashed, plain:codeToHash});
	console.log(knownHash);
	$('#eventsTable > tbody').innerHTML = $('#main').innerHTML.replace(hashed, codeToHash);

}
