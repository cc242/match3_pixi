/**
 * Created by cchurn16 on 11/28/17.
 */
/*global Quad Bounce Sine Elastic Expo Power2 PIXI*/
import {EventEmitter} from 'events';
// import * as PIXI from 'pixi.js'
import TweenMax from 'gsap';
import $ from 'jquery';
import * as Effects from '../core/Effects';
import * as Maths from '../core/Maths';

let app, bunny, boardContainer;

var game;
var fieldSize = 8;
var fieldSize_col = 5;
var orbColors = 4;
var orbSize = 50;
//
var swapSpeed = 0.2;
var fallSpeed = 0.35;
var destroySpeed = 0.2;
var fastFall = true;
//
var gameArray = [];
var removeMap = [];
var orbGroup;
var selectedOrb, pickedOrb;
var canPick = true;
//
var hand;
var handTween;
var handGroup;
var scale = 1;
var emitter;
var arr_bursts = [];
var count = 0;
var shockwave_count = 0;
var filter;
var filter_hilite, arr_sprite_hilite = [];
var filter_lines, graphics_lines, container_lines, filter_lines_noise, filter_glitch, filter_glitch2;
var suggestionFilter;
var helpGraphic;
var bt_help;
var tween1, tween2, tween3, tween4, tween5, tween6, tween7, tween8, tween9, tween10, tween11, tween12, tween13;
class Visualisation extends EventEmitter {
    init(config) {
        app = new PIXI.Application(320, 568, {transparent: true, resolution: 2});
        //PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        document.getElementById('creative_container').appendChild(app.view);
        bunny = PIXI.Sprite.fromImage(require('../img/star.png'));
        bunny.anchor.set(0.5);
        bunny.x = 40;
        bunny.y = app.screen.height / 2;
        app.stage.addChild(bunny);
        bunny.interactive = true;
        bunny.buttonMode = true;
        app.ticker.add(function(delta) {
            this.update(delta);
        }.bind(this));


        drawField();
        scale = document.getElementById('creative_container').getAttribute('scale');
        $('#creative_container').on("touchstart touchmove", orbSelect);
        $('#creative_container').on("touchend", orbDeselect);

        var container = new PIXI.Container;
        container_lines = new PIXI.Container;
        app.stage.addChild(container);
        app.stage.addChild(container_lines);
        bt_help = PIXI.Sprite.fromImage(require('../img/help_button.png'));
        bt_help.width = 50;
        bt_help.height = 50;
        bt_help.anchor.set(0, 1);
        bt_help.x = 10;
        bt_help.y = app.screen.height -10;
        app.stage.addChild(bt_help);
        bt_help.interactive = true;
        bt_help.buttonMode = true;
        bt_help.on('pointerdown', onClick);

        // Create a new emitter
        emitter = new PIXI.particles.Emitter(
            container,
            // The collection of particle images to use
            [PIXI.Texture.fromImage(require('../img/particle.png'))],
            {
                "alpha": {
                    "start": 0.8,
                    "end": 0.1
                },
                "scale": {
                    "start": 0.2,
                    "end": 0.001,
                    "minimumScaleMultiplier": 1
                },
                "color": {
                    "start": "#ffffff",
                    "end": "#ffffff"
                },
                "speed": {
                    "start": 300,
                    "end": 50,
                    "minimumSpeedMultiplier": 1
                },
                "acceleration": {
                    "x": 0,
                    "y": 0
                },
                "maxSpeed": 0,
                "startRotation": {
                    "min": 0,
                    "max": 360
                },
                "noRotation": false,
                "rotationSpeed": {
                    "min": 0,
                    "max": 0
                },
                "lifetime": {
                    "min": 0.2,
                    "max": 0.4
                },
                "blendMode": "normal",
                "frequency": 0.004,
                "emitterLifetime": 0.04,
                "maxParticles": 1000,
                "pos": {
                    "x": 0,
                    "y": 0
                },
                "addAtBack": false,
                "spawnType": "burst",
                "particlesPerWave": 10,
                "particleSpacing": 0,
                "angleStart": 0
            }
        );

        // Start emitting
        // Start the update
        setInterval(()=> {
            checkBursts();
        }, 40)

        function animate() {

        }

        filter = new PIXI.filters.ShockwaveFilter();
        filter.amplitude = 5;
        filter.wavelength = 120;
        filter.brightness = 1;
        filter.radius = 160;
        filter.resolution = 2;
        app.stage.filters = [filter];
        filter_hilite = new PIXI.filters.GlowFilter(10, 2, 1, 0xFFFFFF, 1);
        filter_lines = new PIXI.filters.GlowFilter(10, 4, 1, 0xFFFFFF, 1);
        filter_lines_noise = new PIXI.filters.NoiseFilter(0.4, 2);
        function onClick () {
            showSuggestion();
        }
        addLines();
    }

