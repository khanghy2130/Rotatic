/*
Structure:
	- Play and Editor buttons
	- levels board
	- level button constructor
*/
"use strict";
function MenuScene_Module(p5){

	this.levelButtons = [];
	var playButton, editorButton;

	var levelsBoard = {
		show : false,
		showValue : 0, // 0 is off, 50 is fully shown
		selectedLevel : 0,

		draw : function(levelButtons){
			// update value
			if (this.show){
				if (this.showValue < 50){
					this.showValue++; // pulling down to show the board
				}
			}
			// not showing
			else {
				if (this.showValue > 0){
					this.showValue--; // pushing up to hide the board
				}
			}

			// draw board
			if (this.showValue > 0){
				var fullyShown = this.showValue === 50;
				var exponent = p5.pow((50 - this.showValue), 1.8);

				p5.background(250, 250, 250, this.showValue * 4);
				p5.push();
				p5.translate(0, -exponent);

				// hide board hint
				p5.fill(20);
				p5.textSize(17);
				p5.text("Click outside the panel to return...", 300, 30);

				// box
				p5.fill(20);
				p5.rect(300, 300, 400, 500, 10);
				
				// level buttons (a property of this module, which makes it a global variable)
				levelButtons.forEach((button) => {
					button.draw(fullyShown);
				});

				p5.pop();
				
				// check click to exit
				if (p5.mouseClicking() && fullyShown && p5.sceneControl.timer === 0){
					if (p5.abs(p5.mouseX - 300) > 200 || p5.abs(p5.mouseY - 300) > 250){
						this.show = false;
					}
				}
			}
		}
	};

	this.setup = function() {
		editorButton.hoverValue = 0;
		if (levelsBoard.selectedLevel){
			levelsBoard.levelButtons[levelsBoard.selectedLevel].hoverValue = 0;
		}

	};

	this.draw = function() {
		p5.background(p5.BG_COLOR);
		p5.noStroke();

		// title
		p5.textSize(100);
		p5.fill(20);
		p5.text("Rota", 240, 150);
		p5.fill(230);
		p5.text("tic", 400, 150);

		// buttons
		playButton.draw(!levelsBoard.show);
		editorButton.draw(!levelsBoard.show);

		// control instruction
		p5.textSize(20);
		p5.fill(20, 230, 20);
		p5.text("Goal: rotate the triangles\nto match the pattern.\nLeft Click: rotate left\nRight Click: rotate right" , 450, 400);

		// levels board
		levelsBoard.draw(this.levelButtons);
	};

	// setup the module object
	(function(levelButtons){
		// create buttons
		playButton = new p5.Button("Play", 150, 350, 2.0, () => {
			levelsBoard.show = true;
		});
		editorButton = new p5.Button("Editor", 150, 450, 2.0, () => {
			p5.sceneControl.setupTransition("editor");
		});

		// create level buttons
		
		p5.LEVELS_DATA.forEach((cd, index) => {
			var xPos = (index < 10) ? 210 : 390;
			var yPos = (index < 10) ? 85 + index * 48 : 85 + (index - 10) * 48;

			// set correct number to show
			var num = index + 1;
			if (num < 10){num = "0" + num;}
			levelButtons.push(new p5.Button("Level " + num, xPos, yPos, 1.0, function() {
				p5.currentLevelIndex = index;
				p5.sceneControl.setupTransition("play");
			}));

		});

	})(this.levelButtons);

}