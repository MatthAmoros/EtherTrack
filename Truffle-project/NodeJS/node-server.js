var express = require('express');
var session = require('express-session');
var fs = require("fs");
var app = express();
var accountBySessionId = {}; //[SESSION_ID] = ACCOUNT_ADDRESS

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(session({secret:'0x9fbda871d559710256a2502a2517b794b482db40'})); // to support Session variables
app.use(express.static(__dirname + '/www')); // set PWD

var ssn; // Session variable

// Load database
var usersDatabase = require( __dirname + "/www/" + "db/database.json");

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
	//Add to database
	if(usersDatabase != undefined && usersDatabase.users.find(x => x.account === req.body.address) === undefined)
	{
		console.log("[POST] Account : " + req.body.address + " saved in database.");
		usersDatabase.users.push({account: req.body.address, warehouse:[], ns:[]});
		fs.writeFile(  __dirname + "/www/" + "db/database.json", JSON.stringify( usersDatabase ), "utf8");
	}

	res.send(usersDatabase.users.find(x => x.account === req.body.address));
})

app.post('/createWarehouse', function (req, res) {
	ssn = req.session;
	ssn.account = req.body.address;
	accountBySessionId[req.session.id] = ssn.account;
	console.log("[POST] Account : " + req.body.address + " Warehouse " + req.body.whName + " : " + req.body.whAddress);
	//Add to database
	if(usersDatabase.users.find(x => x.account === req.body.address) != undefined)
	{
		let userData = usersDatabase.users.find(x => x.account === req.body.address);
		userData.warehouse.push({name : req.body.whName, address : req.body.whAddress});
		fs.writeFile(  __dirname + "/www/" + "db/database.json", JSON.stringify( usersDatabase ), "utf8");
	}

	res.send(usersDatabase.users.find(x => x.account === req.body.address));
})

app.post('/createNameService', function (req, res) {
	ssn = req.session;
	ssn.account = req.body.address;
	accountBySessionId[req.session.id] = ssn.account;
	console.log("[POST] Account : " + ssn.account + " Name service " + req.body.nsAddress);
	//Add to database
	if(usersDatabase.users.find(x => x.account === req.body.address) != undefined)
	{
		let userData = usersDatabase.users.find(x => x.account === req.body.address);
		userData.ns.push({address : req.body.nsAddress});
		fs.writeFile(  __dirname + "/www/" + "db/database.json", JSON.stringify( usersDatabase ), "utf8");
	}

	res.send(usersDatabase.users.find(x => x.account === req.body.address));
})

var server = app.listen(8081, function () {

   let host = server.address().address
   let port = server.address().port

   console.log("App listening at http://%s:%s", host, port)
})

function userAlreadyExists(account)
{

}
