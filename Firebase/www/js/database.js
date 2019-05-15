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

function signIn() {
	return new Promise(function (resolve, reject) {
			updateDisplayAppReady();
			console.log("Calling cloud based function ...");
			$.ajax({
			  type: 'POST',
			  url: 'https://ethertrack.firebaseapp.com/createUser',
			  data: {ethAddress: currentAccount},
			  success: function(data) {
			   console.log("Signed in.");
			   //Use ethereum address as uid
			   firebase.auth().signInWithCustomToken(data.token).catch(function(error) {
				  //Call promise
				  reject(error);
				});
				resolve();
			  },
			  error: function() {
			   console.log("Error while sign-in!");
			   reject("Error while sign-in!");
			  }
			});
		});
}

function signInOffChain(email, password) {
	return new Promise(function (resolve, reject) {
			updateDisplayAppReady();
			console.log("Calling off chain auth ...");
			firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
					var errorCode = error.code;
					var errorMessage = error.message;
					console.log(errorCode + ' - ' + errorMessage);
			});
		});
}


function signOut() {
	firebase.auth().signOut();
	console.log("Signed out.");
}

// Save warehouse info to database
function saveWarehouse(userAccount, whAddress, whName) {
    firebase.database().ref('users/' + userAccount + '/warehouse').push({
        address: whAddress
    });
}
// Save nameservice info to database
function saveNameService(userAccount, nsAddress) {
    firebase.database().ref('users/' + userAccount + '/nameservice').push({
        address: nsAddress
    });
}

function addPublicNameServiceForNetwork(networkId) {
	if(typeof networkId == 'undefined') { return; }
	    firebase.database().ref('appParameters/nameServices/network/').child(networkId.toString())
        .once('value', function (snapshot) {
			var nameService = snapshot;
			if(nameService != null) {
				nameService.forEach(function(child) {
					let address = child.val();
					//Adding to user context
					let myNameService = new NameService(address, provider, null, true);
					bindedContract.push(myNameService);
					//Persist changes
					saveNameService(currentAccount, address);
				});
			}
		});
}

// Retrieve user preferences (WH / NS previously saved)
function getUserPreference(userAccount) {
    firebase.database().ref('users').child(userAccount)
        .once('value', function (snapshot) { //Only executed once
            var user = snapshot;
            if (user != null) {
                preferences = user;
				bindedContract = [];
                user.forEach(function (element) {
                    if (element.key == "warehouse") { //Loading Warehouses
                        element.forEach(function (wh) {
                            warehouse = wh.val();

                            if(warehouse.address != undefined) { //It has addres, its a warehouse
								let myWarehouse = new Warehouse('', warehouse.address, null, null, provider, true);
								bindedContract.push(myWarehouse);
								//Received units
								for (var keyRecv in warehouse.received) {
									if (warehouse.received.hasOwnProperty(keyRecv)) {
										myWarehouse.bindIncommingUnit(warehouse.received[keyRecv].unitHash, warehouse.received[keyRecv].unitClear, warehouse.received[keyRecv].from, warehouse.received[keyRecv].tx, keyRecv);
									}
								}
								//Sent units
								for (var keySent in warehouse.sent) {
									if (warehouse.sent.hasOwnProperty(keySent)) {
										myWarehouse.bindIncommingUnit(warehouse.sent[keySent].unitHash, warehouse.sent[keySent].unitClear, warehouse.sent[keySent].from, warehouse.sent[keySent].tx, keySent);
									}
								}
							}
                        });
                    }
                    else if (element.key == "nameservice") {
                        element.forEach(function (ns) {
                            ns = ns.val();

                            if(ns.address != undefined) {
								let myNameService = new NameService(ns.address, provider, null, true);
								bindedContract.push(myNameService);
								//Known nodes
								for (var key in ns.knownNodes) {
									if (ns.knownNodes.hasOwnProperty(key)) {
										//ns.bindIncommingUnit(warehouse.received[key].unitHash, warehouse.received[key].unitClear, warehouse.received[key].from, warehouse.received[key].tx, key);
									}
								}
							}
                        });
                    }
                });
            }

        }).then(function () {
			//First connection
			console.log("Presentation ... ");
			startPresentation();
			});
}
