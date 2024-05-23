import Phaser from "phaser";

const gameWidth = window.innerWidth;
const gameHeight = window.innerHeight;

class FlappyBirdScene extends Phaser.Scene {
  constructor() {
    super({ key: "FlappyBirdScene" });
    this.isGameOver = false;
    this.score = 0;
  }

  preload() {
    this.load.image("background-day", "./assets/sprites/background-day.png");
    this.load.image("ground", "./assets/sprites/base.png");
    this.load.image("bird-mid", "./assets/sprites/bluebird-midflap.png");
    this.load.image("bird-up", "./assets/sprites/bluebird-upflap.png");
    this.load.image("bird-down", "./assets/sprites/bluebird-downflap.png");
    this.load.image("pipe", "./assets/sprites/pipe.png");
    this.load.image("greeting", "./assets/sprites/message.png");
    this.load.image("mobile", "./assets/sprites/phone.png");
    this.load.image("gameover", "./assets/sprites/gameover.png");
    // Load audio
    this.load.audio("flap", "./assets/audio/wing.ogg");
    this.load.audio("hit", "./assets/audio/hit.ogg");
    this.load.audio("score", "./assets/audio/point.ogg");
    this.load.audio("die", "./assets/audio/die.ogg");
    this.load.audio("soundtrack", "./assets/audio/soundtrack.ogg");
    this.load.audio("gameover", "./assets/audio/gameover.ogg");
  }

  create() {
    this.isGameOver = false;
    this.score = 0;

    let backgroundScaleX =
      gameWidth / this.textures.get("background-day").getSourceImage().width;
    let backgroundScaleY =
      gameHeight / this.textures.get("background-day").getSourceImage().height;
    let groundScale =
      gameWidth / this.textures.get("ground").getSourceImage().width;

    let background = this.add.image(
      gameWidth / 2,
      gameHeight / 2,
      "background-day"
    );
    background.setScale(backgroundScaleX, backgroundScaleY);

    this.ground = this.physics.add.staticGroup();
    let ground = this.ground.create(gameWidth / 2, gameHeight - 32, "ground");
    ground.setScale(groundScale, 1).refreshBody();
    ground.setDepth(1); // Ensure ground is above the pipes

    // Create bird animation from individual images
    this.anims.create({
      key: "flap",
      frames: [
        { key: "bird-down" },
        { key: "bird-mid" },
        { key: "bird-up" },
        { key: "bird-mid" },
      ],
      frameRate: 10,
      repeat: -1,
    });

    this.sound.add("soundtrack", { loop: true }).play();

    this.bird = this.physics.add
      .sprite(gameWidth * 0.125, gameHeight / 2, "bird-mid")
      .setScale(2)
      .play("flap");

    this.bird.setCollideWorldBounds(true);
    this.bird.body.allowGravity = false;
    this.bird.setActive(false).setVisible(false);

    this.pipes = this.physics.add.group();
    this.timer = this.time.addEvent({
      delay: 1500,
      callback: this.addRowOfPipes,
      callbackScope: this,
      loop: true,
      paused: true,
    });

    this.input.on("pointerdown", this.flap, this);
    this.input.keyboard.on("keydown-SPACE", this.flap, this);

    this.physics.add.collider(
      this.bird,
      this.ground,
      this.hitGround,
      null,
      this
    );
    this.physics.add.collider(this.bird, this.pipes, this.hitPipe, null, this);
    this.physics.add.overlap(this.bird, this.pipes, this.checkPass, null, this);

    // Welcome message
    if (gameWidth <= 600) {
      this.greeting = this.add.image(gameWidth / 2, gameHeight / 2, "mobile");
    } else {
      this.greeting = this.add.image(gameWidth / 2, gameHeight / 2, "greeting");
    }
    this.greeting.setInteractive();
    this.greeting.on("pointerdown", this.startGame, this);
    this.input.keyboard.on("keydown-SPACE", this.startGame, this);
    this.input.keyboard.on("pointerdown", this.startGame, this);

    // Score text
    this.scoreText = this.add
      .text(gameWidth / 2, 50, this.score.toString(), {
        fontSize: "64px",
        fill: "#FCA146",
        stroke: "#FFF",
        strokeThickness: 6,
        fontFamily: "Upheaval",
      })
      .setOrigin(0.5, 0)
      .setDepth(1);
    this.scoreText.setText("");
  }

