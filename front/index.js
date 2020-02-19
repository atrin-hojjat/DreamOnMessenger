var sock = new WebSocket("ws://localhost:8080/");

var login_info = { logedin: false, user: {username: null, password: null}};
var last_message = {};
var not_seen_count = {};

var gen_banner = (chat) {
	return `		
                    <div class="card p-3">
                        <div class="row">
                            <div class="avatar col-3 pr-0">
                                <img src="${}" alt="Avatar" class="w-100 rounded-circle">
                            </div>
                            <div class="col-6 title align-self-center">
                                <h2>${chat.name}</h2>
                                <h3>${}</h3>
                            </div>
                            <div class="col-3 time">
                                <span>${last_message[chat_id].time}</span>
                                <div class="number">${not_seen_count[chat.id]}</div>
                            </div>
                            <div class="col-12 pt-3 text">
                                <p>${last_message[chat.id].message}
                                </p>
                            </div>
                        </div>
                    </div>
										`;
};

var re_load_chats = (chats) => {
	$(".Messages").text("");
	for(x of chats)
		$(".Messages").add(gen_banner(x));
};

socks.onopen = (data) => {
	alert("YES")
	$("#dialog-content").load("./login.htm", (not_important1, not_important2, not_important3) => {
		$("#login-username").change(() => {
			login_info.username = $(this).text();
		});
		$("#login-password").change(() => {
			login_info.password = $(this).text();
		});
		$("#login-button").click(() => {
			socks.send(JSON.stringify({usr: login_info.username, psd: login_info.password}));
		});
	});
};
socks.onclose = (data) => {
	$("#dialog-content").html("<p> Lost Connection with the server. <br> Reconnecting...</p>" + 
				"<span class=\"loader-frame\"> <span class=\"loader-inner\"> </span> </span>");
};



socks.onmessage = (data) => {
	if(login_info.logedin) {
		
	} else {
		let jdata = JSON.parse(data);
		if(jdata.ok) {
			login_info.logedin = true;
		} else {
			$("#login-message").text(jdata.message);
		}
	}

};
socks.onerror = (data) => {
	$("#dialog-content").html("<p> Lost Connection with the server. <br> Reconnecting...</p>" + 
				"<span class=\"loader-frame\"> <span class=\"loader-inner\"> </span> </span>");
};
