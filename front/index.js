
var start = () => { 

	var sock = new ReconnectingWebSocket("ws://localhost:8080/");

	const init_login_info = { logedin: false, username: null, password: null};
	var login_info = init_login_info;
	var last_message = {};
	var not_seen_count = {};

	var gen_banner = (chat) => {
		let emp = "", time = "", message = "", count = 0;
		if(chat.id in last_message) time = last_message[chat.id].time, message = last_message[chat.id].message;
		if(chat.id in not_seen_count) count = not_seen_count[chat.id]
		return `		
											<div class="card p-3" id="${chat.id}">
													<div class="row">
															<div class="avatar col-3 pr-0">
																	<img src="${emp}" alt="Avatar" class="w-100 rounded-circle">
															</div>
															<div class="col-6 title align-self-center">
																	<h2>${chat.name}</h2>
																	<h3>${emp}</h3>
															</div>
															<div class="col-3 time">
																	<span>${time}</span>
																	<div class="number">${count}</div>
															</div>
															<div class="col-12 pt-3 text">
																	<p>${message}
																	</p>
															</div>
													</div>
											</div>
											`;
	};

	var re_load_chats = (chats) => {
		$("#Messages").text("");
		for(x of chats)
			$("#Messages").prepend(gen_banner(x));
	};

	var add_chat = (chat) => {
		$("#Messages").add(gen_banner(chat));
	}

	sock.onopen = (data) => {
		if(login_info.username != null && login_info.password != null) 
				sock.send(JSON.stringify({usr: login_info.username, psd: login_info.password}));
		else 
		$("#dialog-content").load("login.htm", (a, b, c) => {
			$("#login-username").val(login_info.username);
			$("#login-username").change(() => {
				login_info.username = $("#login-username").val();
			});
			$("#login-password").change(() => {
				login_info.password = $("#login-password").val();
			});
			$("#login-button").click(() => {
				sock.send(JSON.stringify({usr: login_info.username, psd: login_info.password}));
			});
		});
	};
	sock.onclose = (data) => {
		$("#dialog\\-content").html("<p> Lost Connection with the server. <br> Reconnecting...</p>" + 
					"<span class=\"loader-frame\"> <span class=\"loader-inner\"> </span> </span>");
		$("#dialog-box").fadeIn();
		login_info.logedin = false;
	};



	sock.onmessage = (dataw) => {
		let data = dataw.data
		if(login_info.logedin == true) {
			let jdata = JSON.parse(data);
			switch(jdata.command) {
				case "add_chat":
					add_chat(jdata);
					break;
				case "get_chats":
					re_load_chats(jdata.chats);
					break;
			}
		} else {
			let jdata = JSON.parse(data);
			if(jdata.ok == true) {
				login_info.logedin = true;
				sock.send("{\"command\":\"get_chats\"}");
				$("#dialog-box").fadeOut();
			} else {
				$("#login-message").html(jdata.message);
				login_info.password = null;
			}
		}

	};
	sock.onerror = (data) => {
		$("#dialog\\-content").html("<p> Lost Connection with the server. <br> Reconnecting...</p>" + 
					"<span class=\"loader-frame\"> <span class=\"loader-inner\"> </span> </span>");
		$("#dialog-box").fadeIn();
		login_info.login = false;
	};
}


$(document).ready(start);
