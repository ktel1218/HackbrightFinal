var canvas = null;
var ctx = null;
var spritesheet = null;
var spritesheetLoaded = false;

var world = [[]];

var worldWidth = 16;
var worldHeight = 16;
var tileWidth = 32;
var tileHeight = 32;

var pathStart = [worldWidth,worldHeight];
var pathEnd = [0,0];
var currentPath = [];

//dont throw errors with console.log
if (typeof console == 'undefined') var console = {log: function() {}};

function onload(){
    console.log('Page loaded.');
    canvas = document.getElementById('gameCanvas');
    canvas.width = worldWidth*tileWidth;
    canvas.height = worldHeight*tileHeight;
}