var currentAccount = "";
var bindedContract = [];
var knownHash = [];
var preferences;


//====== FIREBASE =======
// Initialize Firebase
var config = {
	apiKey: "AIzaSyCyvAV4yW1hWAcBwLn405okUxkXnWFarEM",
	authDomain: "ethertrack.firebaseapp.com",
	databaseURL: "https://ethertrack.firebaseio.com",
	projectId: "ethertrack",
	storageBucket: "",
	messagingSenderId: "789424521077"
};
firebase.initializeApp(config);

function getOrCreateUser(userAccount)
{

}

function saveWarehouse(userAccount, whAddress, whName)
{
  firebase.database().ref('users/' + userAccount + '/warehouse').push({
	address: whAddress
  });
}

function saveNameService(userAccount, nsAddress)
{
  firebase.database().ref('users/' + userAccount + '/nameservice').push({
	address: nsAddress
  });
}
/*
function saveKnownNodes(nodeName, nodeAddress)
  firebase.database().ref('knownNodes/' + nodeAddress).set({
	name: nodeName
  });
}
*/
function getUserPreference(userAccount)
{
 firebase.database().ref('users').child(userAccount)
  .on('value', function(snapshot) { 
      var user = snapshot;
	if(user != null)
	{
		preferences = user;
		user.forEach(function(element){
		if(element.key=="warehouse")
		{
		        element.forEach(function (wh) {
			wh = wh.val();
			if (bindedContract.indexOf(wh) == -1) {
				let myWarehouse = new Warehouse(wh.address, null, null, provider, true); 
				bindedContract.push(myWarehouse);
			}
			});
		}
		else if(element.key=="nameservice")
		{
			element.forEach(function (ns) { 
				ns = ns.val();
				let myNameService = new NameService(ns.address, provider, null, true); 
				bindedContract.push(myNameService);
			});
		}
	});

	}      
  });
}

//====== FIREBASE =======

function accountUpdate(account)
{
	if(currentAccount != account)
	{
		currentAccount = account;


		if(typeof account == 'undefined')
		{
			toast("Please unlock account");
			$("#main").load("./views/locked.html")
			$("#navbarNavAltMarkup").find("#cntAsAccount").text("User : Locked");
			return;
		}
		else
			$("#main").load("./views/main.html")

		provider.eth.defaultAccount = account;
		$("#navbarNavAltMarkup").find("#cntAsAccount").text("User : " + account.substring(0, 10) + "[...]");
		reloadPreference();
	}
}

function startDapp(provider) {
	if (!provider.isConnected()) {
		toast("Not connected")
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

        provider.sendAsync = Web3.providers.HttpProvider.prototype.send;
}

function reloadPreference()
{
	toast("Reloading preferences...");
	getUserPreference(currentAccount);
}


function toast(message) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerHTML = message;
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

function generateHash() {
	let codeToHash = $("#strToHash").val();
	let hashed = keccak256(codeToHash);
	knownHash.push({hash: hashed, plain:codeToHash});
	console.log(knownHash);
}
