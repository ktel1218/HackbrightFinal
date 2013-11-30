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
        "width": 3000,
        "height": 3000,
    };
    var defaultMaxSpeed = 300;
    var metaballMaxThreshold = 100;
    var particles = [];
    var metaballs = [];
    var global_sprites = [];
    var quadTreeNodes = [];
    var random = new Alea("Katie", "Lefevre", "rulz", 5000);


    //////////////////  MOUSE/WINDOW LISTENERS   /////////////////////


    this.onmousemove = function(e){
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    };

    document.body.addEventListener('touchmove', function(e){
        e.preventDefault();
        cursor.x = e.targetTouches[0].pageX; // alert pageX coordinate of touch point
        cursor.y = e.targetTouches[0].pageY;
    }, false);

    window.onresize = function(e) {
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
        this.speed = 0;
        this.influenceRadius = radius * 4 * (this.speed+20);
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

    Player.prototype.step = function(){
        this.onCollisionDetect(this.nearbySprites);
        this.move();
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

        if (this.x-this.radius <= 0) this.x = 0 + this.radius;
        if (this.x+this.radius >= world.width) this.x = world.width - this.radius;
        if (this.y-this.radius <= 0) this.y = 0 + this.radius;
        if (this.y+this.radius >= world.height) this.y = world.height - this.radius;
    };

    Player.prototype.draw = function(){
        context.beginPath();
        context.fillStyle = "rgba(220,220,220,.85)";
        // context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        context.arc(this.displayX,this.displayY,this.radius,0,Math.PI*2,true);
        context.fill();

        var eyeDisplayX = this.displayX + (this.velocity.x/670)*this.radius;
        var eyeDisplayY = this.displayY + (this.velocity.y/670)*this.radius;

        context.fillStyle = "white";
        context.beginPath();
        context.arc(eyeDisplayX,eyeDisplayY,this.radius/1.8,0,Math.PI*2,true);
        context.fill();

        eyeDisplayX = this.displayX + (this.velocity.x/550)*this.radius;
        eyeDisplayY = this.displayY + (this.velocity.y/550)*this.radius;

        context.fillStyle = "rgba(0,0,220,0.85)";
        context.beginPath();
        context.arc(eyeDisplayX,eyeDisplayY,this.radius/2.5,0,Math.PI*2,true);
        context.fill();

    };

    Player.prototype.onCollisionDetect = function(list){
        for (var i = 0; i < list.length; i++) {
            var collisionObject = this.collisionCheck(list[i]);
            if(collisionObject && collisionObject instanceof Boid){
                this.radius += 40/(this.radius*1.5); // get bigger but approach some max
                // index = global_sprites.indexOf(list[i]);
                // global_sprites.splice(index,1);
                collisionObject.die();
            }
        }
    };

    Player.prototype.collisionCheck = function(object){
        var a;
        // if (object instanceof Player){
        //     a = this.influenceRadius + object.influenceRadius;
        // }

        if (object instanceof Boid){
            a = this.radius + object.radius;
        }
        var dx = object.x - this.x;
        var dy = object.y - this.y;
        var d = dx*dx+dy*dy;
        if (d <= a*a){
            return object;
        }
    };

    //used for Metaball graphics
    Player.prototype.getDiameter = function(){
        return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    };

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


    function OtherPlayer(x,y,radius){

        this.maxSpeed = defaultMaxSpeed;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = 0;
        this.influenceRadius = radius * 4 * (this.speed+20);
        this.playerCursor = {
            "x": world.width/2,
            "y": world.height/2
        };
        return this;
    }


    OtherPlayer.prototype.step = function(){
        this.onCollisionDetect(this.nearbySprites);
        this.move();
    };

    OtherPlayer.prototype.move = function(){
        // num = 20+Math.random()*9;
        // num *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
        // this.playerCursor.x = this.x + num;

        // num = 20+Math.random()*9;
        // num *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
        // this.playerCursor.y = this.y + num;

        // this.velocity = getDirectionTo(this.playerCursor.x, this.playerCursor.y);
        // this.speed = getMagnitude(this.velocity);

        // //do not exceed max speed
        // if (this.speed > this.maxSpeed){
        // this.speed = this.maxSpeed;
        // this.velocity = normalize(this.velocity);
        // this.velocity.x *= this.speed;
        // this.velocity.y *= this.speed;
        // }

        // // player is never directly at cursor!
        // if(this.speed > 1){
        //     this.x += this.velocity.x/18;
        //     this.y += this.velocity.y/18;
        // //if player is within 1 px of cursor, stop.
        // }

        // wall collision

        // if (this.x-this.radius <= 0) this.x = 0 + this.radius;
        // if (this.x+this.radius >= world.width) this.x = world.width - this.radius;
        // if (this.y-this.radius <= 0) this.y = 0 + this.radius;
        // if (this.y+this.radius >= world.height) this.y = world.height - this.radius;

    };

    OtherPlayer.prototype.draw = function(){
        this.displayX = this.x - (player1.x-player1.displayX);
        this.displayY = this.y - (player1.y-player1.displayY);
        context.beginPath();
        context.fillStyle = "rgba(220,220,220,.85)";
        // context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        context.arc(this.displayX,this.displayY,this.radius,0,Math.PI*2,true);
        context.fill();
    };

    OtherPlayer.prototype.onCollisionDetect = function(list){
        for (var i = 0; i < list.length; i++) {
            var collisionObject = this.collisionCheck(list[i]);
            if(collisionObject && collisionObject instanceof Boid){
                this.radius += 40/(this.radius*1.5); // get bigger but approach some max
                index = global_sprites.indexOf(list[i]);
                global_sprites.splice(index,1);
            }
        }
    };

    OtherPlayer.prototype.collisionCheck = function(object){
        var a;
        // if (object instanceof Player){
        //     a = this.influenceRadius + object.influenceRadius;
        // }

        if (object instanceof Boid){
            a = this.radius + object.radius;
        }

        var dx = object.x - this.x;
        var dy = object.y - this.y;
        var d = dx*dx+dy*dy;
        if (d <= a*a){
            return object;
        }
    };

    Player.prototype.getDiameter = function(){
        return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    };

    // Player.prototype.diameter.__defineGetter__("value", function(){
    //     return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    // });

    // Player.diameter


    // function Metaball(x,y,radius){

    //     this.x = x;
    //     this.y = y;
    //     this.radius = Math.pow(radius,3);

    //     return this;
    // }

    // Metaball.prototype.getDiameter = function(x, y){
    //         return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    // };


    //////////////////////////   BOID   ///////////////////////////////




    function Boid(x,y){
        this.radius = 15;
        this.influenceRadius = this.radius *1.5;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        this.maxSpeed = 0.0008;
        return this;
    }

    Boid.prototype.draw = function(){
        this.displayX = this.x - (player1.x-player1.displayX);
        this.displayY = this.y - (player1.y-player1.displayY);
        context.fillStyle = "rgba(200,0,200,0.85)";
        context.beginPath();
        context.arc(this.displayX, this.displayY, this.radius, 0,Math.PI*2,true);
        context.fill();
    };

    Boid.prototype.step = function(){
        this.move();
    };

    Boid.prototype.move = function(){

        this.velocity = {
            "x": 0,
            "y": 0
        };

        for (var i = 0; i < this.nearbySprites.length; i++) {
            sprite = this.nearbySprites[i];
            var partialV = getDirectionTo(sprite.x, sprite.y, this.x, this.y);
            var speed = getMagnitude(partialV);
            partialV.x *= 1/(speed * speed * speed);
            partialV.y *= 1/(speed * speed * speed);
            if (sprite instanceof Player || sprite instanceof OtherPlayer){//evade
                partialV.x *= sprite.radius;
                partialV.y *= sprite.radius;
            }
            else if (2000 > speed && speed > 90){//group
                partialV.x = -partialV.x;
                partialV.y = -partialV.y;
            }
            this.velocity.x += partialV.x;
            this.velocity.y += partialV.y;
        }

        this.speed = getMagnitude(this.velocity);
        if (this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
            this.velocity = normalize(this.velocity);
            this.velocity.x *= this.speed;
            this.velocity.y *= this.speed;
        }


        this.x += this.velocity.x * 10000;
        this.y += this.velocity.y * 10000;


        //// wall collision

        this.x += (1/(this.x*this.x)-1/((world.width-this.x)*(world.width-this.x)))*3000;
        this.y += (1/(this.y*this.y)-1/((world.height-this.y)*(world.height-this.y)))*3000;
        if (this.x-this.radius <= 0) this.x = 0 + this.radius;
        if (this.x+this.radius >= world.width) this.x = world.width - this.radius;
        if (this.y-this.radius <= 0) this.y = 0 + this.radius;
        if (this.y+this.radius >= world.height) this.y = world.height - this.radius;

    };

    Boid.prototype.collisionCheck = function(object){
        var a = this.radius + object.radius;
        var dx = object.x - this.x;
        var dy = object.y - this.y;
        var d = dx*dx+dy*dy;
        return (d <= a*a);
    };

    Boid.prototype.die = function(){
        index = global_sprites.indexOf(this);
        global_sprites.splice(index,1);
        context.fillStyle = "rgba(220,0,0,0.85)";
        context.beginPath();
        context.arc(this.displayX, this.displayY, this.radius*3, 0,Math.PI*2,true);
        context.fill();
    };



    ////////////////////////   QUADTREE   /////////////////////////////




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
            sMinX = sprite.x - sprite.influenceRadius;
            sMaxX = sprite.x + sprite.influenceRadius;
            sMinY = sprite.y - sprite.influenceRadius;
            sMaxY = sprite.y + sprite.influenceRadius;
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

    function makeBoids(num_of_boids){
        // var list_of_boid_objects = [];
        for (var i = 0; i < num_of_boids; i++) {
            var boid = new Boid(random()*world.width, random()*world.height);
            // list_of_boid_objects.push(boid);
            global_sprites.push(boid);
        }
        // return list_of_boid_objects;
    }

    function spriteCount(){
        context.fillStyle="rgba(240,240,240,0.8";
        context.beginPath();
        context.arc(45,45,40,0,Math.PI*2,true);
        context.fill();
        context.fillStyle="rgb(50,50,50)";
        context.font="30px Helvetica";
        context.fillText(global_sprites.length,19,55);
    }


    //intialize player
    player1 = new Player(world.width/2,world.height/2,20);//starting x, y, and radius
    global_sprites.push(player1);
    //initialize OTHER player
    player2 = new OtherPlayer(300, 300, 20);
    global_sprites.push(player2);
    //initialize quadtree
    quadtreeRoot = new Quadtree(0,0, world.width, world.height);
    makeBoids(500);

//TODO adjust on window resize

    for (var i = 0; i < world.width/16; i++) {
        var foreLayer = 1+random()*5; // foreground depth index(1 - 5)
        var foresquare = new Circle(
            canvas.width/2+random()*world.width*foreLayer,
            canvas.height/2+random()*world.height*foreLayer,
            5, foreLayer);
        particles.push(foresquare);
    }
    for (var j = 0; j < world.width/16; j++) {
        var backLayer = 0.2+random()*0.4; // background index (.2 - .4)
        var backsquare = new Circle(
            canvas.width/2+random()*world.width*backLayer,
            canvas.height/2+random()*world.height*backLayer,
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
            global_sprites[i].step();
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
        // spriteCount();
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