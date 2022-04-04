import * as PIXI from 'pixi.js'
import { FpsMeter } from './fps-meter';
//const fs = require('fs');


let fpsMeter: FpsMeter;

const player = PIXI.Sprite.from('images/logo.png');
const backgroundImage = PIXI.Sprite.from('images/logo.png');
// const foreground = PIXI.Sprite.from('images/logo.png');


interface EngineParams {
    containerId: string,
    canvasW: number,
    canvasH: number,
    fpsMax: number
}

class Engine {
    public container: HTMLElement;
    public loader: PIXI.Loader;
    public renderer: PIXI.Renderer;
    public stage: PIXI.Container;
    public graphics: PIXI.Graphics;
    public fpsMax: number;

    

    constructor(params: EngineParams) {
        this.loader = PIXI.Loader.shared;
        this.renderer = PIXI.autoDetectRenderer({
            width: params.canvasW,
            height: params.canvasH,
            antialias: true
        });
        this.stage = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.fpsMax = params.fpsMax;

        this.container = params.containerId ? document.getElementById(params.containerId) || document.body : document.body;
        this.container.appendChild(this.renderer.view);
    } // constructor
} // Engine

let engine = new Engine({
    containerId: 'game',
    canvasW: 2000,
    canvasH: 2000,
    fpsMax: 60,
});

function setCookie(name:string,value:any,days:number) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name:string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return "";
}


let playerInfo:{[name:string]:any} = {
    vx: 0,
    vy: 0,
    grounded: false,
    roofed: false,
    leftWall: false,
    rightWall: false,
    terminalVelocity: -20,
    magicDashKey: "l",
    leftKey: "a",
    rightKey: "d",
    upKey: "w",
    downKey: "s",
    jumpKey: " ",
    // leftKey: "ArrowLeft",
    // rightKey: "ArrowRight",
    // upKey: "ArrowUp",
    // downKey: "ArrowDown",
    // jumpKey: "ArrowUp",
    canMagicDash: true,
    magicJuice: 50,
    magicJuiceMax: 50,
    dashing: false,
    hasWallJump: true,
    screenShot: false,
    lastSavePoint: [300, 700],
    lastLevel: "overworld",
    displayType: "hitbox",
    useBitmap: true,
    dev: true,
}

let canFly = false;
let disableFog = false;

for (let i = 0; i < Object.keys(playerInfo).length; i++) {

    if (getCookie("playerInfoCookie"+Object.keys(playerInfo)[i]) === ""){
    setCookie("playerInfoCookie"+Object.keys(playerInfo)[i], JSON.stringify(playerInfo[Object.keys(playerInfo)[i]]), 600);
    }
    playerInfo[Object.keys(playerInfo)[i]] = JSON.parse(getCookie("playerInfoCookie"+Object.keys(playerInfo)[i]));
}


const saveCookie =async()=> {
    for (let i = 0; i < Object.keys(playerInfo).length; i++) {
    setCookie("playerInfoCookie"+Object.keys(playerInfo)[i], JSON.stringify(playerInfo[Object.keys(playerInfo)[i]]), 600);
}}

window.onload = load;

function load() {
    create();
} // load

let keys:string[] = [""]

let levelData:any;
let staticLevelContainer = new PIXI.Container()
let jumpBuffer = 0;


