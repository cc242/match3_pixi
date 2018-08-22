/**
 * Created by cchurn16 on 11/28/17.
 */
/*global Quad Bounce Sine*/
import {EventEmitter} from 'events';
import * as PIXI from 'pixi.js'
import TweenMax from 'gsap';
import * as Effects from '../core/Effects';
import * as Maths from '../core/Maths';

let app, bunny, boardContainer;
let level = {
    x: 70,         // X position
    y: 120,         // Y position
    columns: 5,     // Number of tile columns
    rows: 5,        // Number of tile rows
    tilewidth: 40,  // Visual width of a tile
    tileheight: 40, // Visual height of a tile
    tiles: [],      // The two-dimensional tile array
    selectedtile: { selected: false, column: 0, row: 0 }
};
let gameStates = {
    init: 0,
    ready: 1,
    resolve: 2
};
let animStates = {
    none: 0,
    ready: 1,
    resolve: 2
};
let gameState = gameStates.init;
let animState = animStates.none;

let arr_sprites = [ {type:0, image:'star.png'},
    {type:1, image:'star_blue.png'},
    {type:2, image:'star_purple.png'},
    {type:3, image:'star_green.png'}
];
let lastframe;
let clusters;

let animationtime = 0;
let animationtimetotal = 0.3;
let count = 0;

