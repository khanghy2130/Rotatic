/*
Structure:
	- loadLevel function (setup)
	- rotate mechanics and animation
	- function to check if puzzle is solved
	- back and undo buttons
	- won object: handles animation and action after won
*/
"use strict";
function PlayScene_Module(p5){

	// destructure to get all constants
	const {GRID_POS, SIDE_LENGTH, T_HEIGHT, CENTER_Y, COLORS, CELL_COLOR} = p5;

	var solutionImage = null;
	var solutionData = []; // contains all cells in their original data
	var gridData = []; // contains all cells
	var canRotateCells = []; // contains cells that can rotate
	var won = false;
	var undoHistory = [];

	var backButton, undoButton;

	// return a list of surrounding cells of the given cell
	function getSurroundingCells(cell){
		// ORDER: [if upward then: below; else: above], [left], [right]
		var surroundingCellsPos = [
			{x: cell.x, y: cell.y + ((cell.upward) ? 1 : -1)},
			{x: cell.x - 1, y: cell.y},
			{x: cell.x + 1, y: cell.y}
		];

		// find each pos from gridData
		// if found then add to result list
		var result = [];
		for (let i=0; i < surroundingCellsPos.length; i++){
			var pos = surroundingCellsPos[i];
			
			for (let j=0; j < gridData.length; j++){
				var c = gridData[j];
				// found it?
				if (c.x === pos.x && c.y === pos.y){
					result.push(c);
					break;
				}
			}
		}
		return result;
	}

	// load and setup play scene
	this.loadLevel = function(levelData) {
		backButton.hoverValue = 0;
		solutionData = [];
		gridData = []; 
		canRotateCells = [];
		won = false;
		wonObject.timer = 0;
		undoHistory = [];
		shuffleControl.setup();

		var encodedList = levelData.match(/.{5}/g); // split the cells raw data
		// create the cells (cd is cellData) one for gridData and one for solution data
		encodedList.forEach((cd) => {
			var cell = new p5.triangleCell.Cell(Number(cd[0]), Number(cd[1]), Number(cd[2]), Number(cd[3]), Number(cd[4]));
			gridData.push(cell);

			cell = new p5.triangleCell.Cell(Number(cd[0]), Number(cd[1]), Number(cd[2]), Number(cd[3]), Number(cd[4]));
			solutionData.push(cell);
		});

		// find cells that can rotate, add them into the list
		gridData.forEach((cell) => {
			// cannot rotate if there are less than 3 surrounding cells
			if (getSurroundingCells(cell).length === 3){
				canRotateCells.push(cell);
			}
		});

		// draw all cells then take picture of the solution
		p5.background(p5.BG_COLOR);
		p5.strokeWeight(2);
		gridData.forEach((cell) => {
			cell.draw();
		});
		solutionImage = p5.get(0, 200, 600, 400);
		p5.background(0);
	};

	// transform data, then call animation
	function rotateAndUpdateData(rotatedCell, goesLeft, doesAnimate){
		// ORDER: [above/below], [left], [right]
		var surroundingCells = getSurroundingCells(rotatedCell);
		var rotateIndicesOrder = []; // the order that the surrounding cells data will be replaced
		
		if (rotatedCell.upward !== goesLeft){
			rotateIndicesOrder = [1, 2, 0];
		} else {
			rotateIndicesOrder = [2, 0, 1];
		}
		// record the data (position and type) after rotation
		var recordedData = [{}, {}, {}];
		surroundingCells.forEach((cell, index) => {
			recordedData[rotateIndicesOrder[index]] = {
				type: cell.type,
				colorIndex: cell.colorIndex,
				angle: cell.angle
			};
		});

		// apply the data and update angle for 3 surrounding cells
		surroundingCells.forEach((cell, index) => {
			cell.type = recordedData[index].type;
			cell.colorIndex = recordedData[index].colorIndex;
			cell.angle = recordedData[index].angle;
			
			if (goesLeft){
				cell.angle = (cell.angle === 0) ? 2 : cell.angle - 1;
			} else {
				cell.angle = (cell.angle === 2) ? 0 : cell.angle + 1;
			}
		});
		// update angle for center cell
		if (goesLeft){
			rotatedCell.angle = (rotatedCell.angle === 0) ? 2 : rotatedCell.angle - 1;
		} else {
			rotatedCell.angle = (rotatedCell.angle === 2) ? 0 : rotatedCell.angle + 1;
		}

		// start animation
		if (doesAnimate){animateControl.setup(goesLeft, rotatedCell, surroundingCells);}
	}

	var animateControl = {
		// properties
		timer : 0, // 0 means ended (start value is 30 [120 degrees]) decrease by 1
		goesLeft : true,
		centerCell : null,
		surroundingCells: [],

		setup : function(goesLeft, centerCell, surroundingCells){
			this.goesLeft = goesLeft;
			this.centerCell = centerCell;
			this.surroundingCells = surroundingCells;
			this.timer = 30;

			// set the cells to hide
			this.centerCell.hide = true;
			this.surroundingCells.forEach((cell) => {
				cell.hide = true;
			});
		},
		draw : function(){
			// draw the cells being rotated
			p5.push();
			p5.translate(this.centerCell.center.x, this.centerCell.center.y);

			// timer closer to 15 -> smaller
			var growFactor = (15 - p5.abs(this.timer - 15)) / 50;
			p5.scale(1.0 - growFactor);

			// 30 * 4 = 120
			p5.rotate(((this.goesLeft)? 4 : -4) * this.timer);

			// draw center cell
			this.centerCell.draw({x: 0, y: 0}, true);
			// draw surrounding cells
			this.surroundingCells.forEach((cell, index) => {
				var xOffset = cell.center.x - this.centerCell.center.x;
				var yOffset = cell.center.y - this.centerCell.center.y;

				cell.draw({x: xOffset, y: yOffset}, true);
			});
			
			p5.pop();
			
			if (this.timer <= 1){this.exitAnimation();}
			else {this.timer--;}
		},
		exitAnimation : function(){
			// set the cells back to show
			this.centerCell.hide = false;
			this.surroundingCells.forEach((cell) => {
				cell.hide = false;
			});
			this.timer = 0;
		}
	};

	var shuffleControl = {
		amount : 0,

		setup : function(){
			this.amount = 100;
		},
		update : function(){
			// random can rotate cell, random rotate direction, no animation
			var cell = canRotateCells[p5.floor(p5.random(canRotateCells.length))];
			rotateAndUpdateData(cell, (p5.random() > 0.5) ? true : false ,false);

			this.amount--;
			// check solved after, if is solved then re shuffle
			if (this.amount === 0){
				if (checkSolve()){this.setup();}
			}
		}
	};

	function checkSolve(){
		// gridData and solutionData have matching cell positioning
		for (let i=0; i < gridData.length; i++){
			var cell = gridData[i];
			var sCell = solutionData[i];
			
			if (cell.type !== sCell.type){
				return false; // not same type
			} 
			// same type
			else {
				// check with each type
				switch (cell.type){
					case 2: // dot
					case 5: // 3 lines
						if (cell.colorIndex !== sCell.colorIndex){
							return false; // not same color
						}
						break;
					case 3: // 1 lines
					case 4:
						if (cell.colorIndex !== sCell.colorIndex || cell.angle !== sCell.angle){
							return false; // not same color or angle
						}
						break;
				}
			}
		}

		return true;
	}

	var wonObject = {
		timer : 0, // 0 (start) to 200 (exit) to 201 (end)

		draw : function(){
			if (this.timer < 200){
				this.timer++;
			}
			// one time call
			else if (p5.sceneControl.timer === 0){
				this.timer++;
				p5.menuScene.levelButtons[p5.currentLevelIndex].completed = true;
				p5.sceneControl.setupTransition("menu");
			}

			// animation (appearing animation: from timer of 30 to 130)
			if (this.timer > 30){
				var fixedTimer = this.timer - 30;
				var opacityValue = p5.min(fixedTimer * 5, 255);
				var xOffset = p5.min(fixedTimer * 2, 70); // offset by 70

				p5.push();
				p5.translate(450, 100);
				p5.rotate(30 - p5.min(fixedTimer, 30));

				// box
				p5.fill(20, 230, 20, opacityValue);
				p5.rect(-70 + xOffset, 0, 200, 50);

				// text
				p5.fill(20, 20, 20, opacityValue);
				p5.text("Solved", 70 - xOffset, 0);

				p5.pop();
			}
		}
	};
	
	this.draw = function() {
		p5.background(p5.BG_COLOR);

		// draw buttons
		p5.noStroke();
		backButton.draw(!won);
		undoButton.draw(!won);

		// draw solution
		p5.image(solutionImage, 450, 100, 300, 200);

		// draw win animation
		if (won){wonObject.draw();}
		
		// draw all cells
		p5.strokeWeight(2);
		gridData.forEach((cell) => {
			cell.draw();
		});

		// shuffling?
		if (shuffleControl.amount > 0){
			shuffleControl.update();
		}
		// animating?
		else if (animateControl.timer > 0){
			animateControl.draw();
		}
		// not won yet?
		else if (!won){

			// check hover
			for (let i=0; i < canRotateCells.length; i++) {
				var cell = canRotateCells[i];
				if (cell.onHover()){
					p5.cursor(p5.HAND);
					// check click and apply actions (store in undoHistory at the start and check solve)
					if (p5.mouseClicking()){
						rotateAndUpdateData(cell, p5.mouseButton === "left", true);
						undoHistory.unshift([cell,  p5.mouseButton !== "left"]);
						won = checkSolve();
					}
					break; // found the hovered cell then stop the loop
				}
			}

		}

	};

	// setup the module object
	(function(){
		// create buttons
		backButton = new p5.Button("Back", 140, 70, 1.0, () => {
			p5.sceneControl.setupTransition("menu");
		});
		undoButton = new p5.Button("Undo", 140, 140, 1.2, () => {
			if (undoHistory.length > 0){
				if (animateControl.timer > 0){
					animateControl.exitAnimation();
				}
				// rotate with the data in the first item
				rotateAndUpdateData(undoHistory[0][0], undoHistory[0][1], true);
				undoHistory.shift();
			}
		});

	})();

}