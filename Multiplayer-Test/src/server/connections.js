let Constants = require('../shared/constants');

function handleConnection(io, socket, players) {
    console.log('a user connected');
    // create a new player and add it to our players object
    players[socket.id] = {
        x: 20,
        y: 20,
        lastKeyDownTimestamp: { // in milliseconds
            x: -1,
            y: -1
        },
        keysDownInXDir: 0,
        keysDownInYDir: 0,
        lastKeyDownX: '',
        lastKeyDownY: '',
        timeSinceMoveStart: {
            x: 0,
            y: 0
        },
        id: socket.id
    };

    // send all players to the new player
    // note, I will eventually (hopefully) make this more efficient by only sending the players in the new players' AOI
    socket.emit('initialConnection', {
        players: players,
        socketID: socket.id
    });
    socket.broadcast.emit('newPlayer', players[socket.id]);
   
    // when a player disconnects, remove them from our players object
    socket.on('disconnect', (data) => handleDisconnect(io, socket, players));
    socket.on('playerMovement', (data) => {
        validateMovement(io, socket, players, data);
        updateMovement(socket, players, data);
    });
}

function handleDisconnect(io, socket, players) {
    console.log('user disconnected');
    // remove this player from our players object

    delete players[socket.id];

    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
}

function updateMovement(socket, players, data) {
    socket.broadcast.emit('playerMovement', {
        x: data.clientCoords.x,
        y: data.clientCoords.y,
        id: socket.id,
        moveDirection: data.moveDirection,
        velocity: getNewPlayerVelocity(players[socket.id], data)
    });
}

function getNewPlayerVelocity(player, data) {
    let newVelocity;

    if (data.keyDirection == 'keyDown') {
        if (data.moveDirection == 'x') {
            if (data.key == 'left') newVelocity = -150;
            else if (data.key == 'right') newVelocity = 150;
        } else if (data.moveDirection == 'y') {
            if (data.key == 'up') newVelocity = -150;
            else if (data.key == 'down') newVelocity = 150;
        }
    } else if (data.keyDirection == 'keyUp') {
        if (data.moveDirection == 'x') {
            if (player.keysDownInXDir == 0) newVelocity = 0;
            if (player.keysDownInXDir == 1 || player.keysDownInXDir == 2) {
                if (data.key == 'left') newVelocity = 150;
                if (data.key == 'right') newVelocity = -150;
            }
        } else if (data.moveDirection == 'y') {
            if (player.keysDownInYDir == 0) newVelocity = 0;
            if (player.keysDownInYDir == 1 || player.keysDownInYDir == 2) {
                if (data.key == 'up') newVelocity = 150;
                if (data.key == 'down') newVelocity = -150;
            }
        }
    }

    return newVelocity;
}

function validateMovement(io, socket, players, data) {
    let player = players[socket.id];
    player.moveStartTime = Date.now();

    let cheatingInX = checkForCheatingInX(data, player);
    let cheatingInY = checkForCheatingInY(data, player);

    // reset timestamp/key info
    if (data.moveDirection == 'x') {
        player.lastKeyDownTimestamp.x = data.timestamp;
        player.lastKeyDownX = data.key;
    } else if (data.moveDirection == 'y') {
        player.lastKeyDownTimestamp.y = data.timestamp;       
        player.lastKeyDownY = data.key;
    } 

    // only trust coords if they are verified
    if (!cheatingInX) player.x = data.clientCoords.x;
    if (!cheatingInY) player.y = data.clientCoords.y;

    // this will let us know when we can check if the net movement is correct (when both keys in a direction are released)
    if (data.keyDirection == 'keyDown') {
        if (data.moveDirection == 'x') player.keysDownInXDir += 1;
        if (data.moveDirection == 'y') player.keysDownInYDir += 1;

        // if player presses other key in the same direction (i.e. left + right), we check the distance moved in the first direction
        if (player.keysDownInXDir == 2 && cheatingInX) io.emit('correction', {x: player.x}); 
        if (player.keysDownInYDir == 2 && cheatingInY) io.emit('correction', {y: player.y});

    } else if (data.keyDirection == 'keyUp') {
        if (data.moveDirection == 'x') player.keysDownInXDir -= 1;
        if (data.moveDirection == 'y') player.keysDownInYDir -= 1;

        // if all keys in X or Y direction are released, perform cheat check on overall distance travelled in that direction
        if (player.keysDownInXDir == 0 && cheatingInX) io.emit('correction', {x: player.x}); 
        if (player.keysDownInYDir == 0 && cheatingInY) io.emit('correction', {y: player.y});
    }
}

function checkForCheatingInX(data, player) {
    // we'll allow a certain difference between player and server because they can get off slightly due to timing
    // 5 is arbitrary
    let approximationAmount = 5;
    let cheatingInX = Math.abs(player.x - data.clientCoords.x) > approximationAmount + Constants.PLAYER_SPEED_NORMAL * ((data.timestamp - player.lastKeyDownTimestamp.x)/1000);

    return cheatingInX;
}

function checkForCheatingInY(data, player) {
    // we'll allow a certain difference between player and server because they can get off slightly due to timing
    // 5 is arbitrary
    let approximationAmount = 5;
    let cheatingInY = Math.abs(player.y - data.clientCoords.y) > approximationAmount + Constants.PLAYER_SPEED_NORMAL * ((data.timestamp - player.lastKeyDownTimestamp.y)/1000);

    return cheatingInY;
}

// this may have to change since I normalize diagonal player movement speed
function calculatePlayerPosition(player) {
    let position = {};

    let playerXBeforeLastButtonPress = player.x;
    let playerYBeforeLastButtonPress = player.y;

    let secondsSinceMoveStartX = (Date.now() - player.timeSinceMoveStart.x)/1000;
    let addToX = Constants.PLAYER_SPEED_NORMAL * secondsSinceMoveStartX;

    let secondsSinceMoveStartY = (Date.now() - player.timeSinceMoveStart.y)/1000;
    let addToY = Constants.PLAYER_SPEED_NORMAL;

    position.x = playerXBeforeLastButtonPress + addToX;
    position.y = playerYBeforeLastButtonPress + addToY;

    return position;
}

module.exports = handleConnection;