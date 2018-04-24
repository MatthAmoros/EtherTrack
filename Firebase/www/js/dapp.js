var currentAccount = "";
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

        if (typeof account == 'undefined') {
            toast("Please unlock account");
            $("#main").load("./views/locked.html")
            $("#navbarNavAltMarkup").find("#cntAsAccount").text("User : Locked");
            isAccountLocked = true;
            
            return;
        }
        else
        {
			//Account not undefined
			updateDisplayAppReady();
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
    if (!provider.isConnected()) {
        toast("Not connected")
        
        //Metamask needed 
        displayMetaMaskBanner();
        return;
    }
    
	//First load
	accountUpdate(provider.eth.accounts[0]);

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