    update(delta) {
        bunny.rotation += 0.05 * delta;
        emitter.update(delta * 0.01);
        count += 0.01;
        shockwave_count += 0.005;
        filter.time = shockwave_count;
        filter_hilite.outerStrength = Math.cos(count*30) * 3;
        filter_lines_noise.seed = count/10;
        filter_glitch.scale.x =  Math.cos(count*20) * 6;
        filter_glitch.scale.y =  Math.sin(count*20) * 6;
        filter_glitch2.scale.x =  Math.sin(count*5) * Math.random() * 2;
        filter_glitch2.scale.y =  Math.cos(count*5) * Math.random() * 2;
    }

}
function addLines() {
    var displacement_sprite = PIXI.Sprite.fromImage(require('../img/940-bump.jpg'));
    displacement_sprite.anchor.set(0.5);
    displacement_sprite.x = 0;
    displacement_sprite.y = 0;
    app.stage.addChild(displacement_sprite);

    filter_glitch = new PIXI.filters.DisplacementFilter(displacement_sprite, 2.2);
    filter_glitch2 = new PIXI.filters.DisplacementFilter(displacement_sprite, 1.2);
    filter_glitch.resolution = 2;
    filter_glitch2.resolution = 2;
    filter_lines_noise.resolution = 2;
    filter_lines.resolution = 2;
    graphics_lines = new PIXI.Graphics();
    container_lines.addChild(graphics_lines);
    graphics_lines.lineStyle(0.5, 0xd2ff00, 1);
    container_lines.filters = [filter_lines, filter_lines_noise, filter_glitch, filter_glitch2];
}

function moveLine(spr1, spr2) {
    let targ1 = spr1.getGlobalPosition();
    let targ2 = spr2.getGlobalPosition();
    let targ1_modx = Maths.map( spr1._anchor._x, 0, 1, 1, -1) * spr1.width/2;
    let targ1_mody = Maths.map( spr1._anchor._y, 0, 1, 1, -1) * spr1.height/2;
    let targ2_modx = Maths.map( spr2._anchor._x, 0, 1, 1, -1) * spr2.width/2;
    let targ2_mody = Maths.map( spr2._anchor._y, 0, 1, 1, -1) * spr2.height/2;
    let startx = targ1.x + targ1_modx;
    let starty = targ1.y + targ1_mody;
    let endx   = targ2.x + targ2_modx
    let endy   = targ2.y + targ2_mody;
    let ctrl1x = startx;
    let ctrl1y = starty;
    let ctrl2x = endx - ((endx - startx) / 2) + 0 + Math.random() * 20;
    let ctrl2y = starty - ((endy - starty) / 2) - 40 - Math.random() * 10;
    graphics_lines.moveTo(startx, starty);
    graphics_lines.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, endx, endy);
    glow(spr1);
    glow(spr2);
}
function clearLines() {

    tween1 = TweenMax.to(graphics_lines, 0.3, {alpha: 0, delay: 0.4, onComplete: function () {
            graphics_lines.clear();
            graphics_lines.lineStyle(0.5, 0xd2ff00, 1);
            tween2 = TweenMax.set(graphics_lines, {alpha: 1});
        }});
}
function burst(x,y, color, sprite) {
    getColor(color);
    if (arr_bursts.length == 0) {

    }
    arr_bursts.push({xpos: x, ypos: y, col: color, sprite: sprite});
}
function getColor(color) {
    switch(color) {
        case 1:
            return {r: 255 , g: 0, b: 0};
        case 2:
            return {r: 255, g: 255, b: 0};
        case 3:
            return {r: 106, g: 255, b: 120};
        case 4:
            return {r: 0, g: 255, b: 255};
        case 5:
            return {r: 255, g: 0, b: 255};
        case 6:
            return {r: 255, g: 255, b: 255};
    }
}
var filter_to;
var hasShockwave;
function checkBursts() {

    if (arr_bursts.length) {
        if (filter && arr_bursts.length > 3 && !hasShockwave) {
            console.dir(arr_bursts);
            hasShockwave = true;

            var avg_x = 0, avg_y = 0;
            for (var i=0; i<arr_bursts.length; i++) {
                console.log('', arr_bursts[i]);
                avg_x += arr_bursts[i].xpos + 40;
                avg_y += arr_bursts[i].ypos;
                if (i<arr_bursts.length-1) {
                    moveLine(arr_bursts[i].sprite, arr_bursts[i+1].sprite);
                }
            }
            avg_x = avg_x / arr_bursts.length;
            avg_y = avg_y / arr_bursts.length;

            shockwave_count = 0;
            console.log('', avg_x, avg_y);
            filter.center = [avg_x, avg_y];
            setTimeout(()=> {
                 hasShockwave = false;
            }, 500);
            // add lines
        }
        var targ =  arr_bursts.pop();
        emitter.emit = false;
        emitter.startColor.value = getColor(targ.col);
        emitter.spawnPos.x = targ.xpos + orbGroup.x;
        emitter.spawnPos.y = targ.ypos + orbGroup.y - 20;



        filter_to =  setTimeout(()=> {
            //app.stage.filters = [];
            }, 1000);
        emitter.emit = true;
    }
}

