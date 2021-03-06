/**
 * @classdesc
 * A list of constants to be used throughout the project
 */
class Constants {
    static get STARTING_COORDS() {
        return new Phaser.Math.Vector2(20, 20);
    }

    static get PLAYER_SPEED_NORMAL() {
        return 150;
    }
}

module.exports = Constants;