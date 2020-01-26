// connect to database 
// postgresql
// databases : users
const { Pool } = require("pg");


var get_usernames = (sender, data) => {
	if(allowed(sender, data.chat_id) === 1) {
		return await pool
			.query("select username from chat_user where chat_id=$1", [data.chat_id])
			.then(res => {
				return res;
			})
			.catch(err => {
				console.log(err.stack);
				return [];
			});
	} else return [];
};

var add_user = (sender, data) => {
	if(allowedd(data.person, data.chat_id) === 0) {
		await pool
			.query("insert into chat_user(chat_id, username) values ($1, $2)", [data.chat_id, data.person]);
		let tt = "" + sender + " ADDED " + data.person + " to " + data.chat_id;
		for(pp in get_usernames(sender, data))
			server.send(pp, {sender: sender, chat_id: data.chat_id, message: tt});
		return true;
	} else return false;
};

var add_chat = (sender, data) => {
	if(users.user_exists(sender)) {
		let id = await pool
			.query('insert into chats(name) values ($1)', [sender]).rows[0].chat_id;
		await pool.query('insert into chat_user(chat_id, username) values ($1, $2)', [id, sender]);
		server.send(sender, {chat_id: id, sender: sender, message: "CREATED CHAT"});
	} else return null;
};

var get_chats = (sender) => {
	if(users.user_exists(sender))
		return await pool
			.query('select chat_id ');//TODO
}
