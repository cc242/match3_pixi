/*global PIXI*/
import Visualisation from './Visualisation';
import Layout from '../core/Layout';
import * as PIXI from 'pixi.js'
import loadJS from 'load-js';

var creative = {
    defaults: {
        container: '.container'
    },
    options: {},
    config: {container: '', width: 320, height: 568},
    init: function(opts) {

        for(var i in opts){
            this.options[i] = {
                value: opts[i],
                enumerable: true,
                writeable: true,
                configurable: true
            }
        }
        this.config = Object.create(this.defaults, this.options);
        let layout = new Layout();
        layout.init(this.config);
        let visualisation = new Visualisation();
        visualisation.init(this.config);

        // background
        let bg = new PIXI.Application(320, 568, {resolution: 2, backgroundColor: 0xe9212d});
        //PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        document.getElementById('background_pixi').appendChild(bg.view);

        let arr_flower_images = [
            require('../img/flower-dark-1@2x.png'),
            require('../img/flower-dark-2@2x.png'),
            require('../img/flower-light-1@2x.png'),
            require('../img/flower-light-2@2x.png')
        ];

        let arr_flowers_anim = [];
        let count = 0;

        function createFlowers() {
            for (let i=0; i<20; i++) {
                var flower = PIXI.Sprite.fromImage(arr_flower_images[count]);
                flower.anchor.set(0.5);
                flower.scale.set(Math.random() - 0.2);
                flower.x = Math.random() * window.innerWidth;
                flower.y =  Math.random() * window.innerHeight;
                bg.stage.addChild(flower);
                arr_flowers_anim.push(flower)
                count++;
                if (count>=arr_flower_images.length) {
                    count=0;
                }
            }
        }
        var level_bg = new PIXI.Graphics();
        window.createBg = function() {
            // level dark background
            window.hideBg();
            level_bg.fillColor = 0x004a69;
            level_bg.fillAlpha = 0.55;
            level_bg.drawRect(0,0,window.innerWidth,window.innerHeight);
            bg.stage.addChild(level_bg);
        };
        window.showBg = function() {
            level_bg.alpha = 1;
        };
        window.hideBg = function() {
            level_bg.alpha = 0;
        };
        createFlowers();
        window.createBg();


        bg.ticker.add(function(delta) {
            for (let i=0; i<arr_flowers_anim.length; i++) {
                arr_flowers_anim[i].y += 0.35;
                if (arr_flowers_anim[i].y > window.innerHeight + arr_flowers_anim[i].height) {
                    arr_flowers_anim[i].y = - arr_flowers_anim[i].height;
                    arr_flowers_anim[i].x =  Math.random() * window.innerWidth;
                }
            }
        }.bind(this));
        window.addEventListener('resize', resizeBG);
        function resizeBG() {
            bg.renderer.resize(window.innerWidth, window.innerHeight)
        }
        resizeBG();
    }
};

// creative.init({container:'#creative_container', width: 320, height: 568});
export default creative;