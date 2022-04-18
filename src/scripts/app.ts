import * as PIXI from 'pixi.js'
import { FpsMeter } from './fps-meter';
//const fs = require('fs');


let fpsMeter: FpsMeter;

let playerAnimation = {
    "idle": [
            PIXI.Texture.from('images/idle_01.png')
        ],
    "run": [
            PIXI.Texture.from('images/run_01.png'), 
            PIXI.Texture.from('images/run_02.png')
        ],
    "wallSlide" : [
        PIXI.Texture.from('images/wallSlide_01.png'), 
        PIXI.Texture.from('images/wallSlide_02.png'), 
        PIXI.Texture.from('images/wallSlide_03.png'), 
    ], 
    "broken": [
        PIXI.Texture.from('images/brokenTexture.png'), 
    ],
    "dash": [
        PIXI.Texture.from('images/dash_01.png'), 
        PIXI.Texture.from('images/dash_02.png'), 
        PIXI.Texture.from('images/dash_03.png'), 
        PIXI.Texture.from('images/dash_04.png'), 
        PIXI.Texture.from('images/dash_05.png'), 

    ]
}
const player = PIXI.Sprite.from('images/idle_01.png');


// maby something like this https://m.media-amazon.com/images/I/71GqQB4KbiS._AC_UL320_.jpg
const spike1 = PIXI.Sprite.from('.images/stagAttack.png');
const spike2 = PIXI.Sprite.from('images/stagAttack.png');
const spike3 = PIXI.Sprite.from('images/stagAttack.png');
const spike4 = PIXI.Sprite.from('images/stagAttack.png');
const spike5 = PIXI.Sprite.from('images/stagAttack.png');
const spike6 = PIXI.Sprite.from('images/stagAttack.png');
const spike7 = PIXI.Sprite.from('images/stagAttack.png');
const spike8 = PIXI.Sprite.from('images/stagAttack.png');
const spike9 = PIXI.Sprite.from('images/stagAttack.png');
const spike10 = PIXI.Sprite.from('images/stagAttack.png');

const backgroundImage = PIXI.Sprite.from('images/idle_01.png')
// const foreground = PIXI.Sprite.from('images/idle_01.png');


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

function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

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
    canMagicDash: false,
    magicJuice: 50,
    magicJuiceMax: 50,
    hasWallJump: false,
    screenShot: false,
    lastSavePoint: [300, 700],
    lastLevel: "overworld",
    displayType: "hitbox",
    useBitmap: true,
    dev: true,
    hitLines: false,
    replay: false,
    replayLength: 60
}


let hitLineLeft = new PIXI.Graphics();
// hitLineLeft.beginFill(0xffffff);
hitLineLeft.lineStyle(1, 0x1ec732);
hitLineLeft.drawRect(0,0,1,1);
let hitLineRight = new PIXI.Graphics();
hitLineRight.beginFill(0xffffff);
hitLineRight.lineStyle(1, 0x1ec732);
hitLineRight.drawRect(0,0,2,2);
let hitLineTop = new PIXI.Graphics();
//hitLineTop.beginFill();
hitLineTop.lineStyle(1, 0x1ec732);
hitLineTop.drawRect(0,0,1,1);
let hitLineBottom = new PIXI.Graphics();
// hitLineBottom.beginFill(0xffffff);
hitLineBottom.lineStyle(1, 0x1ec732);
hitLineBottom.drawRect(0,0, 1, 1);


const wallJumpIcon = PIXI.Sprite.from('images/wallJumpIcon.png');
const labCave1Setup = () => {
    if (!playerInfo.hasWallJump){
        wallJumpIcon.height = 50;
        wallJumpIcon.width = 50;
        wallJumpIcon.x = 350
        wallJumpIcon.y = 1200
        engine.stage.addChild(wallJumpIcon)
        
    }
}

const setupSpike = (spike:any) => {
    spike.width = 50;
    spike.height = 300;
    spike.y = randomNumberGeneratorInRange(-400,-1400);
    spike.x = randomNumberGeneratorInRange(1,15)*100;
    engine.stage.addChild(spike);
}

const bossSetup = () => {
    setupSpike(spike1);
    setupSpike(spike2);
    setupSpike(spike3);
    setupSpike(spike4);
    setupSpike(spike5);
    setupSpike(spike6);
    setupSpike(spike7);
    setupSpike(spike8);
    setupSpike(spike9);
    setupSpike(spike10);
    playerInfo.lastSavePoint = [10,-100]
}

