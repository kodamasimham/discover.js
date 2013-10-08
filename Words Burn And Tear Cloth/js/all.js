// Adding rAF for smoother animation
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function( callback ){
			window.setTimeout(callback, 100000 / 60);
		};
})();

var text="Power Star";
// Basic canvas initialization
var canvas = document.getElementById("canvas"),
		ctx = canvas.getContext("2d"),
		cloth,
	boundsx,
	boundsy,
	mouse = {
		down: false,
		button: 1,
		x: 0,
		y: 0,
		px: 0,
		py: 0
	};

var W = window.innerWidth,
		H = window.innerHeight,
     	skipCount = 4,
		gravity = 0.2,
		touched = false,
		mouse = {},
		minDist = 20,
		bounceFactor = 0.6,
		physics_accuracy = 5,
		mouse_influence      = 20, 
		mouse_cut            = 5,
		gravity              = 1200, 
		cloth_height         = 30,
		cloth_width          = 200,
		start_y              = 20,
		spacing              = 7,
		tear_distance        = 60;

canvas.height = H;
canvas.width = W;

document.addEventListener("mousemove", trackPos, false);

// We also need the mouse positions
function trackPos(e) {
	mouse.x = e.pageX;
	mouse.y = e.pageY;
}

// Creating a class for our particles
var Particle = function() {
	this.r = Math.random()* 6;
	//fconsole.log(this.r);
	// Initial position will be out of canvas
	// but we'll set them later
	this.x = -100;
	this.y = -100;
	
	// Lets give each particle a different velocity
	this.vy = -5 + parseInt(Math.random() * 10);
	this.vx = -5 + parseInt(Math.random() * 10);
	
	// A flag to inform if the particle is free to fall or not
	this.isFree = false;
	
	this.a = Math.random();
	
	// Function to draw them
	this.draw = function() {
		ctx.beginPath();
		// Lets add random opacity
		ctx.fillStyle = "rgba(255, 223, 0, " +this.a+")";
		ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
		ctx.fill();
		ctx.closePath();
	};
		
	// Finally a function to set particle's function
	this.setPos = function(x, y) {
		this.x = x;
		this.y = y;
	}
};

// We also need an array where are particles will be
var particles = [];

// Lets add some text on the canvas now
(function drawText() {
	ctx.fillStyle = "black";
	ctx.font = "100px Arial, sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(text, W/3, H/3);
})();

// Now, we need to save the positions of black pixels and then 
// use these positions to draw the particles
(function getPixelPos() {
	// Here, we are using the getImageData function in 
	// which 3 values are returned. The width and height of
	// the image and the pixel data array. The data array is
	// width x height x 4 in size where the 4 depicts 4 values
	// for each pixel i.e. red, green, blue and alpha (RGBA).
	var imageData = ctx.getImageData(0, 0, W, H),
			data = imageData.data;
	
	// We'll now iterate over the data array going through
	// rows and columns
	// Instead of reading each pixel, we can skip over some
	// to increase the performance
	for (var i = 0; i < imageData.height; i += skipCount) {
		for (var j = 0; j < imageData.width; j += skipCount) {
			// The values in the data array rangle from 0 to
			// (height x width x 4) - 1 so we'll use that information
			// to get the color of each pixel
			
			var color = data[(j * imageData.width * 4) + (i * 4) - 1];
			
			// Now if the color is black, we'll do our stuff
			if(color == 255) {
				particles.push(new Particle());
				particles[particles.length - 1].setPos(i, j);
			}
		}
	}
})();

function clear() {
	//alert("clear");
	ctx.clearRect(0, 0, W, H);
}




// Now for a twist, we'll make the particles fall when they 
// are hovered by mouse with realistic physics :) GRAVITY FTW!

// We'll do our animation stuff here
// Lets see if it works or not, it works! Time for some animation
function update1() {
	clear();
	
	for (i = 0; i < particles.length; i++) {
		var p = particles[i];
		
		// For the burning effect, we'll increase the radius
		// of each particles whilst reducing its opacity.
		// As soon as the opacity goes below zero, we'll make the
		// particle reborn, LOVELY!
		p.r += 0.05;
		p.a -= 0.015;
		
		if(p.a < 0) {
			p.r = Math.random() * 6;
			p.a = Math.random();
		}
		
		// Logic for making them fall on hover 
		if(mouse.x > p.x - p.r && 
			 mouse.x < p.x + p.r &&
			 mouse.y > p.y - p.r &&
			 mouse.y < p.y + p.r)
			touched = true;
		
		//console.log(touched); // Working
		// We'll also make the nearby particles fall down
		// so we will need a minimum distance
		// We'll calculate the distance b/w mouse cursor
		// and the particles and then compare it with minDist
		
		if (touched == true) {
			var dist = Math.sqrt((p.x-mouse.x)*(p.x-mouse.x) + (p.y-mouse.y)*(p.y-mouse.y));
			
			if(dist <= minDist) 
				p.isFree = true;
			
			if(p.isFree == true) {
				// Add velocities and gravity
				p.y += p.vy;
				p.x += p.vx;
				
				// Take a moment and pause the codecast. Try hovering
				// particles and they'll fly away because no gravity 
				// is present, but it is still a cool effect ;)
				
				// Now they'll obey the rules of nature
				p.vy += gravity;
				
				// Note that particles go below the floor so we need
				// to make them bouncy and make them rebound as they
				// hit the floor and walls
				if(p.y + p.r > H) {
					p.vy *= -bounceFactor;
					p.y = H - p.r;
					
					// We also need a little friction on the floor
					// otherwise the particles will keep moving like
					// little ants :P
					if (p.vx > 0) 
						p.vx -= 0.1;
					else
						p.vx += 0.1;
				}
				
				// The codecast completes here. Try changing the colors
				// or size of particles and add your own text keywords!
				// Buh-bye :)
				
				// Collision with walls
				if(p.x + p.r > W) {
					p.vx *= -bounceFactor;
					p.x = W - p.r;
				}
				
				if (p.x - p.r < 0) {
					p.vx *= -bounceFactor;
					p.x = p.r;
				}
			}
		}
		
		ctx.globalCompositeOperation = "lighter";
		p.draw();
	}
}

