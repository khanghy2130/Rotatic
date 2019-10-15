/*
- Cell constructor

- function for drawing each triangle that takes in the Cell object.

- function for checking mouse hover on cell, also show the highlighting

*/
"use strict";
function TriangleCell_Module(p5){

	// destructure to get all constants
	const {GRID_POS, SIDE_LENGTH, T_HEIGHT, CENTER_Y, COLORS, CELL_COLOR} = p5;
	const HIGHLIGHT_VALUE = 40; // yellow color opacity (0 - 255)

	/*
	cell constructor 
	-upward : pointed upward or not
	-colorIndex : 0 , 1 , 2
	-cell type : 0 (not used), 1 (empty), 2 (.), 3 (|), 4 (|/), 5 (\|/)
	-angle : 0 , 1 , 2
	*/
	this.Cell = function(x, y, type, colorIndex, angle) {
		this.hide = false; // show/hide
		this.canRotate = true; // for play scene, false if can't rotate
		this.upward = (x + y) % 2 === 0;

		this.x = x; 
		this.y = y;
		this.type = type;
		this.colorIndex = colorIndex;
		this.angle = angle;
		
		// set center position (if upward then move the center up by the offset below)
		let yOffset = (this.upward) ? T_HEIGHT - (2 * CENTER_Y) : 0;
		this.center = {
			x: GRID_POS.x + x * SIDE_LENGTH/2, 
			y: GRID_POS.y + y * T_HEIGHT + yOffset
		};
	};

	// used in both editor and play scenes
	// uses cell hide, center, x/y, colorIndex, angle
	// position {x, y} is optional, it will override the cell position and won't apply yOffset
	this.Cell.prototype.draw = function(position, overrideHide){
		if (this.hide && !overrideHide) return;
		p5.push();

		// translate to the center of the cell
		if (position){
			p5.translate(position.x, position.y);
		} else {
			p5.translate(this.center.x, this.center.y);
		}
		
		// rotate to the rotate index, and if pointed upward then turn around
		p5.rotate(120 * this.angle + ((this.upward) ? 0 : 180));

		// DRAW TRIANGLE
		p5.fill(CELL_COLOR);
		if (this.type === 0) p5.noFill(); // empty inside if type 0
		p5.stroke(150);
		// top > left > right
		p5.triangle(
			0,
			-(T_HEIGHT - CENTER_Y),
			-SIDE_LENGTH/2,
			CENTER_Y,
			SIDE_LENGTH/2, 
			CENTER_Y
		);

		// DRAW TYPE PATTERN (only draw if has pattern [type > 1])
		if (this.type > 1){
			p5.fill(COLORS[this.colorIndex]);
			p5.noStroke();

			// line(s)
			for (let i=0; i < this.type - 2; i++){
				p5.rect(0, SIDE_LENGTH * 0.15, SIDE_LENGTH * 0.1, SIDE_LENGTH/4);
				p5.rotate(120);
			}

			// center circle  OR  fill the center gap
			if (this.type < 4){
				p5.ellipse(0, 0, SIDE_LENGTH * 0.3, SIDE_LENGTH * 0.3);
				p5.fill(CELL_COLOR);
				p5.ellipse(0, 0, SIDE_LENGTH * 0.15, SIDE_LENGTH * 0.15);
			} else if (this.type >= 4){
				p5.ellipse(0, 0, SIDE_LENGTH * 0.12, SIDE_LENGTH * 0.12);
			}
			
		}
		
		p5.pop();
	};

	// return true and show highlighting if mouse is hovering on given cell
	this.Cell.prototype.onHover = function(){
		// quick check: return false if x or y is far away
		if (p5.abs(p5.mouseX - this.center.x) > SIDE_LENGTH * 0.6 || p5.abs(p5.mouseY - this.center.y) > SIDE_LENGTH * 0.6){
			return false;
		}

		var pt = {x: p5.mouseX, y: p5.mouseY};
		var v1, v2, v3;

		if (this.upward){
			v1 = {
				x: this.center.x,
				y: this.center.y -(T_HEIGHT - CENTER_Y)
			};
			v2 = {
				x: this.center.x -SIDE_LENGTH/2,
				y: this.center.y +CENTER_Y
			};
			v3 = {
				x: this.center.x +SIDE_LENGTH/2,
				y: this.center.y +CENTER_Y
			};
		} else {
			v1 = {
				x: this.center.x,
				y: this.center.y +(T_HEIGHT - CENTER_Y)
			};
			v2 = {
				x: this.center.x -SIDE_LENGTH/2,
				y: this.center.y -CENTER_Y
			};
			v3 = {
				x: this.center.x +SIDE_LENGTH/2,
				y: this.center.y -CENTER_Y
			};
		}

		if (pointInTriangle(pt, v1, v2, v3)){
			p5.noStroke();
			p5.fill(30, 200, 200, HIGHLIGHT_VALUE);
			p5.triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y);

			return true;
		}

		return false;
	};

	var sign = function (p1, p2, p3){
	    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
	};

	var pointInTriangle = function (pt, v1, v2, v3){
	    var d1, d2, d3;
	    var has_neg, has_pos;

	    d1 = sign(pt, v1, v2);
	    d2 = sign(pt, v2, v3);
	    d3 = sign(pt, v3, v1);

	    has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
	    has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

	    return !(has_neg && has_pos);
	};

}