let uniqueSetup:{[key:string]:any} = {
"labCave-1": labCave1Setup,
"boss-1": bossSetup

}

const moveSpike = (spike:any, num:number) => {
    spike.y += num/3;
    if (spike.y > 1000){
        setupSpike(spike);
    }
    levelData.phyBox[num] = [[spike.x, spike.y], [spike.x + 50, spike.y + 270]];
    levelData.deathBox[num] = [[spike.x+10, spike.y+270], [spike.x + 30, spike.y + 300]];

    if (spike.y -2 < player.y+player.height && player.y+player.height < spike.y + 2 && spike.x < player.x+player.width-3 && spike.x + 50 > player.x+3 && player.y+player.height < 945) {
        if (playerInfo.vy < 0) {
            
            player.y = spike.y - player.height +1;
            // playerInfo.vy = -1*num/5
        }
    }

}




const bossLoop = () => {
    moveSpike(spike1, 0);
    moveSpike(spike2, 1);
    moveSpike(spike3, 2);
    moveSpike(spike4, 3);
    moveSpike(spike5, 4);
    moveSpike(spike6, 5);
    moveSpike(spike7, 6);
    moveSpike(spike8, 7);
    moveSpike(spike9, 8);
    moveSpike(spike10, 9);
}

function randomNumberGeneratorInRange(rangeStart:number, rangeEnd:number) {
    return Math.floor(Math.random() * (rangeStart - rangeEnd + 1) + rangeEnd);
 }


let sliderToFrame = (slider:number) => {
    playRecordedFrame(slider/100 * replayLoop.length)
}


function playRecordedFrame(frame:number) {
        frame = Math.round(frame)
        if (frame <= replayLoop.length) {
        console.log(replayLoop[frame][0]["replay-playerCoords"])
        console.log(replayLoop[frame])
        }
 }

// | -------------------------------------------------------- CUSTOM LEVEL BEHAVIOR -----------------------------------------------------|
const pickupJump = () => {
        if (!playerInfo.hasWallJump && player.x < 375 && player.y < 1200 && player.x+ player.width> 375 && player.y+player.height > 1200){
            playerInfo.hasWallJump = true;
            console.log("got wall jump");
            wallJumpIcon.visible = false;
            wallJumpIcon.x = -100
            wallJumpIcon.y = -100
            saveCookie();
        }
}





let uniqueBehavior:{[key:string]:any} = {
    "labCave-1": pickupJump,
    "boss-1": bossLoop
}




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


// ------------------------------------------------------- Non Cookie Data ---------------------------------------------|
let keys:string[] = [""]
let levelData:any;
let staticLevelContainer = new PIXI.Container()
let jumpBuffer = 0;
let canFly = false;
let disableFog = false;
let displayingReplay:boolean = false;
let dashing:string = "none"

function downloadObjectAsJson(exportObj:any, exportName:string){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, "\t"));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


let replayLoop:any = [
    {
        "replay-PayerInfo": playerInfo,
        "replay-playerCoords": [player.x,player.y],
        "replay-jumpBuffer": jumpBuffer,
        "replay-canFly": canFly,
    }
]

//downloadObjectAsJson(replayLoop, "replayLoop")


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
    if (levelData.worldData.name in uniqueSetup) {
        uniqueSetup[levelData.worldData.name].call()
    }
        engine.stage.addChild(player);

    if (playerInfo.hitLines && playerInfo.hitLines) {
        engine.stage.addChild(hitLineLeft)
        engine.stage.addChild(hitLineTop)
        engine.stage.addChild(hitLineRight)
        engine.stage.addChild(hitLineBottom)

    }
    if ("text" in levelData) {
        for (let i = 0; i < levelData.text.length; i++) {
            console.log("text found", levelData.text)
            let textObj = new PIXI.Text(levelData.text[i][2], {fontFamily: 'Arial', fontSize: 18, fill: 0x000000, align: 'center'})
            textObj.x = levelData.text[i][0] -textObj.width/2
            textObj.y = levelData.text[i][1] -textObj.height/2
            textObj.name = "\"propmt\","+String(levelData.text[i][0] -textObj.width/2)+","+String(levelData.text[i][1] -textObj.height/2);
            engine.stage.addChild(textObj)
        }
    }


        saveCookie();


}

loadLevel(playerInfo.lastLevel);
let playerstart:number;


let refreshIntervalId:any


