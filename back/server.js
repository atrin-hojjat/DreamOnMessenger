const express = require('express')
const https = require('http')
const session = require('express-session');
const WS = require('ws') ;
const uuid = require('uuid');
const bodyparser = require("body-parser");
const cors = require("cors");

const app = express();
const socketserver = new WS.Server({noServer:true, clientTracing: false});
var sockets = new Map(); // Session Id to socket
var sessions = new Map(); // username to session Id
var usersmap = new Map(); // session Id to user
const querystring = require("querystring");
const message_handler = require ('./message_handler');
const users = require ('./users');

var sessionParser = session({
	saveUninitialized: false,
	secret: process.env.SECRET,
	resave: false
});

function parse(data) {
	if(data == null || data == undefined || data == "" || data === "") return {};
	try { 
		return JSON.parse(data);
	} catch (e) {
		return {};
	}
}

function write(sock, message) {
  sock.send(JSON.stringify(message));
}

var send = (sender , message ) => {
	try {
		for(sid of sessions.get(sender)) {
			const sock = sockets.get(sid);
			if(sock) write(sock, message);
		}
	} catch (err) {
		console.log(err.stack);
	}
};

var Login = (req, res) => {
	let usr = req.body["login-username"];
	let psd = req.body["login-password"];
	console.log(usr);
	console.log(psd);
	return users.loginfunc(usr, psd).then(login_result => {
		if(login_result.ok == true) {

			const id = uuid.v4();

			req.session.sessionId = id;
			usersmap.set(id, usr);
			return res.status(200).send({ok: true, message: "Login Successful"});
		} else return res.status(200).send({ok: false, message: "Wrong Username or Password"});
	}).catch(e => {
		console.log(e.stack);
		return res.status(500).send({ok: false, message: "Internal Server Error"})
	});
}

var Logout = (req, res) => {
	let s = sockets.get(req.session.sessionId);
	let usr = usersmap.get(req.session.sessionId);
	
	request.session.destroy(() => {
		if(s) s.close();
		
		sockets.delete(req.session.sessionId);
		let t = sessions.get(usr);
		if(t) {
			let ind = t.indexOf(req.session.sessinoId);
			if(ind >= 0) t.splice(ind, 1);
		}
		usermap.delete(req.session.sessionId);

		res.status(200).send({ok: true, message: "Logout Successful"});
	});
}

var Signup = (req, res) => {
	if(req.body.username && req.body.password)
		return users.signup(req.body.username, req.body.password).then(r => {
			return res.status(200).send(r);
		}).catch(e => {
			console.log(e.stack);
			return res.status(500).send({ok: false, messsage: "Internal Server Error"});
		});
	else return res.status(200).send({ok: false, message: "Please fill out all the necessary forms"});
}

var start = () => {
/*
	var whitelist = ['http://localhost:3000', 'http://localhost:8005']
	var corsOptions = {
		origin: function (origin, callback) {
			if (whitelist.indexOf(origin) !== -1) {
				callback(null, true)
			} else {
				callback(null, true)
				//callback(new Error('Not allowed by CORS'))
			}
		}
	}
	app.use(cors(corsOptions));
*/
	app.use(sessionParser);
	app.use(bodyparser.urlencoded({extended: true}));
		
	app.use("/assets", express.static("../assets"));
	app.use("/", express.static("../front"));
	app.post('/session/login', Login);
	app.delete('/session/logout', Logout);
	app.put('/session/signup', Signup);

	const server = https.createServer(app);

	server.on('upgrade', function(req, sock, head) {
		console.log("Upgrading session");

		sessionParser(req, {}, () => {
			if(!req.session.sessionId) {
				sock.destroy();
				return ;
			}
			console.log("Sessions parsed.");
			socketserver.handleUpgrade(req, sock, head, (s) => {
				socketserver.emit('connection', s, req);
			});
		});
	});

	server.listen({host: "0.0.0.0", port: 8080}, () => {
		console.log("Listening on port 8080...");
	});
}

socketserver.on('error' , (err) =>{
  console.log( err );
});
socketserver.on('connection' , (sock, req) => {
	let sessionId = req.session.sessionId;
	if(!sockets.get(sessionId)) {
		sockets.set(sessionId, [sock])
	} else sockets.get(sessionId);
	let user = usersmap.get(sessionId);

	write(sock, {ok: true, message: "Connection Established"});
	sock.on('message' , (data) =>{

		let jdata = parse(data);
		if( jdata.command == 'add_chat' ){
			if( jdata.chat_name !== null && jdata.chat_name !== undefined){
				message_handler.add_chat(user , jdata , send) ;
			}
		}
		else if (jdata.command == 'new_message'){
			if( jdata.chat_id !== null && jdata.chat_id !== undefined){
				message_handler.get_usernames(user, jdata)
				.then(res => {
					for(let receiver of res){
						send(receiver.username, jdata) ;
					}
				}). catch(err => {
					console.log(err);
				});
			}
		}
		else if( jdata.command == 'add_user_to_chat' ){
			if( jdata.person !== null && jdata.chat_id !== null && jdata.person !== undefined && jdata.chat_id !== undefined){
				 message_handler.add_user ( user , jdata , send) ;
			}
		}
		else if( jdata.command == "get_chats") {
			message_handler.get_chats(user).then(chats => { 
				write(sock, {chats: chats, command: "get_chats"})});
		}
	});

  sock.on( 'error', (err ) =>{
    console.log(err);
//		map.delete(sessionId);
  });

	sock.on('close', () => {
		sockets.delete(sessionId);
	});
  console.log('Client connected') ;
});

module.exports= {send: send, start: start};
