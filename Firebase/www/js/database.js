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
var test;

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
								let myWarehouse = new Warehouse(warehouse.address, null, null, provider, true);
								bindedContract.push(myWarehouse);
								//Received units
								for (var key in warehouse.received) {
									if (warehouse.received.hasOwnProperty(key)) {
										myWarehouse.bindIncommingUnit(warehouse.received[key].unitHash, warehouse.received[key].unitClear, warehouse.received[key].from, warehouse.received[key].tx, key);
									}
								}
								//Sent units
								for (var key in warehouse.sent) {
									if (warehouse.sent.hasOwnProperty(key)) {
										myWarehouse.bindIncommingUnit(warehouse.sent[key].unitHash, warehouse.sent[key].unitClear, warehouse.sent[key].from, warehouse.sent[key].tx, key);
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
							}
                        });
                    }
                });

            }
        });
}