function hashCode(str:string) {
    return str.split('').reduce((prevHash, currVal) =>
      (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
  }

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


        if (playerInfo.dev) {  // |---------------------  Dev mode hotkeys -------------------------|
        if (event.key === "t") {
            let inputTime = window.prompt("input game speed, defalt is 60", "60")
            let inputTimeInt = parseFloat(String(inputTime))
            if (isNaN(inputTimeInt)|| inputTimeInt < 0.0000000001) inputTimeInt = 60;
            console.log("game speed:",inputTimeInt)
            engine.fpsMax = inputTimeInt;
            console.log(engine.fpsMax);
            clearInterval(refreshIntervalId)
            refreshIntervalId = setInterval(update, 1000.0 / engine.fpsMax);

        }
        // |-----------------------------------------------------------DISPLAY REPLAY FILE -----------------------------------|
        if (event.key === "r - disabled for now") {// a replay file will allow you to record a section of gameplay in a revolveing buffer
        if (keys.includes("Alt")) {
            displayingReplay = !displayingReplay
            if (displayingReplay) {
            this.clearInterval(refreshIntervalId)
            document.documentElement.style.setProperty("--toolBarTop", 90+"vh");
            sliderToFrame(0)

            }else {
                refreshIntervalId = setInterval(update, 1000.0 / engine.fpsMax);
                document.documentElement.style.setProperty("--toolBarTop", 120+"vh");
            }

            return
        }

            console.log("replay:", playerInfo.replay)
            if (playerInfo.replay) {
                if (this.window.confirm("replay ended\rpress Alt R to view recording\ndownlaod replay?")) {
                    console.log("replay downloading...")
                    downloadObjectAsJson(replayLoop, "replayFile|"+hashCode(JSON.stringify(replayLoop)));
                }
            }
            if (!playerInfo.replay && replayLoop.length > playerInfo.replayLength) {
                playerInfo.replayLength = this.window.prompt("Starting Replay\nset replay length", playerInfo.replayLength)
                if (playerInfo.replayLength == null) {
                    playerInfo.replayLength = 60;
                    playerInfo.replay = true
                }
            }
            playerInfo.replay = !playerInfo.replay;
        }

        if (event.key === "y") {
            player.x = 1000
            player.y = 1000
            playerInfo.lastSavePoint = [1000,1000];
            loadLevel("debug");


        }

        if (event.key === "b" ) {
            playerInfo.hitLines = !playerInfo.hitLines;
            if (playerInfo.hitLines) {
                hitLineBottom.lineStyle(1, 0x1ec732);
                hitLineBottom.drawRect(0,0, 10, 10);
                engine.stage.addChild(hitLineLeft)
                engine.stage.addChild(hitLineRight)
                engine.stage.addChild(hitLineTop)
                engine.stage.addChild(hitLineBottom)
            }else{
                engine.stage.removeChild(hitLineLeft)
                engine.stage.removeChild(hitLineRight)
                engine.stage.removeChild(hitLineTop)
                engine.stage.removeChild(hitLineBottom)

            }
            saveCookie();
        }

        if (event.key === "c" && keys.includes("Alt")) {
            deleteAllCookies();
            window.location.reload();
        }

        if (event.key === "f") {
            canFly = !canFly;
            saveCookie();
        }

        if (event.key === "g") {
            disableFog = !disableFog;
            saveCookie();
        }
    }

        if (event.key === playerInfo.jumpKey) {
            jumpBuffer = 10;
        if (coyoteTime > 0){
            if (event.repeat) {return}
            console.log("jumped");
            playerInfo.vy = 30;
        //     setTimeout(function(){
        //         if (!keys.includes(playerInfo.jumpKey)) {
        //             playerInfo.vy -= 30;
        //         }
        //    }, 150)
            coyoteTime = 0;
            
        }
        // else if (playerInfo.leftWall && playerInfo.hasWallJump && event.key === playerInfo.jumpKey) {
        //     playerInfo.vx = -20;
        //     playerInfo.vy = 30;
        // }else if (playerInfo.rightWall && playerInfo.hasWallJump && event.key === playerInfo.jumpKey) {
        //     playerInfo.vx = 20;
        //     playerInfo.vy = 30;
        // }
    }

        if (event.key === playerInfo.magicDashKey && playerInfo.canMagicDash && dashing == "none") {

            if (keys.includes(playerInfo.upKey) && playerInfo.magicJuice >= 25) {
                playerstart = player.x;
                dashing = "up";
                playerInfo.vx = 0;

                if (keys.includes(playerInfo.leftKey)){
                    dashing = "leftUp";
                    playerInfo.vx = 30;
                }
                if (keys.includes(playerInfo.rightKey)){
                    dashing = "rightUp";    
                    playerInfo.vx = -30;
                }
                setTimeout(function(){
                    dashing = "none";
               }, 200)
                playerInfo.vy = 40;
                playerInfo.magicJuice -= 25;
            }

            else if (keys.includes(playerInfo.leftKey) && playerInfo.magicJuice >= 25) {
                dashing = "left";
                playerstart = player.x;
                playerInfo.vx = 50;
                playerInfo.vy = 0;
                playerInfo.terminalVelocity = 0;
                playerInfo.magicJuice -= 25;
                setTimeout(function(){
                    dashing = "none";
               }, 500)
            }
            else if (keys.includes(playerInfo.rightKey) && playerInfo.magicJuice >= 25) {
                dashing = "right";
                playerstart = player.x;
                playerInfo.vx = -50;
                playerInfo.vy = 0;
                playerInfo.magicJuice -= 25;
                playerInfo.terminalVelocity = 0;
                setTimeout(function(){
                    dashing = "none";
               }, 500)
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


    refreshIntervalId = setInterval(update, 1000.0 / engine.fpsMax);
    render();
} // create
let coyoteTime = 0;
let camHeight:number = (2000/window.innerHeight)*-1.5; // 
let camWidth:number = (2000/window.innerWidth)*-1.5;


// |)|----------------------------------------------------------------- ANIMATION LOOP ------------------------------------------------|(|
let animationLoopNum:number = 1;
setInterval(async () => {
    animationLoopNum += 1
    if (animationLoopNum >= 10) {animationLoopNum =1}

    let texture = playerAnimation.idle[Math.floor(animationLoopNum/10 * playerAnimation.idle.length)]
    let rotation = 0 // 12 to flip

    if (playerInfo.grounded) {
        if (playerInfo.vx < 0) {
            texture = playerAnimation.run[Math.floor(animationLoopNum/10 * playerAnimation.run.length)]
            rotation = 0;
        }else if (playerInfo.vx > 0) {
            texture = playerAnimation.run[Math.floor(animationLoopNum/10 * playerAnimation.run.length)]
            rotation = 12;
        }
    }





    if (playerInfo.hasWallJump && playerInfo.vy < 0) {
    if (playerInfo.leftWall && keys.includes(playerInfo.leftKey)) {
        texture = playerAnimation.wallSlide[Math.floor(animationLoopNum/10 * playerAnimation.wallSlide.length)]
        rotation = 0
    }
    if (playerInfo.rightWall && keys.includes(playerInfo.rightKey)) {
        texture = playerAnimation.wallSlide[Math.floor(animationLoopNum/10 * playerAnimation.wallSlide.length)]
        rotation = 12
    }

    //if (dashing)
}


    player.texture = texture;
    player.texture.rotate  = rotation;

}, 50);

let textAreas = [

]

for (let j = 0; j < engine.stage.children.length; j++) {
    if ( engine.stage.children[j].name != null) {
    console.log("[" +engine.stage.children[j].name + "]")
    const name:string[] = JSON.parse("[" +engine.stage.children[j].name + "]");
    if (name[0] === "prompt") {
        textAreas.push([name[1], name[2]]);
    }}
}

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





    // |------------------------- quick fall -------------------------------------------|
    if (keys.includes(playerInfo.downKey)) {
        playerInfo.terminalVelocity = -100;
        playerInfo.vx = 0;
    }else if (!dashing){
        playerInfo.terminalVelocity = -20;
    }



    const diff:number = playerstart - player.x
    if (dashing && (playerInfo.vy*playerInfo.vy +playerInfo.vx*playerInfo.vx < 10 || diff > 300 || diff < -300 || playerInfo.leftWall || playerInfo.rightWall)) {
        dashing = "none";
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

    if (levelData.worldData.name in uniqueBehavior) {
        uniqueBehavior[levelData.worldData.name].call()
    }



    let leftwallfound = false;
    let rightwallfound = false;
    let groundfound = false;
    let rooffound = false;
    if (jumpBuffer > 0) {jumpBuffer--;}
    for (var i = 0; i < levelData.phyBox.length; i++) {
        if (!leftwallfound){
        if ( player.x >= levelData.phyBox[i][0][0]
            && player.y  + player.height*(3/4) + playerInfo.vy/2 > levelData.phyBox[i][0][1]
            && player.x  <= levelData.phyBox[i][1][0]
            && player.y +  player.height/4 + playerInfo.vy/2 < levelData.phyBox[i][1][1]
            ) {
                playerInfo.leftWall = true;
                leftwallfound = true;
                player.x = levelData.phyBox[i][1][0];
                if (playerInfo.vx > 0) {playerInfo.vx = 0;}

                if (jumpBuffer > 0 && playerInfo.hasWallJump) {
                    jumpBuffer = 0;
                    playerInfo.vx = -20;
                    playerInfo.vy = 30;
                }
                
            }else{playerInfo.leftWall = false;}}
            // |---------------------- cheak right wall --------------------|
        if (!rightwallfound){
        if (player.x + player.width > levelData.phyBox[i][0][0]
            && player.y  + player.height*(3/4) + playerInfo.vy/2 > levelData.phyBox[i][0][1]
            && player.x + player.width < levelData.phyBox[i][1][0]
            && player.y +  player.height/4 + playerInfo.vy/2   < levelData.phyBox[i][1][1]
            ) {
                playerInfo.rightWall = true;
                player.x = levelData.phyBox[i][0][0]+3 - player.width;
                if (playerInfo.vx < 0) {playerInfo.vx = 0;}
                rightwallfound = true;

                if (jumpBuffer > 0 && playerInfo.hasWallJump) {
                    jumpBuffer = 0;
                    playerInfo.vx = 20;
                    playerInfo.vy = 30;
                }
                
            }else{playerInfo.rightWall = false;}}
            // |---------------------- cheak ground --------------------|
    if (!groundfound && player.y+player.height >= levelData.phyBox[i][0][1] && player.y+player.height <= levelData.phyBox[i][1][1]) { 
        if (player.x+ (player.width-3) > levelData.phyBox[i][0][0] && player.x+3 < levelData.phyBox[i][1][0]) {
        if (playerInfo.vy < 0) {
        playerInfo.vy = 0;
        }
        if (player.y+player.height > levelData.phyBox[i][0][1] +1 && player.y+player.height < levelData.phyBox[i][1][1]) {
            player.y = levelData.phyBox[i][0][1]-player.height;
        }
        playerInfo.grounded = true;
        if (jumpBuffer > 0) {playerInfo.vy = 30; jumpBuffer = 0};
        if (playerInfo.vy < 25) {
        coyoteTime = 20;
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

    if (playerInfo.dev && playerInfo.replay) {
        if (playerInfo.replayLength < replayLoop.length) {
            replayLoop.shift();
        }
        replayLoop.push([
            {
                "replay-PayerInfo": playerInfo,
                "replay-playerCoords": [player.x,player.y],
                "replay-jumpBuffer": jumpBuffer,
                "replay-canFly": canFly,
            }
        ])
    }

    if (playerInfo.hitLines && playerInfo.dev) {
        hitLineLeft.x = player.x;
        hitLineLeft.y = player.y +player.height/4 + playerInfo.vy/2;
        hitLineLeft.height = player.height*(3/5);
        hitLineLeft.width = 1;
        hitLineRight.x = player.x+player.width-3;
        hitLineRight.y = player.y +player.height/4 + playerInfo.vy/2;
        hitLineRight.height = player.height*(3/5);
        hitLineRight.width = 1;
        hitLineTop.x= player.x+13;
        hitLineTop.width = player.width-6
        hitLineTop.y = player.y
        hitLineTop.height = 1
        hitLineBottom.x= player.x+13;
        hitLineBottom.width = player.width-6
        hitLineBottom.y = player.y+player.height
        hitLineBottom.height = 1

        if (playerInfo.leftWall) {
            hitLineLeft.tint = (0xffffff);
        }else {
            hitLineLeft.tint = (0x000000);
        }
        if (playerInfo.rightWall) {
            hitLineRight.tint = (0xffffff);
        }else {
            hitLineRight.tint = (0x000000);
        }
        if (playerInfo.roofed) {
            hitLineTop.tint = (0xffffff);
        }else {
            hitLineTop.tint = (0x000000);
        }
        if (playerInfo.grounded) {
            hitLineBottom.tint = (0xffffff);
        }else {
            hitLineBottom.tint = (0x000000);
        }
    }
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

