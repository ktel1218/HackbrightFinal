function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursorX;
    var cursorY;

    var wallForceFactor = 3;
    var playerForceFactor = 8;
    var defaultMaxSpeed = 400;
    var gridSize = 50;

    var boids = [];
    var message = [];
    var coordPlane = [];

    this.onmousemove = function(e){
        cursorX = e.pageX;
        cursorY = e.pageY;
    };

    this.onclick = function(e){
        console.log(coordPlane[5][3].vector.x);
        console.log(message);
    };

    var Char = {
        "x": 0,
        "y": 0,
        "radius":20,//health
        "maxSpeed": defaultMaxSpeed,
        "speed": 0,
        "forceFactor": 8,

        move: function(){

            //rewrite to consolidate functions
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
            context.fillStyle = "rgba(200,0,200,0.85)";
            context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
            context.fill();
        },
    };

    var Boid = {
        "r": 10,
        "x": 100,
        "y": 100,
        
        move: function(){
            var currentCoord = coordPlane[Math.floor(this.x/gridSize)][Math.floor(this.y/gridSize)];
            this.x += currentCoord.vector.x;
            this.y += currentCoord.vector.y;
        },

        draw: function(){
            context.fillStyle = "rgb(0,200,100)";

            context.arc(this.x,this.y,this.r,0,Math.PI*2,true);
            context.fill();
        },
    };

    var Coord = {

        "vector": {"x":0,"y":0},

        drawSquare: function(){
            context.fillStyle="rgba(200,50,0,.5)";
            context.fillRect(this.x,this.y,gridSize,gridSize);
        },

        mapVectors: function(){
            var d = computeForceVector(this, sprites);
            // message.push("d.x: ", d.x);
            if (getMagnitude(d) > 0.0000000000002){//reduce sensitivity
                d = normalize(d);
                this.vector.x = d.x;
                this.vector.y = d.y;
            }
        }
    };

    function initCoord(coordX,coordY){
            Empty = function(){};
            Empty.prototype = Coord;
            coord = new Empty();
            coord.x = coordX;
            coord.y = coordY;
            coord.centerX = coordX + gridSize/2;
            coord.centerY = coordY + gridSize/2;
            return coord;
    }

    function initCoordPlane(){
        for (var i = 0; i < window.innerWidth/gridSize; i ++){
            coordPlane.push([]);
            for (var j = 0; j < window.innerHeight/gridSize; j ++){
                coord = initCoord(i*gridSize,j*gridSize);
                coordPlane[i].push(coord);
            }
        }
    }

    function makeChar(x,y, radius){
        Empty = function(){};
        Empty.prototype = Char;
        charA = new Empty();
        charA.x = x;
        charA.y = y;
        charA.radius = radius;
        return charA;
    }

    function makeBoid(x,y, radius){
        Empty = function(){};
        Empty.prototype = Boid;
        boid = new Empty();
        boid.x = x;
        boid.y = y;
        boid.radius = radius;
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

    function computePointForce(coord, sprite){
        var coordx = coord.centerX;
        var coordy = coord.centerY;
        var otherx = sprite.x;
        var othery = sprite.y;
        var direction = getDirectionTo(sprite, coord);
        var magnitude = getMagnitude(direction);
        //return a vector in the direction of d
        direction.x *= 1/(magnitude * magnitude * magnitude);
        direction.y *= 1/(magnitude * magnitude * magnitude); //weighted by magnitude squared and another to get unit vector?
        return direction;
    }

    function computeWallForce(coord){
        var velocity = {x: 0, y: 0};

        //set x force to the 1 divided by the square of the coords distance from the x wall (stay in the middle, move violently away)
        velocity.x = 1/Math.pow(coord.centerX,2) -
                    1/Math.pow((canvas.width - coord.centerX),2);
        //same for the y        
        velocity.y = 1/Math.pow(coord.centerY,2) - 
                    1/Math.pow((canvas.height - coord.centerY),2);        
        velocity.x *= wallForceFactor;
        velocity.y *= wallForceFactor;

        return velocity;
    }

    function computeSpriteForce(coord, sprites){
        var velocity = {x: 0, y: 0};
        for(var i = 0; i < sprites.length; i++){
            var force = computePointForce(boid, sprites[i]);
            message.push(forcex);
            velocity.x *= sprites[i].forceFactor;
            velocity.y *= sprites[i].forceFactor;
        }
        return velocity;
    }

    function computeForceVector(coord, sprites){
        var vWall = computeWallForce(coord);//infinite
        var vSprites = computeSpriteForce(boid, sprites);//NaN
        return sumVectors([vWall, vSprites]);
    }

    //init
    initCoordPlane();
    var char1 = makeChar(10,10,30);
    //make boids
    for (var i=0; i<4; i++){
        var boid = makeBoid(50+Math.random()*500, 50+Math.random()*300, 20);
        boids.push(boid);
    }

//*******************************
        var sprites = boids;
        sprites.push(char1);

        //**********************************


    function drawGrid(gridSize){
        for (var i = 1; i < window.innerWidth; i += gridSize){
            context.beginPath();
            context.moveTo(i,0);
            context.lineTo(i,window.innerHeight);
            context.stroke();
        }
        for (var j = 1; j < window.innerHeight; j += gridSize){
            context.beginPath();
            context.moveTo(0,j);
            context.lineTo(window.innerWidth, j);
            context.stroke();
        }
    }

    function animate(){
        for (var i=0; i<coordPlane.length; i++){
            for (var j=0; j<coordPlane[i].length; j++){
                coordPlane[i][j].mapVectors();
            }
        }
        // coordX = Math.floor(char1.x/gridSize);
        // coordY = Math.floor(char1.y/gridSize);
        // currentCoord = coordPlane[coordX][coordY];
        // currentCoord.updateAngle(char1.x, char1.y);
        // char1.move();
        for (var k=0; k<boids.length; k++){
            boids[k].move();
        }
    }

    function render(){
        for (var i=0; i<boids.length; i++){
            boids[i].draw();
        }
        drawGrid(gridSize);
        // currentCoord.drawSquare();
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