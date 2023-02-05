// get canvas variable and set width and height to full screen
var canvas = document.getElementById('c1');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
var c = canvas.getContext('2d');

var collision = document.getElementById('c2');
collision.height = window.innerHeight;
collision.width = window.innerWidth;
var d =  collision.getContext('2d');

var zombies = [];
let explosions = [];


let timeBetweenZombies = 1000;
let timeToNextZombie = 0;
let lastLoopTime = 0;

let deaths = 3;
let button1 = document.getElementById('btn');
let button2 = document.getElementById('btn2');
var divStart = document.getElementById('start');
var divGame = document.getElementById('game');
var divEnd = document.getElementById('end');
var scoreDiv = document.getElementById('scored');
var cursor = document.getElementById('cursor');

// for ranking
var nick;
let score = 0;
var firstPlace = document.getElementById('first');
var secondPlace = document.getElementById('second');
var thirdPlace = document.getElementById('third');
var fourthPlace = document.getElementById('fourth');
var fifthPlace = document.getElementById('fifth');
var sixthPlace = document.getElementById('sixth');
var seventhPlace = document.getElementById('seventh');


class Zombie {

    constructor() {
        this.image = new Image();
        this.image.src = "img/zombie.png"; 
        this.imgWidth = 200; // only single zombie in the picture
        this.imgHeight = 312;
        this.size = Math.random() * 0.5 + 0.5; // to generate objects of various sizes, but larger than 0.5
        this.width = this.imgWidth * this.size;
        this.height = this.imgHeight * this.size;
        this.x = canvas.width; // (x,y) location - x at start must be at the end of canvas because they start from right side
        this.y = Math.random() * (canvas.height * 0.3 - this.height) + canvas.height * 0.7  // to avoid having zombie parially hidden
        // to change locaton at time unit - delta x and delta y
        this.dx = Math.random() * (20-3) + 3; // random number between 3 and 20 -- speed
        this.delete = false;
        this.frame = 0; // to change pictures and make movement effect
        this.maxFrame = 8;
        this.timeSinceImgChange = 0;
        this.maxTimeToChangeImg = 200;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')'; // this is each zombie's personal id and will be needed for mouseclick detection.
    }

    move(deltatime) { 
        if (this.x - this.dx + this.width < 0) { // zombie crosses the left border
            this.delete = true;
            let toRemove = ".heart" + deaths;
            let elem = document.querySelector(toRemove);
            elem.classList.add("hidden");
            deaths -= 1;
            score -= 6;
            scoreDiv.innerHTML = "Score: " + score;
        } 

        this.x -= this.dx;

        this.timeSinceImgChange += deltatime

        if (this.timeSinceImgChange > this.maxTimeToChangeImg){ // image will change periodically
            this.timeSinceImgChange = 0;
            if (this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
        }
    }       

    draw() {
        d.fillStyle = this.color;
        d.fillRect(this.x, this.y, this.width, this.height); // x coord  and y coord of upper-left corner, width of rectangle, height of rectangle
        c.drawImage(this.image, this.frame*this.imgWidth, 0, this.imgWidth, this.imgHeight, this.x, this.y, this.width, this.height);
    }
}

class Explosion {
    constructor(x,y,size){
        this.image = new Image();
        this.image.src = "img/boom.png"; 
        this.imgWidth = 200; 
        this.imgHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceImgChange = 0;
        this.maxTimeToChangeImg = 100;
        this.delete = false;
    };

    update(deltaTime) {
        this.timeSinceImgChange += deltaTime;

        if (this.timeSinceImgChange > this.maxTimeToChangeImg){ 
            this.timeSinceImgChange = 0;
            this.frame++;
            if (this.frame > 5) this.delete = true; // image will change only 5 times
        }
    };

