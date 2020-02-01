const net = require('net') ;

const server = net.createServer();
var sockets = [];
const message_handler = require ('./message_handler.js');
const users = require ('./users.js');
var querystring = require('querystring');

function write(sock, message) {
	sock.write(querystring.stringify(message))
}

let send = (sender , message ) =>{
  for(let sock in sockets ){
    if( sock.id === sender ) {
      write (sock.sock, message);
    }
  }
};
server.listen({
  port: '8080' ,
  host: '127.0.0.1'
});
server.on('error' , (err) =>{
  console.log( err );
});
server.on('connection' , (sock) => {
  
  sock.on('data' , async (data) =>{
    let xxx = JSON.parse(data) ;
    if( xxx.usr !== null && xxx.psd !== null ){
      var login_result = await users.loginfunc ( xxx.usr , xxx.psd )
      if( login_result.ok == true ){
        sockets.push({id: xxx.usr, sock: sock});
        sock.on('data' , (data) =>{
          
          let xx = JSON.parse(data);
          if( xx.command == 'Make a chatroom' ){
            if( data.chat_id !== null && data.chat_id !== undefined){
              add_chat(xxx.usr , xx ) ;
            }
          }
          else if (xx.command == 'Send a message'){
            if( data.person !== null && data.chat_id && data.person !== undefined && data.chat_id !== undefined){
              for( let receiver in get_usernames(xxx.usr , xx )  ){
                send ( receiver , xx ) ;
              }
            }
          }
          else if( xx.command == 'Add a person to chatroom' ){
            if( data.person !== null && data.chat_id && data.person !== undefined && data.chat_id !== undefined){
               add_user ( xxx.usr , xx ) ;
            }
          } 
        });
      } else write(sock, login_result);
    }
  });
  sock.on( 'error', (err ) =>{
    console.log(err); 
  }); 
  console.log('Client connected') ;
});

module.exports = {send}