(function animloop(){
	requestAnimFrame(animloop);
	update1();
})();


// for changing the text value
function ChangeText(){
	//alert("changed");
	//p.a=0;
	particles = [];
	toched = true;
	(function animloop(){
		requestAnimFrame(animloop);
		update1();
	})();
	touched=false;
	text=document.getElementById("Textbox").value;
	(function drawText() {
		ctx.fillStyle = "black";
		ctx.font = "100px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(text, W/3, H/3);
	})();
	
	// Now, we need to save the positions of black pixels and then 
	// use these positions to draw the particles
	(function getPixelPos() {
		// Here, we are using the getImageData function in 
		// which 3 values are returned. The width and height of
		// the image and the pixel data array. The data array is
		// width x height x 4 in size where the 4 depicts 4 values
		// for each pixel i.e. red, green, blue and alpha (RGBA).
		var imageData = ctx.getImageData(0, 0, W, W),
				data = imageData.data;
		
		// We'll now iterate over the data array going through
		// rows and columns
		// Instead of reading each pixel, we can skip over some
		// to increase the performance
		for (var i = 0; i < imageData.height; i += skipCount) {
			for (var j = 0; j < imageData.width; j += skipCount) {
				// The values in the data array rangle from 0 to
				// (height x width x 4) - 1 so we'll use that information
				// to get the color of each pixel
				
				var color = data[(j * imageData.width * 4) + (i * 4) - 1];
				
				// Now if the color is black, we'll do our stuff
				if(color == 255) {
					particles.push(new Particle());
					particles[particles.length - 1].setPos(i, j);
				}
			}
		}
	})();


	(function animloop(){
		requestAnimFrame(animloop);
		update();
		update1();
	})();

	//alert(text);
	}


//************************************** tearcloth.js***************************************

