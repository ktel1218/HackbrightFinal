function main(){

    //commented out pieces I've copied over

    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var global_particles = [];
    var quadTreeNodes = [];

    var Particle = {
        "radius": 15,
        "vX": 5,
        "vY": 5,
        "nearbyParticles": [],

        draw: function(){
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0,Math.PI*2,true);
            context.fill();
        },
        move: function(){
            // console.log(this.nearbyParticles);
            this.x += this.vX;
            this.y += this.vY;
            if (this.nearbyParticles !== []){
                for (var i = 0; i < this.nearbyParticles.length; i++) {
                    var particle = this.nearbyParticles[i];
                    if (this.collisionDetect(particle)){
                        console.log("collision!");
                        this.vX = -this.vX;
                        this.vY = -this.vY;
                    }
                }
            }
            if (this.x >= canvas.width || this.x <= 0){
                this.vX = -this.vX;
            }

            if (this.y >= canvas.height || this.y <= 0){
                    this.vY = -this.vY;
            }
        },
        collisionDetect: function(object){
            var a = this.radius + object.radius;
            var dx = object.x - this.x;
            var dy = object.y - this.y;
            var d = dx*dx+dy*dy;
            // console.log("distance: " + d);
            return (d <= a*a);
        },
    };

    // var Quadtree = {
    //     "threshold": 3, // threshold of particles in quadrant

    //     addParticles: function(particles){
    //         for (var i = 0; i < particles.length; i++) {
    //             if (this.rectangle.overlapsWithParticle(particles[i])){
    //                 this.particles.push(particles[i]);
    //             }
    //         }
    //         if (this.particles.length > this.threshold &&
    //             quadTreeNodes.length < 40){
    //             this.subdivide();
    //         }
    //         else {
    //             for (var i = 0; i < this.particles.length; i++) {
    //                 for (var j = 0; j < this.particles.length; j++) {
    //                     if (this.particles[i] !== this.particles[j]) {
    //                         this.particles[i].nearbyParticles.push(this.particles[j]);
    //                     }
    //                 }
    //             }
    //         }

    //         /////////// for each quadrant, find out which particles it contains
    //         /////////// if it's above the threshold, divide
    //     },
    //     // add metaBalls: function(metaBalls){},
    //     //collisionDetection: function()
    //     subdivide: function(){
    //         var w2 = this.rectangle.width/2; // need to add the 2Drect constructor
    //         var h2 = this.rectangle.height/2;
    //         var x = this.rectangle.x;
    //         var y = this.rectangle.y;

    //         this.quadrants.push(makeQuadtree(x, y, w2, h2));
    //         this.quadrants.push(makeQuadtree(x + w2, y, w2, h2));
    //         this.quadrants.push(makeQuadtree(x + w2, y + h2, w2, h2));
    //         this.quadrants.push(makeQuadtree(x, y + h2, w2, h2));

    //         for (var i = 0; i < this.quadrants.length; i++) {
    //             this.quadrants[i].addParticles(this.particles);

    //             quadTreeNodes.push(this.quadrants[i]);

    //         }
    //         this.particles = [];

    //         ///////// fairly straightforward, makes 4 child Quadtrees
    //         //// with new rect bounds. each new quadrant passed list of
    //         // particles, each adds its own particles, and parent quadrant's
    //         // particle list is set to zero
    //     },
    // };

    // var Rectangle = {// square collision detection, it wont really matter anyway
    //     overlapsWithParticle: function(particle){
    //         pMinX = particle.x - particle.radius;
    //         pMaxX = particle.x + particle.radius;
    //         pMinY = particle.y - particle.radius;
    //         pMaxY = particle.y + particle.radius;
    //         return ((pMinX < this.x + this.width && pMaxX > this.x) &&
    //                     (pMinY < this.y + this.height && pMaxY > this.y));
    //     },
    //     draw: function(){
    //         context.fillStyle = "rgba(0,200,100,0.1)";
    //         context.fillRect(this.x,this.y,this.width,this.height);
    //     }
    // };


    function makeParticle(x,y){
        Empty = function(){};
        Empty.prototype = Particle;
        var particle = new Empty();
        particle.x = x;
        particle.y = y;
        return particle;
    }

    // function makeQuadtree(x, y, width, height){
    //     Empty = function(){};
    //     Empty.prototype = Quadtree;
    //     var quadtree = new Empty();
    //     quadtree.particles = [];
    //     quadtree.quadrants = [];
    //     quadtree.rectangle = makeRectangle(x, y, width, height);
    //     return quadtree;
    // }

    // function makeRectangle(x, y, width, height){
    //     Empty = function(){};
    //     Empty.prototype = Rectangle;
    //     var rectangle = new Empty();
    //     rectangle.x = x;
    //     rectangle.y = y;
    //     rectangle.width = width;
    //     rectangle.height = height;
    //     return rectangle;
    // }

    for (var i=0; i<50; i++){
        var particle = makeParticle(Math.random()*canvas.width, Math.random()*canvas.height);
        global_particles.push(particle);
    }
    // particle = makeParticle(10,10);
    // particles.push(particle);
    quadtreeRoot = makeQuadtree(0,0, canvas.width, canvas.height);
    

    function prepCanvas(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function quadTreeSetup(){
        quadtreeRoot.quadrants = [];
        quadtreeRoot.particles = [];
        quadTreeNodes = [];
        quadTreeNodes.push(quadtreeRoot);
        quadtreeRoot.addParticles(global_particles);
    }

    function animate(){
        for (var i = 0; i < global_particles.length; i++) {
            global_particles[i].move();
            global_particles[i].nearbyParticles = [];
        }
        // particle.move();
    }

    function render(){
        for (var i = 0; i < quadTreeNodes.length; i++) {
            quadTreeNodes[i].rectangle.draw();
        }
        for (var i = 0; i < global_particles.length; i++) {
            global_particles[i].draw();
        }
        // particle.draw(); 
    }

    function loop(){
        prepCanvas();
        quadTreeSetup();
        animate();
        render();
        requestAnimationFrame(loop);
    }
    // console.log(particles);
    loop();
}