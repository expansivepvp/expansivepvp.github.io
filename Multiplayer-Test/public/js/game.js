import Player from './player.js';
import Constants from './constants.js'

class Main extends Phaser.Scene {

    preload() {
        this.load.tilemapTiledJSON('world', 'assets/tilemap.json');
        this.load.image('tileset_orthagonal', 'assets/tileset_orthagonal.png');

        this.load.spritesheet('knight', 'assets/knight.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        //  Input Events
        this.cursors = this.input.keyboard.createCursorKeys();

        // connect to websocket server
        this.socket = io();
        
        this.handleSocketConnections();

        // create map
        this.map = this.make.tilemap({key: 'world'});
        this.tileset = this.map.addTilesetImage('tileset_orthagonal');

        // includes map layers and players/enemies
        this.renderLayers();

        this.setupCollisions();
    }

    update() {
        this.handleKeyboardInput();

        let velocity = this.player.getVelocity();
        this.player.getSprite().setVelocity(velocity.x, velocity.y);
    }

    handleKeyboardInput() {
        if (this.cursors.up.isDown) {
            this.socket.emit('playerMovement');
            this.player.setVelocityY(-Constants.PLAYER_SPEED_NORMAL);
            this.player.getSprite().setFrame(0)
        } else if (this.cursors.down.isDown) {
            this.socket.emit('playerMovement');
            this.player.setVelocityY(Constants.PLAYER_SPEED_NORMAL);
            this.player.getSprite().setFrame(1);
        } else {
            this.player.setVelocityY(0);
        }

        if (this.cursors.left.isDown) {
            this.socket.emit('playerMovement');
            this.player.setVelocityX(-Constants.PLAYER_SPEED_NORMAL);
            this.player.getSprite().setFrame(2);
        } else if (this.cursors.right.isDown) {
            this.socket.emit('playerMovement');
            this.player.setVelocityX(Constants.PLAYER_SPEED_NORMAL);
            this.player.getSprite().setFrame(3);
        } else {
            this.player.setVelocityX(0);
        }
    }

    setupAndDrawPlayer() {
        // create and render player
        this.player = new Player();
        let playerCoords = this.player.getCoords();
        let playerSprite = this.physics.add.sprite(playerCoords.x, playerCoords.y, 'knight', 1);
        this.player.setSprite(playerSprite);

        // change size of collision hitbox
        this.player.sprite.body.setSize(19, 32); 
    }

    renderLayers() {
        // render ground before player
        this.groundLayer = this.map.createStaticLayer('Ground', this.tileset, 0, 0);

        this.setupAndDrawPlayer();

        // render other layers over the player
        this.collisionLayer = this.map.createStaticLayer('Collisions', this.tileset, 0, 0);
        this.decorationsLayer = this.map.createStaticLayer('Decorations', this.tileset, 0, 0);
    }

    handleSocketConnections() {
        this.socket.on('currentPlayers', (players) => {
            console.log(players);
            Object.keys(players).forEach((id) => {
                console.log(this.socket.id)
                this.addPlayer(players[id]);
            });
        });
    }

    setupCollisions() {
        // set collision if property "collides" was checked when making the map in in Tiled
        this.map.setCollisionByProperty({collides: true}, true, false, this.collisionLayer);
        this.physics.add.collider(this.player.getSprite(), this.collisionLayer);
    }

    addPlayer(id) {
        // TODO: make function lol
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
            debug: false
        }
    },
    pixelArt: true,
    zoom: 2,
    parent: 'game'
}

let game = new Phaser.Game(config);