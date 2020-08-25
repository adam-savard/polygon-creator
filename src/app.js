import * as PIXI from 'pixi.js';

const pixiApp = new PIXI.Application({width: 975, height: 675});
var lastPoint = null;
var startPoint = null;
var points = [];
var mainStage = new PIXI.Container();
mainStage.width = 975;
mainStage.height = pixiApp.height
pixiApp.stage.addChild(mainStage);

class Button extends PIXI.Container{
    constructor(text, position, onclick){
        super();
        let textToDisplay = new PIXI.Text(text, {
            fontFamily: "Arial",
            fontSize: 20,
            fill: "white",
          });
        
        let buttonBackground = new PIXI.Graphics();
        buttonBackground.beginFill(0x66CCFF);
        buttonBackground.lineStyle(1, 0xFFFFFF, 1);
        buttonBackground.drawRect(0, 0, textToDisplay.width + 10, textToDisplay.height + 10);
        buttonBackground.endFill();
          buttonBackground.interactive = true;
          buttonBackground.buttonMode = true;
          buttonBackground.on('mousedown', function (ev){
            ev.stopPropagation();
            onclick();
          });

        this.addChild(buttonBackground);
        textToDisplay.anchor.set(0.5,0.5);
        textToDisplay.position.set(buttonBackground.width/2,buttonBackground.height/2);
        this.addChild(textToDisplay);
        this.text = textToDisplay;
        this.position.set(position.x, position.y);
    }
}

function save(){
    if(points.length > 0){
        let jsonified = {
            path: points
        }
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonified));
        var dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute("href",dataStr);
        dlAnchorElem.setAttribute("download", "polygon.json");
        dlAnchorElem.click();
    }
    else{
        alert("Nothing to export!");
    }
}

function drawLine(){
    let position = pixiApp.renderer.plugins.interaction.mouse.global;
    let circle = new PIXI.Graphics();
    circle.beginFill(0xE0FFFF);
    circle.drawCircle(0, 0, 4);
    circle.endFill();
    // circle.pivot.set(circle.width/2,circle.height/2);
    circle.position.set(position.x, position.y);
    mainStage.addChild(circle);
    
    if(lastPoint){
        let line = new PIXI.Graphics();
        line.lineStyle(2, 0xFFFFFF, 1);
        line.moveTo(lastPoint.position.x, lastPoint.position.y);
        line.lineTo(position.x, position.y);
        mainStage.addChild(line);
    }

    if(!startPoint){
        startPoint = position;
    }

    points.push(position.x, position.y);

    lastPoint = circle;
}

function clear(){
    mainStage.children.forEach(child=>{
        child.destroy();
    });
    points = [];
    lastPoint = null;
    startPoint = null;
    alert("Stage cleared!");
}

function finishPolygon(){
    if(lastPoint){
        let line = new PIXI.Graphics();
        line.lineStyle(2, 0xFFFFFF, 1);
        line.moveTo(lastPoint.position.x, lastPoint.position.y);
        line.lineTo(startPoint.x, startPoint.y);
        mainStage.addChild(line);

        let decision = confirm("Polygon created. Do you want to save?");
        if(decision) save();
    }
}


pixiApp.stage.interactive = true;
// mainStage.buttonMode = true;

pixiApp.stage.addChild(new Button("Save", {x:10, y:10}, save));
pixiApp.stage.addChild(new Button("Clear", {x:10, y:50}, clear));
let i = setInterval(function(){
    if(document.getElementById('pixi-canvas')){
        document.getElementById('pixi-canvas').appendChild(pixiApp.view);
        clearInterval(i);

        document.getElementById('pixi-canvas').addEventListener('click', drawLine);
        document.body.onkeypress = function(e){
            switch(true){
                case e.key == 'r':
                    finishPolygon();
                    break;
            }
        }
    }
},1)