const express = require("express");
const { Pool } = require("pg");
const user_db = require("../users.js");
const msg_handler_db = require("../message_handler.js");
const cors = require("cors");
const bodyparser = require("body-parser");

module.exports = { run_server : () => {
	try {
		var app = express();
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

		app.use(cors(corsOptions));*/

		app.use(bodyparser.urlencoded({extended: true}));

		console.log("starting..");

		// User Request Handling
		const user_router = express.Router();

		user_router.put("/signup", async (req, res) => {
			let r = await user_db.signup(req.body.username, req.body.password)
			if(r.ok === true) return res.status(200).send({message: "signup successful"})
			else return res.status(400).send({message: r.message});
		});

		user_router.post("/login", async (req, res) => {
			let r = await user_db.loginfunc(req.body.username, req.body.password)
			if(r.ok === true) return res.status(200).send({message: "login successful"});
			else return res.status(400).send({message: r.message});
		});

		user_router.get("/chats", async (req, res) => {
			return await msg_handler_dp.et_chats(req.body.username)
		});

		app.use("/user", user_router);

		const chat_router = express.Router();

		chat_router.get("/check_allowence/:chat_id", async (req, res) => {
			let r = await msg_handler_db.allowed(req.headers.username, {chat_id: req.params.chat_id})
			if(r === true) return res.status(200).send({ok: true});
			else return res.status(400).send({ok:false});
		});

		chat_router.get("/:chat_id/users", async (req, res) => {
			let r = await msg_handler_db.get_usernames(req.headers.username, {chat_id: req.params.chat_id});
			return res.status(200).send(r);
		});

		chat_router.put("/:chat_id/add_user/:user_id", async (req, res) => {
			let r = await msg_handler_db.add_user(req.body.username, {chat_id: req.params.chat_id, person: req.params.user_id});
			if(r === true) return res.status(200).send();
			else return res.status(400).send();
		});

		chat_router.put("/add_chat", async (req, res) => {
			if(await msg_handler_db.add_chat(req.body.username, {chat_name: req.body.chat_name}) === true) return res.status(200).send();
			return res.status(400).send();
		});


		app.use("/chat", chat_router);

		app.listen(8080, () => { console.log("listening"); });
		return true;
	} catch(e) {
		console.log("Starting Server : Error");
		console.log(e.stack);
		return false;
	}

}};