backgroundImage.x  = 0;
backgroundImage.y = 0;  
staticLevelContainer.height = 2000;
staticLevelContainer.width = 2000;
engine.stage.addChild(staticLevelContainer);
// |---------------------------------------------------- LOAD LEVEL ---------------------------------------|
function loadLevel(filename:string) {
    levelData = require(('./Levels/'+filename+'/'+filename+'.json'));
    playerInfo.lastLevel = filename;
    staticLevelContainer.cacheAsBitmap = false;
    staticLevelContainer.removeChildren();
    engine.stage.removeChildren();
    engine.stage.addChild(staticLevelContainer);


    console.log('images/'+filename+'-background.png');
    backgroundImage.texture = PIXI.Texture.from('images/'+filename+'-background.png');
    backgroundImage.height = 2000
    backgroundImage.width = 2000

    let scaleX = 2000/window.innerWidth;
    let scaleY = 2000/window.innerHeight;
    console.log(filename);

    engine.stage.scale = new PIXI.Point(scaleX*1.5, scaleY*1.5);

    if (playerInfo.displayType == "hitbox") {  // |-------------- add physiks hitboxes
    for (let i = 0; i < levelData.phyBox.length; i++) {
        let obj = new PIXI.Graphics();
        obj.beginFill(0xffffff);
        obj.lineStyle(1, 0x000000);
        obj.drawRect(levelData.phyBox[i][0][0], levelData.phyBox[i][0][1], levelData.phyBox[i][1][0]-levelData.phyBox[i][0][0], levelData.phyBox[i][1][1]-levelData.phyBox[i][0][1]);
        staticLevelContainer.addChild(obj)
        if (levelData.phyBox[i].length == 3) {
            let label = new PIXI.Text(levelData.phyBox[i][2], {fontFamily: 'Arial', fontSize: 8, fill: 0x000000, align: 'center'});
            label.x = levelData.phyBox[i][0][0];
            label.y = levelData.phyBox[i][0][1];
            staticLevelContainer.addChild(label);
    }else{
        let label = new PIXI.Text(JSON.stringify(levelData.phyBox[i]), {fontFamily: 'Arial', fontSize: 8, fill: 0x000000, align: 'center'});
            label.x = levelData.phyBox[i][0][0];
            label.y = levelData.phyBox[i][0][1];
            staticLevelContainer.addChild(label);
    }

}

    for (let i = 0; i < levelData.deathBox.length; i++) {
        let obj = new PIXI.Graphics();
        obj.beginFill(0xffffff);
        obj.lineStyle(1, 0xfc0303);
        obj.drawRect(levelData.deathBox[i][0][0], levelData.deathBox[i][0][1], levelData.deathBox[i][1][0]-levelData.deathBox[i][0][0], levelData.deathBox[i][1][1]-levelData.deathBox[i][0][1]);
        staticLevelContainer.addChild(obj)
    }

    for (var i = 0; i < levelData.respawnPoint.length; i ++) {
        let obj6 = new PIXI.Graphics();
        obj6.beginFill(0xffffff);
        obj6.lineStyle(2, 0x00ff00);
        obj6.drawCircle(levelData.respawnPoint[i][0], levelData.respawnPoint[i][1], 5);
        staticLevelContainer.addChild(obj6)
    }
    
    for (let i = 0; i < levelData.teleport.length; i++) {
        console.log("loading level teliports")
        let obj3 = new PIXI.Graphics();
        obj3.beginFill(0xffffff);
        obj3.lineStyle(1, 0xc27b00);
        obj3.drawRect(levelData.teleport[i].bounding[0][0], levelData.teleport[i].bounding[0][1], levelData.teleport[i].bounding[1][0]-levelData.teleport[i].bounding[0][0], levelData.teleport[i].bounding[1][1]-levelData.teleport[i].bounding[0][1]);
        staticLevelContainer.addChild(obj3)
        let obj4 = new PIXI.Graphics();
        obj4.lineStyle(1, 0xc27b00);
        obj4.drawCircle(levelData.teleport[i].spawnX, levelData.teleport[i].spawnY, 5);
        staticLevelContainer.addChild(obj4)
        let label = new PIXI.Text(levelData.teleport[i].destination, {fontFamily: 'Arial', fontSize: 8, fill: 0x000000, align: 'center'});
            label.x = levelData.teleport[i].bounding[0][0]
            label.y = levelData.teleport[i].bounding[0][1]
            staticLevelContainer.addChild(label);

    }

    for (let i = 0; i < levelData.fog.length; i ++) {
        let fogObj = new PIXI.Graphics();
        fogObj.beginFill(0xa6a6a6);
        fogObj.name = levelData.fog[i];
        fogObj.lineStyle(0, 0x00000000);
        let filter = new PIXI.filters.BlurFilter(30);
        fogObj.filters = [filter];
        fogObj.drawRect(levelData.fog[i][0][0], levelData.fog[i][0][1], levelData.fog[i][1][0]-levelData.fog[i][0][0], levelData.fog[i][1][1]-levelData.fog[i][0][1]);
        engine.stage.addChild(fogObj)
    }
    

}
else if (playerInfo.displayType = "graphic"){
    staticLevelContainer.addChild(backgroundImage);
}   
if (playerInfo.useBitmap) {
    staticLevelContainer.cacheAsBitmap = true;
}
    engine.stage.addChild(player);
    saveCookie();


}