function drawField(){

    handGroup = new PIXI.Container();
    orbGroup = new PIXI.Container();
    app.stage.addChild(orbGroup);
    app.stage.addChild(handGroup);
    orbGroup.x = 40;
    orbGroup.y = 100;


    for(var i = 0; i < fieldSize; i ++){
        gameArray[i] = [];
        for(var j = 0; j < fieldSize_col; j ++){
            //var orb = game.add.sprite(orbSize * j + orbSize / 2, orbSize * i + orbSize / 2, "orbs");

            let orb = PIXI.Sprite.fromImage(require('../img/star.png'));
            orb.x = orbSize * j + orbSize / 2;
            orb.y = orbSize * i + orbSize / 2;
            orb.width = orbSize;
            orb.height = orbSize;
            orb.anchor.set(0.5, 1);
            orbGroup.addChild(orb);
            do{
                var randomColor = Math.floor(Math.random() * orbColors) + 1;
                orb.frame = randomColor;

                let texture = PIXI.Texture.fromImage(require('../img/0' + (randomColor) + '@2x.png'));
                orb.texture = texture;

                gameArray[i][j] = {
                    orbColor: randomColor,
                    orbSprite: orb
                }
            } while(isMatch(i, j));
        }
    }
    selectedOrb = null;
    hand = PIXI.Sprite.fromImage(require('../img/hand.png'));
    hand.anchor.set(0, 0.5);
    handGroup.addChild(hand);
    hand.scale.set(0.3)
    hand.visible = true;
    console.log('', orbGroup.width);
    orbGroup.x = (320 - orbGroup.width) / 2;
    orbGroup.y = (568 - orbGroup.height) / 2;
    window.showSuggestion = showSuggestion;
}
function flash(targ) {
    targ.filters = [filter_hilite];
    arr_sprite_hilite.push(targ);
}
function glow(targ) {
    targ.filters = [filter_lines];
    arr_sprite_hilite.push(targ);
}
function showSuggestion(){
    console.log('showsuggestion');
    var matchFound = false;
    var arr_matches = [];
    for(var i = 0; i < fieldSize - 1; i ++){
        for(var j = 0; j < fieldSize_col - 1; j ++){
            tmpSwap(i, j, i + 1, j);
            if(matchInBoard()){
                hand.visible = true;
                hand.x = gameArray[i + 1][j].orbSprite.x + 16;
                hand.y = gameArray[i + 1][j].orbSprite.y + 70;
                matchFound = true;
                arr_matches.push({orb1: gameArray[i][j].orbSprite, orb2: gameArray[i+1][j].orbSprite});

            }
            tmpSwap(i, j, i + 1, j);
            if(matchFound){
                //return;
            }
            tmpSwap(i, j, i, j + 1);
            if(matchInBoard()){
                hand.visible = true;
                hand.x = gameArray[i][j + 1].orbSprite.x + 16;
                hand.y = gameArray[i][j + 1].orbSprite.y + 70;
                matchFound = true;
                arr_matches.push({orb1: gameArray[i][j].orbSprite, orb2: gameArray[i][j+1].orbSprite});
            }
            tmpSwap(i, j, i, j + 1);
            if(matchFound){
                //return;
            }
        }
    }
    if (arr_matches.length) {
        let match = arr_matches[Math.floor(Math.random() * arr_matches.length)];
        flash(match.orb1);
        flash(match.orb2);
    }
    console.log("no match");
}

