import Constants from './constants.js';

/**
 * @classdesc a class to store properties of the player
 * 
 * @param {number} x x position of the player
 * @param {number} y y position of the player
 */
export default class Player {
    constructor() {
        this.coords = Constants.STARTING_COORDS;
        this.velocity = new Phaser.Math.Vector2(0, 0);
    }

    setSprite(sprite) {
        this.sprite = sprite;
    }

    getSprite() {
        return this.sprite;
    }

    setCoords(x, y) {
        this.coords.setXY(x, y);
    }

    getCoords() {
        return this.coords;
    }

    getVelocity() {
        // make sure diagonal movement is not faster than side-to-side movement
        let normalizedVelocity = this.velocity.normalize();
        return new Phaser.Math.Vector2(normalizedVelocity.x * Constants.PLAYER_SPEED_NORMAL, normalizedVelocity.y * Constants.PLAYER_SPEED_NORMAL);
    }

    setVelocityX(vx) {
        this.velocity.x = vx;
    }

    setVelocityY(vy) {
        this.velocity.y = vy;
    }
}