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
    canvas.width = 300;
    canvas.height = 300;

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

        },
        getDiameter : function(x, y){
            // console.log("radius: ", this.radius);
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
        // charA.radius = radius;

        return charA;
    }


    function draw_metaballs(){
        if (metaballs !== null) {
            for (var x = 0; x < canvas.width; x++) {
                for (var y = 0; y < canvas.height; y++) {
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
        draw_metaballs();
    }

    function loop(){
        clearCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();
}