loadLevel(playerInfo.lastLevel);
let playerstart:number;

function create() {
    /* ***************************** */
    /* Create your Game Objects here */
    /* ***************************** */

    window.addEventListener("keydown", async function (event) {
        groundedText.innerHTML = 'Grounded: ' + playerInfo.grounded.toString() + " Leftwall: " + playerInfo.leftWall.toString();
        event.key.toLocaleLowerCase();
        if (event.defaultPrevented) {
          return; // Do nothing if the event was already processed
        }
        if (event.repeat) {return}
        if (!keys.includes(event.key)) {
        keys.push(event.key);
        }

        if (event.key === "Escape") {
            engine.stage.position.x = 0;
            engine.stage.position.y = 0;
            engine.stage.scale = new PIXI.Point(1, 1);
            engine.renderer.render(engine.stage);
            let screeshot = engine.renderer.view.toDataURL();
            // https://onlinepngtools.com/convert-data-uri-to-png
        navigator.clipboard.writeText(screeshot);
        engine.stage.scale = new PIXI.Point((2000/window.innerWidth)*1.5, (2000/window.innerHeight)*1.5);

        }

        if (event.key === "f") {
            canFly = !canFly;
            saveCookie();
        }

        if (event.key === "g") {
            disableFog = !disableFog;
            saveCookie();
        }

        if (event.key === playerInfo.jumpKey) {
            jumpBuffer = 10;
        if (coyoteTime > 0){
            if (event.repeat) {return}
            console.log("jumped");
            playerInfo.vy = 30;
            coyoteTime = 0;
            
        }else if (playerInfo.leftWall && playerInfo.hasWallJump && event.key === playerInfo.jumpKey) {
            playerInfo.vx -= 20;
            playerInfo.vy += 30;
        }else if (playerInfo.rightWall && playerInfo.hasWallJump && event.key === playerInfo.jumpKey) {
            playerInfo.vx += 20;
            playerInfo.vy += 30;
        }}

        if (event.key === playerInfo.magicDashKey && playerInfo.canMagicDash) {
            if (keys.includes(playerInfo.leftKey) && playerInfo.magicJuice >= 25) {
                playerInfo.dashing = true;
                playerstart = player.x;
                playerInfo.vx += 50;
                playerInfo.vy = 0;
                playerInfo.terminalVelocity = 0;
                playerInfo.magicJuice -= 25;
                setTimeout(function(){
                    playerInfo.dashing = false;
               }, 800)
            }
            if (keys.includes(playerInfo.rightKey) && playerInfo.magicJuice >= 25) {
                playerInfo.dashing = true;
                playerstart = player.x;
                playerInfo.vx -= 50;
                playerInfo.vy = 0;
                playerInfo.magicJuice -= 25;
                playerInfo.terminalVelocity = 0;
                setTimeout(function(){
                    playerInfo.dashing = false;
               }, 800)
            }
            if (keys.includes(playerInfo.upKey) && playerInfo.magicJuice >= 25) {
                playerstart = player.x;
                playerInfo.vy = 40;
                playerInfo.vx = 0;
                playerInfo.magicJuice -= 25;
            }
            document.documentElement.style.setProperty("--manaValue", (playerInfo.magicJuice/4)+"em");
        }

        event.preventDefault();
      }, true);

      window.addEventListener("keyup", async function (event) {
        keysText.innerHTML = 'Keys: ' + keys.join(" ").toString();
        if (event.defaultPrevented) {
          return; // Do nothing if the event was already processed
        }
        const result = keys.filter(function(x) {
            return x !== event.key;

        });
        keys = result;
        event.preventDefault();
      }, true);


    // |---------------------- player defined --------------------------------------|
    player.anchor.set(0.05);
    player.x = playerInfo.lastSavePoint[0];
    player.y = playerInfo.lastSavePoint[1];
    engine.stage.addChild(player);


    /* FPS */
    const fpsMeterItem = document.createElement('div');
    fpsMeterItem.classList.add('fps');
    engine.container.appendChild(fpsMeterItem);
    fpsMeterItem.style.position = 'absolute';
    fpsMeterItem.style.top = '0px';
    fpsMeterItem.style.left = '5px';

    fpsMeter = new FpsMeter(() => {
        fpsMeterItem.innerHTML = 'FPS: ' + fpsMeter.getFrameRate().toFixed(2).toString();
        keysText.innerHTML = 'Keys: ' + keys.join(" "),toString().replace(" ","Spacebar");
        groundedText.innerHTML = 'Grounded: ' + playerInfo.grounded.toString() + " Leftwall: " + playerInfo.leftWall.toString();
        playerCoordsItem.innerHTML = 'x: ' + player.x.toFixed(2).toString() + ' y: ' + player.y.toFixed(2).toString() + " xv: " + playerInfo.vx.toFixed(2).toString() + " yv: " + playerInfo.vy.toFixed(2).toString();
    });

    const playerCoordsItem = document.createElement('div');
    playerCoordsItem.classList.add('fps');
    engine.container.appendChild(playerCoordsItem);


    playerCoordsItem.innerHTML = 'x: ' + player.x.toFixed(2).toString() + ' y: ' + player.y.toFixed(2).toString() + " xv: " + playerInfo.vx.toFixed(2).toString() + " yv: " + playerInfo.vy.toFixed(2).toString();
    playerCoordsItem.style.position = 'absolute';
    playerCoordsItem.style.top = '20px';
    playerCoordsItem.style.left = '5px';

    const keysText = document.createElement('div');
    keysText.classList.add('fps');
    engine.container.appendChild(keysText);
    keysText.innerHTML = 'Keys: ' + keys.toString();
    keysText.style.position = 'absolute';
    keysText.style.top = '40px';
    keysText.style.left = '5px';

    const groundedText = document.createElement('div');
    groundedText.classList.add('fps');
    engine.container.appendChild(groundedText);
    groundedText.innerHTML = 'Grounded: ' + playerInfo.grounded.toString();
    groundedText.style.position = 'absolute';
    groundedText.style.top = '60px';
    groundedText.style.left = '5px';



    setInterval(update, 1000.0 / engine.fpsMax);
    render();
} // create
let coyoteTime = 0;
let camHeight:number = (2000/window.innerHeight)*-1.5; // 
let camWidth:number = (2000/window.innerWidth)*-1.5;
function update() {
    fpsMeter.updateTime();

    let fogZone = -1;
    for (let i = 0; i < levelData.fog.length; i++) {
        if (player.x > levelData.fog[i][0][0]
            && player.y > levelData.fog[i][0][1]
            && player.x + player.width/2 < levelData.fog[i][1][0]
            && player.y + player.height/2 < levelData.fog[i][1][1]) {
            fogZone = i;
            break;
        }
    }

    for (let j = 0; j < engine.stage.children.length; j++) {
        if (engine.stage.children[j].name === levelData.fog[fogZone]) {
            engine.stage.children[j].visible = false;
        }else {
            engine.stage.children[j].visible = true;
            if (disableFog && playerInfo.dev && !isNaN(parseFloat(engine.stage.children[j].name))) {
                engine.stage.children[j].visible = false;
            }
        }
    }



    
    if (playerInfo.dev && canFly) {
        if (keys.includes(playerInfo.leftKey)) {
            player.x -= 15;
        }
        if (keys.includes(playerInfo.rightKey)) {
            player.x += 15;
        }
        if (keys.includes(playerInfo.upKey)) {
            player.y -= 15;
        }
        if (keys.includes(playerInfo.downKey)) {
            player.y += 15;
        }
        return
    }

    /* ***************************** */
    /* Update your Game Objects here */
    /* ***************************** */



    // |------------------------- quick fall -------------------------------------------|
    if (keys.includes(playerInfo.downKey)) {
        playerInfo.terminalVelocity = -100;
        playerInfo.vx = 0;
    }else if (!playerInfo.dashing){
        playerInfo.terminalVelocity = -20;
    }



    const diff:number = playerstart - player.x
    if (playerInfo.dashing && (diff > 300 || diff < -300 || playerInfo.leftWall || playerInfo.rightWall)) {
        playerInfo.dashing = false;
        playerInfo.terminalVelocity = -20;
    }

    // |--------------------------------------------- moveing right --------------------|
    if (keys.includes(playerInfo.rightKey)) {
        if (playerInfo.vx > -10) {
        if (playerInfo.grounded) {
            playerInfo.vx -= 7;
        }
        playerInfo.vx -= 7;
    }}

    // |------------------------------ moveing left ----------------------------------|

    if (keys.includes(playerInfo.leftKey)&& !playerInfo.leftWall) {
        if (playerInfo.vx < 10) {
        if (playerInfo.grounded) {
            playerInfo.vx += 7;
        }
        playerInfo.vx += 7;
    }
        }


        //  |---------------------------- wall slide ----------------------------------|
if (playerInfo.hasWallJump) {
if (playerInfo.leftWall) {
    if (keys.includes(playerInfo.leftKey)) {
        playerInfo.terminalVelocity = -3;
    }
}else if (playerInfo.rightWall) {
    if (keys.includes(playerInfo.rightKey)) {
        playerInfo.terminalVelocity = -3;
    }
}
}

    if (playerInfo.vy > playerInfo.terminalVelocity) {
        playerInfo.vy -= 2;
    }else {
        playerInfo.vy += 2;
    }





    //|----------------------- adding/removeing veloicty ^  detecting colitions v ----------------------------|



    // |--------------------------- load into new level ----------------------------------------------------|
    for (let i = 0; i < levelData.teleport.length; i++) {
        if (player.x > levelData.teleport[i].bounding[0][0]
            && player.y > levelData.teleport[i].bounding[0][1]
            && player.x + player.width < levelData.teleport[i].bounding[1][0]
            && player.y + player.height < levelData.teleport[i].bounding[1][1]) {
            player.x = levelData.teleport[i].spawnX;
            player.y = levelData.teleport[i].spawnY;
            playerInfo.lastSavePoint = [levelData.teleport[i].spawnX, levelData.teleport[i].spawnY];
            loadLevel(levelData.teleport[i].destination);
            break;
        }
    }




    for (let i = 0; i < levelData.respawnPoint.length; i++) {
        if (player.x + player.width > levelData.respawnPoint[i][0]
            && player.y + player.height > levelData.respawnPoint[i][1]
            && player.x  < levelData.respawnPoint[i][0]
            && player.y  < levelData.respawnPoint[i][1])
            {
                playerInfo.lastSavePoint = [levelData.respawnPoint[i][0]-player.width/2, levelData.respawnPoint[i][1]-player.height/2];
                break;
            }
    }


    let leftwallfound = false;
    let rightwallfound = false;
    let groundfound = false;
    let rooffound = false;
    if (jumpBuffer > 0) {jumpBuffer--;}
    for (var i = 0; i < levelData.phyBox.length; i++) {
        if (!leftwallfound){
        if ( player.x >= levelData.phyBox[i][0][0]
            && player.y  + player.height*(3/4) > levelData.phyBox[i][0][1]
            && player.x  <= levelData.phyBox[i][1][0]
            && player.y +  player.height/4 < levelData.phyBox[i][1][1]
            ) {
                playerInfo.leftWall = true;
                leftwallfound = true;
                player.x = levelData.phyBox[i][1][0];
                if (playerInfo.vx > 0) {playerInfo.vx = 0;}
                
            }else{playerInfo.leftWall = false;}}
            // |---------------------- cheak right wall --------------------|
        if (!rightwallfound){
        if (player.x + player.width > levelData.phyBox[i][0][0]
            && player.y  + player.height*(3/4) > levelData.phyBox[i][0][1]
            && player.x + player.width < levelData.phyBox[i][1][0]
            && player.y +  player.height/4 < levelData.phyBox[i][1][1]
            ) {
                playerInfo.rightWall = true;
                player.x = levelData.phyBox[i][0][0]+3 - player.width;
                if (playerInfo.vx < 0) {playerInfo.vx = 0;}
                rightwallfound = true;
                
            }else{playerInfo.rightWall = false;}}
            // |---------------------- cheak ground --------------------|
    if (!groundfound && player.y+player.height >= levelData.phyBox[i][0][1] && player.y+player.height <= levelData.phyBox[i][1][1]) { 
        if (player.x+ (player.width-3) > levelData.phyBox[i][0][0] && player.x +3 < levelData.phyBox[i][1][0]) {
        if (playerInfo.vy < 0) {
        playerInfo.vy = 0;
        }
        if (player.y+player.height > levelData.phyBox[i][0][1] +1 && player.y+player.height < levelData.phyBox[i][1][1]) {
            player.y = levelData.phyBox[i][0][1]-player.height;
        }
        playerInfo.grounded = true;
        if (jumpBuffer > 0) {playerInfo.vy = 30; jumpBuffer = 0};
        if (playerInfo.vy < 25) {
        coyoteTime = 30;
        }
        if (playerInfo.vy == 0 && playerInfo.magicJuice < playerInfo.magicJuiceMax ) {
            playerInfo.magicJuice += 0.25;
            if (playerInfo.vx == 0) {
                playerInfo.magicJuice += 0.25;
            }   
            document.documentElement.style.setProperty("--manaValue", (playerInfo.magicJuice/4)+"em");
        }
        // playerStats.vy += 500; // |--------------remobve later-------------------------------------------------|

        groundfound = true;
    }else {playerInfo.grounded = false;
        if (coyoteTime > 0) {
            coyoteTime--;
        }
    }}

    if (!rooffound && player.y -10 >= levelData.phyBox[i][0][1] && player.y -10 <= levelData.phyBox[i][1][1]) { 
            if (player.x+ (player.width-3) > levelData.phyBox[i][0][0] && player.x +3 < levelData.phyBox[i][1][0]) {
                    if (playerInfo.vy > 0) {
            playerInfo.vy = 0;}
            if (player.y+player.height > levelData.phyBox[i][0][1] +1 && player.y+player.height < levelData.phyBox[i][1][1]) {
                player.y = levelData.phyBox[i][0][1]-player.height;
            }
            playerInfo.roofed = true;
            // playerStats.vy -= 500; // |--------------remobve later-------------------------------------------------|
            break; 
        }else{
            playerInfo.roofed = false;}}
        }  



    // |--------------- detect death -------------------|
    for (let i = 0; i < levelData.deathBox.length; i++) {
        if (player.x + player.width > levelData.deathBox[i][0][0]
            && player.y + player.height > levelData.deathBox[i][0][1]
            && player.x  < levelData.deathBox[i][1][0]
            && player.y < levelData.deathBox[i][1][1]
            )
            {
                player.x = playerInfo.lastSavePoint[0];
                player.y = playerInfo.lastSavePoint[1];
                playerInfo.vx = 0;
                playerInfo.vy = 0;
                keys = [];
                break;
            }
    }

    for (let i = 0; i < 4; i++) {
    if (playerInfo.vx < 0) {
        playerInfo.vx += 1;
    }else if (playerInfo.vx > 0) {
        playerInfo.vx -= 1;
    }
}

    player.x -= playerInfo.vx;
    player.y -= playerInfo.vy;


} // update

// let xFrame:number;
// let yFrame:number;
engine.renderer.backgroundColor = 0xffffff;
// let loop = 0;
function render() {
    requestAnimationFrame(render);

        // |--------- cam movement ---------------|
        engine.stage.position.y = player.y*camHeight + engine.renderer.view.height/2;
        engine.stage.position.x = player.x*camWidth + engine.renderer.view.width/2;

    engine.renderer.render(engine.stage);
    fpsMeter.tick();
} // render 

