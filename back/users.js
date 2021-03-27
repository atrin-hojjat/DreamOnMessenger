// handle user login const sjcl = require("sjcl");
const dotenv = require("dotenv").config();
const { Pool } = require("pg");
const sjcl = require("sjcl");

const pool = new Pool();

var signup = async (username, password) => {
  return await pool
    .query("select username from users where username=$1", [username])
    .then(async (res) => {
      console.log(res);
      console.log("Checking if user exists");
      if (res.rows.length === 0)
        return await pool
          .query("insert into users(username, password) values($1, $2)", [
            username,
            sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(password)),
          ])
          .then((res) => {
            return { ok: true };
          })
          .catch((err) => {
            console.log(err.stack);
            return { ok: false, message: "internale server error" };
          });
      return { ok: false, message: "username already exists" };
    })
    .catch((err) => {
      console.log(err.stack);
      return { ok: false, message: "internal server error" };
    });
};

var get_password = async (username) => {
  return await pool
    .query("SELECT * FROM users WHERE username=$1", [username])
    .then((res) => {
      if (res.rows.length === 0) return null;
      return res.rows[0].password;
    })
    .catch((e) => {
      console.error(e.stack);
      return null;
    });
};

var loginfunc = async (usr, psd) => {
  if (usr === null || usr === undefined)
    return { ok: false, message: "Enter Username" };
  if (
    (await get_password(usr)) ==
    sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(psd))
  ) {
    return { ok: true };
  } else {
    return { ok: false, message: "Wrong Username or Password" };
  }
};

var user_exists = async (usr) => {
  return await pool
    .query("select username from users where username=$1", [usr])
    .then((res) => {
      if (res.rows.length === 0) return false;
      return true;
    })
    .catch((err) => {
      console.log(err.stack);
      return false;
    });
};
module.exports = { user_exists, loginfunc, signup };
