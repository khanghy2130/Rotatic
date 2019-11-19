"use strict";
function sketch(p5) {

	/*
	Provided in setup:
		- sceneControl object
		- Button constructor() and draw()

	*/

	p5.setup = function() {
		p5.createCanvas(600, 600);

		p5.rectMode(p5.CENTER);
		p5.imageMode(p5.CENTER);
		p5.textAlign(p5.CENTER, p5.CENTER);
		p5.angleMode(p5.DEGREES);
		p5.textFont("Trebuchet MS");

		// CONSTANTS
		p5.LEVELS_DATA = getLevelsData();

		p5.GRID_POS = {x: 100, y: 250};
		p5.SIDE_LENGTH = 100;
		p5.T_HEIGHT = p5.SIDE_LENGTH * p5.sqrt(3)/2;
		p5.CENTER_Y = p5.SIDE_LENGTH / (2 * Math.sqrt(3));
		
		p5.COLORS = [p5.color(230, 20, 20), p5.color(0, 200, 0), p5.color(30, 130, 230)];
		p5.CELL_COLOR = p5.color(20);
		p5.BG_COLOR = p5.color(65);

		// global properties
		p5.currentLevelIndex = 0;
		p5.alreadyClicked = false;
		p5.mouseClicking = function(){return p5.mouseIsPressed && !p5.alreadyClicked;};

	    // handle changing scene
	    p5.sceneControl = {
	    	scene : "menu",
	    	timer : 24, // start value is 50, totally darken & set scene at 25, 0 is done
	    	nextScene : "menu",
	    	setupTransition : function(scene){
	    		this.nextScene = scene;
	    		this.timer = 50;
	    	},
	    	update : function() {
	    		if (this.timer > 0){
	    			p5.background(0, 0, 0, (25 - p5.abs(this.timer - 25)) * 11);
	    			this.timer--;
	    			
	    			// totally darken? 
	    			if (this.timer === 25){
	    				this.scene = this.nextScene;

	    				// run set up
	    				switch (this.scene){
			    			case "play":
			    				p5.playScene.loadLevel(p5.LEVELS_DATA[p5.currentLevelIndex]);
			    				break;
			    			case "editor":
			    				p5.editorScene.setup();
			    				break;
			    			case "menu":
			    				p5.menuScene.setup();
			    				break;
			    		}
	    			}

	    		}
	    	},
	    };

	    // button constructor
	    p5.Button = function(name, x, y, s, func){
	    	this.name = name;
	    	this.x = x;
	    	this.y = y;
	    	this.s = s;
	    	this.func = func;
	    	this.hoverValue = 0; // (0 to 20)

	    	// for levelButton
	    	this.completed = false;
	    };
	    // draw button method
	    p5.Button.prototype.draw = function(checkHover) {
	    	// update hoverValue
	    	if (checkHover){
	    		if (p5.abs(p5.mouseX - this.x) < this.s * 50 && p5.abs(p5.mouseY - this.y) < this.s * 20){
			    	// can't take action if scene is transiting
		    		if (p5.mouseClicking() && p5.sceneControl.timer === 0){
		    			this.func();
		    		}
		    		if (this.hoverValue < 20){this.hoverValue++;}
		    	}
		    	else {
		    		if (this.hoverValue > 0){this.hoverValue--;}
		    	}
	    	} else {
	    		if (this.hoverValue > 0){this.hoverValue--;}
	    	}
	    	
	    	// box
	    	if (this.hoverValue !== 0){
	    		p5.push();
		    	p5.translate(this.x, this.y);
		    	p5.rotate(30 - this.hoverValue * 1.5);
		    	p5.fill(250, 250, 250, this.hoverValue * 15);
		    	p5.rect(0, 0, this.s * 100, this.s * 40);
		    	p5.pop();
	    	}

	    	// text
	    	p5.textSize(this.s * 25);
	    	p5.fill(240 - this.hoverValue * 10);
	    	if (this.completed){
	    		p5.fill(20 ,240 - this.hoverValue * 10, 20);
	    	}
	    	p5.text(this.name, this.x, this.y);
	    };


		// import modules
		p5.triangleCell = new TriangleCell_Module(p5);
		p5.menuScene = new MenuScene_Module(p5);
		p5.editorScene = new EditorScene_Module(p5);
		p5.playScene = new PlayScene_Module(p5);
		
	};

	p5.draw = function() {
		switch (p5.sceneControl.scene) {
			case "play":
				p5.playScene.draw();
				break;
			case "editor":
				p5.editorScene.draw();
				break;
			case "menu":
				p5.menuScene.draw();
				break;
		}

		p5.sceneControl.update();
		p5.alreadyClicked = p5.mouseIsPressed; // mouse click protect
	};

};

new p5(sketch, "canvas-container");

// disable right-click menu on canvas
document.getElementById("canvas-container").oncontextmenu = function (e) {
    e.preventDefault();
};
