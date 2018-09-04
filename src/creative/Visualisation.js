/**
 * Created by cchurn16 on 11/28/17.
 */
/*global Quad Bounce Back Sine Elastic Expo Power2 PIXI*/
import {EventEmitter} from 'events';
import TweenMax from 'gsap';
import * as PIXI from 'pixi.js'
import $ from 'jquery';
import * as Maths from '../core/Maths';
import particles from 'pixi-particles';
import * as filters from 'pixi-filters';
let app;

var game;
var fieldSize = 6;
var fieldSize_col = 4;
var orbColors = 4;
var orbSize = 60;
//
var swapSpeed = 0.2;
var fallSpeed = 0.35;
var destroySpeed = 0.2;
var fastFall = true;
//
var gameArray = [];
var removeMap = [];
var orbGroup;
var selectedOrb;
var pickedOrb;
var orb1;
var canPick = true;
var mouseIsDown;
//
var hand;
var handGroup;
var scale = 1;
var emitter, emitter2;
var arr_bursts = [];
var count = 0;
var shockwave_count = 0;
var hasShockwave;
var filter;
var filter_hilite, arr_sprite_hilite = [];
var filter_lines, graphics_lines, container_lines, filter_lines_noise, filter_glitch, filter_glitch2;
var bt_help;
var tween1, tween2, tween3, tween4, tween5, tween6, tween7, tween8, tween9, tween10, tween11, tween12, tween13;
var logo, info, pretty_ugly;
var score = 0;
var targetColor = 1;
var flash_effect;
var level_container;
var cp_container, cp_good, cp_great, cp_amazing;
var ui_container, txt_score;
var level, lvl_texture1, lvl_texture2, lvl_texture3, lvl_texture4;
var level_idx = 0;
var levelIsOver;
var sprite1_images, sprite2_images, sprite3_images, sprite4_images;
var sprite1_array, sprite2_array, sprite3_array, sprite4_array;
var texture_arrays;
var anim_sprites, anim_sprites_id;
var scoreOrb;
var targetScore = 4;
class Visualisation extends EventEmitter {
    init(config) {
        app = new PIXI.Application(320, 568, {transparent: true, resolution: 2});
        document.getElementById('creative_container').appendChild(app.view);
        app.ticker.add(function(delta) {
            this.update(delta);
        }.bind(this));

        drawField();
        scale = document.getElementById('creative_container').getAttribute('scale');
        $('#creative_container').on("mousedown touchstart", mouseDown);
        $('#creative_container').on("mouseleave", mouseUp);
        $('#creative_container').on("mouseup touchend", mouseUp);
        $('#creative_container').on("touchstart touchmove mousemove", orbSelect);
        $('#creative_container').on("touchend mouseup", orbDeselect);

        var container = new PIXI.Container;
        container_lines = new PIXI.Container;
        app.stage.addChild(container);
        app.stage.addChild(container_lines);
        bt_help = PIXI.Sprite.fromImage(require('../img/help_button.png'));
        bt_help.alpha = 0;
        bt_help.width = 80;
        bt_help.height = 80;
        bt_help.anchor.set(0, 1);
        bt_help.x = -10;
        bt_help.y = app.screen.height + 5;
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
        emitter2 = new PIXI.particles.Emitter(
            container,
            // The collection of particle images to use
            [PIXI.Texture.fromImage(require('../img/star.png'))],
            {
                "alpha": {
                    "start": 0.8,
                    "end": 0.1
                },
                "scale": {
                    "start": 0.05,
                    "end": 0.1,
                    "minimumScaleMultiplier": 1
                },
                "color": {
                    "start": "#ffffff",
                    "end": "#ffffff"
                },
                "speed": {
                    "start": 200,
                    "end": 100,
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
                    "min": 0.1,
                    "max": 0.5
                },
                "blendMode": "normal",
                "frequency": 0.008,
                "emitterLifetime": 0.21,
                "maxParticles": 1000,
                "pos": {
                    "x": 0,
                    "y": 0
                },
                "addAtBack": false,
                "spawnType": "circle",
                "spawnCircle": {
                    "x": 0,
                    "y": 0,
                    "r": 10
                }
            }
        );

        setInterval(()=> {
            checkBursts();
        }, 40);
        filter = new filters.ShockwaveFilter();
        filter.amplitude = 5;
        filter.wavelength = 120;
        filter.brightness = 1;
        filter.radius = 160;
        filter.resolution = 2;
        app.stage.filters = [filter];
        filter_hilite = new filters.GlowFilter(10, 2, 1, 0xFFFFFF, 1);
        filter_hilite.resolution = 2;
        filter_lines = new filters.GlowFilter(10, 4, 1, 0xFFFFFF, 1);
        filter_lines_noise = new PIXI.filters.NoiseFilter(0.4, 2);
        function onClick () {
            showSuggestion();
        }
        addLines();

        logo = PIXI.Sprite.fromImage(require('../img/logo@2x.png'));
        logo.x = 0;
        logo.y = 0;
        app.stage.addChild(logo);
        info = PIXI.Sprite.fromImage(require('../img/info@2x.png'));
        info.x = 0;
        info.y = 0;
        info.width = 320;
        info.height = 568;
        app.stage.addChild(info);
        pretty_ugly = PIXI.Sprite.fromImage(require('../img/pretty_ugly@2x.png'));
        pretty_ugly.x = 0;
        pretty_ugly.y = 20;
        // app.stage.addChild(pretty_ugly);

        addUI();
        drawLevel();
        setInterval(()=> {
            animOrbs()
        }, 200)
    }

