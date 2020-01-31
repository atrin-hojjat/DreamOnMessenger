const http = require("http");
var querystring = require('querystring');

let users = [{username: "test01", password: "1234"}, {username: "test02", password: "1234"}]

var signup_user = (user) => {
	console.log("Signing " + user.username + " up");
	let data = querystring.stringify(user);
	let req = http.request({
		hostname: 'localhost',
		port: '8080',
		path: '/user/signup',
		method: 'put',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		}
	}, res => {
		console.log("Status : ", res.statusCode);
		/*if(res.statsuCode != 200) 
			throw new Error("Sign up Failed : server returned with code " + res.statusCode);*/
		res.on('data', xx => console.log(xx));
	});
	req.on('error', err => console.log(err.stack));
	req.write(data);
	req.end();
};

module.exports = { 
	signup: () => {
		try {
			signup_user(users[0]);
			signup_user(users[1]);
			return true;
		} catch (e) {
			console.log("signup failed");
			console.log(e);
			return false;
		}
	}
};
