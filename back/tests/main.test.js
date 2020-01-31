const server_test = require("./server.test.js");
const user_test = require("./user.test.js");
const assert = require("assert");
console.log("Testing Started");

console.log("***Starting up Server***");
assert.ok(server_test.run_server());

console.log("***Signing up Users***");
assert.ok(user_test.signup());

