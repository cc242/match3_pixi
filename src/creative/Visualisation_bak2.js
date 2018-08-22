/**
 * Created by cchurn16 on 11/28/17.
 */
/*global*/
import {EventEmitter} from 'events';
import * as PIXI from 'pixi.js'
import * as Effects from '../core/Effects';

let app, bunny;
// Mouse dragging
var drag = false;

var level = {
    x: 70,         // X position
    y: 120,         // Y position
    columns: 4,     // Number of tile columns
    rows: 10,        // Number of tile rows
    tilewidth: 40,  // Visual width of a tile
    tileheight: 40, // Visual height of a tile
    tiles: [],      // The two-dimensional tile array
    selectedtile: { selected: false, column: 0, row: 0 }
};
var arr_sprites = [ {type:0, image:'star.png'},
                    {type:1, image:'star_blue.png'},
                    {type:2, image:'star_purple.png'},
                    {type:3, image:'star_green.png'}
                    ];
var newSprite  = {type:4, image:'crate.png'};
// All of the different tile colors in RGB
var tilecolors = [[255, 128, 128],
    [128, 255, 128],
    [255, 0, 128],
    [4, 149, 128],
    [43, 219, 128],
    [128, 128, 255]];

// Clusters and moves that were found
var clusters = [];  // { column, row, length, horizontal }
var moves = [];     // { column1, row1, column2, row2 }

// Current move
var currentmove = { column1: 0, row1: 0, column2: 0, row2: 0 };

var animationtime = 0;
var animationtimetotal = 0.3;

// Game states
var gamestates = { init: 0, ready: 1, resolve: 2 };
var gamestate = gamestates.init;


var boardContainer;
var blah = 'blah';
class Visualisation extends EventEmitter {
    init(config) {
        app = new PIXI.Application(320, 568, {backgroundColor : 0x1099bb});

        document.getElementById('creative_container').appendChild(app.view);

        bunny = PIXI.Sprite.fromImage(require('../img/star.png'));
        bunny.anchor.set(0.5);
        bunny.x = 40;
        bunny.y = app.screen.height / 2;
        app.stage.addChild(bunny);

        this.updateBunny();

        // Match 3 init
        this.matchThreeInit();
        app.ticker.add(function(delta) {
            this.update();
        }.bind(this));
    }
    updateBunny() {
        app.ticker.add(function(delta) {
            bunny.rotation += 0.05 * delta;
        });
    }
    matchThreeInit() {
        this.createLevel();
        // Initialize the two-dimensional tile array
        for (var i=0; i<level.columns; i++) {
            level.tiles[i] = [];
            for (var j=0; j<level.rows; j++) {
                // Define a tile type and a shift parameter for animation
                let randomIndex = Math.floor(Math.random() * arr_sprites.length);
                var tileImage = arr_sprites[randomIndex].image;
                level.tiles[i][j] = {
                    type: randomIndex,
                    shift: 0,
                    sprite: this.createTileSprite(tileImage)
                }
            }
        }
        this.newGame();
    }
    newGame() {
        console.log('newgame');

        gamestate = gamestates.ready;

        // Create the level
        this.renderTiles();

    }
    createLevel() {
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

        setTimeout(()=> {
            console.log('', level.tiles[0][1].sprite);

            //level.tiles[0][1].sprite.shift = 1;
            //level.tiles[3][9].sprite.alpha = 0.2;

            this.resolveClusters();
        }, 1500)

    }
    // redraw tile locations
    renderTiles() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                // Get the shift of the tile for animation
                var shift = level.tiles[i][j].shift;
                // Calculate the tile coordinates
                var speed = (animationtime / animationtimetotal);
                var coord = this.getTileCoordinate(i, j, 0, (speed < 1 ? speed : 1) * shift);

                // console.log('', coord);

