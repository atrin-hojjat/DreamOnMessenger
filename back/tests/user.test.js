const https = require("https");
let users = [{username: "test01", password: "1234"}, {username: "test02", password: "1234"}]

var signup_user = (user) => {
	console.log("Signing " + user.username + " up");
	let req = https.request({
		hostname: 'localhost',
		port: '8080',
		path: '/users/sighup',
		method: 'put'
	}, res => {
		console.log("Status : ", res.statusCode);
		/*if(res.statsuCode != 200) 
			throw new Error("Sign up Failed : server returned with code " + res.statusCode);*/
		res.on('data', xx => console.log(xx));
	});
	req.on('error', err => console.log(err.stack));
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
			console.log(e.stack());
			return false;
		}
	}
};
