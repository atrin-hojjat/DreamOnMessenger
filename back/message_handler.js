// connect to database 
// postgresql
// databases : users
const { Pool } = require("pg");
const users = require("./users.js");

const pool = new Pool()

var allowed = async (username, chat) => {
	return await pool
		.query("select username from chat_user where chat_id=$1 and username=$2", [chat, username])
		.then(res => {
			if(res.rows.length === 0) return false;
			return true;
		}).catch(err => {
			console.log(err.stack);
			return false;
		});
};

var get_usernames = async (sender, data) => {
	if(await allowed(sender, data.chat_id) === true) {
		return await pool
			.query("select username from chat_user where chat_id=$1", [data.chat_id])
			.then(res => {
				return res.rows;
			})
			.catch(err => {
				console.log(err.stack);
				return [];
			});
	} else return [];
};

var add_user = async (sender, data, send) => {
	if(await allowed(sender, data.chat_id) === true && await allowed(data.person, data.chat_id) === false) {
		console.log("ALLOWED");
		await pool
			.query("insert into chat_user(chat_id, username) values ($1, $2)", [data.chat_id, data.person]);
		let tt = "" + sender + " ADDED " + data.person + " to " + data.chat_id;
		for(pp of await get_usernames(sender, data))
			send(pp.username, {sender: sender, chat_id: data.chat_id, message: tt});
		return true;
	} else return false;
};

var add_chat = async (sender, data, send) => {
	if(users.user_exists(sender)) {
		let id = (await pool
			.query('insert into chats(name) values ($1) returning chat_id', [data.chat_name])).rows[0].chat_id;
		await pool.query('insert into chat_user(chat_id, username) values ($1, $2)', [id, sender]);
		send(sender, {chat_id: id, sender: sender, message: "CREATED CHAT"});
		return true;
	} else return false;
};

var get_chats = async (sender) => {
	if(users.user_exists(sender))
		return await pool
			.query('select chats.chat_id as id, chats.name as name from chats '
				+ "inner join chat_user on chats.chat_id=chat_user.chat_id "
				+ "where chat_user.username=$1", [sender])
			.then(res => res.rows)
			.catch(err => {
				console.log(err.stack);
				return [];
			});
	return [];
};
module.exports = {allowed, get_usernames, add_user, add_chat, get_chats};
