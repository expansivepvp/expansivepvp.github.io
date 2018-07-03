/**
 * @classdesc a class to store properties of the player
 * 
 * @param {number} x x position of the player
 * @param {number} y y position of the player
 */
export default class Player {
    constructor() {
        this.velocity = new Phaser.Math.Vector2(0, 0);
        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false
        }
        this.sprite = {};
        this.normalSpeed = 150;
        this.id = "";
        this.moveDirection = {
            x: false,
            y: false    
        };

        // collisions cause velocity to be set to 0, so we have to manually reset the velocity
        this.currentVelocity = {
            x: 0,
            y: 0
        };
    }

    setSprite(sprite) {
        this.sprite = sprite;
    }

    getSprite() {
        return this.sprite;
    }

    setCoords(x, y) {
        this.getSprite().setPosition(x, y);
    }

    getCoords() {
        return new Phaser.Math.Vector2(this.getSprite().x, this.getSprite().y);
    }

    getVelocity() {
        // make sure diagonal movement is not faster than side-to-side movement
        let normalizedVelocity = this.velocity.normalize();
        return new Phaser.Math.Vector2(normalizedVelocity.x * this.normalSpeed, normalizedVelocity.y * this.normalSpeed);
    }

    setVelocityX(vx) {
        this.velocity.x = vx;
    }

    setVelocityY(vy) {
        this.velocity.y = vy;
    }

    setID(id) {
        this.id = id;
    }

    getID() {
        return this.id;
    }

    setMoveDirectionX(movingX) {
        this.moveDirection.x = movingX;
    }

    setMoveDirectionY(movingY) {
        this.moveDirection.y = movingY;
    }

    getMoveDirection() {
        return this.moveDirection;
    }

    setCurrentVelocityX(v) {
        this.currentVelocity.x = v;
    }

    setCurrentVelocityY(v) {
        this.currentVelocity.y = v;
    }

    getCurrentVelocity() {
        return this.currentVelocity;
    }
}