/*
Copyright (c) 2013 lonely-pixel.com, Stuffit at codepen.io (http://codepen.io/stuffit)

View this and others at http://lonely-pixel.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

 
// settings

window.onload = function() {
	
	canvas.width = window.innerWidth;
	canvas.style.position='fixed';
	canvas.style.zIndex=1;
	canvas.height = window.innerHeight;

	canvas.onmousedown = function(e) {
		mouse.button = e.which;
		mouse.px = mouse.x;
		mouse.py = mouse.y;
  var rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left,
  mouse.y = e.clientY - rect.top,
		mouse.down = true;
		e.preventDefault();
		(function animloop(){
		requestAnimFrame(animloop);
		update1();
		})();
	particles = [];
	toched = true;
	(function animloop(){
		requestAnimFrame(animloop);
		update1();
		update();
	})();
	touched=false;
	text=document.getElementById("Textbox").value;
	(function drawText() {
		ctx.fillStyle = "black";
		ctx.font = "100px Arial, sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(text, W/3, H/3);
	})();
	
	// Now, we need to save the positions of black pixels and then 
	// use these positions to draw the particles
	(function getPixelPos() {
		// Here, we are using the getImageData function in 
		// which 3 values are returned. The width and height of
		// the image and the pixel data array. The data array is
		// width x height x 4 in size where the 4 depicts 4 values
		// for each pixel i.e. red, green, blue and alpha (RGBA).
		var imageData = ctx.getImageData(0, 0, W, W),
				data = imageData.data;
		
		// We'll now iterate over the data array going through
		// rows and columns
		// Instead of reading each pixel, we can skip over some
		// to increase the performance
		for (var i = 0; i < imageData.height; i += skipCount) {
			for (var j = 0; j < imageData.width; j += skipCount) {
				// The values in the data array rangle from 0 to
				// (height x width x 4) - 1 so we'll use that information
				// to get the color of each pixel
				
				var color = data[(j * imageData.width * 4) + (i * 4) - 1];
				
				// Now if the color is black, we'll do our stuff
				if(color == 255) {
					particles.push(new Particle());
					particles[particles.length - 1].setPos(i, j);
				}
			}
		}
	})();
	
	};
	
	canvas.onmouseup = function(e) {
		mouse.down = false;
		e.preventDefault();
	};

	canvas.onmousemove = function(e) {
		mouse.px = mouse.x;
		mouse.py = mouse.y;
		var rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left,
  mouse.y = e.clientY - rect.top,
		e.preventDefault();
	};

	canvas.oncontextmenu = function(e) {
		e.preventDefault(); 
	};

	boundsx = canvas.width - 1;
	boundsy = canvas.height - 1;

	ctx.strokeStyle = 'rgba(222,222,222,0.6)';
	cloth = new Cloth();
	update();
};

var Point = function(x, y) {

	this.x = x;
	this.y = y;
	this.px = x;
	this.py = y;
	this.vx = 0;
	this.vy = 0;
	this.pin_x = null;
	this.pin_y = null;
	this.constraints = [];
};

Point.prototype.update = function(delta) {

	if (mouse.down) {

		var diff_x = this.x - mouse.x,
			diff_y = this.y - mouse.y,
			dist   = Math.sqrt(diff_x * diff_x + diff_y * diff_y);

		if (mouse.button == 1) {

			if(dist < mouse_influence) {
				this.px = this.x - (mouse.x - mouse.px) * 1.8;
				this.py = this.y - (mouse.y - mouse.py) * 1.8;
			}

		} else if (dist < mouse_cut) this.constraints = [];
	}

	this.add_force(0, gravity);

	delta *= delta;
	nx = this.x + ((this.x - this.px) * .99) + ((this.vx / 2) * delta);
	ny = this.y + ((this.y - this.py) * .99) + ((this.vy / 2) * delta);

	this.px = this.x;
	this.py = this.y;

	this.x = nx;
	this.y = ny;

	this.vy = this.vx = 0
};

Point.prototype.draw = function() {

	if (this.constraints.length <= 0) return;
	
	var i = this.constraints.length;
	while(i--) this.constraints[i].draw();
};

Point.prototype.resolve_constraints = function() {

	if (this.pin_x != null && this.pin_y != null) {
	
		this.x = this.pin_x;
		this.y = this.pin_y;
		return;
	}

	var i = this.constraints.length;
	while(i--) this.constraints[i].resolve();

	this.x > boundsx ? this.x = 2 * boundsx - this.x : 1 > this.x && (this.x = 2 - this.x);
	this.y < 1 ? this.y = 2 - this.y : this.y > boundsy && (this.y = 2 * boundsy - this.y);
};

Point.prototype.attach = function(point) {

	this.constraints.push(
		new Constraint(this, point)
	);
};

Point.prototype.remove_constraint = function(lnk) {

	var i = this.constraints.length;
	while(i--) if(this.constraints[i] == lnk) this.constraints.splice(i, 1);
};

Point.prototype.add_force = function(x, y )  {

	this.vx += x;
	this.vy += y;
};

Point.prototype.pin = function(pinx, piny) {
	this.pin_x = pinx;
	this.pin_y = piny;
};

var Constraint = function(p1, p2) {

	this.p1 = p1;
	this.p2 = p2;
	this.length = spacing;
};

Constraint.prototype.resolve = function() {

	var diff_x = this.p1.x - this.p2.x,
		diff_y = this.p1.y - this.p2.y,
		dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y),
		diff = (this.length - dist) / dist;

	if (dist > tear_distance) this.p1.remove_constraint(this);

	var px = diff_x * diff * 0.5;
	var py = diff_y * diff * 0.5;

	this.p1.x += px;
	this.p1.y += py;
	this.p2.x -= px;
	this.p2.y -= py;
};

Constraint.prototype.draw = function() {

	ctx.moveTo(this.p1.x, this.p1.y);
	ctx.lineTo(this.p2.x, this.p2.y);
};

var Cloth = function() {

	this.points = [];

	var start_x = canvas.width / 2 - cloth_width * spacing / 2;

	for(var y = 0; y <= cloth_height; y++) {

		for(var x = 0; x <= cloth_width; x++) {

			var p = new Point(start_x + x * spacing, start_y + y * spacing);

   x != 0 && p.attach(this.points[this.points.length - 1]);
			y == 0 && p.pin(p.x, p.y);
			y != 0 && p.attach(this.points[x + (y - 1) * (cloth_width + 1)])

			this.points.push(p);
		}
	}
};

Cloth.prototype.update = function() {

	var i = physics_accuracy;

	while(i--) {
		var p = this.points.length;
		while(p--) this.points[p].resolve_constraints();
	}

	i = this.points.length;
	while(i--) this.points[i].update(.016);
};

Cloth.prototype.draw = function() {

	ctx.beginPath();

	var i = cloth.points.length;
	while(i--) cloth.points[i].draw();

	ctx.stroke();
};

function update() {

	//ctx.clearRect(0, 0, canvas.width, canvas.height);

	cloth.update();
	cloth.draw();

	requestAnimFrame(update);
}

