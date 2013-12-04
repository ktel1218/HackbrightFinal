function main() {
    //////////////////////////  GLOBALS   /////////////////////////////

    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursor = {
        "x": 0,
        "y": 0,
    };
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var world = {
        "width": 8000,
        "height": 8000,
    };
    var defaultMaxSpeed = 300;
    // var metaballMaxThreshold = 100;
    var particles = [];
    var metaballs = [];
    var global_sprites = [];
    var quadTreeNodes = [];
    var random = new Alea("Katie", "Lefevre", "rulz", 5000);
    var player1;
    var quadtreeRoot;
    var quadTreeLimit = world.width / 4;
    var timer = 0;
    var timeLimit = 3000; //one minute
    var numberOfBoids = 2000;
    var remainingBoidCount;

    /////////////////////  SERVER EXPERIMENT   ////////////////////////


    // var socket = io.connect('http://localhost', {port: 8888, transports: ["websocket"]});
    

    ///////////////  MOUSE/WINDOW LISTENERS   //////////////////

    this.onmousemove = function (e) {
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    };

    document.body.addEventListener('touchmove', function (e) {
        e.preventDefault();
        cursor.x = e.targetTouches[0].pageX; // alert pageX coordinate of touch point
        cursor.y = e.targetTouches[0].pageY;
    }, false);

    window.onresize = function (e) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        player1.updateDisplay();
        if (timer > timeLimit) {
            end();
        }
    };


    //////////////////////////  PLAYER   /////////////////////////////



    function Player(x, y, radius) {

        this.maxSpeed = defaultMaxSpeed;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = 0;
        this.influenceRadius = radius * 4 * (this.speed + 20);
        this.displayX = canvas.width / 2;
        this.displayY = canvas.height / 2;
        this.superState = false;
        this.poisoned = false;

        return this;
    }

    Player.prototype.updateDisplay = function () {

        this.displayX = canvas.width / 2;
        this.displayY = canvas.height / 2;
    };

    Player.prototype.step = function () {
        this.onCollisionDetect(this.nearbySprites);
        this.move();
    };

    Player.prototype.move = function () {



        this.velocity = getDirectionTo(this.displayX, this.displayY, cursor.x, cursor.y);
        this.speed = getMagnitude(this.velocity);

        //SUPERFAST

        if (this.superState) {
            this.maxSpeed = defaultMaxSpeed * 2;
            this.speed *= 2;
            // this.radius *= 1.25;
        }
        else if (this.poisoned) {
            this.maxSpeed = defaultMaxSpeed / 2;
            this.speed /= 2;
        }
        else {
            this.maxSpeed = defaultMaxSpeed;
            // this.radius /= 1.25;
        }

        //do not exceed max speed
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
            this.velocity = normalize(this.velocity);
            this.velocity.x *= this.speed;
            this.velocity.y *= this.speed;
        }

        // player is never directly at cursor!
        if (this.speed > 1) {
            this.x += this.velocity.x / 18;
            this.y += this.velocity.y / 18;
        //if player is within 1 px of cursor, stop.
        }

        // wall collision

        if (this.x - this.radius <= 0) this.x = 0 + this.radius;
        if (this.x + this.radius >= world.width) this.x = world.width - this.radius;
        if (this.y - this.radius <= 0) this.y = 0 + this.radius;
        if (this.y + this.radius >= world.height) this.y = world.height - this.radius;

        // socket.emit('locationUpdate', {x: this.x, y: this.y});
    };

    Player.prototype.draw = function () {

        var bodyColor;
        var irisColor;
        var pupilColor;
        if (this.superState) {
            bodyColor = "rgba(40,0,75,1)";//dark purple
            irisColor = "rgba(0, 255, 100, 0.85)"; // green
            pupilColor = "white";
            if (2 % Math.floor(random() * 2) === 0) {//strobe
                pupilColor = "rgba(0, 200, 0, 0.85)";//dark green
                irisColor = "white";
                bodyColor = "rgba(150,150,250,0.85)";//light blue
            }
        }
        else if (this.poisoned) {
            bodyColor = "rgba(155, 175, 155, 0.85)"; // grey green
            pupilColor = "rgba(0, 155, 0, 0.85)";
            irisColor = "rgb(150, 125, 125)";


        }
        else {
            bodyColor = "rgba(220,220,220,.85)";
            irisColor = "white";
            pupilColor = "rgba(0, 200, 100, 0.85)";
        }


        context.beginPath();
        context.fillStyle = bodyColor;
        context.arc(this.displayX, this.displayY, this.radius, 0, Math.PI * 2, true);
        context.fill();

        var eyeDisplayX = this.displayX + (this.velocity.x / 670) * this.radius;
        var eyeDisplayY = this.displayY + (this.velocity.y / 670) * this.radius;

        context.fillStyle = irisColor;
        context.beginPath();
        context.arc(eyeDisplayX, eyeDisplayY, this.radius / 1.8, 0, Math.PI * 2, true);
        context.fill();

        eyeDisplayX = this.displayX + (this.velocity.x / 550) * this.radius;
        eyeDisplayY = this.displayY + (this.velocity.y / 550) * this.radius;

        context.fillStyle = pupilColor;
        context.beginPath();
        context.arc(eyeDisplayX, eyeDisplayY, this.radius / 2.5, 0, Math.PI * 2, true);
        context.fill();

    };

    Player.prototype.onCollisionDetect = function (list) {

        for (var i = 0; i < list.length; i++) {
            var player = this;
            var collisionObject = player.collisionCheck(list[i]);
            if (collisionObject && collisionObject instanceof Boid) {
                player.radius += 40 / (player.radius * 1.5); // get bigger but approach some max

                collisionObject.die();
                //snitch
                if (collisionObject instanceof Snitch) {
                    if (player.poisoned) {
                        player.poisoned = false;
                    }
                    player.superState = true;

                    setTimeout(function () {
                        player.superState = false;
                    }, 8000);
                }
                //poison
                if (collisionObject instanceof Poison) {
                    if (player.superState) {
                        player.superState = false;
                    }
                    player.poisoned = true;

                    setTimeout(function () {
                        player.poisoned = false;
                    }, 8000);
                }
                else {
                    remainingBoidCount --; //only decrease count if its not a poison Boid
                }
            }
        }
    };

    Player.prototype.collisionCheck = function (object) {
        var a;

        if (object instanceof Boid) {
            a = this.radius + object.radius;
        }
        var dx = object.x - this.x;
        var dy = object.y - this.y;
        var d = dx * dx + dy * dy;
        if (d <= a * a) {
            return object;
        }
    };

    //used for Metaball graphics
    Player.prototype.getDiameter = function (x, y) {
        return this.radius / (Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    };

    // example from NickQ on making a getter
    // Player.prototype.diameter.__defineGetter__("value", function(){
    //     return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    // });



    /////////////////////////  PARTICLES   ////////////////////////////





    function Square(x, y, size, layer) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.layer = layer;
        return this;
    }

    Square.prototype.draw = function () {
        var displayX = this.x - (player1.x * this.layer);
        var displayY = this.y - (player1.y * this.layer);
        var displayWidth = this.width * this.layer;
        var displayHeight = this.height * this.layer;
        context.fillStyle = "rgba(200, 0, 100," + 1 / (this.layer * 2) + ")";
        context.fillRect(displayX, displayY, displayWidth, displayHeight);
    };


    function Circle(x, y, radius, layer) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.layer = layer;
        return this;
    }

    Circle.prototype.draw = function () {
        var displayX = this.x - (player1.x * this.layer);
        var displayY = this.y - (player1.y * this.layer);
        var displayRadius = this.radius * this.layer;
        context.fillStyle = "rgba(0, 200, 100, " + 1 / (this.layer * 2) + ")";
        context.beginPath();
        context.arc(displayX, displayY, displayRadius, 0, Math.PI * 2, true);
        context.fill();
    };




    //////////////////////////   BOID   ///////////////////////////////




    function Boid(x, y) {
        this.radius = 15;
        this.influenceRadius = this.radius * 1.5;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        this.maxSpeed = 0.0008;
        return this;
    }

    Boid.prototype.draw = function () {
        this.displayX = this.x - (player1.x - player1.displayX);
        this.displayY = this.y - (player1.y - player1.displayY);
        context.fillStyle = "rgba(200, 0, 200, 0.85)";
        context.beginPath();
        context.arc(this.displayX, this.displayY, this.radius, 0, Math.PI * 2, true);
        context.fill();
    };

    Boid.prototype.step = function () {
        this.move();
    };

    Boid.prototype.move = function () {

        this.velocity = {
            "x": 0,
            "y": 0
        };

        for (var i = 0; i < this.nearbySprites.length; i++) {
            var sprite = this.nearbySprites[i];
            var partialV = getDirectionTo(sprite.x, sprite.y, this.x, this.y);
            var speed = getMagnitude(partialV);
            partialV.x *= 1 / (speed * speed * speed);
            partialV.y *= 1 / (speed * speed * speed);
            if (sprite instanceof Player) {//evade
                partialV.x *= sprite.radius;
                partialV.y *= sprite.radius;
            }
            else if (2000 > speed && speed > 85) {//group
                partialV.x = -partialV.x;
                partialV.y = -partialV.y;
            }
            this.velocity.x += partialV.x;
            this.velocity.y += partialV.y;
        }

        this.speed = getMagnitude(this.velocity);
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
            this.velocity = normalize(this.velocity);
            this.velocity.x *= this.speed;
            this.velocity.y *= this.speed;
        }


        this.x += this.velocity.x * 10000;
        this.y += this.velocity.y * 10000;


        //// wall collision

        this.x += (1 / Math.pow(this.x, 2) - 1 / (Math.pow(world.width - this.x, 2))) * 30000;
        this.y += (1 / Math.pow(this.y, 2) - 1 / (Math.pow(world.height - this.y, 2))) * 30000;
        if (this.x - this.radius <= 0) this.x = 0 + this.radius;
        if (this.x + this.radius >= world.width) this.x = world.width - this.radius;
        if (this.y - this.radius <= 0) this.y = 0 + this.radius;
        if (this.y + this.radius >= world.height) this.y = world.height - this.radius;

    };

    Boid.prototype.collisionCheck = function (object) {
        var a = this.radius + object.radius;
        var dx = object.x - this.x;
        var dy = object.y - this.y;
        var d = dx * dx + dy * dy;
        return (d <= a * a);
    };

    Boid.prototype.die = function () {
        var index = global_sprites.indexOf(this);
        global_sprites.splice(index, 1);
        context.fillStyle = "rgba(220, 0, 0, 0.85)";
        context.beginPath();
        context.arc(this.displayX, this.displayY, this.radius * 3, 0, Math.PI * 2, true);
        context.fill();
    };

    function Snitch(x, y) {
        //this class flashes and increases the players speed
        this.radius = 15;
        this.influenceRadius = this.radius * 1.5;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        this.maxSpeed = 0.00085;

        return this;
    }

    Snitch.prototype = new Boid();
    Snitch.prototype.draw = function () {
        this.displayX = this.x - (player1.x - player1.displayX);
        this.displayY = this.y - (player1.y - player1.displayY);

        context.fillStyle = "rgba(200, 0, 200, 0.85)";


        if (300 % Math.floor(random() * 300) === 0) {
            context.fillStyle = "rgba(200, 200, 255, 1)";
        }

        context.beginPath();
        context.arc(this.displayX, this.displayY, this.radius, 0, Math.PI * 2, true);
        context.fill();
    };


    function Poison(x, y) {
        //this class is slower and decreases the players speed
        this.radius = 15;
        this.influenceRadius = this.radius * 1.5;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        this.maxSpeed = 0.00075;

        return this;
    }

    Poison.prototype = new Boid();
    Poison.prototype.draw = function () {
        this.displayX = this.x - (player1.x - player1.displayX);
        this.displayY = this.y - (player1.y - player1.displayY);

        context.fillStyle = "rgba(255, 0, 140, 0.85)";

        context.beginPath();
        context.arc(this.displayX, this.displayY, this.radius, 0, Math.PI * 2, true);
        context.fill();
    };


    ////////////////////////   QUADTREE   /////////////////////////////




    function Quadtree(x, y, width, height) {
        this.threshold = 10;
        this.sprites = [];
        this.quadrants = [];
        this.rectangle = new Rectangle(x, y, width, height);
        return this;
    }

    Quadtree.prototype.addSprites = function (sprites) {
        // console.log(sprites);
        // for each quadrant, find out which particles it contains
        // if it's above the threshold, divide
        for (var s = 0; s < sprites.length; s++) {
            if (this.rectangle.overlapsWithSprite(sprites[s])) {
                this.sprites.push(sprites[s]);
            }
        }
        if (this.sprites.length > this.threshold &&
            quadTreeNodes.length < quadTreeLimit) {
            this.subdivide();
        }
        else {
            for (var i = 0; i < this.sprites.length; i++) {
                for (var j = 0; j < this.sprites.length; j++) {
                    if (this.sprites[i] !== this.sprites[j]) {
                        this.sprites[i].nearbySprites.push(this.sprites[j]);
                    }
                }
            }
        }
    };
    Quadtree.prototype.subdivide = function () {
        // makes 4 child Quadtrees with new rect bounds. each new quadrant passed list of particles, each adds its own particles, and parent quadrant's particle list is set to zero

        var w2 = this.rectangle.width / 2;
        var h2 = this.rectangle.height / 2;
        var x = this.rectangle.x;
        var y = this.rectangle.y;

        this.quadrants.push(new Quadtree(x, y, w2, h2));
        this.quadrants.push(new Quadtree(x + w2, y, w2, h2));
        this.quadrants.push(new Quadtree(x + w2, y + h2, w2, h2));
        this.quadrants.push(new Quadtree(x, y + h2, w2, h2));

        for (var i = 0; i < this.quadrants.length; i++) {
            this.quadrants[i].addSprites(this.sprites);

            quadTreeNodes.push(this.quadrants[i]);

        }
        this.sprites = [];
    };

    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    Rectangle.prototype.overlapsWithSprite = function (sprite) {
        var sMinX = sprite.x - sprite.influenceRadius;
        var sMaxX = sprite.x + sprite.influenceRadius;
        var sMinY = sprite.y - sprite.influenceRadius;
        var sMaxY = sprite.y + sprite.influenceRadius;
        return ((sMinX < this.x + this.width && sMaxX > this.x) &&
                    (sMinY < this.y + this.height && sMaxY > this.y));
    };

    Rectangle.prototype.draw = function () {
        var displayX = this.x - (player1.x - player1.displayX);
        var displayY = this.y - (player1.y - player1.displayY);
        context.strokeStyle = "white";
        // context.fillStyle = "rgba(0,200,100,0.1)";
        context.strokeRect(displayX, displayY, this.width, this.height);
    };



    //////////////////////////   MATH   ///////////////////////////////





    function getMagnitude(vector) {
        var x = vector.x;
        var y = vector.y;
        var n = Math.sqrt(x * x + y * y);
        return Math.abs(n);
    }

    function getDirectionTo(x1, y1, x2, y2) {
        var deltaY = y2 - y1;
        var deltaX = x2 - x1;

        var direction = {
            "x": deltaX,
            "y": deltaY,
        };
        return direction;
    }

    function sumVectors(listOfVectors) {
        var sumX = 0;
        var sumY = 0;
        for (var i = 0; i < listOfVectors.length; i++) {
            sumX += listOfVectors[i].x;
            sumY += listOfVectors[i].y;
        }
        var summedVector = {
            "x": sumX,
            "y": sumY,
        };
        return summedVector;
    }

    function normalize(vector) {
        //make a unit vector
        var length = getMagnitude(vector);
        var normalizedVector = {
            "x": (vector.x / length),
            "y": (vector.y / length),
        };
        return normalizedVector;
    }



    /////////////////////  INITIALIZE AND LOOP   ////////////////////////





    function init() {

        //intialize player
        player1 = new Player(world.width / 2, world.height / 2, 20);
        global_sprites.push(player1);

        makeBoids(numberOfBoids);

        makeParticles();

        //initialize quadtree
        quadtreeRoot = new Quadtree(0, 0, world.width, world.height);

    }

    function makeBoids(num_of_boids) {
        //normal boids
        for (var i = 0; i < num_of_boids; i++) {
            var boid = new Boid(random() * world.width, random() * world.height);
            global_sprites.push(boid);
        }
        //snitches/prizes
        for (var i = 0; i < num_of_boids / 50; i++) {
            var snitch = new Snitch(random() * world.width, random() * world.height);
            global_sprites.push(snitch);
        }
        for (var i = 0; i < num_of_boids / 50; i++) {
            var poison = new Poison(random() * world.width, random() * world.height);
            global_sprites.push(poison);
            numberOfBoids ++;
        }

        remainingBoidCount = numberOfBoids;
    }

    function makeParticles() {
        for (var i = 0; i < world.width / 16; i++) {
            var foreLayer = 1 + random() * 5; // foreground depth index(1 - 5)
            var foresquare = new Circle(
                canvas.width / 2 + random() * world.width * foreLayer,
                canvas.height / 2 + random() * world.height * foreLayer,
                5, foreLayer);
            particles.push(foresquare);
        }
        for (var j = 0; j < world.width / 16; j++) {
            var backLayer = 0.2 + random() * 0.4; // background index (.2 - .4)
            var backsquare = new Circle(
                canvas.width / 2 + random() * world.width * backLayer,
                canvas.height / 2 + random() * world.height * backLayer,
                5, backLayer);
            particles.push(backsquare);
        }
    }

    function spriteCount() {
        context.fillStyle = "rgba(240, 240, 240, 0.8";
        context.beginPath();
        context.arc(45, 50, 45, 0, Math.PI * 2, true);
        context.fill();
        context.fillStyle = "rgb(50, 50, 50)";
        context.textAlign = "center";
        context.font = "30px Tahoma";
        context.fillText(numberOfBoids - remainingBoidCount, 45, 60);
    }

    function countDown() {
        context.fillStyle = "rgba(240, 240, 240, 0.5";
        context.beginPath();
        var centerX = canvas.width - 50;
        var centerY = 50;

        context.arc(centerX, centerY, 45, 0, Math.PI * 2, true);
        context.fill();
        var radians = timer / timeLimit * 2;
        context.fillStyle = "rgba(40, 0, 75, 0.75)";

        context.beginPath();
        context.arc(centerX, centerY, 40, 0, Math.PI * radians, true);
        context.lineTo(centerX, centerY);
        context.fill();
    }

    function timeOut() {
        timer ++;
        return (timer > timeLimit);
    }


    function prepCanvas() {
        //set background color, clears before each frame
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    function prepQuadTree() {
        quadtreeRoot.quadrants = [];
        quadtreeRoot.sprites = [];
        quadTreeNodes = [];
        quadTreeNodes.push(quadtreeRoot);
        quadtreeRoot.addSprites(global_sprites);
    }

    function animate() {
        for (var i = 0; i < global_sprites.length; i++) {
            global_sprites[i].step();
            global_sprites[i].nearbySprites = [];
        }

    }

    function render() {

        for (var i = 0; i < global_sprites.length; i++) {
            global_sprites[i].draw();
        }
        for (var j = 0; j < particles.length; j++) {
            particles[j].draw();
        }
        for (var k = 0; k < quadTreeNodes.length; k++) {
            quadTreeNodes[k].rectangle.draw();
        }
        spriteCount();
        countDown();
    }

    function loop() {
        prepCanvas();
        prepQuadTree();
        animate();
        render();
        if (timeOut()) {
            console.log("TIMEOUT");
            end();
            return;
        }
        requestAnimationFrame(loop);
    }

    function end() {
        var score = (-remainingBoidCount / numberOfBoids * 100) + 100;
        if (score < 1) {
            score = score.toFixed(2);
        }
        else {
            score = Math.round(score);
        }
        prepCanvas();
        context.fillStyle = "white";
        context.font = "75px Verdana";
        context.textAlign = "center";
        context.fillText(score + "% CLEARED", canvas.width / 2, canvas.height / 2);
    }

    init();
    loop();
    // end();
}