function tmpSwap(row1, col1, row2, col2){
    var tmp = gameArray[row1][col1];
    gameArray[row1][col1] = gameArray[row2][col2];
    gameArray[row2][col2] = tmp;
}

var pickedOrb;

var orb1, orb2;
function orbSelect(e){
    //console.log('move', e);
    if(canPick){

        var mousePosition = app.renderer.plugins.interaction.eventData.data.global;
        //console.log('', mousePosition);

        hand.visible = false;
        /*handTween.stop();*/
        // console.log('', mousePosition.y);
        var touchy = mousePosition.y - orbGroup.y;
        var touchx =  mousePosition.x - orbGroup.x;
        console.log('', touchy);
        var row = Math.floor((touchy - (orbGroup.y)) / orbSize) + 1;
        var col = Math.floor((touchx - orbGroup.x) / orbSize);
        row +=1;
        col +=1;
        pickedOrb = gemAt(row, col);
        console.log('', row, col);
        
        orb1 = gemAt(row, col);

        // if valid pickedorb
        if (orb1 != -1) {
           //console.log('orb1', orb1);

           if (selectedOrb == orb1) {
               //console.log('same');
           } else {
               //console.log('not same');
               if (selectedOrb != null && areTheSame(selectedOrb, orb1)) {
                   //return;
               }
               if (selectedOrb != null && areNext(selectedOrb, orb1)) {
                   swapOrbs(selectedOrb, orb1, true);
               }
           }
            selectedOrb = orb1;
        } 
    }
}

function orbDeselect(e){
    //console.log('DESELECT *********', );
    pickedOrb = -1;
    selectedOrb = null;
    orb1 = -1;
    // game.input.deleteMoveCallback(orbMove);
}

function orbMove(event, pX, pY){
    if(event.id == 0){
        var distX = pX - selectedOrb.orbSprite.x;
        var distY = pY - selectedOrb.orbSprite.y;
        var deltaRow = 0;
        var deltaCol = 0;
        if(Math.abs(distX) > orbSize / 2){
            if(distX > 0){
                deltaCol = 1;
            }
            else{
                deltaCol = -1;
            }
        }
        else{
            if(Math.abs(distY) > orbSize / 2){
                if(distY > 0){
                    deltaRow = 1;
                }
                else{
                    deltaRow = -1;
                }
            }
        }
        if(deltaRow + deltaCol != 0){
            var pickedOrb = gemAt(getOrbRow(selectedOrb) + deltaRow, getOrbCol(selectedOrb) + deltaCol);
            if(pickedOrb != -1){
                selectedOrb.orbSprite.scale.setTo(1);
                swapOrbs(selectedOrb, pickedOrb, true);
                game.input.deleteMoveCallback(orbMove);
            }
        }
    }
}

function swapOrbs(orb1, orb2, swapBack){
    canPick = false;
    var fromColor = orb1.orbColor;
    var fromSprite = orb1.orbSprite;
    var toColor = orb2.orbColor;
    var toSprite = orb2.orbSprite;
    gameArray[getOrbRow(orb1)][getOrbCol(orb1)].orbColor = toColor;
    gameArray[getOrbRow(orb1)][getOrbCol(orb1)].orbSprite = toSprite;
    gameArray[getOrbRow(orb2)][getOrbCol(orb2)].orbColor = fromColor;
    gameArray[getOrbRow(orb2)][getOrbCol(orb2)].orbSprite = fromSprite;

    tween3 = TweenMax.to(gameArray[getOrbRow(orb1)][getOrbCol(orb1)].orbSprite, swapSpeed, {
        x: getOrbCol(orb1) * orbSize + orbSize / 2,
        y: getOrbRow(orb1) * orbSize + orbSize / 2
    });

    tween4 = TweenMax.to(gameArray[getOrbRow(orb2)][getOrbCol(orb2)].orbSprite, swapSpeed, {
        x: getOrbCol(orb2) * orbSize + orbSize / 2,
        y: getOrbRow(orb2) * orbSize + orbSize / 2,
        onComplete: function() {
            if(!matchInBoard() && swapBack){
                swapOrbs(orb1, orb2, false);
            }
            else{
                if(matchInBoard()){
                    handleMatches();
                }
                else{
                    canPick = true;
                    selectedOrb = null;
                }
            }
        }
    });
}

