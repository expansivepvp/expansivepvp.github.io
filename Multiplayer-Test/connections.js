function handleConnection(io, socket, players) {
    console.log('a user connected');
    // create a new player and add it to our players object
    players[socket.id] = {
        x: 20,
        y: 20
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
   
    // when a player disconnects, remove them from our players object
    socket.on('disconnect', (socket) => handleDisconnect(io, socket, players));
}

function handleDisconnect(io, socket, players) {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
}

module.exports = handleConnection;