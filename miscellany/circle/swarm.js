    
function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursorX;
    var cursorY;

    var wallForceFactor = 3;
    var playerForceFactor = 8;
    var defaultMaxSpeed = 300;

    var boids = [];
    var message = [];

    this.onmousemove = function(e){
        cursorX = e.pageX;
        cursorY = e.pageY;
    };

    this.onclick = function(e){
        for (var i = 0; i < 20; i++) {
            var boid = makeBoid(Math.random()*canvas.width, Math.random()*canvas.height);
            boids.push(boid);
            console.log(boid);
        }
    };

    var Char = {
        "x": 0,
        "y": 0,
        "radius":20,//health
        "maxSpeed": defaultMaxSpeed,
        "speed": 0,

        move: function(){
            var ang = getDirection(this.x, this.y, cursorX, cursorY);
            this.speed = getDistance(this.x, this.y, cursorX, cursorY);

            // player is never directly at cursor!
            if(this.speed > 1){
                this.x = this.x + Math.cos(ang) * (this.speed/25);
                this.y = this.y + Math.sin(ang) * (this.speed/25);
            //if player is within 1 px of cursor, stop.
            }

            if (this.speed > this.maxSpeed)this.speed = this.maxSpeed;//do not exceed max speed

        },

        draw: function(){
            context.beginPath();
            context.fillStyle = "rgba(200,0,200,.85)";
            context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
            context.fill();
        },


    };

    var Boid = {
        "r": 10,

        move: function(){

            var d = computeForceVector(this, boids, char1);
            if (getMagnitude(d) > 0.00006){//reduce sensitivity
                // d = normalize(d);
                this.x += d.x * 8000;
                this.y += d.y * 8000;
            }
        },

        draw: function(){

            context.fillStyle = "rgb(0,200,100)";
            context.beginPath();

            context.arc(this.x,this.y,this.r,0,Math.PI*2,true);
            context.fill();
        },
    };

    function makeChar(x,y){
        Empty = function(){};
        Empty.prototype = Char;
        charA = new Empty();
        charA.x = x;
        charA.y = y;
        return charA;
    }

    function makeBoid(x,y){
        Empty = function(){};
        Empty.prototype = Boid;
        boid = new Empty();
        boid.x = x;
        boid.y = y;
        return boid;
    }

    function prepCanvas(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function getDistance(x1, y1, x2, y2)
    {
        squareX = Math.pow((x1-x2),2);
        squareY = Math.pow((y1-y2),2);
        return Math.sqrt(squareX + squareY);
    }

    function getDirection(x1, y1, x2, y2)
    {
        deltaY = y2 - y1;
        deltaX = x2 - x1;
        return Math.atan2(deltaY,deltaX);
    }

    function getMagnitude(vector){
        var x = vector.x;
        var y = vector.y;
        var n = Math.sqrt(x*x + y*y);
        return Math.abs(n);
    }

    function getDirectionTo(fromObject, toObject){
        var x1 = fromObject.x;
        var y1 = fromObject.y;
        var x2 = toObject.x;
        var y2 = toObject.y;

        var deltaY = y2 - y1;
        var deltaX = x2 - x1;

        var direction = {
            "x": deltaX,
            "y": deltaY,
        };
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
        var length = getMagnitude(vector);
        var normalizedVector = {
            "x": (vector.x/length),
            "y": (vector.y/length),
        };
        return normalizedVector;
    }

    function computePointForce(boid, obstacle){
        var boidx = boid.x;
        var boidy = boid.y;
        var otherx = obstacle.x;
        var othery = obstacle.y;
        var direction = getDirectionTo(obstacle, boid);
        var magnitude = getMagnitude(direction);
        //return a vector in the direction of d
        direction.x *= 1/(magnitude * magnitude * magnitude);
        direction.y *= 1/(magnitude * magnitude * magnitude); //weighted by magnitude squared and another to get unit vector?
        return direction;
    }

    function computeWallForce(boid){
        var velocity = {x: 0, y: 0};

        //set x force to the 1 divided by the square of the boids distance from the x wall (stay in the middle, move violently away)
        velocity.x = 1/(boid.x * boid.x) -
                    1/((canvas.width - boid.x)*(canvas.width - boid.x));
        //same for the y        
        velocity.y = 1 / (boid.y * boid.y) - 1 / ((canvas.height - boid.y) * (canvas.height - boid.y));
        velocity.x *= wallForceFactor;
        velocity.y *= wallForceFactor;

        return velocity;
    }

    function computeCharForce(boid, player){
        var velocity = {x: 0, y: 0};
        var force = computePointForce(boid, player);
        velocity.x += force.x;
        velocity.y += force.y;
        velocity.x *= playerForceFactor;
        velocity.y *= playerForceFactor;
        return velocity;
    }

    function computeOtherBoidForce(boid, boidList){
        var velocity = {x: 0, y:0};
        for(var i = 0; i < boidList.length; i++){
        //avoid unit affecting itself, force would be infinite
            if(boid !== boidList[i]){
            var force = computePointForce(boid, boidList[i]);
            var magnitude = getMagnitude(force);
            if (magnitude > 0.00002 && magnitude < 0.00008){//can split
                force.x = -force.x;
                force.y = -force.y;
            }
            velocity.x += force.x;
            velocity.y += force.y;
            }
        }
        return velocity;
    }

    function computeForceVector(boid, boidList, player){
        var vWall = computeWallForce(boid);
        var vBoids = computeOtherBoidForce(boid, boidList);
        var vChar = computeCharForce(boid, player);
        return sumVectors([vWall, vBoids, vChar]);
    }

    function boidCount(){
        context.fillStyle="rgba(240,240,240,0.8";
        context.beginPath();
        context.arc(45,45,40,0,Math.PI*2,true);
        context.fill();
        context.fillStyle="rgb(50,50,50)";
        context.font="30px Helvetica";
        context.fillText(boids.length,19,55);
    }

    //make char
    char1 = makeChar(10,10);
    //make boids
    for (var i=0; i<100; i++){
        var boid = makeBoid(50+Math.random()*500, 50+Math.random()*300);
        boids.push(boid);
    }

    function animate(){
        char1.move();
        for (var i=0; i<boids.length; i++){
            boids[i].move();
        }
    }

    function render(){

        for (var i=0; i<boids.length; i++){
            boids[i].draw();
        }
        char1.draw();
        boidCount();
    }

    function loop(){
        prepCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();
}