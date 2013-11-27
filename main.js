function main(){
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
        "width": 6000,
        "height": 6000,
    };
    var defaultMaxSpeed = 300;
    var metaballMaxThreshold = 100;
    var particles = [];
    var metaballs = [];
    var global_sprites = [];
    var quadTreeNodes = [];


    //////////////////  MOUSE/WINDOW LISTENERS   /////////////////////


    this.onmousemove = function(e){
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    };

    window.onresize = function(event) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        player1.updateDisplay();
    };


    //////////////////////////  PLAYER   /////////////////////////////




    function Player(x,y,radius){

        this.maxSpeed = defaultMaxSpeed;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.displayX = canvas.width/2;
        this.displayY = canvas.height/2;

        return this;
    }

    Player.prototype.updateDisplay = function(){
        //if in collision with other players:
        //this.displayX = shared center x
        //this.displayY = shared center y
        this.displayX = canvas.width/2;
        this.displayY = canvas.height/2;
    };

    Player.prototype.move = function(){
        this.velocity = getDirectionTo(this.displayX, this.displayY, cursor.x,cursor.y);
        this.speed = getMagnitude(this.velocity);

        //do not exceed max speed
        if (this.speed > this.maxSpeed){
        this.speed = this.maxSpeed;
        this.velocity = normalize(this.velocity);
        this.velocity.x *= this.speed;
        this.velocity.y *= this.speed;
        }

        // player is never directly at cursor!
        if(this.speed > 1){
            this.x += this.velocity.x/18;
            this.y += this.velocity.y/18;
        //if player is within 1 px of cursor, stop.
        }

        // wall collision
        this.x += (1/(this.x*this.x)-1/((world.width-this.x)*(world.width-this.x)))*500000;
        this.y += (1/(this.y*this.y)-1/((world.height-this.y)*(world.height-this.y)))*500000;
    };

    Player.prototype.draw = function(){
        context.beginPath();
        context.fillStyle = "rgba(200,0,200,.85)";
        // context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        context.arc(this.displayX,this.displayY,this.radius,0,Math.PI*2,true);
        context.fill();
    };

    Player.prototype.getDiameter = function(){
        return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    };

    // Player.prototype.diameter.__defineGetter__("value", function(){
    //     return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    // });

    // Player.diameter

    /////////////////////////  PARTICLES   ////////////////////////////





    function Square(x,y,size,layer){
            this.x = x;
            this.y = y;
            this.width = size;
            this.height = size;
            this.layer = layer;
            return this;
    }
    Square.prototype.draw = function(){
        var displayX = this.x - (player1.x*this.layer);
        var displayY = this.y - (player1.y*this.layer);
        var displayWidth = this.width * this.layer;
        var displayHeight = this.height * this.layer;
        context.fillStyle = "rgba(200,0,100," + 1/(this.layer*2) + ")";
        context.fillRect(displayX, displayY, displayWidth, displayHeight);
    };


    function Circle(x, y, radius, layer){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.layer = layer;
        return this;
    }
    Circle.prototype.draw = function(){
        var displayX = this.x - (player1.x*this.layer);
        var displayY = this.y - (player1.y*this.layer);
        var displayRadius = this.radius * this.layer;
        context.fillStyle = "rgba(0,200,100," + 1/(this.layer*2) + ")";
        context.beginPath();
        context.arc(displayX,displayY,displayRadius,0,Math.PI*2,true);
        context.fill();
    };

    /////////////////////////  OTHER PLAYER   ////////////////////////////





    function Metaball(x,y,radius){

        this.x = x;
        this.y = y;
        this.radius = Math.pow(radius,3);

        return this;
    }

    Metaball.prototype.getDiameter = function(x, y){
            return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    };


    //////////////////////////   BOID   ///////////////////////////////




    function Boid(x,y){
        this.radius = 15;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        return this;
    }

    Boid.prototype.draw = function(){
        var displayX = this.x - (player1.x-player1.displayX);
        var displayY = this.y - (player1.y-player1.displayY);
        context.beginPath();
        context.arc(displayX, displayY, this.radius, 0,Math.PI*2,true);
        context.fill();
    };

    Boid.prototype.move = function(){

        this.velocity = {
            "x": 0,
            "y": 0
        };

        for (var i = 0; i < this.nearbySprites.length; i++) {
            sprite = this.nearbySprites[i];
            var partialV = getDirectionTo(sprite.x, sprite.y, this.x, this.y);
            this.speed = getMagnitude(partialV);
            partialV.x *= 1/(this.speed * this.speed * this.speed);
            partialV.y *= 1/(this.speed * this.speed * this.speed);
            if (sprite instanceof Player){//evade
                partialV.x *= 10;
                partialV.y *= 10;
            }
            else if (2000 > this.speed && this.speed > 90){//group
                partialV.x = -partialV.x;
                partialV.y = -partialV.y;
            }
            this.velocity.x += partialV.x;
            this.velocity.y += partialV.y;
        }

        if (getMagnitude(this.velocity) > 0.000008){//reduce sensitivity
            // d = normalize(d);
            this.x += this.velocity.x * 10000;
            this.y += this.velocity.y * 10000;
        }

        //// wall collision

        this.x += (1/(this.x*this.x)-1/((world.width-this.x)*(world.width-this.x)))*500;
        this.y += (1/(this.y*this.y)-1/((world.height-this.y)*(world.height-this.y)))*500;

    };


    Boid.prototype.collisionDetect = function(object){
        var a = this.radius + object.radius;
        var dx = object.x - this.x;
        var dy = object.y - this.y;
        var d = dx*dx+dy*dy;
        return (d <= a*a);
    };



    ////////////////////////   QuadTree   /////////////////////////////




    function Quadtree(x, y, width, height){
        this.threshold = 10;
        this.sprites = [];
        this.quadrants = [];
        this.rectangle = new Rectangle(x, y, width, height);
        return this;
    }

    Quadtree.prototype.addSprites = function(sprites){
        // console.log(sprites);
        // for each quadrant, find out which particles it contains
        // if it's above the threshold, divide
        for (var s = 0; s < sprites.length; s++) {
            if (this.rectangle.overlapsWithSprite(sprites[s])){
                this.sprites.push(sprites[s]);
            }
        }
        if (this.sprites.length > this.threshold &&
            quadTreeNodes.length < 1000){
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
    Quadtree.prototype.subdivide = function(){
        // makes 4 child Quadtrees with new rect bounds. each new quadrant passed list of particles, each adds its own particles, and parent quadrant's particle list is set to zero

        var w2 = this.rectangle.width/2;
        var h2 = this.rectangle.height/2;
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

    function Rectangle(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        return this;
    }

    Rectangle.prototype.overlapsWithSprite = function(sprite){
            sMinX = sprite.x - sprite.radius;
            sMaxX = sprite.x + sprite.radius;
            sMinY = sprite.y - sprite.radius;
            sMaxY = sprite.y + sprite.radius;
            return ((sMinX < this.x + this.width && sMaxX > this.x) &&
                        (sMinY < this.y + this.height && sMaxY > this.y));
    };

    Rectangle.prototype.draw = function(){
        displayX = this.x - (player1.x-player1.displayX);
        displayY = this.y - (player1.y-player1.displayY);
        context.strokeStyle = "white";
        // context.fillStyle = "rgba(0,200,100,0.1)";
        context.strokeRect(displayX,displayY,this.width,this.height);
    };



    //////////////////////////   MATH   ///////////////////////////////





    function getMagnitude(vector){
            var x = vector.x;
            var y = vector.y;
            // console.log(x,y);
            var n = Math.sqrt(x*x + y*y);
            // console.log(n);
            // console.log(Math.abs(n));
            return Math.abs(n);
    }

    function getDirectionTo(x1,y1,x2,y2){
        var deltaY = y2 - y1;
        var deltaX = x2 - x1;

        var direction = {
            "x": deltaX,
            "y": deltaY,
        };
        // console.log(direction.x, direction.y);
        return direction;
    }

    function sumVectors(listOfVectors){
        var sumX = 0;
        var sumY = 0;
        for (var i = 0; i < listOfVectors.length; i++){
            sumX += listOfVectors[i].x;
            sumY += listOfVectors[i].y;
        }
        var summedVector = {
            "x": sumX,
            "y": sumY,
        };
        return summedVector;
    }

    function normalize(vector){
        //make a unit vector
        var length = getMagnitude(vector);
        var normalizedVector = {
            "x": (vector.x/length),
            "y": (vector.y/length),
        };
        return normalizedVector;
    }

    /////////////////////  INITIALIZE AND LOOP   ////////////////////////

    // function drawMetaballs(){
    //     if (metaballs !== null) {
    //         for (var x = 0; x < canvas.width; x++) {
    //             for (var y = 0; y < canvas.height; y++) {
    //                 var sum = 0; //reset the summation
    //                 for (var i = 0; i < metaballs.length; i ++){
    //                     // console.log("x: ", x, "y: ",y);
    //                     // console.log(metaballs[i].getDiameter(x,y));
    //                     sum += metaballs[i].getDiameter(x,y);
    //                     //sum = NAN
    //                     // console.log("sum: ", sum);
    //                 }
    //                 if (sum >= metaballMaxThreshold){
    //                     context.fillStyle = "black";
    //                     context.fillRect(x,y,1,1);
    //                     // console.log("drawing!");
    //                 }
    //             }
    //         }
    //     }
    // }


    player1 = new Player(world.width/2,world.height/2,20);//starting x, y, and radius

    global_sprites.push(player1);

    quadtreeRoot = new Quadtree(0,0, world.width, world.height);
    for (var i=0; i<1000; i++){
        var boid = new Boid(Math.random()*world.width, Math.random()*world.height);
        global_sprites.push(boid);
    }

    // metaball = makeMetaball(100,100,40);
    // metaballs.push(player1);
    // metaballs.push(metaball);

//TODO adjust on window resize

    for (var i = 0; i < world.width/16; i++) {
        var foreLayer = 1+Math.random()*5; // foreground depth index(1 - 5)
        var foresquare = new Circle(
            canvas.width/2+Math.random()*world.width*foreLayer,
            canvas.height/2+Math.random()*world.height*foreLayer,
            5, foreLayer);
        particles.push(foresquare);
    }
    for (var j = 0; j < world.width/16; j++) {
        var backLayer = 0.2+Math.random()*0.4; // background index (.2 - .4)
        var backsquare = new Circle(
            canvas.width/2+Math.random()*world.width*backLayer,
            canvas.height/2+Math.random()*world.height*backLayer,
            5, backLayer);
        particles.push(backsquare);
    }

    function prepCanvas(){
        //set background color, clears before each frame
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "black";
        context.fillRect(0,0,canvas.width, canvas.height);
    }
    function prepQuadTree(){
        quadtreeRoot.quadrants = [];
        quadtreeRoot.sprites = [];
        quadTreeNodes = [];
        quadTreeNodes.push(quadtreeRoot);
        quadtreeRoot.addSprites(global_sprites);
    }

    function animate(){
        // player1.move();
        for (var i = 0; i < global_sprites.length; i++) {
            global_sprites[i].move();
            global_sprites[i].nearbySprites = [];
        }
    }

    function render(){
        // player1.draw();
        // drawMetaballs();
        for (var i = 0; i < global_sprites.length; i++) {
            global_sprites[i].draw();
        }
        for (var i = 0; i < particles.length; i++) {
            particles[i].draw();
        }
        for (var i = 0; i < quadTreeNodes.length; i++) {
            quadTreeNodes[i].rectangle.draw();
        };
    }

    function loop(){
        prepCanvas();
        prepQuadTree();
        animate();
        render();
        requestAnimationFrame(loop);
    }
    loop();
}