                if (level.tiles[i][j].type >= 0) {
                    // Get the color of the tile
                    // console.log('', level.tiles[i][j]);
                    var sprite = level.tiles[i][j].sprite;
                    this.drawTile(sprite, coord.tilex, coord.tiley);

                }
            }
        }
    }
    update() {
        this.renderTiles();
        if (clusters.length) {
            animationtime += 0.02;
        } else {
            // animationtime = 0;
        }
        // console.log('clusters', clusters);
        // animationtime += 0.001;
    }
    swap(x1, y1, x2, y2) {
        var typeswap = level.tiles[x1][y1].type;
        level.tiles[x1][y1].type = level.tiles[x2][y2].type;
        level.tiles[x2][y2].type = typeswap;
    }
    // Get the mouse position
    getMousePos(e) {
        return {
            x: e.data.getLocalPosition(boardContainer).x,
            y: e.data.getLocalPosition(boardContainer).y
        };
    }
    getTileCoordinate(column, row, columnoffset, rowoffset) {
        var tilex = (column + columnoffset) * level.tilewidth;
        var tiley = (row + rowoffset) * level.tileheight;
        // console.log('', tiley);
        return { tilex: tilex, tiley: tiley};
    }
    drawTile(sprite, x, y,) {
        sprite.x = x;
        sprite.y = y;
    }
    // createTileSprite
    createTileSprite(img) {

        // Math.floor(Math.random() * tilecolors.length)

        // let tile = PIXI.Sprite.fromImage(require('../img/star.png'));
        // console.log('img', img);
        let tile = PIXI.Sprite.fromImage(require('../img/'+img));
        tile.width = level.tilewidth;
        tile.height = level.tileheight;
        tile.anchor.set(0);
        tile.alpha = 1;
        // tile.rotation = Math.random() * 45;
        boardContainer.addChild(tile);
        return tile
    }
    // Find clusters in the level
    findClusters() {
        // Reset clusters
        clusters = [];

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
    console.log('clusters', clusters);
    }
    resolveClusters() {
        // Check for clusters
        this.findClusters();
        this.removeClusters();
        this.shiftTiles();

        return;
        // While there are clusters left
        while (clusters.length > 0) {

            // Remove clusters
            //this.removeClusters();

            // Shift tiles
            //this.shiftTiles();

            // Check if there are clusters left
            //this.findClusters();
        }
    }
    removeClusters() {
        console.log('removeClusters');
        // Change the type of the tiles to -1, indicating a removed tile
        this.loopClusters(
            // this sets the type of each tile in cluster to -1, to be removed
            function(index, column, row) {
                level.tiles[column][row].type = -1;
                boardContainer.removeChild(level.tiles[column][row].sprite);
            });
        // return;
        // Calculate how much a tile should be shifted downwards
        for (var i=0; i<level.columns; i++) {
            var shift = 0;
            for (var j=level.rows-1; j>=0; j--) {
                // Loop from bottom to top
                if (level.tiles[i][j].type == -1) {
                    // Tile is removed, increase shift
                    shift++;
                    level.tiles[i][j].shift = 0;
                } else {
                    // Set the shift
                    level.tiles[i][j].shift = shift;
                }
            }
        }
        //clusters = [];
        console.log('', level.tiles);
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
    shiftTiles() {
        for (var i=0; i<level.columns; i++) {
            for (var j=level.rows-1; j>=0; j--) {
                // Loop from bottom to top
                if (level.tiles[i][j].type == -1) {
                    // Insert new random tile
                    return;
                    let randomIndex = 4;//Math.floor(Math.random() * arr_sprites.length);
                    var tileImage = newSprite.image;

                    level.tiles[i][j].type = randomIndex;
                    level.tiles[i][j].sprite = this.createTileSprite(tileImage);
                } else {
                    // Swap tile to shift it
                    var shift = level.tiles[i][j].shift;
                    if (shift > 0) {
                        this.swap(i, j, i, j+shift)
                    }
                }
                // Reset shift
                level.tiles[i][j].shift = 0;
            }
        }
    }
    swap(x1, y1, x2, y2) {
        var typeswap = level.tiles[x1][y1].type;
        level.tiles[x1][y1].type = level.tiles[x2][y2].type;
        level.tiles[x2][y2].type = typeswap;
    }
}
export default Visualisation;