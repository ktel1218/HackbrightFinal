function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursorX;
    var cursorY;
    var gridSize = 75;
    var entrance;
    var defaultMaxSpeed = 400;

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

    var Char = {
        "x": 0,
        "y": 0,
        "radius":10,//health
        "maxSpeed": defaultMaxSpeed,
        "speed": 0,

        move: function(){
            var ang = getDirection(this.x, this.y, cursorX, cursorY);
            this.speed = getDistance(this.x, this.y, cursorX, cursorY);
            if (this.collisionDetect(globe1)){
                this.x = this.x + Math.cos(ang); //nice sticky effect
                this.y = this.y + Math.sin(ang);
                this.touch(globe1);
            }

            // player is never directly at cursor!
            else if (this.speed > 1){
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

        collisionDetect: function(object){
            var a = this.radius + object.radius;
            var dx = object.x - this.x;
            var dy = object.y - this.y;
            var d = dx*dx+dy*dy;
            // console.log("distance: " + d);
            return (d <= a*a);
        },

        touch: function(object){
            
            if (object.radius > 3){
                this.radius += 0.1;
                object.radius -= 0.2;
            }
        }
    };

    var Globe = {
        "x": 0,
        "y": 0,
        "radius":200,//health

        draw: function(){
            context.beginPath();
            context.fillStyle = "rgba(200,0,200,.85)";
            context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
            context.fill();
        },
    };

    function makeChar(x,y){
        Empty = function(){};
        Empty.prototype = Char;
        char1 = new Empty();
        char1.x = x;
        char1.y = y;
        return char1;
    }

    function makeGlobe(x,y){
        Empty = function(){};
        Empty.prototype = Globe;
        globe1 = new Empty();
        globe1.x = x;
        globe1.y = y;
        return globe1;
    }

    makeChar(10,10);
    makeGlobe(500,500);


    function animate(){
        char1.move();

    }

    function render(){
        char1.draw();
        globe1.draw();
    }

    function loop(){
        prepCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();

}