let cursors;
let player;

class Main extends Phaser.Scene {
    preload() {
        this.load.tilemapTiledJSON('world', './/assets/tilemap.json');
        this.load.image('tileset_orthagonal', './assets/tileset_orthagonal.png');

        this.load.spritesheet('knight', './assets/knight.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        let map = this.make.tilemap({key: 'world'});
        let tileset = map.addTilesetImage('tileset_orthagonal');

        let ground = map.createStaticLayer('Ground', tileset, 0, 0);
        let collision = map.createStaticLayer('Collisions', tileset, 0, 0);
        let decorations = map.createStaticLayer('Decorations', tileset, 0, 0);

        player = this.physics.add.sprite(50, 50, 'knight', 1);

        // set collision if property "collides" was checked when making the map in in Tiled
        map.setCollisionByProperty({collides: true}, true, false, collision);
        this.physics.add.collider(player, collision);
        
        // change size of collision hitbox
        player.body.setSize(19, 32); 
        
        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (cursors.left.isDown) {
            player.setVelocityX(-150);
            player.setFrame(2);
        } else if (cursors.right.isDown) {
            player.setVelocityX(150);
            player.setFrame(3)
        } else {
            player.setVelocityX(0);
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