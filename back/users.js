// handle user login
const sjcl = require("sjcl");
const {Pool} = require("pg");

const pool = new Pool()

var get_password = async (username) => { 
	return await pool
		.query('SELECT * FROM users WHERE username=$1', [username])
		.then( res => {
			if(res.rows.length === 0) return null;
			return res.row[0].password
		}).catch(e => {
			console.error(e.stack);
			return null
		});
};

var loginfunc = async (usr, psd) => {
  if(usr === null || usr === undefined) 
		return {ok: false, message: "Enter Username"};
  if(get_password(usr) === sjcl.codec.hex.
		fromBits(sjcl.hash.sha256.ash(psd)) ) {
		return {ok: true};
  } else {
		return {ok: false, message : "Wrong Username or Password"};
  }
};

var user_exists = async (usr) => {
	return await pool.query('select * from users where username=$1', [usr])
		.then(res => {
			if(res.rows.length === 0) return false;
			return true;
		}).catch(err => {
			console.log(err.stack);
			return false;
		});
}
