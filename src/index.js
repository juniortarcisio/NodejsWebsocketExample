var WebSocketServer = require('websocket').server;
var http = require('http');
 
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server
    //,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    //autoAcceptConnections: false
});

var clients = [ ];

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' connected.');
    var index = clients.push(connection) - 1;

    for (var i=0; i < clients.length; i++) {
        clients[i].sendUTF('someone has joined');
    }

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            for (var i=0; i < clients.length; i++) {
                //clients[i].sendUTF({test:'xd', msg:message.utf8Data});
                clients[i].sendUTF(message.utf8Data);
            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }      
    });

    connection.on('close', function(connection) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
      clients.splice(index, 1);
      
        for (var i=0; i < clients.length; i++) {
            clients[i].sendUTF('someone has left');
        }
    });
});

setInterval(function() {
    for (var i=0; i < clients.length; i++) {
        console.log('server auto message');
        clients[i].sendUTF('server auto message');
    }
},10000);