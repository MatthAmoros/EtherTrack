var express = require('express');
var session = require('express-session');
var fs = require("fs");
var app = express();

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(session({secret:'0x9fbda871d559710256a2502a2517b794b482db40'})); // to support Session variables
app.use(express.static(__dirname + '/www')); // set PWD

var ssn; // Session variable


// Responds to root GET calls
app.get('/', function (req, res) {
	ssn = req.session;
	res.sendFile( __dirname + "/www/" + "EtherTrackGUI.html" );
	console.log("[GET] Home");
})

var server = app.listen(8081, function () {

   let host = server.address().address
   let port = server.address().port

   console.log("App listening at http://%s:%s", host, port)
})

function userAlreadyExists(account)
{

}
