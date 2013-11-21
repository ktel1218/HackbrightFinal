function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursor = {
        "x": 0,
        "y": 0
    };

    var wallForceFactor = 3;
    var playerForceFactor = 8;
    var defaultMaxSpeed = 400;
    var gridSize = 10;

    var message = [];
    var coordPlane = [];
    var sprites = [];
    var affectedCoords = [];


    this.onmousemove = function(e){
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    };

    this.onclick = function(e){
        console.log(message);
    };

    var Char = {
        "maxSpeed": defaultMaxSpeed,
        "forceFactor": 10,
        "influence": 50,

        move: function(){

            //rewrite to consolidate functions
            this.vector = getDirectionTo(this, cursor);
            var speed = getMagnitude(this.vector);

            if (speed > this.maxSpeed) speed = this.maxSpeed;
            // player is never directly at cursor!
            if(speed > 1){
                this.x = this.x + this.vector.x/25;
                this.y = this.y + this.vector.y/25;
            //if player is within 1 px of cursor, stop.
            }

            //do not exceed max speed

        },

        draw: function(){
            context.beginPath();
            context.fillStyle = "rgba(200,0,200,0.85)";
            context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
            context.fill();
        },

        imprint: function(){
            var closestCoords = getSurroundingCoords(this.x,this.y,this.influence);
            affectedCoords.push.apply(affectedCoords, closestCoords);
            for (var i = 0; i < closestCoords.length; i++) {
                var coordX = closestCoords[i].x;
                var coordY = closestCoords[i].y;
                var d = computeForceVector(closestCoords[i], this);
                if (getMagnitude(d) > 0.00002){//reduce sensitivity
                    d = normalize(d);
                    closestCoords[i].vector.x += d.x;
                    closestCoords[i].vector.y += d.y;
                }
            }
        }
    };

    var Boid = {

        "forceFactor": 30,
        "influence":30,
        
        move: function(){
            try {
                var currentCoord = coordPlane[Math.round(this.x/gridSize)][Math.round(this.y/gridSize)];
                // wallVX = 1/Math.pow(this.x,2) - 1/Math.pow((canvas.width - this.x),2)/10;
                // wallVY = 1/Math.pow(this.y,2) - 1/Math.pow((canvas.height - this.y),2)/10;

                // if(Math.random() < .1){
                //     console.log(currentCoord.vector.x, currentCoord.vector.y, wallVX, wallVY);
                // }
            
                this.x += currentCoord.vector.x/10;
                this.y += currentCoord.vector.y/10;
            } catch (e) {
                for (var i = 0; i < sprites.length; i++) {
                    if(sprites[i] === this){
                        sprites.splice(i, 1);
                    }
                }
            }
            // this.x *= wallVX;
            // this.y *= wallVY;
        },

        draw: function(){
            // context.fillStyle = "rgb(0,200,100)";
            context.beginPath();
            context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
            context.fill();
        },

        imprint: function(){
            var closestCoords = getSurroundingCoords(this.x,this.y,this.influence);
            affectedCoords.push.apply(affectedCoords, closestCoords);
            for (var i = 0; i < closestCoords.length; i++) {
                var coordX = closestCoords[i].x;
                var coordY = closestCoords[i].y;
                var d = computeForceVector(closestCoords[i], this);
                if (getMagnitude(d) > 0.00002){//reduce sensitivity
                    d = normalize(d);
                    closestCoords[i].vector.x += d.x;
                    closestCoords[i].vector.y += d.y;
                }
            }
        }
    };

    var Coord = {

        drawSquare: function(){
            context.fillStyle="rgba(200,50,0,.5)";
            context.fillRect(this.x,this.y,gridSize,gridSize);
        },

        // mapVectors: function(){
        //     var d = computeForceVector(this, char1);
        //     if (getMagnitude(d) > 0.00002){//reduce sensitivity
        //         // d = normalize(d);
        //         this.vector = {
        //             "x" : d.x,
        //             "y" : d.y
        //         };
        //         // console.log("Logging!");
        //     }
        // },
        logVect: function(){
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.vector.x/25, this.y + this.vector.y/25);
            context.stroke();
        }
    };

    function initCoord(coordX,coordY){
            Empty = function(){};
            Empty.prototype = Coord;
            coord = new Empty();
            coord.x = coordX || 0;
            coord.y = coordY || 0;
            coord.centerX = coordX + gridSize/2;
            coord.centerY = coordY + gridSize/2;
            coord.vector = {"x": 0, "y": 0};
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

    function getSurroundingCoords(x,y,rInfluence){
        // var currentCoord = getCurrentCoord(x,y);
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
                if (rInfluence > distance){
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
        // console.log(n);

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

        // console.log(direction.y);

        return direction;
    }


    function normalize(vector){
        var length = getMagnitude(vector);
        var normalizedVector = {
            "x": (vector.x/length),
            "y": (vector.y/length),
        };
        // console.log(normalizedVector.x, normalizedVector.y);
        return normalizedVector;
    }

    function computePointForce(coord, sprite){
        var direction = getDirectionTo(sprite, coord);
        var magnitude = getMagnitude(direction);
        //return a vector in the direction of d
        // var normalizedMagnitude = 1/Math.pow(magnitude,3);
        // direction.x *= normalizedMagnitude;
        // direction.y *= normalizedMagnitude; //weighted by magnitude squared and another to get unit vector?
        // console.log(direction.x, direction.y);
        direction.x *= magnitude;
        direction.y *= magnitude;
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

    function degradeVectors(coordList){
        for (var i = 0; i < coordList.length; i++) {
            if (Math.abs(coordList[i].vector.x)<0.8 && Math.abs(coordList[i].vector.y)<0.8){
                coordList[i].vector.x = 0;
                coordList[i].vector.y = 0;
                coordList.splice(i,0);
            }
            else {

                coordList[i].vector.x /= 1.00005;
                coordList[i].vector.y /= 1.00005;


////////////////INSTEAD: Make direction magnitude (speed) and unit vector (direction) a property of each object, use getVectorOfMotion() which gets speed and direction and multiplies that shit. Then degrade vectors could degrade magnitude incrementally and that shit would work.
            }
            // coordList[i].vector *= magnitude;
        }
    }

    // var coord1 = initCoord(200,200);
    initCoordPlane();

    var char1 = makeChar(50+Math.random()*200, 50+Math.random()*200,25);

    for (var i = 0; i < 1; i++) {
        var boid = makeBoid(50+Math.random()*200, 50+Math.random()*200,15);
        sprites.push(boid);
    }

    // var boid1 = makeBoid(50+Math.random()*200, 50+Math.random()*200,15);

    sprites.push(char1);
    // sprites.push(boid1);

    function animate(){
        for (var i = 0; i < sprites.length; i++) {
                sprites[i].imprint();
            }
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].move();
        }
        // char1.imprint();
        // boid1.imprint();
        // char1.move();
        // boid1.move();
        degradeVectors(affectedCoords);

    }

    function render(){
        // char1.draw();
        // boid1.draw();

        for (var i = 0; i < sprites.length; i++) {
             sprites[i].draw();
         }
        for (var i = 0; i < coordPlane.length; i++) {
            for (var j = 0; j < coordPlane[i].length; j++) {
                coordPlane[i][j].logVect();
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