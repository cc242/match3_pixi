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
var that;
var level = {
    x: 100,         // X position
    y: 120,         // Y position
    columns: 5,     // Number of tile columns
    rows: 10,        // Number of tile rows
    tilewidth: 40,  // Visual width of a tile
    tileheight: 40, // Visual height of a tile
    tiles: [],      // The two-dimensional tile array
    selectedtile: { selected: false, column: 0, row: 0 }
};

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

// Game states
var gamestates = { init: 0, ready: 1, resolve: 2 };
var gamestate = gamestates.init;

// Score
var score = 0;

// Animation variables
var animationstate = 0;
var animationtime = 0;
var animationtimetotal = 0.3;

// Show available moves
var showmoves = false;

// The AI bot
var aibot = false;

// Game Over
var gameover = false;

var boardContainer;
var blah = 'blah';
class Visualisation extends EventEmitter {
    init(config) {
        that = this;
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


        this.render();
    }
    updateBunny() {
        app.ticker.add(function(delta) {
            bunny.rotation += 0.1 * delta;
        });
    }
    matchThreeInit() {

        // Initialize the two-dimensional tile array
        for (var i=0; i<level.columns; i++) {
            level.tiles[i] = [];
            for (var j=0; j<level.rows; j++) {
                // Define a tile type and a shift parameter for animation
                level.tiles[i][j] = { type: 0, shift:0 }
            }
        }
        console.log('init level', level);
        this.newGame();
    }
    update() {


        if (gamestate == gamestates.ready) {
            // Game is ready for player input

            // Check for game over
            if (moves.length <= 0) {
                gameover = true;
            }

            // Let the AI bot make a move, if enabled
            if (aibot) {
                animationtime += 0.001;
                if (animationtime > animationtimetotal) {
                    // Check if there are moves available
                    this.findMoves();

                    if (moves.length > 0) {
                        // Get a random valid move
                        var move = moves[Math.floor(Math.random() * moves.length)];

                        // Simulate a player using the mouse to this.swap two tiles
                        this.mousethis.swap(move.column1, move.row1, move.column2, move.row2);
                    } else {
                        // No moves left, Game Over. We could start a new game.
                        // newGame();
                    }
                    animationtime = 0;
                }
            }
        } else if (gamestate == gamestates.resolve) {
            // Game is busy resolving and animating clusters
            animationtime += 0.01;

            if (animationstate == 0) {
                // Clusters need to be found and removed
                if (animationtime > animationtimetotal) {
                    // Find clusters
                    this.findClusters();

                    if (clusters.length > 0) {
                        // Add points to the score
                        for (var i=0; i<clusters.length; i++) {
                            // Add extra points for longer clusters
                            score += 100 * (clusters[i].length - 2);;
                        }

                        // Clusters found, remove them
                        this.removeClusters();

                        // Tiles need to be shifted
                        animationstate = 1;
                    } else {
                        // No clusters found, animation complete
                        gamestate = gamestates.ready;
                    }
                    animationtime = 0;
                }
            } else if (animationstate == 1) {
                // Tiles need to be shifted
                if (animationtime > animationtimetotal) {
                    // Shift tiles
                    this.shiftTiles();

                    // New clusters need to be found
                    animationstate = 0;
                    animationtime = 0;

                    // Check if there are new clusters
                    this.findClusters();
                    if (clusters.length <= 0) {
                        // Animation complete
                        gamestate = gamestates.ready;
                    }
                }
            } else if (animationstate == 2) {
                // this.swapping tiles animation
                if (animationtime > animationtimetotal) {
                    // this.swap the tiles
                    this.swap(currentmove.column1, currentmove.row1, currentmove.column2, currentmove.row2);

                    console.log('currentmove', currentmove);
                    // Check if the this.swap made a cluster
                    this.findClusters();
                    if (clusters.length > 0) {
                        // Valid this.swap, found one or more clusters
                        // Prepare animation states
                        animationstate = 0;
                        animationtime = 0;
                        gamestate = gamestates.resolve;
                    } else {
                        // Invalid this.swap, Rewind this.swapping animation
                        animationstate = 3;
                        animationtime = 0;
                    }

                    // Update moves and clusters
                    this.findMoves();
                    this.findClusters();
                }
            } else if (animationstate == 3) {
                // Rewind this.swapping animation
                if (animationtime > animationtimetotal) {
                    // Invalid this.swap, this.swap back
                    this.swap(currentmove.column1, currentmove.row1, currentmove.column2, currentmove.row2);

                    // Animation complete
                    gamestate = gamestates.ready;
                }
            }

            // Update moves and clusters
            this.findMoves();
            this.findClusters();
        }
    }
    render() {
        var levelwidth = level.columns * level.tilewidth;
        var levelheight = level.rows * level.tileheight;
        // Draw the frame
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(1, 0x1099bb, 1);
        graphics.beginFill(0x000000, 1);
        graphics.drawRect(0, 0, levelwidth + 8, levelheight + 8);
        boardContainer.addChild(graphics);
        boardContainer.position.x = level.x - 4;
        boardContainer.position.y = level.y - 4;
        boardContainer.interactive = true;
        /*boardContainer.pointermove = this.onMouseMove;
        boardContainer.pointerup = this.onMouseUp;
        boardContainer.pointerout = this.onMouseOut;*/

        boardContainer.on('pointerdown', (e)=> {
           this.onMouseDown(e);
        });
        boardContainer.on('pointermove', (e)=> {
            this.onMouseMove(e);
        });
        boardContainer.on('pointerup', (e)=> {
            this.onMouseUp(e);
        });
        boardContainer.on('pointerout', (e)=> {
            this.onMouseOut(e);
        });

        function mousedownEventHandler(e) {

            console.log('pointermove:', e.data.getLocalPosition(boardContainer));
        }

        // Render tiles
        this.renderTiles();

                // Render clusters
                //this.renderClusters();

                // Render moves, when there are no clusters
                if (showmoves && clusters.length <= 0 && gamestate == gamestates.ready) {
                    // this.renderMoves();
                }

                // Game Over overlay
                /*if (gameover) {
                    context.fillStyle = "rgba(0, 0, 0, 0.8)";
                    context.fillRect(level.x, level.y, levelwidth, levelheight);

                    context.fillStyle = "#ffffff";
                    context.font = "24px Verdana";
                    drawCenterText("Game Over!", level.x, level.y + levelheight / 2 + 10, levelwidth);
                }*/
    }
    renderTiles() {
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows; j++) {
                // Get the shift of the tile for animation
                var shift = level.tiles[i][j].shift;

                // Calculate the tile coordinates
                var coord = this.getTileCoordinate(i, j, 0, (animationtime / animationtimetotal) * shift);

                // Check if there is a tile present
                if (level.tiles[i][j].type >= 0) {
                    // Get the color of the tile
                    var col = tilecolors[level.tiles[i][j].type];

                    // Draw the tile using the color
                    this.drawTile(coord.tilex, coord.tiley, col[0], col[1], col[2]);
                }

                // Draw the selected tile
                if (level.selectedtile.selected) {
                    if (level.selectedtile.column == i && level.selectedtile.row == j) {
                        // Draw a red tile
                        this.drawTile(coord.tilex, coord.tiley, 255, 0, 0);
                    }
                }
            }
        }

        // Render the swap animation
        if (gamestate == gamestates.resolve && (animationstate == 2 || animationstate == 3)) {
            // Calculate the x and y shift
            var shiftx = currentmove.column2 - currentmove.column1;
            var shifty = currentmove.row2 - currentmove.row1;

            // First tile
            var coord1 = this.getTileCoordinate(currentmove.column1, currentmove.row1, 0, 0);
            var coord1shift = this.getTileCoordinate(currentmove.column1, currentmove.row1, (animationtime / animationtimetotal) * shiftx, (animationtime / animationtimetotal) * shifty);
            var col1 = tilecolors[level.tiles[currentmove.column1][currentmove.row1].type];

            // Second tile
            var coord2 = this.getTileCoordinate(currentmove.column2, currentmove.row2, 0, 0);
            var coord2shift = this.getTileCoordinate(currentmove.column2, currentmove.row2, (animationtime / animationtimetotal) * -shiftx, (animationtime / animationtimetotal) * -shifty);
            var col2 = tilecolors[level.tiles[currentmove.column2][currentmove.row2].type];

            // Draw a black background
            this.drawTile(coord1.tilex, coord1.tiley, 0, 0, 0);
            this.drawTile(coord2.tilex, coord2.tiley, 0, 0, 0);

            // Change the order, depending on the animation state
            if (animationstate == 2) {
                // Draw the tiles
                this.drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
                this.drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
            } else {
                // Draw the tiles
                this.drawTile(coord2shift.tilex, coord2shift.tiley, col2[0], col2[1], col2[2]);
                this.drawTile(coord1shift.tilex, coord1shift.tiley, col1[0], col1[1], col1[2]);
            }
        }
    }
    getTileCoordinate(column, row, columnoffset, rowoffset) {
        var tilex = level.x + (column + columnoffset) * level.tilewidth;
        var tiley = level.y + (row + rowoffset) * level.tileheight;
        return { tilex: tilex, tiley: tiley};
    }
    drawTile(x, y, r, g, b) {
        // console.log('', x, y, r, g, b);
        var graphics = new PIXI.Graphics();
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginFill(Effects.rgbToHex(r, g, b), 1);
        graphics.drawRect(x, y, level.tilewidth, level.tileheight);
        app.stage.addChild(graphics);
        //context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        //context.fillRect(x, y, level.tilewidth, level.tileheight);
    }
    findMoves() {
        // Reset moves
        moves = []

        // Check horizontal this.swaps
        for (var j=0; j<level.rows; j++) {
            for (var i=0; i<level.columns-1; i++) {
                // this.swap, find clusters and this.swap back
                this.swap(i, j, i+1, j);
                this.findClusters();
                this.swap(i, j, i+1, j);

                // Check if the this.swap made a cluster
                if (clusters.length > 0) {
                    // Found a move
                    moves.push({column1: i, row1: j, column2: i+1, row2: j});
                }
            }
        }

        // Check vertical this.swaps
        for (var i=0; i<level.columns; i++) {
            for (var j=0; j<level.rows-1; j++) {
                // this.swap, find clusters and this.swap back
                this.swap(i, j, i, j+1);
                this.findClusters();
                this.swap(i, j, i, j+1);

                // Check if the this.swap made a cluster
                if (clusters.length > 0) {
                    // Found a move
                    moves.push({column1: i, row1: j, column2: i, row2: j+1});
                }
            }
        }
        // console.log('moves:', moves);
        // Reset clusters
        clusters = []
    }
    newGame() {
        console.log('newgame');


        // Reset score
        score = 0;

        // Set the gamestate to ready
        gamestate = gamestates.ready;

        // Reset game over
        gameover = false;

        // Create the level
        boardContainer = new PIXI.Container();
        app.stage.addChild(boardContainer);
        this.createLevel();

        // Find initial clusters and moves
        this.findMoves();
        this.findClusters();
    }
    createLevel() {
        var done = false;

        // Keep generating levels until it is correct
        while (!done) {

            // Create a level with random tiles
            for (var i=0; i<level.columns; i++) {
                for (var j=0; j<level.rows; j++) {
                    level.tiles[i][j].type = this.getRandomTile();
                    level.tiles[i][j].id = i+':'+j;
                }
            }

            // Resolve the clusters
            this.resolveClusters();

            // Check if there are valid moves
            this.findMoves();

            // Done when there is a valid move
            if (moves.length > 0) {
                done = true;
            }

        }
        console.log(level);
    }
    getRandomTile() {
        return Math.floor(Math.random() * tilecolors.length);
    }
    resolveClusters() {
        // Check for clusters
        this.findClusters();

        // While there are clusters left
        while (clusters.length > 0) {
            console.log('resolving');
            // Remove clusters
            this.removeClusters();

            // Shift tiles
            this.shiftTiles();

            // Check if there are clusters left
            this.findClusters();
        }
    }
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
    removeClusters() {
        // Change the type of the tiles to -1, indicating a removed tile
        this.loopClusters(function(index, column, row, cluster) { level.tiles[column][row].type = -1; });

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
    }
    shiftTiles() {
        // Shift tiles
        for (var i=0; i<level.columns; i++) {
            for (var j=level.rows-1; j>=0; j--) {
                // Loop from bottom to top
                if (level.tiles[i][j].type == -1) {
                    // Insert new random tile

                    level.tiles[i][j].type = this.getRandomTile();
                } else {
                    // this.swap tile to shift it
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
    getMouseTile(pos) {

        // Calculate the index of the tile
        var tx = Math.floor((pos.x) / level.tilewidth);
        var ty = Math.floor((pos.y) / level.tileheight);


        console.log('pos', pos);
        console.log('tx', tx, 'ty', ty);
        // Check if the tile is valid
        if (tx >= 0 && tx < level.columns && ty >= 0 && ty < level.rows) {
            // Tile is valid
            console.log('valid');
            return {
                valid: true,
                x: tx,
                y: ty
            };
        }
        console.log('invalid');
        // No valid tile
        return {
            valid: false,
            x: 0,
            y: 0
        };
    }
    canswap(x1, y1, x2, y2) {
        // Check if the tile is a direct neighbor of the selected tile
        if ((Math.abs(x1 - x2) == 1 && y1 == y2) ||
            (Math.abs(y1 - y2) == 1 && x1 == x2)) {
            return true;
        }
    }
    testScope(num) {
        console.log('test', num);
    }
    checkSwap(x1, y1, x2, y2) {
        if ((Math.abs(x1 - x2) == 1 && y1 == y2) ||
            (Math.abs(y1 - y2) == 1 && x1 == x2)) {
            return true;
        }
    }
    // this.swap two tiles in the level
    swap(x1, y1, x2, y2) {
        var typeswap = level.tiles[x1][y1].type;
        level.tiles[x1][y1].type = level.tiles[x2][y2].type;
        level.tiles[x2][y2].type = typeswap;

        // console.log('swapping', level.tiles);
    }
    mouseSwap(c1, r1, c2, r2) {
        // Save the current move
        currentmove = {column1: c1, row1: r1, column2: c2, row2: r2};

        // Deselect
        level.selectedtile.selected = false;

        // Start animation
        animationstate = 2;
        animationtime = 0;
        gamestate = gamestates.resolve;
    }
    // On mouse movement
    onMouseMove(e) {
        //console.log('mousemove 1', drag, level.selectedtile.selected);
        // Get the mouse position
        var pos = this.getMousePos(e);

        // Check if we are dragging with a tile selected
        if (drag && level.selectedtile.selected) {
            // Get the tile under the mouse

            var mt = this.getMouseTile(pos);
            if (mt.valid) {
                // Valid tile
                // Check if the tiles can be swapped
                // var canswap = this.canSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);

                if ( this.checkSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)){
                    // Swap the tiles
                    this.mouseSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);
                }
            }
        }
    }

    // On mouse button click
    onMouseDown(e) {
        // Get the mouse position
        var pos = this.getMousePos(e);

        //console.log('', e);
        // Start dragging
        if (!drag) {

            // Get the tile under the mouse
            var mt = this.getMouseTile(pos);

            if (mt.valid) {

                // Valid tile
                var swapped = false;
                if (level.selectedtile.selected) {

                    if (mt.x == level.selectedtile.column && mt.y == level.selectedtile.row) {
                        // Same tile selected, deselect
                        level.selectedtile.selected = false;
                        drag = true;
                        return;
                    } else if (this.checkSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)){
                        // Tiles can be swapped, swap the tiles
                        this.mouseSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);
                        swapped = true;
                    }
                }

                if (!swapped) {
                    // Set the new selected tile
                    level.selectedtile.column = mt.x;
                    level.selectedtile.row = mt.y;
                    level.selectedtile.selected = true;
                }
            } else {
                // Invalid tile
                level.selectedtile.selected = false;
            }

            // Start dragging
            drag = true;
        }

        // Check if a button was clicked
        /*for (var i=0; i<buttons.length; i++) {
            if (pos.x >= buttons[i].x && pos.x < buttons[i].x+buttons[i].width &&
                pos.y >= buttons[i].y && pos.y < buttons[i].y+buttons[i].height) {

                // Button i was clicked
                if (i == 0) {
                    // New Game
                    newGame();
                } else if (i == 1) {
                    // Show Moves
                    showmoves = !showmoves;
                    buttons[i].text = (showmoves?"Hide":"Show") + " Moves";
                } else if (i == 2) {
                    // AI Bot
                    aibot = !aibot;
                    buttons[i].text = (aibot?"Disable":"Enable") + " AI Bot";
                }
            }
        }*/
    }

    onMouseUp(e) {
        // Reset dragging
        console.log('', level.tiles);
        drag = false;
    }

    onMouseOut(e) {
        // Reset dragging
        drag = false;
    }

    // Get the mouse position
    getMousePos(e) {
        return {
            x: e.data.getLocalPosition(boardContainer).x,
            y: e.data.getLocalPosition(boardContainer).y
        };
    }
    // createTileSprite
    createTileSprite() {
        let tile = PIXI.Sprite.fromImage(require('../img/star.png'));
        tile.anchor.set(0);
        return tile
    }
}
export default Visualisation;