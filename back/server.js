const express = require('express')
const https = require('http')
const session = require('express-session');
const WS = require('ws') ;
const uuid = require('uuid');
const bodyparser = require("body-parser");
const cors = require("cors");
var multer = require("multer");

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

var validateUsername = (username) => {
	return /^[A-Za-z0-9]+$/g.test(username);
};
var validatePassword = function(pass) {
  let least8 = pass.length >= 8, cap = false, sml = false
    , num = false, neith = false;
  for(let i = 0; i < pass.length; i++) {
    let ch = pass.charAt(i);
    if(ch >= 'a' && ch <= 'z') sml = true;
    else if(ch >= 'A' && ch <= 'Z') cap = true;
    else if(ch >= '0' && ch <= '9') num = true;
    else neith = true;
  }
  return least8 && cap && sml && num && neith;
}

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
		if(sessions.get(sender))
			for(sid of sessions.get(sender)) {
				const sock = sockets.get(sid);
				if(sock) write(sock, message);
			}
	} catch (err) {
		console.log(err.stack);
	}
};

var checkLogin = (req, res) => {
	if(req.session.sessionId) {
		return res.status(200).send({loged: true, username: req.session.username})
	} else return res.status(200).send({loged: false});
}

var Login = (req, res) => {
	let usr = req.body["login-username"];
	let psd = req.body["login-password"];
	if(!validateUsername(usr)) {
		return res.status(200).send({ok: false, message: "Username can only consist of letters and numbers"})
	}

	return users.loginfunc(usr, psd).then(login_result => {
		if(login_result.ok == true) {

			const id = uuid.v4();

			req.session.sessionId = id;
			req.session.username = usr;
			usersmap.set(id, usr);
			if(sessions.get(usr)) sessions.get(usr).push(id)
			else sessions.set(usr, [id])
			console.log(`${usr} Loged in`);
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

	if(s) s.close();
	
	sockets.delete(req.session.sessionId);
	let t = sessions.get(usr);
	if(t) {
		let ind = t.indexOf(req.session.sessinoId);
		if(ind >= 0) t.splice(ind, 1);
	}
	usersmap.delete(req.session.sessionId);

	
	req.session.destroy(() => {
		res.status(200).send({ok: true, message: "Logout Successful"});
	});
}

var Signup = (req, res) => {
	let usr = req.body["signup-username"];
	let psd = req.body["signup-password"];
	if(!validateUsername(usr)) {
		return res.status(200).send({ok: false, message: "Username can only consist of letters and numbers"})
	}
	if(!validatePassword(psd)) {
		return res.status(200).send({ok: false, message: 
			"Password should consist of at least on digit, one uppercase letter, one lowercase letter, and one sign, and be at least 8 digits"})
	}
	if(usr && psd)
		return users.signup(usr, psd).then(r => {
			console.log(`${usr} Signed up`);
			return res.status(200).send(r);
		}).catch(e => {
			console.log(e.stack);
			return res.status(500).send({ok: false, messsage: "Internal Server Error"});
		});
	else return res.status(200).send({ok: false, message: "Please fill out all the necessary forms"});
}

// Image handling

var profile_image_storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './uploads/images/users');
	},
	filename: (req, file, cb) => {
		sessionParser(req, {}, () => {
			if(!req.session.sessionId) {
				return cb('Please Login');
			}
			cb(null, req.session.username);
		})
	}
})
var chat_image_storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./uploads/images/chats");
	},
	filename: (req, file, cb) => {
		sessionParser(req, {}, () => {
			if(!req.session.sessionId) {
				return cb("Please login");
			}
			if(message_handler.allowed(req.session.username, req.params.chat_id) == false) {
				return cb("You are not allowed to alter this chat")
			}
			cb(null, req.params.chat_id);
		})
	}
})
var profile_image_hndl = multer({storage: profile_image_storage});
var chat_image_hndl = multer({storage: chat_image_storage});



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
	app.get("/session/check", checkLogin);

	app.post("/users/profile/image", upload_image);
	app.get("/users/profile/image/:username", get_image);
	app.post("/chats/:chat_id/image", upload_chat_image);
	app.get("/chats/:chat_id/image", get_chat_image);

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
	sockets.set(sessionId, sock);
	let user = usersmap.get(sessionId);

	write(sock, {ok: true, message: "Connection Established"});
	sock.on('message' , (data) =>{

		let jdata = parse(data);
		if( jdata.command == 'add_chat' ){
			if( jdata.chat_name !== "" && jdata.chat_name !== null && jdata.chat_name !== undefined ){
				if(/^[A-Za-z0-9\ ]+$/g.test(jdata.chat_name))
					message_handler.add_chat(user , jdata , send) ;
				else send(user, {ok: false, message: "chat name can only consist of lower case, upper case, numbers and spaces", command: "error"})
			}
		}
		else if (jdata.command == 'new_message'){
			if( jdata.chat_id !== "" && jdata.chat_id !== null && jdata.chat_id !== undefined && /^[0-9]+$/g.test(jdata.chat_id)){
				message_handler.get_usernames(user, jdata)
				.then(res => {
					jdata.sender = user;
					for(let receiver of res){
						send(receiver.username, jdata) ;
					}
				}). catch(err => {
					console.log(err);
				});
			}
		}
		else if( jdata.command == 'add_user_to_chat' ){
			if( jdata.chat_id !== "" && jdata.person !="" && /^[0-9]+$/g.test(jdata.chat_id) && validateUsername(jdata.person)
				&& jdata.person !== null && jdata.chat_id !== null && jdata.person !== undefined && jdata.chat_id !== undefined){
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
