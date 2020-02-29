
const init_login_info = { logedin: false, username: null, password: null};
var login_info = init_login_info;
let cnt = 0;

var show_just_waiting = () => {
	$("#waiting-modal").show();
	$("#login-root").hide();
	$("#signup-root").hide();
}

var toggle_login = () => {
	$("#dialog-content").animate({ trans: 90 }, {
		step: (now, fx) => {
			$("#dialog-content").css('transform', "rotateY(" + now + "deg)")
		}, duration: 'fast'
	}, 'linear');
	$("#signup-root").toggle()
	$("#login-root").toggle()
	$("#dialog-content").animate({ trans: 0 }, {
		step: (now, fx) => {
			$("#dialog-content").css('transform', "rotateY(" + now + "deg)")
		}, duration: 'fast'
	}, 'linear');
}

var init = () => {
		$.ajax({
			method: 'GET',
			url: '/session/check',
			success: (jdt) => {
				console.log(jdt)
				if(jdt.loged == true) {
					login_info.logedin = true;
					login_info.username = jdt.username;
					start()
				}
			}
		});
	$("#login-modal").load("/login.htm", (a, b, c) => {
		$("#login-username").val(login_info.username);
		$("#login-password").val(login_info.password);
		$("#login-username").change(() => {
			login_info.username = $("#login-username").val();
		});
		$("#login-password").change(() => {
			login_info.password = $("#login-password").val();
		});
		$("#login-toggle-button").click((e) => {
			e.preventDefault();
			toggle_login()
		});
		$("#login-form").submit((e) => {
			e.preventDefault();
			$("#waiting-modal").show();

			$.ajax({
				method: 'POST',
				url: '/session/login',
				data: $("#login-form").serialize(),
				success: (jdt) => {
					console.log(jdt)
					$("#waiting-modal").hide();
					if(jdt.ok == true) {
						login_info.logedin = true;
						cnt = 0;
						start();
					} else {
						console.log(jdt.message);
						$("#login-message").text(jdt.message);
					}
				}
			});
		});
		$("#waiting-modal").hide();
	});
	$("#signup-modal").load("/signup.htm", (a, b, c) => {
		$("#signup-username").val(login_info.username);
		$("#signup-password").val(login_info.password);
		$("#signup-username").change(() => {
			login_info.username = $("#signip-username").val();
		});
		$("#signup-password").change((e) => {
			e.preventDefault();
			login_info.password = $("#signup-password").val();
		});
		$("#signup-toggle-button").click(() => {
			toggle_login()
		});
		$("#signup-form").submit((e) => {
			e.preventDefault();
			$("#waiting-modal").show();

			$.ajax({
				method: 'PUT',
				url: '/session/signup',
				data: $("#signup-form").serialize(),
				success: (jdt) => {
					console.log(jdt)
					$("#waiting-modal").hide();
					if(jdt.ok == true) {
						toggle_login()
					} else {
						console.log(jdt.message);
						$("#signup-message").text(jdt.message);
					}
				}
			});
		});

	});
	$("#LOGOUT").click(() => {
		logout();
	});
}

var sock;

var logout = () => {
	if(sock) sock.close()
	show_just_waiting();
	$("#dialog-box").fadeIn();
	$.ajax({
		method: 'delete',
		url: '/session/logout',
		success: (jdt) => {
			$("#waiting-modal").hide();
			$("#login-root").show();
			$("#signup-root").hide();
			login_info.logedin = false;
			login_info.username = "";			
		}
	});

}

var start = () => { 
	let socketid = { address: 'localhost', port: 8080};
	sock = new WebSocket(`ws://${window.location.host}/`);

	var CHATS = [];
	var chats = {}
	var last_upd = {}
	var last_message = {};
	var not_seen_count = {};
	var messages = {};
	var chat_on = "";

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
	var create_message = (message) => {
		console.log(message)
		return `
					<div class="message ${message.sender == login_info.username ? "sent" : "recieved"}">
		${message.message}</div>`
	};

	var load_chat = (chat_id) => {
		not_seen_count[chat_id] = 0;
		chat_on = chat_id
		$("#messages").text("");
		if(messages[chat_id]) for(x of messages[chat_id]) {
			$("#messages").append(create_message(x));
		}
	};

	var re_load_chats = () => {
		CHATS.sort((a, b) => {
			if(last_upd[a.id]) return false;
			if(last_upd[b.id]) return true;
			return last_upd[a.id] < last_upd[b.id];
		})
		$("#chats").text("");
		for(x of CHATS)
		{
			$("#chats").prepend(gen_banner(x));
			let test = x.id;	
			$(`#${x.id}`).click(() => { load_chat(test);})
		}
	};

	var add_chat = (chat) => {
		$("#chats").prepend(gen_banner(chat));
		$(`#${chat.id}`).click(() => { load_chat(chat.id);})
	}

	sock.onopen = (data) => {
		cnt = 0;
		sock.send("{\"command\":\"get_chats\"}");
		$("#dialog-box").fadeOut();
	};
	sock.onclose = (data) => {
//		$("#modal-message-content").
//			html("<p class=\"justify-content-center lab modal-message\">" +
//			"Lost Connection with the server. <br> Reconnecting...</p>"); 
		show_just_waiting();
		$("#dialog-box").fadeIn();
		if(login_info.loged) setTimeout(() => {
			if(cnt < 5) {
				cnt++;
				console.log(cnt)
				login_info.logedin = false
				start();
			} else {
				alert("Connection lost, please Login again")
				$("#modal-message-content").html("");
				$("#waiting-modal").hide();
				$("#login-root").show();
				$("#signup-root").hide();
							
			}
		}, 1000);
	};



	sock.onmessage = (dataw) => {
		let data = dataw.data
		let jdata = JSON.parse(data);
		console.log(jdata)
		switch(jdata.command) {
			case "new_message":
				last_message[jdata.chat_id] = {message: jdata.sender + ":" + jdata.message, time:Date.now()};
				last_upd[jdata.chat_id] = Date.now();
				if(jdata.chat_id == chat_on) {
					$("#messages").append(create_message(jdata))
				} else not_seen_count[jdata.chat_id] += 1;
				messages[jdata.chat_id].push(jdata);
				
				$(`#${jdata.chat_id}`).remove()
				add_chat(chats[jdata.chat_id])
				break;
			case "add_chat":
				jdata.id = jdata.chat_id
				not_seen_count[jdata.id]++;
				last_upd[jdata.id] = Date.now();
				chats[jdata.id] = jdata;
				messages[jdata.id] = []
				not_seen_count[jdata.chat_id] = 0;
				add_chat(jdata);
				break;
			case "get_chats":
				for(x of jdata.chats)
				{
					not_seen_count[x.id] = 0;
					messages[x.id] = []
					chats[x.id] = x
				}
				CHATS = jdata.chats
				re_load_chats();
				break;
		}
	};
	sock.onerror = (data) => {
		$("#modal-message-content").
			html("<p class=\"justify-content-center lab modal-message\">" +
			"Lost Connection with the server. <br> Reconnecting...</p>"); 
		show_just_waiting();

		$("#dialog-box").fadeIn();
		sock.close();
	};
	$("#send_message").click(() => {
		sock.send(JSON.stringify({command: "new_message", chat_id: chat_on, message: $("#new_message_text").val()}))
	});

	$("#add_chat").click(() => {
		sock.send(JSON.stringify({command: "add_chat", chat_name: $("#new_chat").val()}))
	});

	$("#invite").click(() => {
		sock.send(JSON.stringify({command: "add_user_to_chat", person: $("#new_user").val(), chat_id: chat_on}))
	});

}


$(document).ready(init);
