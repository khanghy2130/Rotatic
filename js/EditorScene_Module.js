/* 
Where user edits custom level and gets the ENCODED level data.
-Structure: 
	+data (gridData) of all cells (Cell object).
	+encode function that gives the level data as a string.
	
*/
"use strict";
function EditorScene_Module(p5){

	// destructure to get all constants
	const {GRID_POS, SIDE_LENGTH, T_HEIGHT, CENTER_Y, COLORS, CELL_COLOR} = p5;
	var gridData = []; // hold all cells

	var backButton, dataButton;

	// object that handles the selecting system
	var selectSystem = {
		selectedCell : null,
		center : null, // center of the cell
	};

	// log out a string of level data
	// encode order: x, y, type, colorIndex, angle
	function logEncodedData(){
		var encodedData = "\"";
		gridData.forEach((cell)=>{
			// append to string if not type 0
			if (cell.type !== 0){
				encodedData += "" + cell.x + cell.y + cell.type + cell.colorIndex + cell.angle;
			}
		});
		console.log(encodedData + "\",");
	};

	// draw options menu and check hover + click
	function drawOptions(){
		// menu width is 500px
		const menuX = 300;
		const menuY = selectSystem.center.y - 150;

		p5.noStroke();
		p5.fill(200);
		p5.rect(menuX, menuY, 500, 150, 10);
		p5.triangle(
			selectSystem.center.x, selectSystem.center.y - 50,
			selectSystem.center.x - 20, selectSystem.center.y - 80,
			selectSystem.center.x + 20, selectSystem.center.y - 80
		);

		// highlight & function
		p5.fill(0,0,0, 50);
		for (let i=-1; i < 2; i++){
			if (p5.abs(p5.mouseY - menuY) < 60 && p5.abs(p5.mouseX - (menuX + i*150)) < 60){
				p5.rect(menuX + i*150, menuY, 120, 120, 10);

				// check click -> apply action
				if (p5.mouseClicking()){
					switch(i){
						// change type
						case -1:
							// if right click then set type to 0
							if (p5.mouseButton === "right"){
								selectSystem.selectedCell.type = 0;
							}
							else {
								if (selectSystem.selectedCell.type < 5){
									selectSystem.selectedCell.type++;
								} else {
									selectSystem.selectedCell.type = 0;
								}
							}
							
							break;
						// rotate
						case 0:
							if (selectSystem.selectedCell.angle < 2){
								selectSystem.selectedCell.angle++;
							} else {
								selectSystem.selectedCell.angle = 0;
							}
							break;
						// change color
						case 1:
							if (selectSystem.selectedCell.colorIndex < 2){
								selectSystem.selectedCell.colorIndex++;
							} else {
								selectSystem.selectedCell.colorIndex = 0;
							}
							break;
					}
				}
				break;
			}
		}

		// draw options
		for (let i=-1; i < 2; i++){
			switch(i){
				// change type
				case -1:
					let yFix = (selectSystem.selectedCell.upward) ? 10 : -10 ;
					selectSystem.selectedCell.draw({x: menuX + i*150, y: menuY + yFix});
					break;
				case 0:
					p5.noFill();
					p5.strokeWeight(10);
					p5.stroke(20);
					p5.arc(menuX, menuY, 50, 50, -10, 270);
					p5.fill(20);
					p5.noStroke();
					p5.triangle(menuX, menuY - 10, menuX, menuY - 40, menuX + 20, menuY - 25);
					break;
				case 1:
					p5.fill(p5.COLORS[selectSystem.selectedCell.colorIndex]);
					p5.strokeWeight(5);
					p5.stroke(20);
					p5.rect(menuX + i*150, menuY, 70, 70, 10);
					break;
			}
		}

		// quit if clicked outside.
		if (p5.mouseClicking()){
			if (p5.abs(p5.mouseY - menuY) > 75 || p5.abs(p5.mouseX - menuX) > 250){
				selectSystem.selectedCell = null;
			}
		}
	};

	this.setup = function() {
		backButton.hoverValue = 0;
	};

	this.draw = function() {
		p5.background(p5.BG_COLOR);

		// back and data button
		p5.noStroke();
		backButton.draw(selectSystem.selectedCell === null);
		dataButton.draw(selectSystem.selectedCell === null);

		// instruction text
		p5.textSize(20);
		p5.fill(220, 220, 10);
		p5.text("Click on a triangle cell to edit it.\nRight clicking the TYPE option will set it to none.\nClick 'Data' to get the encoded level data.\n", 300, 150);

		// draw all cells
		p5.strokeWeight(2);
		gridData.forEach((cell) => {
			cell.draw();
		});

		// check hover if no cell selected
		if (selectSystem.selectedCell === null){
			for (let i=0; i < gridData.length; i++) {
				if (gridData[i].onHover()){
					// check click
					if (p5.mouseClicking() && p5.sceneControl.timer === 0){
						var cell = gridData[i];
						selectSystem.selectedCell = cell;

						// fix y so all cells in a row give same y
						selectSystem.center = {x: cell.center.x, y: GRID_POS.y + cell.y * T_HEIGHT};
					}
					break; // found the hovered cell then stop the loop
				}
			}
		}
		// a cell is selected: show options
		else {
			p5.background(0, 0, 0, 200);
			// redraw cell to highlight
			selectSystem.selectedCell.draw();
			drawOptions();
		}
		
	};

	// setup
	(function(){
		// create all cell objects
		for (let y=0; y < 4; y++){
			for (let x=0; x < 9; x++){
		    	gridData.push(new p5.triangleCell.Cell(x, y, 1, 0, 0));
			}
		}

		// create buttons
		backButton = new p5.Button("Back", 150, 50, 1.3, () => {
			p5.sceneControl.setupTransition("menu");
		});
		dataButton = new p5.Button("Data", 450, 50, 1.3, () => {
			logEncodedData();
		});
	})();
	

}
