function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursorX;
    var cursorY;
    var maxSpeed = 400;
    var gridSize = 75;

    // var speed = 6.0;

    //get cursor's x and y all the time
    this.onmousemove = function(e){
        cursorX = e.pageX;
        cursorY = e.pageY;
    };

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

    function getTimeDelta(time1, time2)
    {
        return time1 - time2;
    }

    var Char = {
        "x": 0,
        "y": 0,
        "radius":40,

        move: function(){
            var ang = getDirection(this.x, this.y, cursorX, cursorY);
            var l = getDistance(this.x, this.y, cursorX, cursorY);
            if (l > maxSpeed) l = maxSpeed;//do not exceed max speed

            // player is never directly at cursor!
            if (l > 1){
                this.x = this.x + Math.cos(ang) * (l/25);
                this.y = this.y + Math.sin(ang) * (l/25);
            //if player is within 1 px of cursor, stop.

                //l/25 is the velocity
                //.cos and .sin of the angle(direction)
            }
        },

        draw: function(){
            context.beginPath();
            context.fillStyle = "rgba(200,0,200,.85)";
            context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
            context.fill();
        },
    };

    var Coord = {
        "x": 0,
        "y": 0,
        "enterExits": [],
        "angle": 0,

        drawAngle: function(){
            context.beginPath();
            //context.moveTo(this.x,this.y);
            context.moveTo(this.x,this.y);
            context.lineTo((this.x+Math.cos(this.angle)*75),this.y+Math.sin(this.angle)*75);
            context.strokeStyle="#000000";
            context.stroke();
        },


        updateAngle: function(){
            //give an x and y
            var sumX = 0;
            var sumY = 0;
            for (var i = 0; i < this.enterExits.length; i++){
                sumX += this.enterExits[i][0];
                sumY += this.enterExits[i][1];
                sumX /= this.enterExits.length;
                sumY /= this.enterExits.length;
            }
            this.angle = getDirection(this.x, this.y, sumX, sumY);
        },
        drawSquare: function(){
            context.fillStyle="rgba(200,50,0,.5)";
            context.fillRect(this.x,this.y,gridSize,gridSize);
        },
    };

    function initCoord(coordX,coordY){
            Empty = function(){};
            Empty.prototype = Coord;
            coord = new Empty();
            coord.x = coordX;
            coord.y = coordY;
            return coord;
    }

    function initCoordPlane(){
        for (var i = 0; i < window.innerWidth/gridSize; i ++){
            coordPlane.push([]);
            for (var j = 0; j < window.innerHeight/gridSize; j ++){
                coord = initCoord(i*gridSize,j*gridSize);
                coordPlane[i].push(coord);
                coord.drawAngle();
            }
        }
    }

    function makeChar(x,y){
        Empty = function(){};
        Empty.prototype = Char;
        char1 = new Empty();
        char1.x = x;
        char1.y = y;
        return char1;
    }

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

    makeChar(10,10);

    var coordPlane = [];
    initCoordPlane();

    var exit = [0,0];
    var currentCoord = coordPlane[0][0];

    function animate(){
        char1.move();

        coordX = Math.floor(char1.x/gridSize);
        coordY = Math.floor(char1.y/gridSize);
        currentCoord = coordPlane[coordX][coordY];

    }

    function render(){
        drawGrid(gridSize);
        char1.draw();
        currentCoord.drawSquare();
    }

    function loop(){
        prepCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }


    loop();

}