function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursor = {
        "x": 0,
        "y": 0
    };

    var defaultMaxSpeed = 600;
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

            if (this.x - this.radius <= 30) this.x = 30 + this.radius;
            if (this.x + this.radius >= canvas.width-30)this.x = canvas.width-30 - this.radius;
            if (this.y - this.radius <= 20) this.y = 20 + this.radius;
            if (this.y + this.radius >= canvas.height-40) this.y = canvas.height-40 - this.radius;

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
                var d = getDirectionTo(this, closestCoords[i]);
                d = normalize(d);
                closestCoords[i].vector.x += d.x;
                closestCoords[i].vector.y += d.y;
            }
        }
    };

    var Boid = {

        "influence": 30,

        move: function(){
            try {
                var currentCoord = coordPlane[Math.round(this.x/gridSize)][Math.round(this.y/gridSize)];

                this.x += currentCoord.vector.x;
                this.y += currentCoord.vector.y;
            } catch (e) {
                for (var i = 0; i < sprites.length; i++) {
                    if(sprites[i] === this){
                        sprites.splice(i, 1);
                    }
                }
            }
            if (this.x - this.radius <= 10) this.x = 10 + this.radius;
            if (this.x + this.radius >= canvas.width - 30) this.x = canvas.width - 30 - this.radius;
            if (this.y - this.radius <= 10) this.y = 10 + this.radius;
            if (this.y + this.radius >= canvas.height - 30) this.y = canvas.height - 30 - this.radius;
        },

        draw: function(){
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
                d = normalize(d);
                closestCoords[i].vector.x += d.x;
                closestCoords[i].vector.y += d.y;
            }
        }
    };

    var Coord = {

        drawSquare: function(){
            context.fillStyle="rgba(200,50,0,.5)";
            context.fillRect(this.x,this.y,gridSize,gridSize);
        },

        logVect: function(){
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.vector.x/20, this.y + this.vector.y/20);
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
        direction.x *= magnitude;
        direction.y *= magnitude;
        return direction;
    }


    function computeForceVector(coord, sprite){
        var velocity = {x: 0, y: 0};
        var force = computePointForce(coord, sprite);
        velocity.x += force.x;
        velocity.y += force.y;
        return velocity;
    }

    function degradeVectors(coordList){
        for (var i = 0; i < coordList.length; i++) {
            if (Math.abs(coordList[i].vector.x)<0.8 && Math.abs(coordList[i].vector.y)<0.8){
                coordList[i].vector.x = 0;
                coordList[i].vector.y = 0;
                coordList.splice(i,1);
            }
            else {

                coordList[i].vector.x /= 1.005;
                coordList[i].vector.y /= 1.005;
            }
        }
    }

    initCoordPlane();

    var char1 = makeChar(50+Math.random()*200, 50+Math.random()*200,25);

    for (var i = 0; i < 6; i++) {
        var boid = makeBoid(50+Math.random()*(canvas.width), 50+Math.random()*(canvas.width),15);
        sprites.push(boid);
    }


    sprites.push(char1);

    function animate(){
        for (var i = 0; i < sprites.length; i++) {
                sprites[i].imprint();
            }
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].move();
        }
        degradeVectors(affectedCoords);

    }

    function render(){

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
