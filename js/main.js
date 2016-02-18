window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render } );
    
    function preload() {
        //taken from last assignment ****
        game.load.image('sky', 'assets/images/background.jpg');
        game.load.image('ground', 'assets/images/platform.png');
        game.load.image('treat', 'assets/images/dog_treat.png'); //must fix
        game.load.spritesheet('puppy', 'assets/images/puppy_by_l0velyblue-d3dbil8.png', 30, 33);
        
        //apparently it says that Firefox doesn't do mp3 files, so include otherformats as well
        game.load.audio('dog_sounds', ['assets/sfx/dog_bark.wav', 'assets/sfx/dog_bark.mp3', 'assets/sfx/dog_bark.ogg']); //cut down to one bark
        game.load.audio('dog_jump', ['assets/sfx/Jump_00.mp3', 'assets/sfx/Jump_00.wav']);
        
        //my own work
        game.load.audio('music', ["assets/music/Like I'm Gonna Lose You.mp3", "assets/music/Like I'm Gonna Lose You.ogg", "assets/music/Like I'm Gonna Lose You.wav"]);
        //****
    }
    
    //also taken from last assignment *****
    var player;
    var platforms;
    var cursors;
    
    var treats;
    var score = 0;
    var score_text;
    var gameOver;
    
    //audio vars
    var dog_sounds;
    var dog_jump;
    var music;
    var sounds;
    //******
    
    //introduce a timer
    var timer;
    var spawner;
    
    function create() {
        //********* taken from last assignment
        //  We're going to be using physics, so enable the Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  A simple background for our game
        game.add.sprite(0, 0, 'sky');

        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = game.add.group();
        
        //  We will enable physics for any object that is created in this group
        platforms.enableBody = true;
        
        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 64, 'ground');
        
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        ground.scale.setTo(2, 2);
        
        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;
        
        // The player and its settings
        player = game.add.sprite(32, game.world.height - 150, 'puppy');
        
        //scale the puppy to be larger
        player.scale.x += 0.6;
        player.scale.y += 0.6;
        
        //  We need to enable physics on the player
        game.physics.arcade.enable(player);
        
        //  Player physics properties. Give the little guy a slight bounce.
        player.body.bounce.y = 0.1; //shouldn't need to bounce that much.
        player.body.gravity.y = 250; //need to test to see if this will hinder jumping onto the first 2 platforms.
        player.body.collideWorldBounds = true;
        
        //  Our two animations, walking left and right.
        player.animations.add('left', [3, 4, 5], 10, true);
        player.animations.add('right', [6, 7, 8], 10, true);
        player.animations.add('idle', [0, 1, 2], 10, true); //animated idle state
        
        //remake ledges to be different
        var ledge = platforms.create(500, 600, 'ground');
        ledge.body.immovable = true;

        ledge = platforms.create(-175, 250, 'ground');
        ledge.body.immovable = true;
        
        ledge = platforms.create(500, 300, 'ground');
        ledge.body.immovable = true;
        
        ledge = platforms.create(200, 400, 'ground');
        ledge.body.immovable = true;
        
        
        //introduce the notion of a time limit.
        timer = game.time.create(false);
        //30 second timer
        timer.loop(Phaser.Timer.SECOND * 30, stopGame, this); //will kill timer once stopGame is called
        timer.start();
        
        //spawn random treats every half second -> 500 milliseconds
        spawner = game.time.create(false);
        spawner.loop(Phaser.Timer.SECOND * 0.5, spawnTreats, this);
        spawner.start();
        
        //  Finally some treats to eat
        treats = game.add.group();

        //  We will enable physics for any treat that is created in this group
        treats.enableBody = true;

        /*for (var i = 0; i < 12; i++)
        {
            //  Create a treat inside of the 'treats' group
            var treat = treats.create(i * 70, 0, 'treat');

            //scale down the treats
            treat.scale.x -= 0.8;
            treat.scale.y -= 0.8;

            //  Let gravity do its thing
            treat.body.gravity.y = 250;
            //found a bug where treats that hit the ground didn't actually hit the ground and fell through
            treat.body.collideWorldBounds = true;

            //  This just gives each treat a slightly random bounce value
            treat.body.bounce.y = 0.7 + Math.random() * 0.3;

            if (i == 1 || i == 3 || i == 5)
                treat.body.velocity.x = 200 + Math.random() * 100;
            else if (i == 4 || i == 7 || i == 11)
                treat.body.velocity.x = -150 + Math.random() * 100;
        }
        */
        //  The score
        score_text = game.add.text(16, 16, 
            'Score: ' + score, { fontSize: '32px', fill: '#000' });

        //  Our controls.
        cursors = game.input.keyboard.createCursorKeys();

        //Add in our audio
        dog_sounds = game.add.audio('dog_sounds'); dog_sounds.volume = 1;
        dog_jump = game.add.audio('dog_jump'); dog_jump.volume = 0.5;
        music = game.add.audio('music'); music.volume = 1;
        music.play();


        //Taken from http://phaser.io/examples/v2/audio/loop
        sounds = [dog_sounds, dog_jump, music];

        //  Being mp3 files these take time to decode, so we can't play them instantly
        //  Using setDecodedCallback we can be notified when they're ALL ready for use.
        //  The audio files could decode in ANY order, we can never be sure which it'll be.

        game.sound.setDecodedCallback(sounds, update, this); //may break the game using update function as param, we'll see
    }
    
    function update() {
        //same update as previous game
        //  Collide the player and the treats with the platforms
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(treats, platforms);

        //adding collision between treats
        game.physics.arcade.collide(treats, treats);

        //  Checks to see if the player overlaps with any of the treats, if he does call the collectTreat function
        game.physics.arcade.overlap(player, treats, collectTreat, null, this);

        //  Reset the players velocity (movement)
        // added extra details to movements
        player.body.velocity.x = 0;

        if (cursors.left.isDown)
        {
            //  Move to the left
            player.body.velocity.x = -200;

            if (!player.body.touching.down || cursors.up.isDown)
            {
                //use a still image for jumping while moving
                player.animations.stop();

                player.frame = 5;
            }
            else
                player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player.body.velocity.x = 200;

            if (!player.body.touching.down || cursors.up.isDown)
            {
                //use a still image for jumping while moving
                player.animations.stop();
                player.frame = 7;
            }
            else
                player.animations.play('right');
        }
        else if (!player.body.touching.down)
        {
            player.animations.stop();
        }
        else if (player.body.touching.down && cursors.down.isDown)
        {
            //sitting, rather than idle
            player.animations.stop();
            player.frame = 1;
        }
        else
        {
            //animated idle state
            player.animations.play('idle');
        }

        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.body.velocity.y = -325;

            //add in jump sound
            dog_jump.play();
        }
    }
    
    //this is the function that is called when the player overlaps a treat - "eats" the treat
    function collectTreat(player, treat) {
        // Removes the treat from the screen
        treat.kill();
        
        //add sound for eating the treat
        dog_sounds.play();

        //  Add and update the score
        score = score + 10;
        score_text.text = "Score: " + score;
    }
    
    //randomly spawns treats on a timer
    function spawnTreats() {
        var treat = treats.create((Math.random() * 700)+50, 0, 'treat'); //spawns a treat at a random location
        
        //format for the treat (its settings)
        //scale down the treats
        treat.scale.x -= 0.8;
        treat.scale.y -= 0.8;

        //  Let gravity do its thing
        treat.body.gravity.y = 250;
        //found a bug where treats that hit the ground didn't actually hit the ground and fell through
        treat.body.collideWorldBounds = true;

        //  This just gives each treat a slightly random bounce value
        treat.body.bounce.y = 0.7 + Math.random() * 0.3;
        
        //now give random x velocity
        var num = Math.random(); //if the random number generated is less than 0.5, then we move right
        var modifier = 0;
        if (num < 0.5)
            modifier = 1; //moves to the right direction
        else
            modifier = -1; //moves to the left direction
        
        treat.body.velocity.x = (Math.random() * 200 * modifier) + (100 * modifier); //random number between 100 <-> 300 || -300 <-> -100
    }
    
    //terminates the game
    function stopGame() {
        //stop the timer
        timer.stop();
        //reset game input
        game.input.reset();
        
        game.input.keyboard.enabled = false; //stop keyboard usage
        
        //stop the player character
        player.animations.stop();
        player.frame = 5;
        
        //add text to tell the player the game ended
        var text = game.add.text(350, 32, "Game Over", {fontSize: '32px', fill: '#FF0000'});
        
        dog_jump.mute = true; dog_jump.volume = 0;
        dog_sounds.mute = true; dog_sounds.volume = 0;
    }
    
    function render() {
        game.debug.text("Time Remaining: " + (timer.duration.toFixed(0) / Phaser.Timer.SECOND), 16, 72);
    }
};
