var express = require('express');
var session = require('express-session');
var app = express();
var accountBySessionId = {}; //[SESSION_ID] = ACCOUNT_ADDRESS


app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(session({secret:'0x9fbda871d559710256a2502a2517b794b482db40'})); // to support Session variables
app.use(express.static('www')); // set PWD

var ssn; // Session variable

// Responds to root GET calls
app.get('/', function (req, res) {
	ssn = req.session;
	res.sendFile( __dirname + "/www/" + "EtherTrackGUI.html" );
	console.log("[GET] Home");
	if(accountBySessionId[req.session.id] === undefined)
		console.log("User not logged");
	else
		console.log("User : " + accountBySessionId[req.session.id]);
})

// Responds to root POST calls
app.post('/accountConnected', function (req, res) {
	ssn = req.session;
	ssn.account = req.body.address;
	accountBySessionId[req.session.id] = ssn.account;
	console.log("[POST] Account : " + req.body.address + " connected.");
})

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("App listening at http://%s:%s", host, port)
})
