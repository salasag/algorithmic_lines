//import { ColorCycler } from "./ColorCycler";

var CANVAS_HEIGHT = 800;
var CANVAS_WIDTH  = 1600;
let FPS = 60;
let objects = [];
let isMousePreviouslyPressed = false;
let speedRange = 8;
let sizeRange = 200;
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
let CUSTOM_CODE = 4;
let colorBarDirection = 1
let colorCyclers = []
let COLORPICKER_HEIGHT = SIDEBAR_WIDTH*1.5;
let TEXTBOX_HEIGHT = 50
let colorBarHeight = TEXTBOX_HEIGHT
let colorPicker;
let colorCycleBuilder;
let COLORCYCLEBUILDER_HEIGHT = COLORPICKER_HEIGHT;
let cursorSize = 10;
let cnv;
let alpha = 127;

function setup(){
    CANVAS_HEIGHT = windowHeight;
    CANVAS_WIDTH  = windowWidth-SIDEBAR_WIDTH;
    cnv = createCanvas(CANVAS_WIDTH+SIDEBAR_WIDTH,CANVAS_HEIGHT);
    cnv.mouseWheel(handleDelayChange);
    frameRate(FPS);
    textAlign(CENTER, CENTER);
    background(255);
    setupObjects();
    initColor()
    cursor(CROSS)
    fill(0);
}

function handleDelayChange(event){
    getColorCycler().changeDelay(Math.floor((event.deltaY)/10))
}