function areNext(orb1, orb2){
    return Math.abs(getOrbRow(orb1) - getOrbRow(orb2)) + Math.abs(getOrbCol(orb1) - getOrbCol(orb2)) == 1;
}

function areTheSame(orb1, orb2){
    return getOrbRow(orb1) == getOrbRow(orb2) && getOrbCol(orb1) == getOrbCol(orb2);
}

function gemAt(row, col){
    if(row < 0 || row >= fieldSize || col < 0 || col >= fieldSize_col){
        return -1;
    }
    return gameArray[row][col];
}

function getOrbRow(orb){
    return Math.floor(orb.orbSprite.y / orbSize);
}

function getOrbCol(orb){
    return Math.floor(orb.orbSprite.x / orbSize);
}

function isHorizontalMatch(row, col){
    return gemAt(row, col).orbColor == gemAt(row, col - 1).orbColor && gemAt(row, col).orbColor == gemAt(row, col - 2).orbColor;
}

function isVerticalMatch(row, col){
    return gemAt(row, col).orbColor == gemAt(row - 1, col).orbColor && gemAt(row, col).orbColor == gemAt(row - 2, col).orbColor;
}

function isMatch(row, col){
    return isHorizontalMatch(row, col) || isVerticalMatch(row, col);
}

function matchInBoard(){
    for(var i = 0; i < fieldSize; i++){
        for(var j = 0; j < fieldSize_col; j++){
            if(isMatch(i, j)){
                return true;
            }
        }
    }
    return false;
}

function handleMatches(){
    for (var i = 0; i<arr_sprite_hilite.length; i++) {
        arr_sprite_hilite[i].filters = [];
    }
    arr_sprite_hilite = [];

    removeMap = [];
    for(var i = 0; i < fieldSize; i++){
        removeMap[i] = [];
        for(var j = 0; j < fieldSize; j++){
            removeMap[i].push(0);
        }
    }
    handleHorizontalMatches();
    handleVerticalMatches();
    destroyOrbs();
    //console.log('', gameArray);
}

function handleVerticalMatches(){
    for(var i = 0; i < fieldSize; i++){
        var colorStreak = 1;
        var currentColor = -1;
        var startStreak = 0;
        for(var j = 0; j < fieldSize; j++){
            if(gemAt(j, i).orbColor == currentColor){
                colorStreak ++;
            }
            if(gemAt(j, i).orbColor != currentColor || j == fieldSize - 1){
                if(colorStreak >= 3){
                    //console.log("VERTICAL :: Length = "+colorStreak + " :: Start = ("+startStreak+","+i+") :: Color = "+currentColor);
                    for(var k = 0; k < colorStreak; k++){
                        removeMap[startStreak + k][i] ++;
                    }
                }
                startStreak = j;
                colorStreak = 1;
                currentColor = gemAt(j, i).orbColor;
            }
        }
    }

}

function handleHorizontalMatches(){
    for(var i = 0; i < fieldSize; i++){
        var colorStreak = 1;
        var currentColor = -1;
        var startStreak = 0;
        for(var j = 0; j < fieldSize; j++){
            if(gemAt(i, j).orbColor == currentColor){
                colorStreak ++;
            }
            if(gemAt(i, j).orbColor != currentColor || j == fieldSize - 1){
                if(colorStreak >= 3){
                    //console.log("HORIZONTAL :: Length = "+colorStreak + " :: Start = ("+i+","+startStreak+") :: Color = "+currentColor);
                    for(var k = 0; k < colorStreak; k++){
                        removeMap[i][startStreak + k] ++;
                    }
                }
                startStreak = j;
                colorStreak = 1;
                currentColor = gemAt(i, j).orbColor;
            }
        }
    }

}

function destroyOrbs(){
    var destroyed = 0;
    for(var i = 0; i < fieldSize; i++){
        for(var j = 0; j < fieldSize_col; j++){
            if(removeMap[i][j]>0){

                var orbsprite = gameArray[i][j].orbSprite;
                burst(orbsprite.x, orbsprite.y, gameArray[i][j].orbColor, orbsprite);
           
                tween5 = TweenMax.to(orbsprite, destroySpeed, {alpha: 0, onComplete: function() {
                        orbGroup.removeChild(this.target)
                        this.target.destroy();
                        // console.log('', orbsprite.x, orbsprite.y);
                        // burst(gameArray[i][j].orbSprite.x, gameArray[i][j].orbSprite.y-20)
                        destroyed --;
                        if(destroyed == 0){
                            makeOrbsFall();
                            if(fastFall){
                                replenishField();
                            }
                        }
                    }});
                destroyed ++;
                gameArray[i][j] = null;
            }
        }
    }
    clearLines();
}

