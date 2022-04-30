console.log("Hello World");

let levelData:any

const loadLevel = (filename:string) => {
    levelData = require(filename);
    console.log(levelData);
}

const level = (<HTMLInputElement>document.getElementById("levelSelector"))
if (typeof(level) == "object") {
level.addEventListener('change', () => {
    console.log(level.value);
    loadLevel(level.value);
})
}