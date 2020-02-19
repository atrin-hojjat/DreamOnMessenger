const WS = require('ws') ;

const server = new WS.Server({port: 8080});
var sockets = [];
const querystring = require("querystring");
const message_handler = require ('./message_handler');
const users = require ('./users');

function parse(data) {
	console.log(data);
	if(data == null || data == undefined || data == "" || data === "") return {};
	return JSON.parse(data);
}

function write(sock, message) {
  sock.write(JSON.stringify(message));
}

var send = (sender , message ) => {
  for(let sock of sockets ){
    if( sock.id == sender ) {
      write (sock.sock, message);
    }
  }
};
var start = () => {
	/*
	server.listen({
		port: '8080' ,
		host: '127.0.0.1'
	});*/
}
server.on('error' , (err) =>{
  console.log( err );
});
server.on('connection' , (sock) => {
	let LOGED = false;

  sock.on('data' , (data) =>{
		if(LOGED) return ;
    let xxx = parse(data) ;
    if( xxx.usr !== null && xxx.psd !== null ){
      users.loginfunc ( xxx.usr , xxx.psd ).then( login_result => {
				if( login_result.ok == true ){
					write(sock, {ok: true, message: "Login successful"});
					LOGED = true;
					sockets.push({id: xxx.usr, sock: sock});
					sock.on('data' , (data) =>{

						let xx = parse(data);
						console.log(xx);
						if( xx.command == 'add_chat' ){
							if( xx.chat_name !== null && xx.chat_name !== undefined){
								message_handler.add_chat(xxx.usr , xx , send) ;
							}
						}
						else if (xx.command == 'new_message'){
							if( xx.chat_id !== null && xx.chat_id !== undefined){
								message_handler.get_usernames(xxx.usr, xx)
								.then(res => {
									for(let receiver of res){
										send(receiver.username, xx) ;
									}
								}). catch(err => {
									console.log(err);
								});
							}
						}
						else if( xx.command == 'add_user_to_chat' ){
							if( xx.person !== null && xx.chat_id !== null && xx.person !== undefined && xx.chat_id !== undefined){
								 message_handler.add_user ( xxx.usr , xx , send) ;
							}
						}
					});
				} else write(sock, login_result);
			}).catch(err => {
				console.log(err.stack);
				write(sock, {ok : false, message: "Internal Server Error"});
			});
    }
  });
  sock.on( 'error', (err ) =>{
    console.log(err);
  });
  console.log('Client connected') ;
});

module.exports= {send: send, start: start};
