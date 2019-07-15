var currentAccount = "";
var isOffChain = localStorage['isOffChain'];
var bindedContract = [];
var contractListners = [];
var knownHash = [];
var preferences;
var isAccountLocked;

var selectedWarehouseAddress;
var selectedWarehouseName;

// Check if account changed
function accountUpdate(account) {
	if (currentAccount != account) {
		currentAccount = account;

		if(isOffChain)
		{
			toast("Running off-chain.");

			$("#navbarNavAltMarkup").find("#cntAsAccount").text("User : " + account + "[Off Chain]");
			$("#navbar").append("<a class='nav-item nav-link' href='#' onclick='localStorage[\'isOffChain\'] = false; currentAccount = currentAccount + \'1\'; location.reload();'>Go On-chain</a>")
			isAccountLocked = false;

			signIn().then(function() {
				reloadPreference();
			});

			return;
		}
		else if (typeof account == 'undefined')
		{
			toast("Please unlock account");
			$("#main").load("./views/locked.html");
			$("#navbarNavAltMarkup").find("#cntAsAccount").text("User : Locked");
			isAccountLocked = true;

			return;
		}
		else
		{
			provider.eth.defaultAccount = account;
			$("#navbarNavAltMarkup").find("#cntAsAccount").text("User : " + account.substring(0, 10) + "[...]");

			isAccountLocked = false;

			signIn().then(function() {
				reloadPreference();
			});
		}
	}
}

// Start DApp
function startDapp(provider) {
	if(provider != null) {
		if (!provider.isConnected()) {
			toast("Not connected");

			//Metamask needed
			displayMetaMaskBanner();
			return;
		}
		else {
			//Needed since new versions
			ethereum.enable();
		}

		provider.sendAsync = Web3.providers.HttpProvider.prototype.send;
		//Account refresh
		setInterval(() => {
			if(!isOffChain) {
				console.log("Refresh account ...");
				const accounts = provider.eth.accounts;
				if(accounts != undefined) {
					accountUpdate(accounts[0]);
				}
				else {
					accountUpdate(undefined);
				}
			}
			else {
				console.log("Off chain account");
			}
		},
		3000);
	}

	accountUpdate("");
}

function startPresentation() {
	if(typeof bindedContract == 'undefined' || bindedContract.length == 0) {
		//First connection, display help
		$("#helpModal").modal('toggle');
		$('#helpModal #modHelpOk').click(function() {
			addPublicNameServiceForNetwork(web3.version.network);
		});
	}
}

function askRegisterWH(address, name, ns) {
	$('#registerNameModal #modWhAddress').val(address);
	$('#registerNameModal #modWhName').val(name);

	$('#registerNameModal #modRegisterOk').click(function() {
		let contract = bindedContract.find(x => x.address == ns);
		console.log(contract);
		contract.registerGLNWithAddress(name, address);
	});

	$('#registerNameModal').modal('toggle');
}

// Reload user preferences
function reloadPreference() {
	toast("Reloading preferences for " + currentAccount + "...");
	getUserPreference(currentAccount);

	startPresentation();
}

// Display message (toast style)
function toast(message) {
	var x = document.getElementById("snackbar");
	x.className = "show";
	x.innerHTML = message;
	setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

// Generate keccak256 hash of passed string
function generateHash() {
	let codeToHash = $("#strToHash").val();
	let hashed = keccak_256(codeToHash);
	knownHash.push({ hash: '0x'+hashed, plain: codeToHash });
	console.log(knownHash);
}
