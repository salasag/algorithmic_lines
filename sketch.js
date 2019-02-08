//import { ColorCycler } from "./ColorCycler";

var CANVAS_HEIGHT = 800;
var CANVAS_WIDTH  = 1600;
let FPS = 60;
let objects = [];
let isMousePreviouslyPressed = false;
let speedRange = 8;
let sizeRange = 100;
let counter = 0;
let reflectionFactor = 1;
let currentColor = [100,100,100]
let colorChange = 0
let colorDirection = 1;
let colorMode = 0;
let maxColor = 255;
let minColor = 100;
let SIDEBAR_WIDTH = 100;
let GRAYSCALE_CODE = 0;
let RGB_CODE = 1;
let WARM_CODE = 2;
let COOL_CODE = 3;
let colorBarHeight = 0
let colorBarDirection = 1
let colorCyclers = []

function setup(){
    CANVAS_HEIGHT = windowHeight;
    CANVAS_WIDTH  = windowWidth-SIDEBAR_WIDTH;
    createCanvas(CANVAS_WIDTH+SIDEBAR_WIDTH,CANVAS_HEIGHT);
    frameRate(FPS);
    setupObjects();
    background(255);
    initColor()
    fill(0);
}

function setupObjects(){
}

function initColor(){
    colorCyclers[GRAYSCALE_CODE]=new ColorCycler([
        [0,0,0],
        [255,255,255]
    ],100)
    colorCyclers[RGB_CODE]=new ColorCycler([
        [255,100,100],
        [255,255,100],
        [100,255,100],
        [100,255,255],
        [100,100,255],
        [255,100,255]
    ],250);
    colorCyclers[WARM_CODE]=new ColorCycler([
        [255,100,100],
        [255,255,100]
    ],250);
    colorCyclers[COOL_CODE]=new ColorCycler([
        [100,255,100],
        [100,255,255],
        [100,100,255],
        [255,100,255]
    ],250);
}

function getNewColor(){
    colorCyclers[colorMode].cycleColor()
    currentColor = colorCyclers[colorMode].getColor()
}

function draw(){
    drawObjects();
    handleMouseClick();
    handleCollisions();
    getNewColor();
    isMousePreviouslyPressed = mouseIsPressed;
}

function drawObjects(){
    objects.map(currentObject => {
        currentObject.move();
        currentObject.draw();
    });
    if((colorBarDirection > 0 && colorBarHeight > CANVAS_HEIGHT) || (colorBarDirection < 0 && colorBarHeight < 0)){
        colorBarDirection *= -1
    }
    colorBarHeight += colorBarDirection;
    stroke(currentColor)
    line(CANVAS_WIDTH, colorBarHeight, CANVAS_WIDTH+SIDEBAR_WIDTH, colorBarHeight);

}

function handleCollisions(){
    objects.map(obj1 => {
        objects.map(obj2 => {
            if(isCollisionCircle(obj1.xPosition,obj1.yPosition,obj1.width,obj2.xPosition,obj2.yPosition,obj2.width)){
                stroke(currentColor)
                line(obj1.xPosition, obj1.yPosition, obj2.xPosition, obj2.yPosition);
            }
        });
    });
}

function handleCounter(){
    counter++;
    if(counter>10^9){counter=0;}
}

function handleMouseClick(){
    if(mouseIsPressed && counter%5 == 0 && mouseX < CANVAS_WIDTH && mouseX > 0 && mouseY < CANVAS_HEIGHT && mouseY > 0){
        let radius = Math.random()*sizeRange;
        objects.push(new PhysicsObject(mouseX,mouseY,Math.random()*speedRange-speedRange/2,Math.random()*speedRange-speedRange/2,0,0,radius,radius))
        if(objects.length > 50){
            objects.shift();
        }
    }
    else if(mouseIsPressed && !isMousePreviouslyPressed && mouseX > CANVAS_WIDTH && mouseX < CANVAS_WIDTH+SIDEBAR_WIDTH && mouseY < CANVAS_HEIGHT && mouseY > 0){
        colorMode = (colorMode+1)%colorCyclers.length;
        // initColor()
    }
}

function isCollisionRectangle(x1,width1,y1,height1,x2,width2,y2,height2){
    return x1 < (x2+width2) && (x1+width1) > x2 &&
           y1 < (y2+height2) && (y1+height1) > y2;
}

function isCollisionCircle(x1,y1,r1,x2,y2,r2){
    return sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) < r1+r2;
}

class PhysicsObject{

    constructor(initXPosition,initYPosition,initXVelocity,initYVelocity,initXAcceleration,initYAcceleration,initWidth,initHeight){
        this.xPosition = initXPosition;
        this.yPosition = initYPosition;
        this.xVelocity = initXVelocity;
        this.yVelocity = initYVelocity;
        this.xAcceleration = initXAcceleration;
        this.yAcceleration = initYAcceleration;
        this.width = initWidth;
        this.height = initHeight
        this.color = getNewColor();
    }

    move(){
        this.xVelocity += this.xAcceleration;
        this.xPosition += this.xVelocity;
        this.yVelocity += this.yAcceleration;
        this.yPosition += this.yVelocity;
        if(this.xPosition > CANVAS_WIDTH){
            this.xPosition = CANVAS_WIDTH;
            this.xVelocity *= -reflectionFactor;
        }
        if(this.xPosition < 0){
            this.xPosition = 0;
            this.xVelocity *= -reflectionFactor;
        }
        if(this.yPosition > CANVAS_HEIGHT){
            this.yPosition = CANVAS_HEIGHT;
            this.yVelocity *= -reflectionFactor;
        }
        if(this.yPosition < 0){
            this.yPosition = 0;
            this.yVelocity *= -reflectionFactor;
        }
    }

    draw(){
        //fill(this.color)
        // ellipse(this.xPosition,this.yPosition,this.width,this.height);
    }

    onClick(){
        this.direction = !this.direction;
    }
}

class ColorCycler{

    constructor(colors,delay){
        this.colors = colors
        this.delay = delay
        this.currentColor = this.colors[0];
        this.currentIndex = 0;
        this.updateNextColor();
    }

    getColor(){
        return this.currentColor
    }

    updateNextColor(){
        this.previousIndex = this.currentIndex;
        this.currentIndex = (this.currentIndex+1)%this.colors.length
        this.previousColor = this.colors[this.previousIndex];
        this.currentColor = this.previousColor;
        this.nextColor = this.colors[this.currentIndex];
        let vRed   = (this.nextColor[0]-this.previousColor[0])/this.delay
        let vGreen = (this.nextColor[1]-this.previousColor[1])/this.delay
        let vBlue  = (this.nextColor[2]-this.previousColor[2])/this.delay
        this.velocities = [vRed,vGreen,vBlue]
    }

    cycleColor(){
        let redValue = this.currentColor[0]+this.velocities[0]
        let greenValue = this.currentColor[1]+this.velocities[1]
        let blueValue = this.currentColor[2]+this.velocities[2]
        if(Math.abs(this.nextColor[0]-this.previousColor[0])<=Math.abs(redValue-this.previousColor[0]) &&
           Math.abs(this.nextColor[1]-this.previousColor[1])<=Math.abs(greenValue-this.previousColor[1]) && 
           Math.abs(this.nextColor[2]-this.previousColor[2])<=Math.abs(blueValue-this.previousColor[2])){
            this.updateNextColor();
        }
        else{
            this.currentColor = [redValue, greenValue, blueValue];
        }
    }

}
