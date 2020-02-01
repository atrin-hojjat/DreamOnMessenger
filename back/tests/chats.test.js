const http = require("http")
const querystring = require("querystring");

var add_chat = (user, chat) => {

};

var add_user_to_chat = (user, chat, user2) => {

};

var get_chats = (user) => {
	
};

var get_users = (chat) {

};

module.exports = {
	init_test : () => {
		try {
			let users = [{username: "test01", password: "1234"}, {username: "test02", password: "1234"}]
			let chat = [{chat_name: "chat 0", id: 0}];
			add_chat(users[0].username, chat[0]);
			chat = get_chats(users[0].username);
			console.log(chat[0]);
			add_user_to_chat(users[0].username, chat[0].id, users[1].username);
			console.log(get_users(chat[0].id));
			return true;
		} catch(e) {
			console.log("Chat Test Failed");
			console.log(e);
			return false;
		}
	}
};