  update() {
    if (this.bird.y > gameHeight && !this.isGameOver) {
      this.sound.play("die");
      this.showGameOver();
    }

    // Check if bird has passed through the pipes
    this.pipes.children.iterate((pipe) => {
      this.checkPass(this.bird, pipe);
    });

    // Adjust the bird's angle based on its velocity
    if (this.bird.body.velocity.y < 0) {
      this.bird.angle = -33; // Point upwards when moving up
    } else if (this.bird.body.velocity.y > 0 && this.bird.angle < 90) {
      this.bird.angle += 2.5; // Gradually point downwards when falling
    }
  }

  startGame() {
    if (this.isGameOver) {
      this.scene.restart();
      return;
    }

    this.greeting.setVisible(false);
    this.bird.setActive(true).setVisible(true);
    this.bird.body.allowGravity = true;
    this.timer.paused = false;
  }

  incrementScore() {
    this.score += 1 / 8;
    this.scoreText.setText(this.score);
    this.sound.play("score");
  }

  checkPass(bird, pipe) {
    if (pipe.passed) return; // If the pipe has been passed, do nothing
    if (bird.x > pipe.x) {
      pipe.passed = true; // Set the passed flag to true
      this.incrementScore(); // Increment the score
    }
  }

  flap() {
    if (!this.bird.active || this.isGameOver) return;
    this.bird.setVelocityY(-350);
    this.sound.play("flap");
  }

  addPipe(x, y, type) {
    const pipe = this.pipes.create(x, y, type);
    pipe.body.allowGravity = false;
    pipe.setVelocityX(-200);
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
    pipe.setDepth(0);
    pipe.passed = false;
  }

  addRowOfPipes() {
    const gap = gameHeight * (Math.random() * (0.7 - 0.4) + 0.4);
    const holePosition = Math.floor(Math.random() * 5); // The position of the hole
    for (let i = 0; i < 10; i++) {
      if (i < holePosition || i > holePosition + 1) {
        let yPosition = i * 60 + 10;
        if (i > holePosition + 1) {
          yPosition += gap; // Add the gap to the y position of the pipes after the hole
          this.addPipe(gameWidth, yPosition, "pipe");
        } else {
          this.addPipe(gameWidth, yPosition, "pipe");
        }
      }
    }
  }

  hitGround() {
    if (!this.isGameOver) {
      this.sound.play("hit");
      this.showGameOver();
    }
  }

  hitPipe() {
    if (!this.isGameOver) {
      this.sound.play("hit");
      this.showGameOver();
    }
  }

  showGameOver() {
    this.isGameOver = true;
    this.bird.setActive(false).setVisible(false);
    this.pipes.clear(true, true);
    this.timer.remove();
    this.add.image(gameWidth / 2, gameHeight / 2, "gameover");
    this.sound.stopByKey("soundtrack");
    this.sound.play("gameover");
    this.input.on("pointerdown", this.startGame, this);
    this.input.keyboard.on("keydown-SPACE", this.startGame, this);
    this.time.delayedCall(2000, () => {
      this.scoreText.setText("Score: " + this.score);
      // Create a new text object for the restart message
      this.restartText = this.add
        .text(gameWidth / 2, 100, "Press to restart", {
          fontSize: "32px",
          fill: "#FCA146",
          stroke: "#FFF",
          strokeThickness: 6,
          fontFamily: "Upheaval",
        })
        .setOrigin(0.5, 0)
        .setDepth(1);
      this.tweens.add({
        targets: this.restartText,
        alpha: { start: 1, to: 0.5 },
        scale: { start: 1, to: 1.1 },
        ease: "Linear",
        duration: 1000,
        repeat: -1, // -1: infinity
        yoyo: true,
      });
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: gameWidth,
  height: gameHeight,
  parent: "app",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
      debug: false,
    },
  },
  scene: FlappyBirdScene,
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
  let newGameWidth = window.innerWidth;
  let newGameHeight = window.innerHeight;

  game.scale.resize(newGameWidth, newGameHeight);
  game.scene.scenes.forEach((scene) => {
    scene.cameras.main.setBounds(0, 0, newGameWidth, newGameHeight);
    scene.physics.world.setBounds(0, 0, newGameWidth, newGameHeight);
  });
});