    update(delta) {
        emitter.update(delta * 0.01);
        emitter2.update(delta * 0.01);
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
function addUI() {
    ui_container = new PIXI.Container;
    app.stage.addChild(ui_container);
    ui_container.alpha = 0;
    var gfx_score = new PIXI.Graphics();
    gfx_score.resolution = 2;
    ui_container.addChild(gfx_score);
    gfx_score.lineStyle(3, 0x6a1867, 1);
    gfx_score.beginFill(0xffd0ef, 1);
    gfx_score.drawRoundedRect(202, 517, 95, 30, 10);
    gfx_score.endFill();

    var style = new PIXI.TextStyle({
        fontFamily: 'Gill Sans',
        fontSize: 24,
        fontWeight: 'bold',
        fill: ['#6a1867'],
    });
    txt_score = new PIXI.Text('', style);
    txt_score.x = 240;
    txt_score.y = 518;
    ui_container.addChild(txt_score);

    // add sprite to score
    scoreOrb = new PIXI.extras.AnimatedSprite(sprite1_array);
    scoreOrb.x = 210;
    scoreOrb.y = 560;
    scoreOrb.width = orbSize + 5;
    scoreOrb.height = orbSize + 5;
    scoreOrb.anchor.set(0.5, 1);
    ui_container.addChild(scoreOrb);
    setTimeout(()=> {
        scoreOrb.gotoAndStop(1);
    }, 1000);
    scoreOrb.alpha = 1;
    anim_sprites[anim_sprites_id++] = scoreOrb;

    updateScore(0);
    console.log('', gameArray);
}
function checkScore() {
    if (score >= targetScore) {
        score = 0;
        levelIsOver = true;
        // set all orbs for removal
        for(var i = 0; i < fieldSize; i++) {
            for (var j = 0; j < fieldSize_col; j++) {
                removeMap[i][j] = 1;
            }
        }
    }
}
function updateScore(s) {
    txt_score.text = s + '/' + targetScore;
}

function nextLevel() {
    reposOrbs();
    canPick = true;
    levelIsOver = false;
    updateScore(0);

    level_idx++;
    targetColor = level_idx+1;
    if (level_idx >= 4) {
        level_idx = 0;
        targetColor = 1;
    }
    // Show the level card
    setTimeout(()=> {
        animLevel();
    }, 1000);
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
            return {r: 248 , g: 185, b: 255};
        case 2:
            return {r: 0, g: 255, b: 18};
        case 3:
            return {r: 255, g: 225, b: 61};
        case 4:
            return {r: 0, g: 255, b: 255};
        case 5:
            return {r: 255, g: 0, b: 255};
        case 6:
            return {r: 255, g: 255, b: 255};
    }
}
function checkBursts() {

    if (arr_bursts.length) {
        if (filter && arr_bursts.length > 2 && !hasShockwave) {
           hasShockwave = true;
            var avg_x = 0, avg_y = 0;
            for (var i=0; i<arr_bursts.length; i++) {
                avg_x += arr_bursts[i].xpos + 40;
                avg_y += arr_bursts[i].ypos;
                if (i<arr_bursts.length-1) {
                    if (flash_effect) {
                        if (arr_bursts.length==3) {
                            showCp(1);
                        }
                        if (arr_bursts.length==4) {
                            showCp(2);
                        }
                        if (arr_bursts.length>=5) {
                            showCp(3);
                        }

                        moveLine(arr_bursts[i].sprite, arr_bursts[i + 1].sprite);
                    }
                }
            }
            avg_x = avg_x / arr_bursts.length;
            avg_y = avg_y / arr_bursts.length;
            shockwave_count = 0;
            filter.center = [avg_x, avg_y];
            setTimeout(()=> {
                 hasShockwave = false;
            }, 500);
        }
        var targ =  arr_bursts.pop();
        emitter.emit = false;
        emitter.startColor.value = getColor(targ.col);
        emitter.spawnPos.x = targ.xpos + orbGroup.x;
        emitter.spawnPos.y = targ.ypos + orbGroup.y - 20;

        emitter2.emit = false;
        // emitter2.startColor.value = getColor(targ.col);
        emitter2.spawnPos.x = targ.xpos + orbGroup.x;
        emitter2.spawnPos.y = targ.ypos + orbGroup.y - 20;
        emitter.emit = true;
        emitter2.emit = true;
    }
}
function drawLevel() {
    level_container = new PIXI.Container();
    level_container.alpha = 0;

    app.stage.addChild(level_container);
    // level graphic
    level = PIXI.Sprite.fromImage(require('../img/level1@2x.png'));
    level_container.addChild(level);
    level.interactive = true;
    level.buttonMode = true;
    level.anchor.set(0.5);
    level.x = 320 / 2;
    level.y = 568 / 2;
    level.on('pointerdown', onStart);

    TweenMax.set(level_container, {y: -568});

    lvl_texture1 = PIXI.Texture.fromImage(require('../img/level1@2x.png'));
    lvl_texture2 = PIXI.Texture.fromImage(require('../img/level2@2x.png'));
    lvl_texture3 = PIXI.Texture.fromImage(require('../img/level3@2x.png'));
    lvl_texture4 = PIXI.Texture.fromImage(require('../img/level4@2x.png'));
     setTimeout(()=> {
         animLevel()
         }, 2000);
}
function animLevel() {
    console.log('level idx', level_idx);
    scoreOrb.textures = texture_arrays[level_idx];
    scoreOrb.gotoAndStop(1);
    switch (level_idx) {
        case 0:
            level.texture = lvl_texture1;
            break;
        case 1:
            level.texture = lvl_texture2;
            break;
        case 2:
            level.texture = lvl_texture3;
            break;
        case 3:
            level.texture = lvl_texture4;
            break;
    } 
    TweenMax.to(level_container, 0.3, {alpha: 1});
    TweenMax.set(level_container, {y: 0});
    window.showBg();
    ui_container.alpha = 0;
    bt_help.alpha = 0;
}
function onStart() {
    TweenMax.to(level_container, 0.3, {alpha: 0, y: -568});
    window.hideBg();
    TweenMax.set(ui_container, {x: 50, alpha: 0});
    TweenMax.to(ui_container, 0.3, {alpha: 1, delay: 0.5});
    TweenMax.to(ui_container, 0.3, {x: 0, delay: 0.5, ease: Back.easeOut});
    TweenMax.set(bt_help, {x: -50, alpha: 0});
    TweenMax.to(bt_help, 0.3, {alpha: 1, delay: 0.5});
    TweenMax.to(bt_help, 0.3, {x: 0, delay: 0.5, ease: Back.easeOut});
}
function addCp() {
    cp_good = PIXI.Sprite.fromImage(require('../img/cp_good.png'));
    cp_good.x = 160;
    cp_good.y = 236;
    cp_good.width = 320;
    cp_good.height = 568;
    cp_container.addChild(cp_good);
    cp_great = PIXI.Sprite.fromImage(require('../img/cp_great.png'));
    cp_great.x = 160;
    cp_great.y = 236;
    cp_great.width = 320;
    cp_great.height = 568;
    cp_container.addChild(cp_great);
    cp_amazing = PIXI.Sprite.fromImage(require('../img/cp_amazing.png'));
    cp_amazing.x = 160;
    cp_amazing.y = 236;
    cp_amazing.width = 320;
    cp_amazing.height = 568;
    cp_container.addChild(cp_amazing);
    cp_good.alpha = 0;
    cp_great.alpha = 0;
    cp_amazing.alpha = 0;
    cp_good.anchor.set(0.5);
    cp_great.anchor.set(0.5);
    cp_amazing.anchor.set(0.5);
}
function showCp(idx) {
    var targ;
    //cp_container.alpha = 1;
    switch (idx) {
        case 1:
            cp_good.alpha = 1;
            cp_great.alpha = 0;
            cp_amazing.alpha = 0;
            targ = cp_good;
            break;
        case 2:
            cp_good.alpha = 0;
            cp_great.alpha = 1;
            cp_amazing.alpha = 0;
            targ = cp_great;
            break;
        case 3:
            cp_good.alpha = 0;
            cp_great.alpha = 0;
            cp_amazing.alpha = 1;
            targ = cp_amazing;
            break;
    }
    targ.scale.x = targ.scale.y = 0.5;
    TweenMax.to(targ.scale, 1, {x: 0.7, y: 0.7});
    TweenMax.to(targ, 1, { alpha: 0});
}
function createAnimSprites() {
    sprite1_images = [require('../img/1b.png'), require('../img/1a.png')];
    sprite2_images = [require('../img/2b.png'), require('../img/2a.png')];
    sprite3_images = [require('../img/3b.png'), require('../img/3a.png')];
    sprite4_images = [require('../img/4b.png'), require('../img/4a.png')];
    sprite1_array = [];
    sprite2_array = [];
    sprite3_array = [];
    sprite4_array = [];
    for (let i=0; i < 2; i++)
    {
        let texture = PIXI.Texture.fromImage(sprite1_images[i]);
        sprite1_array.push(texture);
        texture = PIXI.Texture.fromImage(sprite2_images[i]);
        sprite2_array.push(texture);
        texture = PIXI.Texture.fromImage(sprite3_images[i]);
        sprite3_array.push(texture);
        texture = PIXI.Texture.fromImage(sprite4_images[i]);
        sprite4_array.push(texture);
    };
    texture_arrays = [sprite1_array,sprite2_array,sprite3_array,sprite4_array];
    console.log('', texture_arrays);
}
function drawField(){

    handGroup = new PIXI.Container();
    orbGroup = new PIXI.Container();
    cp_container = new PIXI.Container();

    app.stage.addChild(orbGroup);
    app.stage.addChild(handGroup);
    app.stage.addChild(cp_container);
    cp_container.y = 50;
    addCp();

    orbGroup.x = 40;
    orbGroup.y = 100;
    anim_sprites = {};
    anim_sprites_id = 0;
    createAnimSprites();
     setTimeout(()=> {
         reposOrbs();
         orbGroup.x = (320 - orbGroup.width) / 2;
         orbGroup.y = (568 - orbGroup.height) / 2 + 70;
         }, 2000);


    selectedOrb = null;
    hand = PIXI.Sprite.fromImage(require('../img/hand.png'));
    hand.anchor.set(0, 0.5);
    handGroup.addChild(hand);
    hand.scale.set(0.3)
    hand.visible = false;

    window.showSuggestion = showSuggestion;
}
function animOrbs() {
    Object.entries(anim_sprites).forEach(([key, value]) => {
        if (Math.random() > 0.98) {
            value.gotoAndStop(2);
            setTimeout(()=> {
                value.gotoAndStop(1);
            }, (Math.random() * 300) + 100);
        }
    });
}
function reposOrbs() {
    for(var i = 0; i < fieldSize; i ++){
        gameArray[i] = [];
        for(var j = 0; j < fieldSize_col; j ++){
            let orb = new PIXI.extras.AnimatedSprite(sprite4_array);
            orb.x = orbSize * j + orbSize / 2;
            orb.y = orbSize * i + orbSize / 2;
            orb.width = orbSize;
            orb.height = orbSize;
            orb.anchor.set(0.5, 1);
            orbGroup.addChild(orb);
            setTimeout(()=> {
                orb.gotoAndStop(1);
            }, 1000);

            orb.alpha = 0;
            anim_sprites[anim_sprites_id++] = orb;
            setTimeout(()=> {
                TweenMax.to(orb, 0.3, {alpha: 1, delay: 0.5});
            }, 1000);

            do{
                var randomColor = Math.floor(Math.random() * orbColors) + 1;
                let texture = texture_arrays[randomColor-1];
                orb.textures = texture;
                gameArray[i][j] = {
                    orbColor: randomColor,
                    orbSprite: orb
                }
            } while(isMatch(i, j));
        }
    }
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

                matchFound = true;
                arr_matches.push({orb1: gameArray[i][j].orbSprite, orb2: gameArray[i+1][j].orbSprite});

            }
            tmpSwap(i, j, i + 1, j);
            tmpSwap(i, j, i, j + 1);
            if(matchInBoard()){

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
function mouseDown(e) {
    mouseIsDown = true;
}
function mouseUp(e) {
    mouseIsDown = false;
}
function orbSelect(e){
    if(canPick && mouseIsDown){
        var mousePosition = app.renderer.plugins.interaction.eventData.data.global;
        hand.visible = false;
        var touchy = mousePosition.y - orbGroup.y;
        var touchx =  mousePosition.x - orbGroup.x;
        var row = Math.floor((touchy - (orbGroup.y)) / orbSize) + 2;
        var col = Math.floor((touchx - orbGroup.x) / orbSize);
        row +=1;
        col +=1;
        pickedOrb = gemAt(row, col);
        console.log('', row, col);
        
        orb1 = gemAt(row, col);

        // if valid pickedorb
        if (orb1 != -1) {
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
    pickedOrb = -1;
    selectedOrb = null;
    orb1 = -1;
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
    updateScore(score);
    checkScore();
    destroyOrbs();
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
                    if (currentColor == targetColor) {
                        console.log('***** SCORE', );
                        flash_effect = true;
                        score++;
                        setTimeout(()=> {
                            flash_effect = false;
                        }, 400);
                    }
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
                    if (currentColor == targetColor) {
                        console.log('***** SCORE', );
                        flash_effect = true;
                        score++;
                         setTimeout(()=> {
                                flash_effect = false;
                             }, 400);
                    }
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
                        destroyed --;
                        if(destroyed == 0){
                            if (levelIsOver) {
                                nextLevel();
                            } else {
                                makeOrbsFall();
                                if(fastFall){
                                    replenishField();
                                }
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
                    tween6 = TweenMax.to(sprite.scale, 0.2, {y: 0.25, delay: 0.2});
                    tween7 = TweenMax.to(sprite.scale, 0.8, {y: 0.3, ease: Elastic.easeOut.config(1.5, 0.3), delay:0.4});

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
                    });

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
            for(var i = 0; i < emptySpots; i++){
                let orb = new PIXI.extras.AnimatedSprite(sprite1_array);
                orb.x = orbSize * j + orbSize / 2;
                orb.y = -40 * (emptySpots-i);
                orb.width = orbSize;
                orb.height = orbSize;
                orb.anchor.set(0.5, 1);
                orbGroup.addChild(orb);
                orb.alpha = 0;
                anim_sprites[anim_sprites_id++] = orb;

                var randomColor = Math.floor(Math.random() * orbColors) + 1;
                let texture = texture_arrays[randomColor-1];
                orb.textures = texture;
                orb.gotoAndStop(1);
                gameArray[i][j] = {
                    orbColor: randomColor,
                    orbSprite: orb
                };

                var sprite = gameArray[i][j].orbSprite;
                tween9 = TweenMax.to(sprite.scale, 0.1, {y: 0.25, delay: 0.2});
                tween10 = TweenMax.to(sprite.scale, 0.8, {y: 0.3, ease: Elastic.easeOut.config(1.5, 0.3), delay:0.3 });

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