class Visualisation extends EventEmitter {
    init(config) {
        app = new PIXI.Application(320, 568, {backgroundColor : 0x1099bb});

        document.getElementById('creative_container').appendChild(app.view);

        bunny = PIXI.Sprite.fromImage(require('../img/star.png'));
        bunny.anchor.set(0.5);
        bunny.x = 40;
        bunny.y = app.screen.height / 2;
        app.stage.addChild(bunny);

        window.levels = level;
        this.initGame();

        app.ticker.add(function(delta) {
            this.update(delta);
        }.bind(this));
    }
    initGame() {
        this.addBoard();
        // create level array
        this.createArray();
        console.log('', level.tiles[0][0].type);
        gameState = gameStates.ready;


         /*setTimeout(()=> {
             this.swap(1,0,1,2);
             console.log('', level.tiles[0][0].type);
             },60);*/


        this.renderBoard();

         setTimeout(()=> {

             this.findClusters();
             this.removeClusters();
             this.shiftTiles();

             setTimeout(()=> {
                 // level.tiles[2][4].sprite.x = 10
                 //this.replaceTiles();
                 //this.renderBoard()
             }, 3500);

             gameState = gameStates.resolve;

         }, 2000);


    }
    renderBoard() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {

                level.tiles[i][j].sprite.x = level.tileheight * i;
                level.tiles[i][j].sprite.y = level.tileheight * j;
            }
        }
    }
    update(delta) {

        // Check state of game
        switch (gameState) {

            case gameStates.init:

                break;
            case gameStates.ready:
                this.gameLoop(delta);
                break;
            case gameStates.resolve:
                this.resolve(delta);
                break;
        }

    }
    gameLoop(delta) {
        bunny.rotation += 0.05 * delta;
    }
    resolve(delta) {

    }
    renderTiles() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                // Get the shift of the tile for animation
                var shift = level.tiles[i][j].shift;

            }
        }
    }
    getTileCoordinate(column, row, columnoffset, rowoffset) {
        var tilex = (column + columnoffset) * level.tilewidth;
        var tiley = (row + rowoffset) * level.tileheight;
        return { tilex: tilex, tiley: tiley};
    }
    createArray() {

        var types = [   1,0,0,0,1,
                        0,2,2,2,3,
                        2,3,1,1,1,
                        3,0,1,2,3,
                        0,1,2,3,0,
                        1,2,3,0,1
                    ];
        var count = 0;
        var idx = 0;
        // Initialize the two-dimensional tile array
        for (var i=0; i<level.columns; i++) {
            level.tiles[i] = [];
            for (var j=0; j<level.rows; j++) {
                // Define a tile type and a shift parameter for animation
                //let randomIndex = Math.floor(Math.random() * arr_sprites.length);
                let randomIndex = types[idx];
                idx++;
                if (count > arr_sprites.length-1) {
                    count = 0;
                }

                var tileImage = arr_sprites[randomIndex].image;
                level.tiles[i][j] = {
                    type: randomIndex,
                    shift: 0,
                    sprite: this.createTileSprite(tileImage, randomIndex)
                }
            }
        }
        console.log(level.tiles[2][3]);
        console.log(level.tiles[2][4]);
    }
    // Find clusters in the level
    findClusters() {
        // Reset clusters
        clusters = []

        // Find horizontal clusters
        for (var j=0; j<level.rows; j++) {
            // Start with a single tile, cluster of 1
            var matchlength = 1;
            for (var i=0; i<level.columns; i++) {
                var checkcluster = false;

                if (i == level.columns-1) {
                    // Last tile
                    checkcluster = true;
                } else {
                    // Check the type of the next tile
                    if (level.tiles[i][j].type == level.tiles[i+1][j].type &&
                        level.tiles[i][j].type != -1) {
                        // Same type as the previous tile, increase matchlength
                        matchlength += 1;
                    } else {
                        // Different type
                        checkcluster = true;
                    }
                }

                // Check if there was a cluster
                if (checkcluster) {
                    if (matchlength >= 3) {
                        // Found a horizontal cluster
                        clusters.push({ column: i+1-matchlength, row:j,
                            length: matchlength, horizontal: true });
                    }

                    matchlength = 1;
                }
            }
        }

        // Find vertical clusters
        for (var i=0; i<level.columns; i++) {
            // Start with a single tile, cluster of 1
            var matchlength = 1;
            for (var j=0; j<level.rows; j++) {
                var checkcluster = false;

                if (j == level.rows-1) {
                    // Last tile
                    checkcluster = true;
                } else {
                    // Check the type of the next tile
                    if (level.tiles[i][j].type == level.tiles[i][j+1].type &&
                        level.tiles[i][j].type != -1) {
                        // Same type as the previous tile, increase matchlength
                        matchlength += 1;
                    } else {
                        // Different type
                        checkcluster = true;
                    }
                }

                // Check if there was a cluster
                if (checkcluster) {
                    if (matchlength >= 3) {
                        // Found a vertical cluster
                        clusters.push({ column: i, row:j+1-matchlength,
                            length: matchlength, horizontal: false });
                    }

                    matchlength = 1;
                }
            }
        }
        // console.log('checking clusters', clusters.length);
    }
    // Remove the clusters
    removeClusters() {
        // Change the type of the tiles to -1, indicating a removed tile
        this.loopClusters(function(index, column, row, cluster) {
            // level.tiles[column][row].oldType = level.tiles[column][row].type;
            level.tiles[column][row].type = -1;
            console.log('remove');
        });

        // Calculate how much a tile should be shifted downwards
        for (var i=0; i<level.columns; i++) {
            var shift = 0;
            for (var j=level.rows-1; j>=0; j--) {
                // Loop from bottom to top
                if (level.tiles[i][j].type == -1) {
                    level.tiles[i][j].sprite.alpha = 0.5;
                    // boardContainer.removeChild(level.tiles[i][j].sprite)
                    // Tile is removed, increase shift
                    shift++;
                    level.tiles[i][j].shift = 0;
                } else {
                    // Set the shift
                    // level.tiles[i][j].sprite.children[1].text = shift;
                    level.tiles[i][j].shift = shift;
                }
            }
        }

    }
    loopClusters(func) {
        for (var i=0; i<clusters.length; i++) {
            //  { column, row, length, horizontal }
            var cluster = clusters[i];
            var coffset = 0;
            var roffset = 0;
            for (var j=0; j<cluster.length; j++) {
                func(i, cluster.column+coffset, cluster.row+roffset, cluster);

                if (cluster.horizontal) {
                    coffset++;
                } else {
                    roffset++;
                }
            }
        }
    }
    getTile() {
        console.log('', level.tiles);
    }
    shiftTiles() {
        var count = 0;
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                // Get the shift of the tile for animation
                let sprite = level.tiles[i][j].sprite;
                let shift = level.tiles[i][j].shift;
                let ytarg = shift * level.tileheight + sprite.y;
                TweenMax.to(sprite, 0.4, {y: ytarg, ease: Sine.easeIn});
                var that = this;

                let newType = level.tiles[i][j].type;
                if (!level.tiles[i][j+shift].updated) {
                    level.tiles[i][j+shift].new = newType;
                }

                console.log(i,j, level.tiles[i][j]);
                console.log(i,j+shift, level.tiles[i][j+shift]);

                level.tiles[i][j+shift].updated = true;
                console.log('------------------------------------', );
                //this.swap(i,j)


                (function (i, j) {
                    setTimeout(function() {
                        //if(shift >0) {

                        that.swap(i, j);
                       // }
                    }, 400);
                })(i, j);
            }
        }
        var that = this;
         setTimeout(()=> {
             for (var i=0; i<level.columns; i++) {
                 for (var j = 0; j < level.rows; j++) {
                     var tile = level.tiles[i][j];
                     //if (tile.shift > 0) {
                         //that.swap(i,j);
                    // }
                 }
             }
             }, 1000);

    }
    replaceTiles() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {

                if (level.tiles[i][j].type = -1) {
                    let randomIndex = Math.floor(Math.random() * arr_sprites.length);
                    var tileImage = arr_sprites[randomIndex].image;
                    level.tiles[i][j] = {
                        type: randomIndex,
                        shift: 0,
                        sprite: this.createTileSprite(tileImage, randomIndex)
                    }
                 }
            }
        }
    }
    getTile(t) {
        var returnval;
        switch(t) {
            case 0:
                return 'gold';
            case 1:
                return 'blue';
            case 2:
                return 'pink';
            case 3:
                return 'green';
            case -1:
                return 'removed';

        }
    }
    swap(x1, y1) {

        let shift = level.tiles[x1][y1].shift;



        let secondTile = level.tiles[x1][y1+shift];
        let firstTile = level.tiles[x1][y1];

        console.log(x1, y1+shift, secondTile);


        //firstTile.sprite.alpha = 0;


        if (secondTile.hasOwnProperty('oldType')) {
            //secondTile.type = secondTile.oldType;
        }
        if (secondTile.new != -1) {
                secondTile.sprite.alpha = 1;
                //console.log(arr_sprites[secondTile.new].image);

                let texture = PIXI.Texture.fromImage(require('../img/' + arr_sprites[secondTile.new].image));
                secondTile.sprite.tile.texture = texture;
        }




        /*if (x1==2 && y1==3 && x2==2 && y2==4) {
           // console.log('first', firstTile);
           // console.log('second', secondTile);
        }

        var typeswap = level.tiles[x1][y1].type;
        level.tiles[x1][y1].type = level.tiles[x2][y2].type;
        level.tiles[x2][y2].type = typeswap;




        // so secondTile must become firstTile


        if (x1 == 2) {
            console.log('swapping', x1, y1, 'with', x2, y2, ':', this.getTile(firstTile.type), this.getTile(secondTile.type));
        }







        // console.log('typeswap', typeswap);
        if (typeswap >= 0) {
            //console.log('', typeswap);
            let texture = PIXI.Texture.fromImage(require('../img/' + arr_sprites[typeswap].image));
            secondTile.sprite.tile.texture = texture;
        }*/
    }

    addBoard() {
        var levelwidth = level.columns * level.tilewidth;
        var levelheight = level.rows * level.tileheight;
        boardContainer = new PIXI.Container();
        app.stage.addChild(boardContainer);
        // Draw the frame
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(1, 0x1099bb, 1);
        graphics.beginFill(0x000000, 1);
        graphics.drawRect(0, 0, levelwidth + 8, levelheight + 8);
        boardContainer.addChild(graphics);
        boardContainer.position.x = level.x - 4;
        boardContainer.position.y = level.y - 4;
        boardContainer.interactive = true;
    }
    createTileSprite(img, index) {
        var spriteContainer = new PIXI.Container();
        let tile = PIXI.Sprite.fromImage(require('../img/'+img));
        tile.width = level.tilewidth;
        tile.height = level.tileheight;
        tile.anchor.set(0);
        tile.alpha = 1;
        boardContainer.addChild(spriteContainer);
        spriteContainer.addChild(tile);

        spriteContainer.tile = tile;

        var style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff'], // gradient
        });

        var richText = new PIXI.Text('99', style);
        richText.x = 0;
        richText.y = 0;

        var style2 = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#ffffff'], // gradient
        });

        var richText2 = new PIXI.Text(index, style2);
        richText2.x = 0;
        richText2.y = 0;
        // spriteContainer.addChild(richText);
        spriteContainer.addChild(richText2);
        return spriteContainer
    }
}
export default Visualisation;