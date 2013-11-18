function main(){
    var canvas = document.getElementById("canv");
    var context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.fillStyle = "rgba(200,0,200,.85)";
    var mouseDown = false;
    var cursorX;
    var cursorY;
    var start = {
        "x": 20,
        "y": 200,
    };
    var end = {
        "x": 200,
        "y": 200,
    };
    var control = {
        "x": (end.x-start.x)/2 + start.x,
        "y": (end.y-start.y)/2 + start.y,
    };

    this.onmousedown = function(e){
        mouseDown = true;
    };
    this.onmouseup = function(e){
        mouseDown = false;
    };

    this.onmousemove = function(e){
        if (mouseDown){
        control.x = e.pageX;
        control.y = e.pageY;
        }
    };


    function drawCircle(x, y, radius){
        context.beginPath();
        context.arc(x,y,radius,0,Math.PI,false);
        context.fill();
        console.log("X:", x, "Y:", y, "Radius:", radius);
    }

    function drawBezierEllipse(centerX, centerY, width, height) {
        context.beginPath();
      // context.moveTo(centerX, centerY - height/2); // starts at top
        context.moveTo(centerX -5, centerY); //goes to left


        context.bezierCurveTo(
            centerX - 5 - width/2, centerY - height/2,
            centerX + 5 + width/2, centerY - height/2,
            centerX + 5, centerY); //goes to right

      // context.bezierCurveTo(
      //   centerX + width/2, centerY - height/2, // C1 curves right
      //   centerX + width/2, centerY + height/2, // C2
      //   centerX, centerY + height/2); // goes to bottom
      
        context.bezierCurveTo(
            centerX + 5 + width/2, centerY + height/2,
            centerX - 5 - width/2, centerY + height/2,
            centerX - 5, centerY); //goes to left

      // context.bezierCurveTo(
      //   centerX - width/2, centerY + height/2, // C3 curves left
      //   centerX - width/2, centerY - height/2, // C4
      //   centerX, centerY - height/2); // back to top
     
        context.fill();
        context.closePath();
    }

    function drawQuadraticEllipse(start, control, end){
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.quadraticCurveTo(control.x, control.y, end.x, end.y);
        context.stroke();
    }

    
    function Circle(x, y){
        this.x = x;
        this.y = y;
        this.radius = 100;

        this.draw = function(){
            drawCircle(this.x, this.y, this.radius);
        };
    }

    

    function getVectorTo(fromObject, toObject){
        var x1 = fromObject.x;
        var y1 = fromObject.y;
        var x2 = toObject.x;
        var y2 = toObject.y;

        var deltaY = y2 - y1;
        var deltaX = x2 - x1;

        var vectorTo = {
            "x": deltaX,
            "y": deltaY,
        };

        return vectorTo;
    }

    function drawVector(startPoint, vectorTo){
        var endPoint = {
            "x": startPoint.x + vectorTo.x,
            "y": startPoint.y + vectorTo.y
        };
        context.beginPath();
        context.moveTo(startPoint.x,startPoint.y);
        context.lineTo(endPoint.x, endPoint.y);
        context.stroke();
    }

    // circle1 = new Circle(200, 200);



    function animate(){

    }

    function render(){
        drawQuadraticEllipse(start, control, end);
        drawBezierEllipse(300, 300, 200, 200);
        // circle1.draw();
    }

    function loop(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        animate();
        render();
        requestAnimationFrame(loop);
    }

    loop();

}