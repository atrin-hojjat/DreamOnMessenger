const server_test = require("./server.test.js");
const user_test = require("./user.test.js");
const assert = require("assert");
console.log("Testing Started");

console.log("***Starting up Server***");

var start_testing = () => {
	console.log("Starting Tests...");
	const DO_SIGNUP = process.env.DO_SIGNUP;
	if(DO_SIGNUP !== null && DO_SIGNUP !== undefined) {
		console.log("***Signing up Users***");
		assert.ok(user_test.signup());
	}

	console.log("***Loging in***");
	assert.ok(user_test.login());
};
assert.ok(server_test.run_server(start_testing));
