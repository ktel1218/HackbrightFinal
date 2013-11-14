

Game.EvasiveManeuversPlayerAI = function(units, asteroids){
    var boardSize = {width: 900, height: 900}; //game of this particular board
    var commands = [];
    var stepSize = 100;

    for(var i = 0; i < units.length; i++){
    var d = computeForceVector(units[i], asteroids); //dont have this yet
        if (Geometry.magnitude(d) > 0.00002){//normalize movement
            d = Geometry.normalize(d);
            p = {x: units[i].x + d.x * stepSize, y: units[i].y +d.y *stepSize};
            commands.push(AI.createMoveCommand(units[i], p));
        }
    }

    return commands;

    function computeForceVector(unit, asteroids){
        var vWall = computeWallForce(ship);
        var vAst = computeAsteroidForce(ship);
        var vShips = computeOtherShipForce(ship);
        return Geometry.sumVectors([vWall, vAst, vShips]);
    }

    function computeWallForce(ship){
        var velocity = {x: 0, y: 0};
        velocity.x = 1 / (ship.x * ship.x) -1 / (boardSize.width - ship.x) * (boardSize.width - ship.x);//set x force to the 1 divided by the square of the ships distance from the x wall (stay in the middle, move violently away)
        velocity.y = 1 / (ship.y * ship.y) -1 / (boardSize.height - ship.y) * (boardSize.width - ship.y);//same for the y
        velocity.x *= wallForceFactor;
        velocity.y *= wallForceFactor;

        return velocity;
    }

    function computeAsteroidForce(ship, asteroids){
        var velocity = {x: 0, y: 0};
        //for each asteroid look at how much force it exerts on the ship and get a vector of the sum of those forces and return it
        for(var i = 0; i < asteroids.length; i ++){
            var force = computePointForce(ship, asteroids[i]);
            velocity.x += force.x;
            velocity.y += force.y;
        }
        return velocity;
    }

    function computerOtherShipForce(ship, units){
        var velocity = {x: 0, y:0};
        for(var i = 0; i < units.length; i++){//how do I avoid unit affecting itself? Duhhh object comparison 
            if(ship !== units[i]){//force would be infinite
            var force = computePointForce(ship, units[i]);
            velocity.x += force.x;
            velocity.y += force.y;
            }
        }
        return velocity;
    }
    function computePointForce(ship, obstacle){
        var direction = Geometry.directionTo(obstacle, ship);
        var magnitude = Geometry.magnitude(direction);
        //return a vector in the direction of d
        direction.x *= 1/(magnitude * magnitude * magnitude);
        direction.y *= 1/(magnitude * magnitude * magnitude); //weighted by magnitude squared and another to get unit vector?
        return direction;

    }
};