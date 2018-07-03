import Player from './player.js';

class Main extends Phaser.Scene {

    preload() {
        this.load.tilemapTiledJSON('world', 'assets/tilemap.json');
        this.load.image('tileset_orthagonal', 'assets/tileset_orthagonal.png');

        this.load.spritesheet('knight', 'assets/knight.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        // start off by drawing player
        this.setupAndDrawPlayer();

        // connect to websocket server
        this.socket = io();
        
        this.players = {};
        this.socket.on('initialConnection', (data) => this.establishInitialVariables(data));

        // create map
        this.map = this.make.tilemap({key: 'world'});
        this.tileset = this.map.addTilesetImage('tileset_orthagonal');

        // renders map layers
        this.renderLayers();

        this.setupCollisions();

        this.socket.on('correction', (data) => this.handleCorrections.call(this, data));

        this.setupKeyboard();

        this.input.keyboard.on('keyup', (event) => {

            // make sure context is of entire class, not keyboardManager
            this.handleKeyup.call(this, event);
        });

        this.socket.on('newPlayer', (data) => this.addPlayer(data));
        this.socket.on('playerMovement', (data) => this.updatePlayer(data));
        this.socket.on('disconnect', (playerID) => this.handleDisconnect(playerID));
    }

    update() {
        this.handleKeydown();
    }

    handleDisconnect(playerID) {
        this.players[playerID].getSprite().destroy();
        delete this.players[playerID];
    }

    establishInitialVariables(data) {
        // todo: probably implement something that selectively loads a json file with the info for the class the player chooses
        for (let id in data.players) {
            if (id != data.socketID) {
                this.players[id] = new Player();
                let player = this.players[id];
                player.setID(data.players[id].id);

                player.setSprite(this.physics.add.sprite(player.x, player.y, 'knight', 1))
                this.physics.add.collider(this.players[id].getSprite(), this.collisionLayer, (sprite, collisionLayer) => {

                    // when they collide, maintain the velocity that was sent to them in the last update
                    if (player.getMoveDirection().x) player.getSprite().setVelocityX(player.getCurrentVelocity().x);
                    if (player.getMoveDirection().y) player.getSprite().setVelocityY(player.getCurrentVelocity().y);
                });
            }
        }
    }

    addPlayer(data) {
        this.players[data.id] = new Player();
        let player = this.players[data.id];
        player.setID(data.id);
        player.setSprite(this.physics.add.sprite(player.x, player.y, 'knight', 1));
        this.physics.add.collider(this.players[data.id].getSprite(), this.collisionLayer, (sprite, collisionLayer) => {

            // when they collide, maintain the velocity that was sent to them in the last update
            if (player.getMoveDirection().x) player.getSprite().setVelocityX(player.getCurrentVelocity().x);
            if (player.getMoveDirection().y) player.getSprite().setVelocityY(player.getCurrentVelocity().y);
        });
    }

    updatePlayer(data) {
        let player = this.players[data.id];

        player.getSprite().setPosition(data.x, data.y);

        if (data.moveDirection == 'x') {
            player.getSprite().setVelocityX(data.velocity);
            player.setCurrentVelocityX(data.velocity);
            if (data.velocity != 0) player.setMoveDirectionX(true);
            else player.setMoveDirectionX(false);

            if (data.velocity > 0) player.getSprite().setFrame(3);
            else if (data.velocity < 0) player.getSprite().setFrame(2);
        }
        else if (data.moveDirection == 'y') {
            player.getSprite().setVelocityY(data.velocity);
            player.setCurrentVelocityY(data.velocity);
            if (data.velocity != 0) player.setMoveDirectionY(true);
            else player.setMoveDirectionY(false);

            if (data.velocity < 0) player.getSprite().setFrame(0);
            else if (data.velocity > 0) player.getSprite().setFrame(1);
        }
    }

    handlePlayerMovement() {
        if (this.player.movement.up) this.player.getSprite().setVelocityY(-this.player.normalSpeed);
        else if (this.player.movement.down) this.player.getSprite().setVelocityY(this.player.normalSpeed);
        else this.player.getSprite().setVelocityY(0);
        if (this.player.movement.right) this.player.getSprite().setVelocityX(this.player.normalSpeed);
        else if (this.player.movement.left) this.player.getSprite().setVelocityX(-this.player.normalSpeed);
        else this.player.getSprite().setVelocityX(0);
    }

    setupKeyboard() {
        this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    }

    handleKeydown() {
        if (Phaser.Input.Keyboard.JustDown(this.up)) {
            this.socket.emit('playerMovement', this.generatePlayerInfo('up', 'keyDown', 'y'));
            this.player.movement.up = true;
            this.player.movement.down = false;
            this.player.getSprite().setFrame(0);
        } else if (Phaser.Input.Keyboard.JustDown(this.down)) {
            this.socket.emit('playerMovement', this.generatePlayerInfo('down', 'keyDown', 'y'));
            this.player.movement.down = true;
            this.player.movement.up = false;
            this.player.getSprite().setFrame(1);
        } else {
            this.player.getSprite().setVelocityY(0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.left)) {
            this.socket.emit('playerMovement', this.generatePlayerInfo('left', 'keyDown', 'x'));
            this.player.movement.left = true;
            this.player.movement.right = false;
            this.player.getSprite().setFrame(2);
        } else if (Phaser.Input.Keyboard.JustDown(this.right)) {
            this.socket.emit('playerMovement', this.generatePlayerInfo('right', 'keyDown', 'x'));
            this.player.movement.right = true;
            this.player.movement.left = false;
            this.player.getSprite().setFrame(3);
        } else {
            this.player.getSprite().setVelocityX(0);
        }

        this.handlePlayerMovement();
    }

    handleKeyup(e) {
        switch(e.keyCode) {
            case 87: // W
                this.socket.emit('playerMovement', this.generatePlayerInfo('up', 'keyUp', 'y'));
                this.player.movement.up = false;
                if (this.down.isDown) this.player.movement.down = true;
                break;
            case 65: // A
                this.socket.emit('playerMovement', this.generatePlayerInfo('left', 'keyUp', 'x'));
                this.player.movement.left = false;
                if (this.right.isDown) this.player.movement.right = true;
                break;
            case 83: // S
                this.socket.emit('playerMovement', this.generatePlayerInfo('down', 'keyUp', 'y'));
                this.player.movement.down = false;
                if (this.up.isDown) this.player.movement.up = true;
                break;
            case 68: // D
                this.socket.emit('playerMovement', this.generatePlayerInfo('right', 'keyUp', 'x'));
                this.player.movement.right = false;
                if (this.left.isDown) this.player.movement.left = true;
                break;
        }

        this.handlePlayerMovement();
    }

    generatePlayerInfo(key, keyDirection, moveDirection) {
        return {
            key: key, 
            keyDirection: keyDirection,
            timestamp: Date.now(), 
            clientCoords: {
                x: this.player.getSprite().x, 
                y: this.player.getSprite().y
            },
            moveDirection: moveDirection
        }
    }

    setupAndDrawPlayer() {
        // create and render player
        this.player = new Player();
        let playerCoords = this.player.getCoords();
        let playerSprite = this.physics.add.sprite(playerCoords.x, playerCoords.y, 'knight', 1);
        this.player.setSprite(playerSprite);

        // we want our player to be above ground and below other layers
        this.player.getSprite().depth = 5;
    }

    renderLayers() {
        // render ground before player
        this.groundLayer = this.map.createStaticLayer('Ground', this.tileset, 0, 0);
        this.groundLayer.depth = 0;

        // render other layers over the player
        this.collisionLayer = this.map.createStaticLayer('Collisions', this.tileset, 0, 0);
        this.collisionLayer.depth = 10;
        this.decorationsLayer = this.map.createStaticLayer('Decorations', this.tileset, 0, 0);
        this.decorationsLayer.depth = 10;
    }

    setupCollisions() {
        // set collision if property "collides" was checked when making the map in in Tiled
        this.map.setCollisionByProperty({collides: true}, true, false, this.collisionLayer);
        this.physics.add.collider(this.player.getSprite(), this.collisionLayer);

        if (this.players.length > 0) {
            for (let playerID of this.players) {
                this.physics.add.collider(this.players[playerID].getSprite(), this.collisionLayer);
            }
        }
    }

    handleCorrections(coord) {
        if ('y' in coord) this.player.getSprite().y = coord.y;
        if ('x' in coord) this.player.getSprite().x = coord.x;
    }
}

let config = {
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    scene: [Main],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    },
    pixelArt: true,
    zoom: 2,
    parent: 'game'
}

let game = new Phaser.Game(config);