import { getRandomValues, getCssProp, detectCollision, roundNum } from './untils/untils.js'
let game, block, hole, characters, score, gameoverscreen, gameStart, star, gameStop, isJumping, scoreTotal, gameSpeed, gravitySpeedStoped

Object.assign(window, {
    detectCollision
})
gameStart = document.querySelector('#gameStart')

function setInitialValus() {
    gameStop = false
    isJumping = false
    scoreTotal = 0
    gameSpeed = 'slow'
    gravitySpeedStoped = false
}

function getElement() {
    game = document.querySelector('#game')
    block = document.querySelector('#block')
    hole = document.querySelector('#hole')
    characters = document.querySelector('#character')
    score = document.querySelector('#score')
    gameoverscreen = document.querySelector('#gamescreen')
    star = document.querySelector('#star')
}

function setEventListener() {
    addEventListener('resize', () => {
        if (gameStop) return
        initRandomHole()
    })
    gameoverscreen.querySelector('button').addEventListener('click',()=>{
        gameSpeed = 'slow'
        hideGameOverScreen()
        startGravity()
        resetScore()
        changeScoreUI()
        resetAllAnimations()
        resetCharacterPosition()
        startBgAnimation()
        setTimeout(()=>{
            gameStop = false
        })

        //musicStart
        bgMusic.playBg()
    })
    document.body.addEventListener('click', () => {
        if (gameStop) return
        characterJump()
    })
    addEventListener('keydown', (e) => {
        if (gameStop) return
        e = e || window.event
        if (e.keyCode === 32) {
            characterJump()
        }
    })
}
class MusicBg{
    constructor() {
        this.bgMusic = new Audio('./sounds/bg.wav')
        this.bgMusic.volume = 0.5
    }
    playBg(){
        this.bgMusic.currentTime = 0
        this.bgMusic.loop = true
        this.bgMusic.play()
    }
    stopMusic(){
        this.bgMusic.pause()
    }
}
let bgMusic = new MusicBg()
function gameOver() {
    // gameOver sound
    (new Audio('./sounds/gameover.wav')).play()
    gameStop = true
    showGameOverScreen()
    stopBlockAnimation()
    stopGravity()
    hideStar()
    bgMusic.stopMusic()
    stopBgAnimation()
    console.log('game over')
}
function resetScore() {
    scoreTotal = 0
}
function changeScoreUI() {
    score.innerText = `score : ${scoreTotal}`
    gameoverscreen.querySelector('.score').innerText = `score : ${scoreTotal}`
}
const gameSpeedConfig = {
    'slow': 150,
    'normal': 250,
    'fast': 350,
    'superfast': 450,
    'ridiculous': 550
}

function characterJump() {
    isJumping = true
    let jumpCount = 0
    let jumpInterval = setInterval(() => {
        changeGameState({ diff: -3, direction: 'up' })
        if (jumpCount > 20) {
            (new Audio('./sounds/fly.wav')).play()
            clearInterval(jumpInterval)
            isJumping = false
            jumpCount = 0
        }
        jumpCount++
    }, 10)
}
function resetCharacterPosition(){
    characters.style.top = '20vh'
    characters.style.left ='10vh'
}
function changeGameState({ diff, direction }) {
    handleStarDection()
    handleCharacterAnimation(direction)
    handleCharacterPosition(diff)
    handleCharacterCollision()
    handleGameSpeed()
}
function handleStarDection(){
    if(star.style.display === 'none') return
    if(detectCollision(characters,star)){
        // play sound effect
        (new Audio('./sounds/star.wav')).play()
        scoreTotal += 150
        hideStar()
        changeScoreUI()
    }
}
function handleCharacterAnimation(direction) {
    if (direction === 'down') {
        character.classList.remove('go-up')
        character.classList.add('go-down')
    } else {
        character.classList.remove('go-down')
        character.classList.add('go-up')
    }
}
function handleCharacterPosition(diff) {
    const chartererTop = getCssProp(characters, 'top')
    const changeTop = parseInt(chartererTop) + diff
    if (changeTop < 0) return
    if (changeTop > window.innerHeight) {
        return gameOver()
    }
    characters.style.top = `${changeTop}px`
}

