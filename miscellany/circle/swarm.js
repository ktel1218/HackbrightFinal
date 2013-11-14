    
function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var speed = 6.0;
    var wallForceFactor = 3;

    function prepCanvas(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function getMagnitude(vector)
    {
        var x = vector.x;
        var y = vector.y;
        var n = Math.sqrt(x*x + y*y);
        return Math.abs(n);
    }

    function getDirectionTo(fromObject, toObject)
    {
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

    function sumVectors(vector1, vector2)
    {
        var sumX = vector1.x + vector2.x;
        var sumY = vector1.y + vector2.y;

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

    var Boid = {
        "r": 10,
        "x": 100,
        "y": 100,
        "vX": 2,
        "vY": 2,

        draw: function(){

            context.fillStyle = "rgb(0,200,100)";

            // circle1
            context.arc(this.x,this.y,this.r,0,Math.PI*2,true);
            context.fill();
        },

        move: function(){
            this.x += this.vX;
            this.y += this.vY;
            if (this.x > canvas.width) {
                if (this.vX > 0){
                    this.vX = -this.vX;
                }
            }
            if (this.y > canvas.height){
                if (this.vY > 0){
                    this.vY = -this.vY;
                }
            }
            if (this.x < 0){
                if (this.vX < 0) {
                    this.vX = -this.vX;
                }
            }
            if (this.y < 0){
                if (this.vY < 0){
                    this.vY = -this.vY;
                }
            }

            var d = computeForceVector(this, boids); //dont have this yet
            if (getMagnitude(d) > 0.00002){//normalize movement
                d = normalize(d);
                this.x += d.x;
                this.y += d.y;
            }
        },

        norm: function(){
            var z = Math.sqrt(this.vX*this.vX + this.vY * this.vY);
            if (z<0.001){
                this.vX = (Math.random() - 0.5) * speed;
                this.vY = (Math.random() - 0.5) * speed;
                this.norm();
            }
            else{
                z = speed /z;
                this.vX *= z;
                this.vY *= z;
            }
        }
    };

    function makeBoid(x,y){
        Empty = function(){};
        Empty.prototype = Boid;
        boid = new Empty();
        boid.x = x;
        boid.y = y;
        return boid;
    }

    boids = [];

    for (var i=0; i<20; i++){
        var boid = makeBoid(50+Math.random()*500, 50+Math.random()*300);
        boids.push(boid);
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
        velocity.x = 1 / (boid.x * boid.x) - 1 / (canvas.width - boid.x) * (canvas.width - boid.x);//set x force to the 1 divided by the square of the boids distance from the x wall (stay in the middle, move violently away)
        velocity.y = 1 / (boid.y * boid.y) - 1 / (canvas.height - boid.y) * (canvas.width - boid.y);//same for the y
        velocity.x *= wallForceFactor;
        velocity.y *= wallForceFactor;

        return velocity;
    }

    function computeOtherBoidForce(boid, boidList){
        var velocity = {x: 0, y:0};
        for(var i = 0; i < boidList.length; i++){//how do I avoid unit affecting itself? Duhhh object comparison 
            if(boid !== boidList[i]){//force would be infinite
            var force = computePointForce(boid, boidList[i]);
            velocity.x += force.x;
            velocity.y += force.y;
            }
        }
        return velocity;
    }

    function computeForceVector(boid, boidList){
        var vWall = computeWallForce(boid);
        var vBoids = computeOtherBoidForce(boid, boidList);
        return sumVectors(vWall, vBoids);
    }

    function render(){
        for (var i=0; i<boids.length; i++){
            boids[i].draw();
        }
    }

    function animate(){
        // bounce(boids);
        // align(boids);
        for (var i=0; i<boids.length; i++){
            boids[i].norm();
            boids[i].move();
        }
        // for(var i = 0; i < boids.length; i++){
        //     var d = computeForceVector(boids[i], boids); //dont have this yet
        //     if (getMagnitude(d) > 0.00002){//normalize movement
        //         d = normalize(d);
        //         boids[i].x += d.x;
        //         boids[i].y += d.y;
        //         // commands.push(AI.createMoveCommand(boids[i], p));
        //     }
        // }
    }

    function loop(){
        prepCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();

}