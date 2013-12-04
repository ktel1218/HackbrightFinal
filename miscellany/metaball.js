function main(){
    // var MIN_THRESHOLD = 80;
    var MAX_THRESHOLD = 80;
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    var metaballs = [];
    var defaultMaxSpeed = 400;
    var cursor = {
        "x": 0,
        "y": 0,
    };
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var world = {
        "width": canvas.width,
        "height": canvas.height,
    };

    var buffer = 10;

    this.onmousemove = function(e){
        cursor.x = e.pageX;
        cursor.y = e.pageY;
    };

    function Metaball(x,y,radius){

        this.x = x;
        this.y = y;
        this.radius = Math.pow(radius,3);
        this.maxX = x + radius;
        this.minX = x - radius;
        this.maxY = y + radius;
        this.minY = y - radius;
        // ball.radius = radius;

        return this;
    }

    Metaball.prototype.getDiameter = function(x, y){
        return this.radius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    };



    function Player(x,y,radius){

        this.maxSpeed = defaultMaxSpeed;
        this.nearbySprites = [];
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.radius = radius;
        this.metaballRadius = Math.pow(radius, 3);
        this.minX = x - radius;
        this.maxX = x + radius;
        this.minY = y - radius;
        this.maxY = y + radius;
        return this;
    }


    Player.prototype.move = function(){

        this.velocity = getDirectionTo(this.x, this.y, cursor.x, cursor.y);
        this.speed = getMagnitude(this.velocity);

        //do not exceed max speed
        if (this.speed > this.maxSpeed){
        this.speed = this.maxSpeed;
        this.velocity = normalize(this.velocity);
        this.velocity.x *= this.speed;
        this.velocity.y *= this.speed;
        }

        // player is never directly at cursor!
        if(this.speed > 1){
            this.x += this.velocity.x/18;
            this.y += this.velocity.y/18;
        //if player is within 1 px of cursor, stop.
        }

        // wall collision

        if (this.x-this.radius <= 0)this.x = 0 + this.radius;
        if (this.x+this.radius >= world.width) this.x = world.width - this.radius;
        if (this.y-this.radius <= 0) this.y = 0 + this.radius;
        if (this.y+this.radius >= world.height) this.y = world.height - this.radius;

        this.minX = this.x - this.radius;
        this.maxX = this.x + this.radius;
        this.minY = this.y - this.radius;
        this.maxY = this.y + this.radius;
    };

    Player.prototype.draw = function(){
        context.beginPath();
        context.fillStyle = "rgba(220,220,220,.85)";
        // context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        context.arc(this.x,this.y,this.radius,0,Math.PI*2,true);
        context.fill();
    };

    Player.prototype.onCollisionDetect = function(list){
        for (var i = 0; i < list.length; i++) {
            var collisionObject = this.collisionCheck(list[i]);
            if(collisionObject && collisionObject instanceof Boid){
                this.radius += 40/(this.radius*1.5); // get bigger but approach some max
                // index = global_sprites.indexOf(list[i]);
                // global_sprites.splice(index,1);
                collisionObject.die();
            }
        }
    };

    Player.prototype.collisionCheck = function(object){
        var a;
        if (object instanceof Metaball){
            a = this.radius+20 + object.radius+20;
        }

        if (object instanceof Boid){
            a = this.radius + object.radius;
        }
        var dx = object.x - this.x;
        var dy = object.y - this.y;
        var d = dx*dx+dy*dy;
        if (d <= a*a){
            return object;
        }
    };

    //used for Metaball graphics
    Player.prototype.getDiameter = function(x, y){
        return this.metaballRadius / (Math.pow(x - this.x,2) + Math.pow(y - this.y,2));
    };


    function normalize(vector){
        //make a unit vector
        var length = getMagnitude(vector);
        var normalizedVector = {
            "x": (vector.x/length),
            "y": (vector.y/length),
        };
        return normalizedVector;
    }

    function getDirectionTo(x1,y1,x2,y2){
        var deltaY = y2 - y1;
        var deltaX = x2 - x1;

        var direction = {
            "x": deltaX,
            "y": deltaY,
        };
        // console.log(direction.x, direction.y);
        return direction;
    }

    function getMagnitude(vector){
            var x = vector.x;
            var y = vector.y;
            // console.log(x,y);
            var n = Math.sqrt(x*x + y*y);
            // console.log(n);
            // console.log(Math.abs(n));
            return Math.abs(n);
    }

    function draw_metaballs(object){
        //list of metaballs to draw
        //if they're touching, remove the one being touched
        //draw touching ones together
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
                        context.fillRect(x,y,2,2);
                        // console.log("drawing!");
                    }
                }
            }
        }
    }

    player1 = new Player(100, 100, 30);
    metaball1 = new Metaball(canvas.width/2,canvas.height/2,30);

    metaballs.push(player1);
    metaballs.push(metaball1);

    // for (var i = 0; i < metaballs.length; i++) {
    //     console.log(metaballs[i].getDiameter(20,20));
    // }


    function clearCanvas(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function animate(){
        player1.move();
    }

    function render(){
        draw_metaballs(metaball1);
        draw_metaballs(player1);

    }

    function loop(){
        clearCanvas();
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();
}