let numHoles = 0
let soundCount = 0
function handleCharacterCollision() {
    const collisionBlock = detectCollision(characters, block)
    const collisionHole = detectCollision(characters, hole, { y1: -46, y2: 47 })
    if (collisionBlock && !collisionHole) {
        // changeScoreUI()
        return gameOver()
    } else if (collisionHole) {
        
        soundCount++
        if (soundCount > 35) {
            // playSound
            (new Audio('./sounds/hole.wav')).play()
            soundCount = 0
        }

        //score
        scoreTotal++
        changeScoreUI()

        //star show
        if (gameStop) return
        numHoles++
        if (numHoles > 150) {
            showStar()
            setTimeout(()=>{
                hideStar()
            },4500)
            numHoles = 0
        }
        console.log({ numHoles})
    }
}
function handleGameSpeed() {
    let doRest = false
    if (scoreTotal > 2000) {
        gameSpeed = 'ridiculous'
        doRest = true
    }
    else if (scoreTotal > 1000) {
        gameSpeed = 'superfast'
        doRest = true
    }
    else if (scoreTotal > 500) {
        gameSpeed = 'fast'
        doRest = true
    }
    else if (scoreTotal > 250) {
        gameSpeed = 'normal'
        doRest = true
    }
    if (doRest) {
        hole.addEventListener('animationiteration',()=>{
            resetAllAnimations()
        })
        block.addEventListener('animationiteration', () => {
            resetAllAnimations()
        })
    }
}

function initRandomHole() {
    hole.addEventListener('animationiteration', () => {
        const fromHeight = 60 * innerHeight / 100
        const toHeight = 95 * innerHeight / 100
        const randomValue = getRandomValues(fromHeight, toHeight)
        hole.style.top = `-${randomValue}px`
    })
}

function resetAllAnimations() {
    const second = roundNum(innerHeight / gameSpeedConfig[gameSpeed])
    const animationCss = `blockAnimation ${second}s linear infinite`
    block.style.animation = animationCss
    hole.style.animation = animationCss

    if(star.style.display !== 'none') return
    const num = getRandomValues(1,5)
    const starAnimation =`startAnimation${num} ${second}s linear infinite`
    star.style.animation = starAnimation
}
function stopBlockAnimation(){
    const blockLeft = block.getBoundingClientRect().x
    block.style.animation = ''
    hole.style.animation = ''
    
    block.style.left = `${blockLeft}px`
    hole.style.left = `${blockLeft}px`
}


function beginGravity() {
    setInterval(() => {
        if (isJumping || gravitySpeedStoped) return
        changeGameState({ diff: 5, direction: 'down' })
    }, 20)
}
function stopGravity(){
    gravitySpeedStoped = true 
}
function startGravity() {
    gravitySpeedStoped = false
}
function showGameOverScreen(){
    gameoverscreen.style.display =''
}
function hideGameOverScreen(){
    gameoverscreen.style.display = 'none'
}
function showStar(){
    if(star.style.display !=='none') return
    star.style.display = ''
    star.style.top =`${getRandomValues(20,100)}px`
}

function hideStar(){
    star.style.display ='none'
}
function startBgAnimation(){
    game.style.animation = 'backgroungAnimation 5s linear infinite'
}
function stopBgAnimation() {
    game.style.animation = ''
}

function gameInit() {
    setInitialValus()
    getElement()
    resetAllAnimations()
    initRandomHole()
    setEventListener()
    beginGravity()
    startBgAnimation()
}
gameStart.querySelector('button').addEventListener('click', ()=>{
    gameInit()
    bgMusic.playBg()
    gameStart.style.display = 'none'
})