function makeOrbsFall(){
    var fallen = 0;
    var restart = false;
    for(var i = fieldSize - 2; i >= 0; i--){
        for(var j = 0; j < fieldSize_col; j++){
            if(gameArray[i][j] != null){
                var fallTiles = holesBelow(i, j);
                if(fallTiles > 0){
                    if(!fastFall && fallTiles > 1){
                        fallTiles = 1;
                        restart = true;
                    }

                    var sprite = gameArray[i][j].orbSprite;
                    var targScale =  sprite.transform.scale.x;
                    tween6 = TweenMax.to(sprite.scale, 0.2, {y: targScale * 0.75, delay: 0.2});
                    tween7 = TweenMax.to(sprite.scale, 0.8, {y: targScale, ease: Elastic.easeOut.config(1.5, 0.3), delay:0.4});

                    tween8 = TweenMax.to(sprite, fallSpeed, {
                        y: sprite.y + fallTiles * orbSize,
                        ease: Power2.easeIn,
                        onComplete: function() {
                            fallen --;
                            if(fallen == 0){
                                if(restart){
                                    makeOrbsFall();
                                }
                                else{
                                    if(!fastFall){
                                        replenishField();
                                    }
                                }
                            }
                        }
                    })

                    fallen ++;

                    gameArray[i + fallTiles][j] = {
                        orbSprite: gameArray[i][j].orbSprite,
                        orbColor: gameArray[i][j].orbColor
                    }
                    gameArray[i][j] = null;
                }
            }
        }
    }

    if(fallen == 0){
        replenishField();

    }
}

function replenishField(){
    var replenished = 0;
    var restart = false;
    for(var j = 0; j < fieldSize_col; j++){
        var emptySpots = holesInCol(j);


        if(emptySpots > 0){
            if(!fastFall && emptySpots > 1){
                emptySpots = 1;
                restart = true;
            }

            // console.log('', emptySpots);

            for(var i = 0; i < emptySpots; i++){

                let orb = PIXI.Sprite.fromImage(require('../img/star.png'));
                orb.x = orbSize * j + orbSize / 2;
                // console.log('i', i);
                orb.y = -40 * (emptySpots-i);
                orb.alpha = 0;
                orb.width = orbSize;
                orb.height = orbSize;
                orb.anchor.set(0.5, 1);
                orbGroup.addChild(orb);

                var randomColor = Math.floor(Math.random() * orbColors) + 1;

                let texture = PIXI.Texture.fromImage(require('../img/0' + (randomColor) + '@2x.png'));
                orb.texture = texture;

                gameArray[i][j] = {
                    orbColor: randomColor,
                    orbSprite: orb
                };

                var sprite = gameArray[i][j].orbSprite;
                var targScale =  sprite.transform.scale.x;
                tween9 = TweenMax.to(sprite.scale, 0.1, {y: targScale * 0.75, delay: 0.2});
                tween10 = TweenMax.to(sprite.scale, 0.8, {y: targScale, ease: Elastic.easeOut.config(1.5, 0.3), delay:0.3 });

                tween11 = TweenMax.to(gameArray[i][j].orbSprite, fallSpeed, {
                    y: orbSize * i + orbSize / 2, ease: ((i == emptySpots-1) ? Power2.easeIn : Power2.easeIn), alpha: 1,
                    delay: 0.05 * (emptySpots - i),
                    onComplete: function() {
                        replenished --;
                        if(replenished == 0){
                            if(restart){
                                makeOrbsFall();
                            }
                            else{
                                if(matchInBoard()){
                                     setTimeout(()=> {
                                         handleMatches();
                                         }, 250);
                                }
                                else{
                                    canPick = true;
                                    selectedOrb = null;
                                }
                            }
                        }
                    }
                })
                replenished ++;

            }
        }
    }
}

function holesBelow(row, col){
    var result = 0;
    for(var i = row + 1; i < fieldSize; i++){
        if(gameArray[i][col] == null){
            result ++;
        }
    }

    return result;
}

function holesInCol(col){
    var result = 0;
    for(var i = 0; i < fieldSize; i++){
        if(gameArray[i][col] == null){
            result ++;
        }
    }
    return result;
}



export default Visualisation;