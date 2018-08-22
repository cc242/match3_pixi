/**
 * Created by cchurn16 on 11/28/17.
 */
/*global TweenMax $*/
const PIXI = require('pixi.js');
require('pixi-particles');
const EventEmitter = require('events');

var emitter, container, shadow;
var hasInit, flashing;
class VisualPixi extends EventEmitter {
    constructor() {
        super();
        console.log('VisualPixi constructor');
        // this.init();
    }
    init(config) {

        var isPortrait = (window.innerHeight > window.innerWidth);
        console.log('isPortrait', isPortrait);

        var app = new PIXI.Application((isPortrait ? 800 : 1200), (isPortrait ? 1200 : 800), {backgroundColor : 0x000000});




        var vid = this.addVideoSprite('http://mi-cs01.prod.millennialmedia.com/~cchurn/483836193.mp4');
        container = new PIXI.Container();
        vid.scale.y = -1;
        vid.width = 1200;
        vid.height = 1100;
        vid.y = 1100;
        vid.alpha =0.16;


        //bg.anchor.set(0);

        bg.x = 0;//app.renderer.width / 2;
        bg.y = 0;//app.renderer.height / 2;

        app.stage.addChild(vid);
        app.stage.addChild(container);

        container.x = app.renderer.width / 2;;
        container.y = app.renderer.height / 2;
        app.ticker.add(function(delta) {
            emitter.update(delta * 0.05);
        });

        // Create a new emitter
        emitter = new PIXI.particles.Emitter(

            // The PIXI.Container to put the emitter in
            // if using blend modes, it's important to put this
            // on top of a bitmap, and not use the root stage Container
            container,

            // The collection of particle images to use
            [PIXI.Texture.fromImage(require('../img/particle.png'))],

            // Emitter configuration, edit this to change the look
            // of the emitter
            {
                "alpha": {
                    "start": 0,
                    "end": 0.8
                },
                "scale": {
                    "start": 0.002,
                    "end": 0.16,
                    "minimumScaleMultiplier": 1
                },
                "color": {
                    "start": "#e4f9ff",
                    "end": "#3fcbff"
                },
                "speed": {
                    "start": 100,
                    "end": 20,
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
                    "min": 2,
                    "max": 7
                },
                "lifetime": {
                    "min": 0.2,
                    "max": 9.8
                },
                "blendMode": "add",
                "frequency": 0.001,
                "emitterLifetime": -1,
                "maxParticles": 1500,
                "pos": {
                    "x": 0,
                    "y": 0
                },
                "addAtBack": false,
                "spawnType": "circle",
                "spawnCircle": {
                    "x": 0,
                    "y": 0,
                    "r": 0
                }
            }
        );

        emitter.emit = false;
        hasInit = true;
    }
    flash() {
        if (emitter) {
            flashing = true;
            container.alpha = 1;
            emitter.emit = true;
            emitter.startSpeed = 70;
            emitter.startColor = [228, 249, 255];
            emitter.endColor = [63, 203, 255];
            setTimeout(function() {
                emitter.emit = false;
                TweenMax.to(container, 1, {alpha:0, onComplete: function() {
                    flashing = false;
                }})
            }, 2000)
        }
    }
    update(level) {
        if (!hasInit || flashing) return;

        if (emitter) {

            switch (true) {
                case (level > 0.4):
                    emitter.emit = true;
                    //emitter.startSpeed = 100 + (100*level);
                    emitter.startSpeed = 70;
                    emitter.startColor = [255, 255, 255];
                    emitter.endColor = [255, 192, 0];
                    break;
                case (level > 0.3):
                    emitter.emit = true;
                    emitter.startSpeed = 100 + (100*level);
                    //emitter.startSpeed = 70;
                    emitter.startColor = [228, 249, 255];
                    emitter.endColor = [63, 203, 255];
                    break;
                default:
                    emitter.emit = false;
                    break;

            }
        }
        container.alpha = level + 0.2;
        shadow.alpha = 1-level;

    }
    addVideoSprite (video_url) {
        var texture = new PIXI.Texture.fromVideo(video_url.split(/[?#]/)[0]);
        $(texture.baseTexture.source).attr('looping', 'true')
        texture.baseTexture.on('loaded', function () {
            setTimeout(function() {
                // $(texture.baseTexture.source).get(0).pause();
            },500);
        });

        texture.baseTexture.source.addEventListener('ended',myHandler,false);
        function myHandler(e) {
            console.log('play');
            texture.baseTexture.source.play();
        }

        texture.baseTexture.source.crossOrigin = "anonymous";
        var sprite  = new PIXI.Sprite(texture);
        return sprite;
    }
}

module.exports = VisualPixi;