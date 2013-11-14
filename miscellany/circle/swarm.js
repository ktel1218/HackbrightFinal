    
function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var speed = 6.0;
    var wallForceFactor = 3;
    var playerForceFactor = 5;
    var boids = [];
    var defaultMaxSpeed = 400;
    var cursorX;
    var cursorY;
    var message = [];

    this.onmousemove = function(e){
        cursorX = e.pageX;
        cursorY = e.pageY;
    };

    this.onclick = function(e){
        console.log(message);
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


        touch: function(object){
            
            if (object.radius > 3){
                this.radius += 0.1;
                object.radius -= 0.2;
            }
        }
    };

    var Boid = {
        "r": 10,
        "x": 100,
        "y": 100,

        draw: function(){
            context.fillStyle = "rgb(0,200,100)";

            context.arc(this.x,this.y,this.r,0,Math.PI*2,true);
            context.fill();
        },

        move: function(){

            var d = computeForceVector(this, boids, char1);
            if (getMagnitude(d) > 0.00002){//reduce sensitivity
                d = normalize(d);
                this.x += d.x *5;
                this.y += d.y * 5;
            }
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
        velocity.x = 1 / (boid.x * boid.x) - 1 / ((canvas.width - boid.x) * (canvas.width - boid.x));//set x force to the 1 divided by the square of the boids distance from the x wall (stay in the middle, move violently away)
        velocity.y = 1 / (boid.y * boid.y) - 1 / ((canvas.height - boid.y) * (canvas.height - boid.y));//same for the y
        velocity.x *= wallForceFactor;
        velocity.y *= wallForceFactor;

        return velocity;
    }

    function computeCharForce(boid, player){
        var velocity = {x: 0, y: 0};
        var force = computePointForce(boid, player);
        velocity.x += force.x;
        velocity.y += force.y;
        velocity.x *= wallForceFactor;
        velocity.y *= wallForceFactor;
        return velocity;
    }

    function computeOtherBoidForce(boid, boidList){
        var velocity = {x: 0, y:0};
        for(var i = 0; i < boidList.length; i++){//how do I avoid unit affecting itself? Duhhh object comparison 
            if(boid !== boidList[i]){//force would be infinite
            var force = computePointForce(boid, boidList[i]);
            if (getMagnitude(force) < 0.00007){
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
        message.push(vBoids);
        return sumVectors([vWall, vBoids, vChar]);
    }

    //make char
    char1 = makeChar(10,10);
    //make boids
    for (var i=0; i<30; i++){
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
    }

    function loop(){
        prepCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();
}