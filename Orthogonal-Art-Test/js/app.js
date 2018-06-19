let cursors;
let player;

class Main extends Phaser.Scene {
    preload() {
        this.load.tilemapTiledJSON('world', './assets/tilemap.json');
        this.load.image('tileset_orthagonal', './assets/tileset_orthagonal.png');

        this.load.spritesheet('dude', './assets/knight.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        let map = this.make.tilemap({key: 'world'});
        let tileset = map.addTilesetImage('tileset_orthagonal');

        let ground = map.createStaticLayer('Ground', tileset, 0, 0);

        player = this.physics.add.sprite(50, 50, 'dude', 1);

        let collision = map.createStaticLayer('Collisions', tileset, 0, 0);
        let decorations = map.createStaticLayer('Decorations', tileset, 0, 0);

        map.setCollisionByProperty({collides: true}, true, false, collision);
        this.physics.add.collider(player, collision);
        
        player.body.setSize(19, 32); 
        //player.body.setOffset(3, 8); 
        
        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();

        // this.anims.create({
        //     key: 'left',
        //     frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        //     frameRate: 10,
        //     repeat: -1
        // });
        
        // this.anims.create({
        //     key: 'turn',
        //     frames: [ { key: 'dude', frame: 4 } ],
        //     frameRate: 20
        // });
        
        // this.anims.create({
        //     key: 'right',
        //     frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        //     frameRate: 10,
        //     repeat: -1
        // });

        // this.input.keyboard.on('keydown_SPACE', function (event) {
        //     fireBullet();
        // });
    }

    update() {
        if (cursors.left.isDown) {
            player.setVelocityX(-150);
            // player.anims.play('left', true);
            player.setFrame(2);
        } else if (cursors.right.isDown) {
            player.setVelocityX(150);
            // player.anims.play('right', true);
            player.setFrame(3)
        } else {
            player.setVelocityX(0);
            // player.anims.play('turn');
        }
    
        if (cursors.up.isDown) {
            player.setVelocityY(-150);
            player.setFrame(0)
        } else if (cursors.down.isDown) {
            player.setVelocityY(150);
            player.setFrame(1);
        } else {
            player.setVelocityY(0);
        }
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