function setupObjects(){
    colorPicker = new ColorPicker(CANVAS_WIDTH+1,CANVAS_HEIGHT-COLORPICKER_HEIGHT,SIDEBAR_WIDTH,COLORPICKER_HEIGHT)
    colorPicker.draw();
    colorCycleBuilder = new ColorCycleBuilder(CANVAS_WIDTH+1,CANVAS_HEIGHT-COLORPICKER_HEIGHT-COLORCYCLEBUILDER_HEIGHT,SIDEBAR_WIDTH,COLORCYCLEBUILDER_HEIGHT,0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
    colorCycleBuilder.draw();
}

function initColor(){
    colorCyclers[GRAYSCALE_CODE]=new ColorCycler([
        [0,0,0],
        [255,255,255]
    ],500)
    colorCyclers[RGB_CODE]=new ColorCycler([
        [255,100,100],
        [255,255,100],
        [100,255,100],
        [100,255,255],
        [100,100,255],
        [255,100,255]
    ],500);
    colorCyclers[WARM_CODE]=new ColorCycler([
        [255,100,100],
        [255,255,100]
    ],500);
    colorCyclers[COOL_CODE]=new ColorCycler([
        [100,255,100],
        [100,255,255],
        [100,100,255],
        [255,100,255]
    ],500);
}

function getNewColor(){
    getColorCycler().cycleColor();
    currentColor = getColorCycler().getColor();
    currentColor.push(50)
}

function getColorCycler(){
    if(colorMode==CUSTOM_CODE){
        return colorCycleBuilder.getColorCycler()
    }
    else{
        return colorCyclers[colorMode]
    }
}

function draw(){
    handleMouseClick();
    handleCollisions();
    drawObjects();
    getNewColor();
    isMousePreviouslyPressed = mouseIsPressed;
}

function drawObjects(){
    objects.map(currentObject => {
        currentObject.move();
        currentObject.draw();
    });
    push()
    drawColorBar();
    drawTextBox();
    drawCover();
    pop()
}

function drawColorBar(){
    if((colorBarDirection > 0 && colorBarHeight > CANVAS_HEIGHT-COLORPICKER_HEIGHT-COLORCYCLEBUILDER_HEIGHT) || (colorBarDirection < 0 && colorBarHeight < TEXTBOX_HEIGHT)){
        colorBarDirection *= -1
    }
    colorBarHeight += colorBarDirection;
    stroke(currentColor)
    line(CANVAS_WIDTH, colorBarHeight, CANVAS_WIDTH+SIDEBAR_WIDTH, colorBarHeight);
}

function drawTextBox(){
    fill(currentColor)
    rect(CANVAS_WIDTH,0,SIDEBAR_WIDTH,TEXTBOX_HEIGHT)
    fill(255)
    stroke(0)
    if(colorMode == GRAYSCALE_CODE){
        textSize(15);
        text("GRAYSCALE",CANVAS_WIDTH+SIDEBAR_WIDTH/2,TEXTBOX_HEIGHT/4)
    }
    else if(colorMode == RGB_CODE){
        textSize(25);
        text("RGB",CANVAS_WIDTH+SIDEBAR_WIDTH/2,TEXTBOX_HEIGHT/4)
    }
    else if(colorMode == WARM_CODE){
        textSize(25);
        text("WARM",CANVAS_WIDTH+SIDEBAR_WIDTH/2,TEXTBOX_HEIGHT/4)
    }
    else if(colorMode == COOL_CODE){
        textSize(25);
        text("COOL",CANVAS_WIDTH+SIDEBAR_WIDTH/2,TEXTBOX_HEIGHT/4)
    }
    else{
        textSize(20);
        text("CUSTOM",CANVAS_WIDTH+SIDEBAR_WIDTH/2,TEXTBOX_HEIGHT/4)
    }
    text(this.getColorCycler().getDelay(),CANVAS_WIDTH+SIDEBAR_WIDTH/2,TEXTBOX_HEIGHT*3/4)
}

function drawCover(){
    if(mouseX < CANVAS_WIDTH){
        noStroke();
        fill(currentColor)
        rect(CANVAS_WIDTH,0,SIDEBAR_WIDTH,CANVAS_HEIGHT);
    }
    else if(pmouseX < CANVAS_WIDTH){
        colorPicker.draw()
        colorCycleBuilder.draw()
    }
}

function handleCollisions(){
    objects.map(obj1 => {
        objects.map(obj2 => {
            if(isCollisionCircle(obj1.xPosition,obj1.yPosition,obj1.width,obj2.xPosition,obj2.yPosition,obj2.width)){
                stroke(currentColor)
                if(obj1.xPosition!=obj2.xPosition||obj1.yPosition!=obj2.yPosition){
                    let dist = distance(obj1.xPosition,obj1.yPosition,obj2.xPosition,obj2.yPosition)
                    if(obj1.type+obj2.type==0 || obj1.type+obj2.type==2){
                        noFill()
                        ellipse((obj1.xPosition+obj2.xPosition)/2,(obj1.yPosition+obj2.yPosition)/2,dist)
                    }
                    else{
                        line(obj1.xPosition, obj1.yPosition, obj2.xPosition, obj2.yPosition);
                        //stroke(255-currentColor[0],255-currentColor[1],255-currentColor[2])
                        // stroke(currentColor[0]-50,currentColor[1]-50,currentColor[2]-50)
                        // for(let i = 0; i < 50; i++){
                        //     let x = (obj1.xPosition+obj2.xPosition)/2 + (2*Math.random()-1)*dist;
                        //     let y = (obj1.yPosition+obj2.yPosition)/2 + (2*Math.random()-1)*dist;
                        //     point(x,y)
                        // }
                    }
                }
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
        objects.push(new PhysicsObject(mouseX,mouseY,Math.random()*speedRange-speedRange/2,Math.random()*speedRange-speedRange/2,0,0,radius,radius,Math.floor(Math.random()*2)))
        if(objects.length > 50){
            objects.shift();
        }
    }
    else if(mouseIsPressed && !isMousePreviouslyPressed && mouseX > CANVAS_WIDTH && mouseX < CANVAS_WIDTH+SIDEBAR_WIDTH && mouseY < CANVAS_HEIGHT-COLORPICKER_HEIGHT-COLORCYCLEBUILDER_HEIGHT && mouseY > 0){
        colorMode = (colorMode+1)%(colorCyclers.length+1);
    }
    if(!mouseIsPressed && colorCycleBuilder.isContinuousDraw()){
        objects = []
    }
    colorPicker.handleClick(mouseX,mouseY,mouseIsPressed,isMousePreviouslyPressed)
    let cycleBuilderSignal = colorCycleBuilder.handleClick(mouseX,mouseY,mouseIsPressed,isMousePreviouslyPressed,colorPicker.getColor());
    if(cycleBuilderSignal == "CLEAR_SCREEN"){
        clearScreen()
    }
}

function clearScreen(){
    stroke(0)
    fill(255)
    rect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT)
    objects = []
}

function isCollisionRectangle(x1,width1,y1,height1,x2,width2,y2,height2){
    return x1 < (x2+width2) && (x1+width1) > x2 &&
           y1 < (y2+height2) && (y1+height1) > y2;
}

function isCollisionCircle(x1,y1,r1,x2,y2,r2){
    return distance(x1,y1,x2,y2) < r1+r2;
}

function distance(x1,y1,x2,y2){
    return sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

class PhysicsObject{

    constructor(initXPosition,initYPosition,initXVelocity,initYVelocity,initXAcceleration,initYAcceleration,initWidth,initHeight,type){
        this.xPosition = initXPosition;
        this.yPosition = initYPosition;
        this.xVelocity = initXVelocity;
        this.yVelocity = initYVelocity;
        this.xAcceleration = initXAcceleration;
        this.yAcceleration = initYAcceleration;
        this.width = initWidth;
        this.height = initHeight
        this.color = [0,0,0];
        this.type = type
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
        this.MIN_DELAY = 20
        this.MAX_DELAY = 2000
        this.updateNextColor();
    }

    getColor(){
        return this.currentColor
    }

    getColors(){
        return this.colors
    }

    getDelay(){
        return this.delay
    }

    getColorDelay(delay){
        let index = Math.floor(delay/this.delay)%this.colors.length;
        let previousColor = this.colors[index];
        let nextColor = this.colors[(index+1)%this.colors.length]
        let fractionToNext = ((delay+.1)%this.delay)/this.delay;
        let redValue   = previousColor[0]+(nextColor[0]-previousColor[0])*fractionToNext;
        let greenValue = previousColor[1]+(nextColor[1]-previousColor[1])*fractionToNext;
        let blueValue  = previousColor[2]+(nextColor[2]-previousColor[2])*fractionToNext;
        return [redValue,greenValue,blueValue]
    }

    updateNextColor(){
        this.previousIndex = this.currentIndex;
        this.currentIndex = (this.currentIndex+1)%this.colors.length
        this.previousColor = this.colors[this.previousIndex];
        this.currentColor = this.previousColor;
        this.nextColor = this.colors[this.currentIndex];
        this.updateVelocities()
    }

    updateVelocities(){
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

    addColor(color){
        this.colors.push(color)
    }

    removeColor(index){
        this.colors.splice(index,1)
        if(this.colors.length!=0){
            this.currentColor = this.colors[0];
            this.currentIndex = 0;
            this.updateNextColor();
        }
    }
    
    changeDelay(amount){
        this.delay = Math.max(Math.min(this.delay + amount,this.MAX_DELAY),this.MIN_DELAY)
        this.updateVelocities()
    }
}

class ColorPicker{

    constructor(xPosition,yPosition,width,height){
        this.xPosition = xPosition;
        this.yPosition = yPosition;
        this.width = width;
        this.height = height;
        this.colorBarWidthScale = .8;
        this.colorBarHeightScale = .005;
        this.colorBarBufferBottom = .05;
        this.colorBarBufferTop = .1;
        this.colorLinePickerRadius    = (1-this.colorBarWidthScale)/2*this.width;
        let colors = [[255,0  ,0  ],
                      [255,255,0  ],
                      [0  ,255,0  ],
                      [0  ,255,255],
                      [0  ,0  ,255],
                      [255,0  ,255]]
        this.colorCycler=new ColorCycler(colors,this.width * this.colorBarWidthScale/colors.length);
        this.colorLinePickerColor = this.colorCycler.getColor();
        this.colorLinePickerRelativeX = 0;
        this.colorLinePickerAbsoluteX = this.xPosition+this.width*(1-this.colorBarWidthScale)/2;
        this.colorLinePickerAbsoluteY = this.yPosition+(1-this.colorBarHeightScale/2-this.colorBarBufferBottom)*this.height;
        this.colorPalettePickerColor = [255,255,255];

        this.colorPaletteHeightScale = .8

        this.colorPalettePickerRelativeX = 0;
        this.colorPalettePickerAbsoluteX = this.xPosition+this.width*(1-this.colorBarWidthScale)/2;
        this.colorPalettePickerRelativeY = 0;
        this.colorPalettePickerAbsoluteY = this.yPosition+this.colorBarBufferTop*this.height;
        this.draw()
    }

    draw(){
        this.drawBackground();
        this.drawColorLine();
        this.drawColorPalette();
    }
    
    drawBackground(){
        fill(this.colorPalettePickerColor);
        stroke(0);
        rect(this.xPosition,this.yPosition,this.width,this.height);
    }
    
    drawColorLine(){
        let endX = this.colorLinePickerAbsoluteX + this.width*this.colorBarWidthScale
        for(let i = this.colorLinePickerAbsoluteX; i < endX; i++) {
            stroke(this.colorCycler.getColorDelay(i-this.colorLinePickerAbsoluteX))
            line(i,this.yPosition+(1-this.colorBarHeightScale-this.colorBarBufferBottom)*this.height,i,this.yPosition+(1-this.colorBarBufferBottom)*this.height);
        }
        noStroke()
        fill(this.colorLinePickerColor)
        ellipse(this.colorLinePickerAbsoluteX+this.colorLinePickerRelativeX,this.colorLinePickerAbsoluteY,this.colorLinePickerRadius,this.colorLinePickerRadius)
    }

    drawColorPalette(){
        let endX = this.colorLinePickerAbsoluteX + this.width*this.colorBarWidthScale
        for(let i = this.colorLinePickerAbsoluteX; i < endX; i++) {
            let currentRHorizontal = 255-(255-this.colorLinePickerColor[0])/(this.width*this.colorBarWidthScale)*(i-this.colorLinePickerAbsoluteX)
            let currentGHorizontal = 255-(255-this.colorLinePickerColor[1])/(this.width*this.colorBarWidthScale)*(i-this.colorLinePickerAbsoluteX)
            let currentBHorizontal = 255-(255-this.colorLinePickerColor[2])/(this.width*this.colorBarWidthScale)*(i-this.colorLinePickerAbsoluteX)
            for(let j = this.colorPalettePickerAbsoluteY; j < this.colorPalettePickerAbsoluteY+this.height*this.colorPaletteHeightScale; j++) {
                let currentRVertical = currentRHorizontal-currentRHorizontal/(this.height*this.colorPaletteHeightScale)*(j-this.colorPalettePickerAbsoluteY)
                let currentGVertical = currentGHorizontal-currentGHorizontal/(this.height*this.colorPaletteHeightScale)*(j-this.colorPalettePickerAbsoluteY)
                let currentBVertical = currentBHorizontal-currentBHorizontal/(this.height*this.colorPaletteHeightScale)*(j-this.colorPalettePickerAbsoluteY)
                stroke([currentRVertical,currentGVertical,currentBVertical])
                point(i,j);
            }
        }
        stroke(255)
        fill(this.colorPalettePickerColor)
        ellipse(this.colorPalettePickerAbsoluteX+this.colorPalettePickerRelativeX,this.colorPalettePickerAbsoluteY+this.colorPalettePickerRelativeY,this.colorLinePickerRadius,this.colorLinePickerRadius)
    }

    getColor(){
        return this.colorPalettePickerColor
    }

    handleClick(mouseX,mouseY,mouseIsPressed,isMousePreviouslyPressed){
        if(this.mouseInBounds(mouseX,mouseY)){
            
        }//this.mouseOnColorLinePicker(mouseX,mouseY) && 
        if(mouseIsPressed && mouseX > this.colorLinePickerAbsoluteX && mouseX < this.colorLinePickerAbsoluteX + this.width*this.colorBarWidthScale &&
            mouseY > this.colorPalettePickerAbsoluteY + this.height*this.colorPaletteHeightScale){
            this.colorLinePickerRelativeX = mouseX-this.colorLinePickerAbsoluteX;
            this.colorLinePickerColor = this.colorCycler.getColorDelay(this.colorLinePickerRelativeX)
            this.updateColorPalettePickerColor()
            this.draw()
        }
        if(mouseIsPressed && //this.mouseOnColorPalettePicker(mouseX,mouseY) && 
            mouseX > this.colorPalettePickerAbsoluteX && mouseX < this.colorPalettePickerAbsoluteX + this.width*this.colorBarWidthScale &&
            mouseY > this.colorPalettePickerAbsoluteY && mouseY < this.colorPalettePickerAbsoluteY + this.height*this.colorPaletteHeightScale){
            this.colorPalettePickerRelativeX = mouseX-this.colorPalettePickerAbsoluteX;
            this.colorPalettePickerRelativeY = mouseY-this.colorPalettePickerAbsoluteY;
            this.updateColorPalettePickerColor()
            this.draw()
        }
    }

    updateColorPalettePickerColor(){
        let redValue =   (255-(255-this.colorLinePickerColor[0])/(this.width*this.colorBarWidthScale)*this.colorPalettePickerRelativeX)*(1-this.colorPalettePickerRelativeY/(this.height*this.colorPaletteHeightScale))
        let greenValue = (255-(255-this.colorLinePickerColor[1])/(this.width*this.colorBarWidthScale)*this.colorPalettePickerRelativeX)*(1-this.colorPalettePickerRelativeY/(this.height*this.colorPaletteHeightScale))
        let blueValue =  (255-(255-this.colorLinePickerColor[2])/(this.width*this.colorBarWidthScale)*this.colorPalettePickerRelativeX)*(1-this.colorPalettePickerRelativeY/(this.height*this.colorPaletteHeightScale))
        this.colorPalettePickerColor = [redValue,greenValue,blueValue]
    }

    mouseInBounds(mouseX,mouseY){
        return mouseX > this.xPosition && mouseX < this.xPosition+this.width && mouseY > this.yPosition && mouseY < this.yPosition + this.height
    }

    mouseOnColorLinePicker(mouseX,mouseY){
        return Math.sqrt((this.colorLinePickerAbsoluteX+this.colorLinePickerRelativeX-mouseX)*(this.colorLinePickerAbsoluteX+this.colorLinePickerRelativeX-mouseX)
                        +(this.colorLinePickerAbsoluteY-mouseY)*(this.colorLinePickerAbsoluteY-mouseY)) < this.colorLinePickerRadius
    }
    
    mouseOnColorPalettePicker(mouseX,mouseY){
        return Math.sqrt((this.colorPalettePickerAbsoluteX+this.colorPalettePickerRelativeX-mouseX)*(this.colorPalettePickerAbsoluteX+this.colorPalettePickerRelativeY-mouseX)
                        +(this.colorPalettePickerAbsoluteY+this.colorPalettePickerRelativeY-mouseY)*(this.colorPalettePickerAbsoluteY+this.colorPalettePickerRelativeY-mouseY)) < this.colorLinePickerRadius
    }
}

class ColorCycleBuilder{

    constructor(xPosition,yPosition,width,height){
        this.xPosition = xPosition
        this.yPosition = yPosition
        this.width = width
        this.height = height
        this.buttonHeightScale = .2
        this.pickedColor = [255,255,255]
        this.colorCycler;
        this.continuousDraw = false;
        this.defaultColorCycler = new ColorCycler([[255,255,255],[0,0,0]],500);
    }

    draw(){
        this.drawBackground()
        this.drawButtons()
        this.drawColors()
    }

    drawBackground(){
        stroke(0)
        fill(this.pickedColor)
        rect(this.xPosition,this.yPosition,this.width,this.height)
    }

    drawColors(){
        if(this.colorCycler!=undefined){
            let scale = 0.9;
            let numberPerRow = Math.ceil(Math.sqrt(this.colorCycler.getColors().length))
            for(let colorNumber = 0; colorNumber < this.colorCycler.getColors().length; colorNumber++){
                let i = colorNumber%numberPerRow
                let j = Math.floor(colorNumber/numberPerRow)
                let width  = this.width/numberPerRow
                let height = (1-this.buttonHeightScale)*this.height/numberPerRow
                let x = i*width
                let y = j*height
                stroke(0)
                fill(this.colorCycler.getColors()[colorNumber])
                rect(this.xPosition+x+(1-scale)/2*width,this.yPosition+y+(1-scale)/2*height,width*scale,height*scale)
            }
        }
    }

    getColorCycler(){
        if(this.colorCycler==undefined){
            return this.defaultColorCycler
        }
        else{
            return this.colorCycler
        }
    }

    isContinuousDraw(){
        return this.continuousDraw;
    }

    drawButtons(){
        stroke(0)
        fill(this.pickedColor)
        rect(this.xPosition,this.yPosition+(1-this.buttonHeightScale)*this.height,this.width/3,this.height*this.buttonHeightScale)
        rect(this.xPosition+this.width/3,this.yPosition+(1-this.buttonHeightScale)*this.height,this.width/3,this.height*this.buttonHeightScale)
        rect(this.xPosition+this.width*2/3,this.yPosition+(1-this.buttonHeightScale)*this.height,this.width/3,this.height*this.buttonHeightScale)
        fill(255)
        textSize(25);
        text("+",this.xPosition+this.width/6,this.yPosition+(1-this.buttonHeightScale/2)*this.height)
        if(this.continuousDraw){
            fill(127)
        }
        else{
            fill(255)
        }
        rect(this.xPosition+this.width*(1/3)*(1+2/5),this.yPosition+(1-this.buttonHeightScale*.6)*this.height,this.width/3*1/5,this.height*this.buttonHeightScale*1/5)
        text("x",this.xPosition+this.width*5/6,this.yPosition+(1-this.buttonHeightScale/2)*this.height)
        stroke(this.pickedColor)
    }

    handleClick(mouseX,mouseY,mouseIsPressed,isMousePreviouslyPressed,color){
        this.pickedColor = color
        // 
        if(mouseIsPressed && !isMousePreviouslyPressed && mouseX > this.xPosition && mouseX < this.xPosition + this.width/3 &&
           mouseY > this.yPosition + (1-this.buttonHeightScale)*this.height && mouseY < this.yPosition + this.height){
            if(this.colorCycler==undefined){
                this.colorCycler = new ColorCycler([color],500)
            }
            else{
                this.colorCycler.addColor(this.pickedColor)
            }
            this.draw();
        }
        // Toggle Continuous Draw
        else if(mouseIsPressed && !isMousePreviouslyPressed && mouseX > this.xPosition + this.width/3 && mouseX < this.xPosition + this.width*2/3 &&
           mouseY > this.yPosition + (1-this.buttonHeightScale)*this.height && mouseY < this.yPosition + this.height){
            this.continuousDraw = !this.continuousDraw
            this.draw()
        }
        // Clear Screen
        else if(mouseIsPressed && !isMousePreviouslyPressed && mouseX > this.xPosition + this.width*2/3 && mouseX < this.xPosition + this.width &&
           mouseY > this.yPosition + (1-this.buttonHeightScale)*this.height && mouseY < this.yPosition + this.height){
            return "CLEAR_SCREEN"
        }
        // Delete custom color
        else if(mouseIsPressed && !isMousePreviouslyPressed && mouseX > this.xPosition && mouseX < this.xPosition + this.width &&
            mouseY < this.yPosition + (1-this.buttonHeightScale)*this.height && mouseY > this.yPosition &&
            this.colorCycler!=undefined){
            let numberPerRow = Math.ceil(Math.sqrt(this.colorCycler.getColors().length))
            let width  = this.width/numberPerRow
            let height = this.height/numberPerRow
            let i = Math.floor((mouseX-this.xPosition)/width)
            let j = Math.floor((mouseY-this.yPosition)/height)
            let colorNumber = j*numberPerRow+i;
            this.colorCycler.removeColor(colorNumber);
            if(this.colorCycler.getColors().length==0){
                this.colorCycler=undefined;
            }
            this.draw();
        }
        //this.draw()
    }
}