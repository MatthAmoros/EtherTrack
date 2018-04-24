const functions = require('firebase-functions');

// Firebase Setup
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ethertrack.firebaseio.com"
});

// Verify token
// POST to /createUser
exports.createUser = functions.https.onRequest((req, res) => {	
	var status;
	if (req.method === 'POST') {
		if (req.body.ethAddress !== undefined) {    
			admin.auth().createCustomToken(req.body.ethAddress, {ethAdd: req.body.ethAddress})
			.then(function(customToken) {
				/*
				  firebase.database().ref('users/' + req.body.ethAddress).set({
											firstConnection: true
					});
				  */
				// Send token back to client
				return res.status(200).send({token : customToken, ethAddres: req.body.ethAddress});
			})
			.catch(function(error) {
				return res.status(400).send(error);
			}); 
		  }
		  else
		  {
			return res.status(400).send({error : "Undefined ETH Address", success: false});
		  }
	}
});
