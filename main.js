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
    var defaultMaxSpeed = 1200;
    var particles = [];
    var player1 = {
        "x" : 0,
        "y" : 0};

    //////////////////////////  MOUSE   /////////////////////////////


    this.onmousemove = function(e){
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    };


    //////////////////////////  PLAYER   /////////////////////////////


    var Player = {
        "maxSpeed": defaultMaxSpeed,

        //has x, y, displayX, displayY and radius

        move: function(){
            this.velocity = getDirectionTo(this.displayX, this.displayY, cursor.x, cursor.y);
            this.speed = getMagnitude(this.velocity);

            // player is never directly at cursor!
            if(this.speed > 1){
                this.x += this.velocity.x/18;
                this.y += this.velocity.y/18;
            //if player is within 1 px of cursor, stop.
            }

            if (this.speed > this.maxSpeed)this.speed = this.maxSpeed;//do not exceed max speed

            // wall collision
            this.x += (1/(this.x*this.x)-1/((world.width-this.x)*(world.width-this.x)))*500000;
            this.y += (1/(this.y*this.y)-1/((world.height-this.y)*(world.height-this.y)))*500000;

        },

        //  move all draw funcs to separate render section
        draw: function(){
            context.beginPath();
            context.fillStyle = "rgba(200,0,200,.85)";
            // context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
            context.arc(this.displayX,this.displayY,this.radius,0,Math.PI*2,true);
            context.fill();
        },
    };


    function makePlayer(x,y,radius){
        Empty = function(){};
        Empty.prototype = Player;
        var player = new Empty();
        player.x = x;
        player.y = y;
        player.radius = radius;
        player.displayX = canvas.width/2;
        player.displayY = canvas.height/2;

        return player;
    }

    /////////////////////////  PARTICLES   ////////////////////////////

    var Square = {
        //has x, y, size

        draw: function(){
            var displayX = this.x - (player1.x*this.layer);
            var displayY = this.y - (player1.y*this.layer);
            var displayWidth = this.width * this.layer;
            var displayHeight = this.height * this.layer;
            context.fillStyle = "rgba(200,0,100," + 1/(this.layer*2) + ")";
            context.fillRect(displayX, displayY, displayWidth, displayHeight);
            // console.log(player1.x, player1.y);

        },
    };

    var Circle = {
        //has x, y, and radius

        draw: function(){
            var displayX = this.x - (player1.x*this.layer);
            var displayY = this.y - (player1.y*this.layer);
            var displayRadius = this.radius * this.layer;
            context.fillStyle = "rgba(200,0,100," + 1/(this.layer*2) + ")";
            context.beginPath();
            context.arc(displayX,displayY,displayRadius,0,Math.PI*2,true);
            context.fill();
        },
    };

function makeSquare(x,y,size,layer){//layer is between 0 and 2
    Empty = function(){};
    Empty.prototype = Square;
    var square = new Empty();
    square.x = x;
    square.y = y;
    square.width = size;
    square.height = size;
    square.layer = layer;
    return square;
}


function makeCircle(x,y,radius,layer){//layer is between 0 and 2
    Empty = function(){};
    Empty.prototype = Circle;
    var circle = new Empty();
    circle.x = x;
    circle.y = y;
    circle.radius = radius;
    circle.layer = layer;
    return circle;
}

    //////////////////////////   MATH   ///////////////////////////////


    function getMagnitude(vector){
            var x = vector.x;
            var y = vector.y;
            var n = Math.sqrt(x*x + y*y);
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


    player1 = makePlayer(world.width/2,world.height/2,20);//starting x, y, and radius
    for (var i = 0; i < world.width/16; i++) {
        var foreLayer = 1+Math.random()*5; // foreground depth index(1 - 5)
        var foresquare = makeCircle(
            350+Math.random()*world.width*foreLayer,
            250+Math.random()*world.height*foreLayer,
            5, foreLayer);
        particles.push(foresquare);
    }
    for (var j = 0; j < world.width/16; j++) {
        var backLayer = 0.2+Math.random()*0.4; // background index (.2 - .4)
        var backsquare = makeCircle(
            350+Math.random()*world.width*backLayer,
            250+Math.random()*world.height*backLayer,
            5, backLayer);
        particles.push(backsquare);
    }

    function prepCanvas(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function animate(){
        player1.move();
    }

    function render(){
        player1.draw();
        for (var i = 0; i < particles.length; i++) {
            particles[i].draw();
        }
    }

    function loop(){
        prepCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }
    // console.log(particles);
    loop();
}