    draw() {
        c.drawImage(this.image, this.frame*this.imgWidth, 0, this.imgWidth, this.imgHeight, this.x, this.y, this.size, this.size);
    };
}

window.addEventListener("click", function(e) {
    const pixelColor  = d.getImageData(e.x, e.y, 1, 1).data;

    zombies.forEach(object => {
        if (object.randomColors[0] === pixelColor[0] && object.randomColors[1] === pixelColor[1] && object.randomColors[2] === pixelColor[2]){
            object.delete = true;
            score+=12;
            scoreDiv.innerHTML = "Score: " + score;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    });
})


function animate(timestamp){
    c.clearRect(0,0, canvas.width, canvas.height);
    d.clearRect(0, 0, canvas.width, canvas.height);

    let deltaTime = timestamp - lastLoopTime;
    lastLoopTime = timestamp;
    timeToNextZombie += deltaTime;

    if (timeToNextZombie > timeBetweenZombies){ // time between creating new zombie
        zombies.push(new Zombie());
        timeToNextZombie = 0;
    };

    for (var i = 0; i < zombies.length ; i++) zombies[i].move(deltaTime);
    for (var i = 0; i < explosions.length ; i++) explosions[i].update(deltaTime);
    for (var i = 0; i < zombies.length ; i++) zombies[i].draw();
    for (var i = 0; i < explosions.length ; i++) explosions[i].draw();

    zombies = zombies.filter(object => !object.delete);
    explosions = explosions.filter(object => !object.delete);

    if (deaths > 0 ) requestAnimationFrame(animate);
    else {
        addScore();
        divGame.classList.add("hidden");
        divEnd.classList.remove("hidden");
    }
}


function startGame() {
    if (nick.length > 0) {
        divStart.classList.add("hidden");
        divGame.classList.remove("hidden");
        var elem = document.getElementById('nick');
        elem.innerHTML = "Player: " + nick;
        animate(0);
    }
    else window.alert("You must enter your nickname first!");
}

function getCurrentDate(){
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let currentDate = `${day}-${month}-${year}`;
    return currentDate;
}

button1.addEventListener("click", e => {
    // global values reset
    deaths = 3; 
    zombies = [];
    explosions = [];
    timeToNextZombie = 0;
    lastLoopTime = 0;
    score = 0;
    scoreDiv.innerHTML = "Score: " + score;
    for (var i = 1; i <= 3 ; i++){
        let toRemove = ".heart" + i;
        let elem = document.querySelector(toRemove);
        elem.classList.remove("hidden");
    }
    nick = document.getElementById("fname").value;
    startGame(e);
});

button2.addEventListener("click", e => {
    divEnd.classList.add("hidden");
    divStart.classList.remove("hidden");
});


// highscores 
async function addScore() {
    // adding new score
    const response = await fetch("http://localhost:3000/scores?");
    const rawResponse = await fetch("http://localhost:3000/scores?", {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({id: response.length + 1, name: nick, score: score, date: getCurrentDate()})
        })
    
    // update highscores 
    const res = await fetch("http://localhost:3000/scores?");
    const data = await res.json();
    data.sort((a, b) => b.score - a.score);
    console.log(data);
    firstPlace.innerHTML = "1. " + data[0].name + " " + data[0].score + " " + data[0].date;
    secondPlace.innerHTML = "2. " + data[1].name + " " + data[1].score + " " + data[1].date;
    thirdPlace.innerHTML = "3. " + data[2].name + " " + data[2].score + " " + data[2].date;
    fourthPlace.innerHTML = "4. " + data[3].name + " " + data[3].score + " " + data[3].date;
    fifthPlace.innerHTML = "5. " + data[4].name + " " + data[4].score + " " + data[4].date;
    sixthPlace.innerHTML = "6. " + data[5].name + " " + data[5].score + " " + data[5].date;
    seventhPlace.innerHTML = "7. " + data[6].name + " " + data[6].score + " " + data[6].date;
}

// viewfinder
document.onmousemove = function(e){
    cursor.style.left = (e.pageX - 20 )+ "px";
    cursor.style.top = (e.pageY - 20 ) + "px";
}
