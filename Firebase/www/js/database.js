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
/*
function saveKnownNodes(nodeName, nodeAddress)
  firebase.database().ref('knownNodes/' + nodeAddress).set({
	name: nodeName
  });
}
*/
// Retrieve user preferences (WH / NS previously saved)
function getUserPreference(userAccount) {
    firebase.database().ref('users').child(userAccount)
        .on('value', function (snapshot) {
            var user = snapshot;
            if (user != null) {
                preferences = user;
                user.forEach(function (element) {
                    if (element.key == "warehouse") {
                        element.forEach(function (wh) {
                            wh = wh.val();
                            if (bindedContract.indexOf(wh) == -1) {
                                let myWarehouse = new Warehouse(wh.address, null, null, provider, true);
                                bindedContract.push(myWarehouse);
                            }
                        });
                    }
                    else if (element.key == "nameservice") {
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