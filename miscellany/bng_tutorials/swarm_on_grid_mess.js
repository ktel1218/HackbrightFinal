function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursorX;
    var cursorY;

    var wallForceFactor = 3;
    var playerForceFactor = 8;
    var defaultMaxSpeed = 400;
    var gridSize = 25;

    var message = [];
    var coordPlane = [];
    var sprites = [];

    this.onmousemove = function(e){
        cursorX = e.pageX;
        cursorY = e.pageY;
    };

    this.onclick = function(e){
        console.log(message);
    };

    var Char = {
        "maxSpeed": defaultMaxSpeed,
        "forceFactor": 10,
        "influence":2000/gridSize,

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

        imprint: function(){
            var closestCoords = getSurroundingCoords(this.x, this.y, this.influence);
            for (var i = 0; i < closestCoords.length; i++) {
                closestCoords[i].mapVectors();
            }
        },
    };

    var Boid = {

        "forceFactor": 5,
        "influence":1500/gridSize,

        
        move: function(){
            var currentCoord = getCurrentCoord(this.x,this.y);
            this.x += currentCoord.vector.x;
            this.y += currentCoord.vector.y;
        },

        draw: function(){
            context.fillStyle = "rgb(0,200,100)";
            context.beginPath();
            context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
            context.fill();
        },
        imprint: function(){
            var closestCoords = getSurroundingCoords(this.x, this.y, this.influence);
            for (var i = 0; i < closestCoords.length; i++) {
                closestCoords[i].mapVectors(sprite);
            }
        },
    };

    var Coord = {

        drawSquare: function(){
            context.fillStyle="rgba(200,50,0,.5)";
            context.fillRect(this.x,this.y,gridSize,gridSize);
        },

        mapVectors: function(){
            var d = computeForceVector(this, sprite);
            if (getMagnitude(d) > 0.00002){//reduce sensitivity
                d = normalize(d);
                this.vector = {
                    "x" : d.x,
                    "y" : d.y
                };
            }
        },
        logVect: function(){
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.vector.x/25, this.y + this.vector.y/25);
            context.stroke();
        }
    };

    function getCurrentCoord(x,y){
        return coordPlane[Math.floor(x/gridSize)][Math.floor(y/gridSize)];
    }

    function initCoord(coordX,coordY){
            Empty = function(){};
            Empty.prototype = Coord;
            coord = new Empty();
            coord.x = coordX || 0;
            coord.y = coordY || 0;
            coord.vector = {"x": 0, "y": 0};
            return coord;
    }

    function initCoordPlane(){
        for (var i = 0; i < canvas.width/gridSize; i ++){
            coordPlane.push([]);
            for (var j = 0; j < canvas.height/gridSize; j ++){
                coord = initCoord(i*gridSize,j*gridSize);
                coordPlane[i].push(coord);
            }
        }
    }

    function getSurroundingCoords(x,y,rInfluence){
        var currentCoord = getCurrentCoord(x,y);
        var listOfCoordsSquare = [];
        var listOfCoordsCircle = [];
        var iMin = Math.round((x - rInfluence)/gridSize);
        if (iMin < 0) iMin = 0;
        var iMax = Math.round((x + rInfluence)/gridSize);
        if (iMax > Math.round(canvas.width/gridSize)) iMax = Math.round(canvas.width/gridSize);
        var jMin = Math.round((y - rInfluence)/gridSize);
        if (jMin < 0) jMin = 0;
        var jMax = Math.round((y + rInfluence)/gridSize);
        if (jMax > Math.round(canvas.height/gridSize)) jMax = Math.round(canvas.height/gridSize);
        for (var i = iMin; i<= iMax; i++){
            for (var j = jMin; j <= jMax; j++){
                var x1 = coordPlane[i][j].x;
                var y1 = coordPlane[i][j].y;
                var distance = getDistance(x1, y1, x,y);
                if (rInfluence > distance && coordPlane[i][j] !== currentCoord){
                    listOfCoordsCircle.push(coordPlane[i][j]);
                }
            }
        }
        return listOfCoordsCircle;
    }

    function makeChar(x,y, radius){
        Empty = function(){};
        Empty.prototype = Char;
        charA = new Empty();
        charA.x = x || 0;
        charA.y = y || 0;
        charA.radius = radius;
        return charA;
    }

    function makeBoid(x,y, radius){
        Empty = function(){};
        Empty.prototype = Boid;
        boid = new Empty();
        boid.x = x || 0;
        boid.y = y || 0;
        boid.radius = radius;
        return boid;
    }

    function prepCanvas(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function getDistance(x1, y1, x2, y2){
        squareX = Math.pow((x1-x2),2);
        squareY = Math.pow((y1-y2),2);
        return Math.sqrt(squareX + squareY);
    }

    function getDirection(x1, y1, x2, y2){
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


    function normalize(vector){
        var length = getMagnitude(vector);
        var normalizedVector = {
            "x": (vector.x/length),
            "y": (vector.y/length),
        };
        return normalizedVector;
    }

    function computePointForce(coord, sprite){
        var direction = getDirectionTo(sprite, coord);
        var magnitude = getMagnitude(direction);
        //return a vector in the direction of d
        var normalizedMagnitude = 1/Math.pow(magnitude,3);
        direction.x *= normalizedMagnitude;
        direction.y *= normalizedMagnitude; //weighted by magnitude squared and another to get unit vector?
        return direction;
    }


    function computeForceVector(coord, sprite){
        var velocity = {x: 0, y: 0};
        var force = computePointForce(coord, sprite);
        velocity.x += force.x;
        velocity.y += force.y;
        // console.log(velocity.x, velocity.y);
        return velocity;
    }

    initCoordPlane();

    var char1 = makeChar(50+Math.random()*500, 50+Math.random()*300,25);
    sprites.push(char1);

    for (var i = 0; i < 4; i ++){
        boid = makeBoid(50+Math.random()*500, 50+Math.random()*300,10);
        sprites.push(boid);
    }

    function animate(){
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].imprint();
        }
        for (var j = 0; j < sprites.length; j++) {
            sprites[j].move();
        }
    }

    function render(){
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].draw();
        }
        for (var j = 0; j < coordPlane.length; j++) {
            for (var k = 0; k < coordPlane[j].length; k++) {
                coordPlane[j][k].logVect();
            }
        }
    }

    function loop(){
        prepCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();
}