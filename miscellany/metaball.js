function main(){
    // var MIN_THRESHOLD = 80;
    var MAX_THRESHOLD = 100;
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var metaballs = [];
    var defaultMaxSpeed = 400;
    var cursor = {
        "x": 0,
        "y": 0,
    };
    canvas.width = 900;
    canvas.height = 900;

    var buffer = 10;

    this.onmousemove = function(e){
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    };

    var Metaball = {

        getDiameter : function(x, y){
            // console.log(this.radius);
            // console.log("x:",x,"y:",y);
            return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
        }
    };

    var Char = {

        "maxSpeed": defaultMaxSpeed,

        move: function(){
            var ang = getDirection(this.x, this.y, cursor.x, cursor.y);
            this.speed = getDistance(this.x, this.y, cursor.x, cursor.y);

            // player is never directly at cursor!
            if(this.speed > 1){
                this.x = this.x + Math.cos(ang) * (this.speed/25);
                this.y = this.y + Math.sin(ang) * (this.speed/25);
            //if player is within 1 px of cursor, stop.
            }

            if (this.speed > this.maxSpeed)this.speed = this.maxSpeed;//do not exceed max speed

            this.maxX = this.x + this.boundingBox/2;
            this.minX = this.x - this.boundingBox/2;
            this.maxY = this.y + this.boundingBox/2;
            this.minY = this.y - this.boundingBox/2;
        },

        getDiameter : function(x, y){
            // console.log(this.radius);
            // console.log("x:",x,"y:",y);
            return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
        }
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

    function makeMetaball(x,y,radius){
        Empty = function(){};
        Empty.prototype = Metaball;
        ball = new Empty();
        ball.x = x;
        ball.y = y;
        ball.radius = Math.pow(radius,3);
        ball.maxX = ball.x + radius + buffer;
        ball.minX = ball.x - (radius + buffer);
        ball.maxY = ball.y + radius + buffer;
        ball.minY = ball.y - (radius + buffer);
        // ball.radius = radius;

        return ball;
    }

    function makeChar(x,y,radius){
        Empty = function(){};
        Empty.prototype = Char;
        charA = new Empty();
        charA.x = x;
        charA.y = y;
        charA.radius = Math.pow(radius,3);
        charA.boundingBox = radius*2 + buffer;

        // charA.radius = radius;

        return charA;
    }


    function draw_metaballs(object){
        var startX = object.minX;
        var endX = object.maxX;
        var startY = object.minY;
        var endY = object.maxY;

        if (metaballs !== null) {
            for (var x = startX; x < endX; x++) {
                for (var y = startY; y < endY; y++) {
                    var sum = 0; //reset the summation
                    for (var i = 0; i < metaballs.length; i ++){
                        // console.log("x: ", x, "y: ",y);
                        // console.log(metaballs[i].getDiameter(x,y));
                        sum += metaballs[i].getDiameter(x,y);
                        //sum = NAN
                        // console.log("sum: ", sum);
                    }
                    if (sum >= MAX_THRESHOLD){
                        context.fillStyle = "black";
                        context.fillRect(x,y,1,1);
                        // console.log("drawing!");
                    }
                }
            }
        }
    }

    char1 = makeChar(200, 200, 40);
    metaball1 = makeMetaball(100,100,60);

    metaballs.push(char1);
    metaballs.push(metaball1);

    // for (var i = 0; i < metaballs.length; i++) {
    //     console.log(metaballs[i].getDiameter(99,99));
    // }

    // draw_metaballs();

    function clearCanvas(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function animate(){
        char1.move();
    }

    function render(){
        if ((char1.minX < metaball1.maxX && char1.maxX > metaball1.minX) &&
                    (char1.minY < metaball1.maxY && char1.maxY > metaball1.minY)){
            draw_metaballs(char1);
            draw_metaballs(metaball1);
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