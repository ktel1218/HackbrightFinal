function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var cursor = {
        "x": 0,
        "y": 0,
    };
    var defaultMaxSpeed = 400;
    var squares = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var world = {
        "width": 6000,
        "height": 6000,
    };


    console.log(canvas);

    function clearCanvas(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    this.onmousemove = function(e){
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    };

    // window.onresize = function(e){
    //     viewport.width = window.width;
    //     viewport.height = window.height;
    // };

    var Char = {
        "x": 0,
        "y": 0,
        "radius":20,//health
        "maxSpeed": defaultMaxSpeed,
        "speed": 0,

        move: function(){
            var ang = getDirection(canvas.width/2, canvas.height/2, cursor.x, cursor.y);
            this.speed = getDistance(canvas.width/2, canvas.height/2, cursor.x, cursor.y);

            // player is never directly at cursor!
            if(this.speed > 1){
                this.x += Math.cos(ang) * (this.speed/25);
                this.y += Math.sin(ang) * (this.speed/25);
            //if player is within 1 px of cursor, stop.
            }

            if (this.speed > this.maxSpeed)this.speed = this.maxSpeed;//do not exceed max speed

            // side collision
            this.x += (1/(this.x*this.x)-1/((world.width-this.x)*(world.width-this.x)))*500000;
            this.y += (1/(this.y*this.y)-1/((world.height-this.y)*(world.height-this.y)))*500000;

        },

        draw: function(){
            context.beginPath();
            context.fillStyle = "rgba(200,0,200,.85)";
            // context.arc(this.x,this.y,this.radius,0,Math.PI*2,true
            context.arc(canvas.width/2,canvas.height/2,this.radius,0,Math.PI*2,true);
            context.fill();
        },
    };

    var Square = {

        draw: function(){
            context.fillStyle = "rgba(200,0,100," + 1/(this.layer*2) + ")";
            context.fillRect(this.x - (char1.x*this.layer), this.y - (char1.y*this.layer), this.width*this.layer, this.height*this.layer);
        },
    };

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


    function makeChar(x,y){
        Empty = function(){};
        Empty.prototype = Char;
        charA = new Empty();
        charA.x = x;
        charA.y = y;

        return charA;
    }

    function makeSquare(x,y,size,layer){//layer is between 0 and 2
        Empty = function(){};
        Empty.prototype = Square;
        square = new Empty();
        square.x = x;
        square.y = y;
        square.width = size;
        square.height = size;
        square.layer = layer;
        return square;
    }

    char1 = makeChar(200, 200);

    for (var i = 0; i < world.width/20; i++) {
        var square = makeSquare(50+Math.random()*world.width-50, 50+Math.random()*world.height-50, 15, 1+Math.random()*5);
        squares.push(square);
    }
    for (var i = 0; i < world.width/5; i++) {
        var square = makeSquare(50+Math.random()*world.width-50, 50+Math.random()*world.height-50, 15, .2+Math.random()*0.4);
        squares.push(square);
    }


    function animate(){
        char1.move();
    }

    function render(){
        char1.draw();
        for (var i = 0; i < squares.length; i++) {
            squares[i].draw();
        }
    }

    function loop(){
        clearCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();
}