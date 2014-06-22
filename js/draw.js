var DRAW = new DRAW_CLASS();

function DRAW_CLASS(){
	this.PREVIEW_SIZE = {w: 148, h: 100 };
	
	this.draw_grid = function(canvas, gap_x, gap_y){
		if(MAIN.grid == false){
			canvas.clearRect(0, 0, WIDTH, HEIGHT);
			DRAW.draw_background(canvas, WIDTH, HEIGHT);
			return false;
			}
		gap_x = parseInt(gap_x);
		gap_y = parseInt(gap_y);
		if(gap_x<2) gap_x=2;
		if(gap_y<2) gap_y=2;
		for(var i=gap_x; i<WIDTH; i=i+gap_x){
			if(gap_x==0) break;
			if(i%(gap_x*5) == 0)	//main lines
				canvas.strokeStyle = '#808080';
			else
				canvas.strokeStyle = '#dddddd';	
			canvas.beginPath();
			canvas.moveTo(0.5 + i, 0);
			canvas.lineTo(0.5 + i, HEIGHT);
			canvas.stroke();
			}
		for(var i=gap_y; i<HEIGHT; i=i+gap_y){
			if(gap_y==0) break;
			if(i%(gap_y*5) == 0)	//main lines
				canvas.strokeStyle = '#808080';
			else
				canvas.strokeStyle = '#dddddd';
			canvas.beginPath();
			canvas.moveTo(0, 0.5 + i);
			canvas.lineTo(WIDTH, 0.5 + i);
			canvas.stroke();
			}
		};
	this.draw_background = function(canvas, W, H, gap, force){
		if(MAIN.TRANSPARENCY == false && force == undefined){
			canvas.beginPath();
			canvas.rect(0, 0, W, H);
			canvas.fillStyle = "#ffffff";
			canvas.fill();
			return false;
			}
		if(gap == undefined)
			gap = 10;
		var fill = true;
		for(var i=0; i<W; i=i+gap){		
			if(i%(gap*2) == 0)
				fill=true;
			else
				fill=false;
			for(var j=0; j<H; j=j+gap){
				if(fill==true){
					canvas.fillStyle = '#eeeeee';
					canvas.fillRect(i, j, gap, gap);
					fill = false;
					}
				else
					fill = true;				
				}
			}
		};
	//credits to Victor Haydin
	this.toolFiller = function(context, W, H, x, y, color_to, sensitivity){
		var img = context.getImageData(0, 0, W, H);
		var imgData = img.data;
		var k = ((y * (img.width * 4)) + (x * 4));
		var dx = [ 0, -1, +1,  0];
		var dy = [-1,  0,  0, +1];
		var color_from = {
			r: imgData[k+0],
			g: imgData[k+1],
			b: imgData[k+2],
			a: imgData[k+3],
			}
		if(color_from.r == color_to.r && 
		  color_from.g == color_to.g && 
		  color_from.b == color_to.b && 
		  color_from.a == color_to.a) 
			return false;
		var stack = [];
		stack.push(x);
		stack.push(y);
		while (stack.length > 0){
			var curPointY = stack.pop();
			var curPointX = stack.pop();
			for (var i = 0; i < 4; i++){
				var nextPointX = curPointX + dx[i];
				var nextPointY = curPointY + dy[i];
				if (nextPointX < 0 || nextPointY < 0 || nextPointX >= W || nextPointY >= H) 
					continue;
				var k = (nextPointY * W + nextPointX) * 4;
				//check
				if(Math.abs(imgData[k+0] - color_from.r) <= sensitivity &&
				  Math.abs(imgData[k+1] - color_from.g) <= sensitivity &&
				  Math.abs(imgData[k+2] - color_from.b) <= sensitivity &&
				  Math.abs(imgData[k+3] - color_from.a) <= sensitivity){
					//fill pixel
					imgData[k+0] = color_to.r; //r
					imgData[k+1] = color_to.g; //g
					imgData[k+2] = color_to.b; //b
					imgData[k+3] = color_to.a; //a
					stack.push(nextPointX);
					stack.push(nextPointY);
					}
				}
			}
		context.putImageData(img, 0, 0);
		};
	this.tool_magic_wand = function(context, W, H, x, y, sensitivity){
		var img = context.getImageData(0, 0, W, H);
		var imgData = img.data;
		var k = ((y * (img.width * 4)) + (x * 4));
		var dx = [ 0, -1, +1,  0];
		var dy = [-1,  0,  0, +1];
		var color_to = {
			r: 255,
			g: 255,
			b: 255,
			a: 0,
			}
		var color_from = {
			r: imgData[k+0],
			g: imgData[k+1],
			b: imgData[k+2],
			a: imgData[k+3],
			}
		if(color_from.r == color_to.r && 
		  color_from.g == color_to.g && 
		  color_from.b == color_to.b && 
		  color_from.a == color_to.a) 
			return false;
		if(ALPHA < 255 && color_from.a == ALPHA) return false;
		var stack = [];
		stack.push(x);
		stack.push(y);
		while (stack.length > 0){
			var curPointY = stack.pop();
			var curPointX = stack.pop();
			for (var i = 0; i < 4; i++){
				var nextPointX = curPointX + dx[i];
				var nextPointY = curPointY + dy[i];
				if (nextPointX < 0 || nextPointY < 0 || nextPointX >= W || nextPointY >= H) 
					continue;
				var k = (nextPointY * W + nextPointX) * 4;
				//check
				if(Math.abs(imgData[k+0] - color_from.r) <= sensitivity &&
				  Math.abs(imgData[k+1] - color_from.g) <= sensitivity &&
				  Math.abs(imgData[k+2] - color_from.b) <= sensitivity &&
				  Math.abs(imgData[k+3] - color_from.a) <= sensitivity){
					//fill pixel
					if(ALPHA == 255){
						imgData[k+0] = color_to.r; //r
						imgData[k+1] = color_to.g; //g
						imgData[k+2] = color_to.b; //b
						imgData[k+3] = color_to.a; //a
						}
					else
						imgData[k+3] = ALPHA; //a
					
					stack.push(nextPointX);
					stack.push(nextPointY);
					}
				}
			}
		context.putImageData(img, 0, 0);
		};
	this.if_blank = function(canvas){
		var img = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
		var imgData = img.data;
		
		if(MAIN.TRANSPARENCY == false){
			//transparency disabled
			for(var i = 0; i < imgData.length; i += 4){
				if(imgData[i] < 255 || imgData[i+1] < 255 || imgData[i+2] < 255) return false;
				}
			}
		else{
			//transparenc enabled
			for(var i = 0; i < imgData.length; i += 4){
				if(imgData[i+3] == 0) continue; //transparent
				if(imgData[i] < 255 || imgData[i+1] < 255 || imgData[i+2] < 255) return false;
				}
			}
		return true;
		};
	this.trim_info = function(canvas, trim_white, include_white){
		var top = 0;
		var left = 0;
		var bottom = 0;
		var right = 0;
		var img = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
		var imgData = img.data;
		//check top
		main1:
		for(var y = 0; y < img.height; y++){
			for(var x = 0; x < img.width; x++){
				var k = ((y * (img.width * 4)) + (x * 4));
				if(imgData[k+3] == 0) continue; //transparent 
				if(include_white !== true && imgData[k] == 255 && imgData[k+1] == 255 && imgData[k+2] == 255) continue; //white
				break main1;
				}
			top++;
			}
		//check left
		main2:
	      	for(var x = 0; x < img.width; x++){
			for(var y = 0; y < img.height; y++){
				var k = ((y * (img.width * 4)) + (x * 4));
				if(imgData[k+3] == 0) continue; //transparent 
				if(include_white !== true && imgData[k] == 255 && imgData[k+1] == 255 && imgData[k+2] == 255) continue; //white
				break main2;
				}
			left++;
			}
		//check bottom
		main3:
		for(var y = img.height-1; y >= 0; y--){
			for(var x = img.width-1; x >= 0; x--){
				var k = ((y * (img.width * 4)) + (x * 4));
				if(imgData[k+3] == 0) continue; //transparent 
				if(include_white !== true && imgData[k] == 255 && imgData[k+1] == 255 && imgData[k+2] == 255) continue; //white
				break main3;
				}
			bottom++;
			}
		//check right
		main4:
		for(var x = img.width-1; x >= 0; x--){
			for(var y = img.height-1; y >= 0; y--){
				var k = ((y * (img.width * 4)) + (x * 4));
				if(imgData[k+3] == 0) continue; //transparent 
				if(include_white !== true && imgData[k] == 255 && imgData[k+1] == 255 && imgData[k+2] == 255) continue; //white
				break main4;
				}
			right++;
			}
		return {
			top: top,
			left: left,
			bottom: bottom,
			right: right,
			};
		};
	this.trim = function(layer, no_resize, include_white){
		var all_top = HEIGHT;
		var all_left = WIDTH;
		var all_bottom = HEIGHT;
		var all_right = WIDTH;
		for(var i in LAYERS){
			if(layer != undefined && LAYERS[i].name != layer) continue;	
			
			var top = 0;
			var left = 0;
			var bottom = 0;
			var right = 0;
			var img = document.getElementById(LAYERS[i].name).getContext("2d").getImageData(0, 0, WIDTH, HEIGHT);
			var imgData = img.data;
			//check top
			main1:
			for(var y = 0; y < img.height; y++){
				for(var x = 0; x < img.width; x++){
					var k = ((y * (img.width * 4)) + (x * 4));
					if(imgData[k+3] == 0) continue; //transparent 
					if(include_white !== true && imgData[k] == 255 && imgData[k+1] == 255 && imgData[k+2] == 255) continue; //white
					break main1;
					}
				top++;
				}
			//check left
			main2:
		      for(var x = 0; x < img.width; x++){
				for(var y = 0; y < img.height; y++){
					var k = ((y * (img.width * 4)) + (x * 4));
					if(imgData[k+3] == 0) continue; //transparent 
					if(include_white !== true && imgData[k] == 255 && imgData[k+1] == 255 && imgData[k+2] == 255) continue; //white
					break main2;
					}
				left++;
				}
			//check bottom
			main3:
			for(var y = img.height-1; y >= 0; y--){
				for(var x = img.width-1; x >= 0; x--){
					var k = ((y * (img.width * 4)) + (x * 4));
					if(imgData[k+3] == 0) continue; //transparent 
					if(include_white !== true && imgData[k] == 255 && imgData[k+1] == 255 && imgData[k+2] == 255) continue; //white
					break main3;
					}
				bottom++;
				}
			//check right
			main4:
			for(var x = img.width-1; x >= 0; x--){
				for(var y = img.height-1; y >= 0; y--){
					var k = ((y * (img.width * 4)) + (x * 4));
					if(imgData[k+3] == 0) continue; //transparent 
					if(include_white !== true && imgData[k] == 255 && imgData[k+1] == 255 && imgData[k+2] == 255) continue; //white
					break main4;
					}
				right++;
				}
			all_top = Math.min(all_top, top);
			all_left = Math.min(all_left, left);
			all_bottom = Math.min(all_bottom, bottom);
			all_right = Math.min(all_right, right);
			}
		//move to top-left corner
		for(var i in LAYERS){
			if(layer != undefined && LAYERS[i].name != layer) continue;	
			
			tmp_data = document.getElementById(LAYERS[i].name).getContext("2d").getImageData(0, 0, WIDTH, HEIGHT);
			document.getElementById(LAYERS[i].name).getContext("2d").clearRect(0, 0, WIDTH, HEIGHT);
			document.getElementById(LAYERS[i].name).getContext("2d").putImageData(tmp_data, -all_left, -all_top);
			var canvas_name = LAYERS[i].name;
			}
		//resize
		if(no_resize != undefined) return false;
		if(layer != undefined){
			var W = round(WIDTH - all_left - all_right);
			var H = round(HEIGHT - all_top - all_bottom);
			
			var imageData = document.getElementById(layer).getContext("2d").getImageData(0, 0, W, H);
			document.getElementById(layer).width = W;
			document.getElementById(layer).height = H;
			document.getElementById(layer).getContext("2d").clearRect(0, 0, W, H);
			document.getElementById(layer).getContext("2d").putImageData(imageData, 0, 0);
			
			return {
				top: all_top,
				left: all_left,
				bottom: all_bottom,
				right: all_right,
				};
			}
		else{
			WIDTH = WIDTH - all_left - all_right;
			HEIGHT = HEIGHT - all_top - all_bottom;
			if(WIDTH<1) WIDTH = 1;
			if(HEIGHT<1) HEIGHT = 1;
			RATIO = WIDTH/HEIGHT;
			LAYER.set_canvas_size();
			}
		LAYER.update_info_block();
		};
	this.effect_bw = function(context, W, H, level){
		var img = context.getImageData(0, 0, W, H);
		var imgData = img.data;
		var grey, c;
		for(var i = 0; i < imgData.length; i += 4){		
			if(imgData[i+3] == 0) continue;	//transparent
			grey = round(0.2126 * imgData[i] + 0.7152 * imgData[i+1] + 0.0722 * imgData[i+2]);
			if(grey <= level)
				c = 0;
			else
				c = 255;
			imgData[i] = c;
			imgData[i+1] = c;
			imgData[i+2] = c;
			}
		context.putImageData(img, 0, 0);	
		};
	this.decrease_colors = function(context, W, H, colors, dithering, greyscale){
		var img = context.getImageData(0, 0, W, H);
		var imgData = img.data;
		
		//collect top colors
		var colors_top = [];
		for(var i = 0; i < imgData.length; i += 40){	//check pixel and skip 10.
			if(imgData[i+3] == 0) continue;	//transparent
			var key = imgData[i]+"."+imgData[i+1]+"."+imgData[i+2];
			
			if(colors_top[key] == undefined)
				colors_top[key] = [1, imgData[i], imgData[i+1], imgData[i+2]];
			else
				colors_top[key][0]++;
			}
		
		//sort
		colors_top.sort(function(a,b) { return parseFloat(b[0]) - parseFloat(a[0]); } );
		var colors_top_sort = [];
		for (var i in colors_top)
			colors_top_sort.push(colors_top[i]);
		colors_top_sort.sort(function(a, b) {return b[0] - a[0]});
		colors_top = colors_top_sort;
		
		if(colors_top.length > 256){	
			var last = colors_top[0];
			for(var i=1; i<colors_top.length; i++){
				var diffR = colors_top[i][1] - last[1];
				var diffG = colors_top[i][2] - last[2];
				var diffB = colors_top[i][3] - last[3];
				diff = Math.sqrt(diffR*diffR + diffG*diffG + diffB*diffB);

				if(diff > 100)
					last = colors_top[i]; //save last good
				else{
					//to close, remove it
					colors_top.splice(i, 1); i--;
					}
				}
			if(colors_top.length < 100){
				//oops, we deleted too much ...
				colors_top = colors_top_sort;
				colors_top_sort.splice(256);
				}
			colors_top_sort.splice(512);
			}
		colors_top_sort = [];	
		
		var palette = [];
		var min = 0;
		var index;
		var top_color_n;
		for(var i in colors_top){
			if(colors_top[i][0] > min){
				min = colors_top[0];
				index = i;
				}
			}
		//add main color
		palette.push([colors_top[index][1], colors_top[index][2], colors_top[index][3]]);
		top_color_n = colors_top[index][0];
		
		//increase pallete - use only different colors
		for(var c=1; c<colors; c++){
			var diff_all=0;
			var max_all = 0;
			var index_all;
			//reset
			for(var i in colors_top)
				colors_top[i][4] = [];
			for(var p in palette){
				var diff;
				var max = 0;
				var index;
				var diff_tmp = [];
				for(var i in colors_top){
					var diffR = colors_top[i][1] - palette[p][0];
					var diffG = colors_top[i][2] - palette[p][1];
					var diffB = colors_top[i][3] - palette[p][2];
					diff = Math.sqrt(diffR*diffR + diffG*diffG + diffB*diffB); //max 441
					//density fix
					//diff *= colors_top[i][0];// * 441 / top_color_n;
					colors_top[i][4].push(diff);
					}
				}
			//find biggest minimum
			var index=0;
			var max = 0;
			for(var i in colors_top){
				var min = 999999;
				for(var k in colors_top[i][4]){
					if(colors_top[i][4][k] < min)
						min = colors_top[i][4][k];
					}
				if(min > max){
					index = i;
					max = min;
					}
				}
			palette.push([colors_top[index][1], colors_top[index][2], colors_top[index][3]]);
			}

		//change
		for(var i = 0; i < imgData.length; i += 4){
			if(imgData[i+3] == 0) continue;	//transparent
			var mid = round(imgData[i] + imgData[i+1] + imgData[i+2])/3;
			if(dithering == true){
				//find first close color
				var index1 = 0;
				var min1 = 256*3;
				var diff1;
				for(var j=0; j<palette.length; j++){
					var diff = 0;
					diff += Math.abs(palette[j][0] - imgData[i]);
					diff += Math.abs(palette[j][1] - imgData[i+1]);
					diff += Math.abs(palette[j][2] - imgData[i+2]);
					if(diff < min1){
						min1 = diff;
						index1 = j;
						diff1 = diff;
						}
					}
				//find second close color
				var index2 = 0;
				var min2 = 256*3;
				var diff2;
				for(var j=0; j<palette.length; j++){
					if(j == index1) continue; //we already have this
					var diff = 0;
					diff += Math.abs(palette[j][0] - imgData[i]);
					diff += Math.abs(palette[j][1] - imgData[i+1]);
					diff += Math.abs(palette[j][2] - imgData[i+2]);
					if(diff < min2){
						min2 = diff;
						index2 = j;
						diff2 = diff;
						}
					}
				var c;
				if(diff1 == 0 || diff1/diff2 < 0.3)
					c = palette[index1];	//exact color match
				else{
					//we not sure here ... randomize to get better overall quality
					var rand = HELPER.getRandomInt(-diff1, diff2);
					if(rand < 0)
						c = palette[index2];
					else
						c = palette[index1];
					}
				imgData[i] = c[0];
				imgData[i+1] = c[1];
				imgData[i+2] = c[2];
				}
			else{
				var index = 0;
				var min = 256*3;
				for(var j=0; j<palette.length; j++){
					var diff = 0;
					diff += Math.abs(palette[j][0] - imgData[i]);
					diff += Math.abs(palette[j][1] - imgData[i+1]);
					diff += Math.abs(palette[j][2] - imgData[i+2]);
					if(diff < min){
						min = diff;
						index = j;
						}
					}
				imgData[i] = palette[index][0];
				imgData[i+1] = palette[index][1];
				imgData[i+2] = palette[index][2];
				}
			if(greyscale == true){
				var mid = round(0.2126 * imgData[i] + 0.7152 * imgData[i+1] + 0.0722 * imgData[i+2]);
				imgData[i] = mid;
				imgData[i+1] = mid;
				imgData[i+2] = mid;
				}
			}
		context.putImageData(img, 0, 0);
		};
	//converts greyscale images to coloured
	this.colorize = function(context, W, H, rand_power, max_gap, dither, manual_colors){
		var img = context.getImageData(0, 0, W, H);
		
		if(manual_colors == undefined || manual_colors === true){
			var colors = [];
			for(var x=0; x < 3; x++){
				colors[x] = [];
				var pre = HELPER.getRandomInt(-1 * rand_power, rand_power);
				for(var i = 0; i <= 255; i++){
					colors[x][i] = HELPER.getRandomInt(pre - rand_power, pre + rand_power);
					
					if(colors[x][i] < -1*max_gap)	colors[x][i] += 10;
					else if(colors[x][i] > max_gap)	colors[x][i] -= 10;
					
					pre = colors[x][i];
					}
				}
			if(manual_colors === true)
				return colors;
			}
		else
			var colors = manual_colors;
		
		//colorize
		var imgData = img.data;
		for(var i = 0; i < imgData.length; i += 4){
			if(imgData[i+3] == 0) continue;	//transparent
			if(dither == true){
				var diff = Math.abs(colors[0][imgData[x]]) + Math.abs(colors[0][imgData[x]]) + Math.abs(colors[0][imgData[x]]);
				diff = diff / 3;
				}
			for(var c = 0; c < 3; c++){
				var x = i + c;
				if(dither == false)
					imgData[x] += colors[c][imgData[x]];
				else{
					if(diff < rand_power*6)
						imgData[x] += colors[c][imgData[x]];
					else{
						//big difference here - randomize
						var rand = HELPER.getRandomInt(Math.min(0, colors[c][imgData[x]]), Math.max(0, colors[c][imgData[x]]));
						imgData[x] += rand;
						}
					}
				if(imgData[x] > 255) imgData[x] = 255;
				if(imgData[x] < 0) imgData[x] = 0;
				}
			}
		context.putImageData(img, 0, 0);
		return false;
		};
	//fixing white and black color balance
	this.auto_adjust = function(context, W, H){
		//settings
		var white = 240;	//white color min
		var black = 30;		//black color max
		var target_white = 1; 	//how much % white colors should take
		var target_black = 0.5;	//how much % black colors should take
		var modify = 1.1;	//color modify strength
		
		document.body.style.cursor = "wait";	
		var img = context.getImageData(0, 0, W, H);
		var imgData = img.data;
		var n = 0;	//pixels count without transparent
		
		//make sure we have white
		var n_valid = 0;
		for(var i = 0; i < imgData.length; i += 4){
	      		if(imgData[i+3] == 0) continue;	//transparent
	      		if((imgData[i] + imgData[i+1] + imgData[i+2]) / 3 > white) n_valid++;
	        	n++;
			}
		target = target_white;
		var n_fix_white = 0;
		var done = false;
		for(var j=0; j < 30; j++){
			if(n_valid * 100 / n >= target) done = true;
			if(done == true) break;
			n_fix_white++;
			
			//adjust
			for(var i = 0; i < imgData.length; i += 4){
				if(imgData[i+3] == 0) continue;	//transparent
				for(var c = 0; c < 3; c++){
					var x = i + c;
					if(imgData[x] < 10) continue;
					//increase white
					imgData[x] *= modify;
					imgData[x] = round(imgData[x]);
					if(imgData[x] > 255) imgData[x] = 255;
					}
				}
			
			//recheck
			n_valid = 0;
			for(var i = 0; i < imgData.length; i += 4){
				if(imgData[i+3] == 0) continue;	//transparent
		      		if((imgData[i] + imgData[i+1] + imgData[i+2]) / 3 > white) n_valid++;
				}
			}
			
		//make sure we have black
		n_valid = 0;
		for(var i = 0; i < imgData.length; i += 4){
			if(imgData[i+3] == 0) continue;	//transparent
	      		if((imgData[i] + imgData[i+1] + imgData[i+2]) / 3 < black) n_valid++;		
			}
		target = target_black;
		var n_fix_black = 0;
		var done = false;
		for(var j=0; j < 30; j++){
			if(n_valid * 100 / n >= target) done = true;
			if(done == true) break;
			n_fix_black++;
			
			//adjust
			for(var i = 0; i < imgData.length; i += 4){
				if(imgData[i+3] == 0) continue;	//transparent
				for(var c = 0; c < 3; c++){
					var x = i + c;
					if(imgData[x] > 240) continue;
					//increase black
					imgData[x] -= (255-imgData[x]) * modify - (255-imgData[x]);
					imgData[x] = round(imgData[x]);
					}
				}
			
			//recheck
			n_valid = 0;
			for(var i = 0; i < imgData.length; i += 4){
				if(imgData[i+3] == 0) continue;	//transparent
		      		if((imgData[i] + imgData[i+1] + imgData[i+2]) / 3 < black) n_valid++;
				}
			}
			
		//save	
		context.putImageData(img, 0, 0);
		document.body.style.cursor = "auto";
		//log('Iterations: brighten='+n_fix_white+", darken="+n_fix_black);
		};

	this.zoom = function(recalc, scroll){
		if(recalc != undefined){
			//zoom-in or zoom-out
			if(recalc == 1 || recalc == -1){
				var step = 100;
				if(ZOOM <= 100 && recalc < 0)
					step = 10;
				if(ZOOM <100 && recalc > 0)
					step = 10;
				if(recalc*step + ZOOM > 0){
					ZOOM = ZOOM + recalc*step;
					if(ZOOM > 100 && ZOOM < 200)
						ZOOM = 100;
					}
				}
			//zoom using exact value
			else
				ZOOM = parseInt(recalc);
			CON.calc_preview_auto();
			}
		document.getElementById("zoom_nr").innerHTML = ZOOM;
		document.getElementById("zoom_range").value = ZOOM;

		//change scale and repaint
		document.getElementById('canvas_back').style.width = round(WIDTH * ZOOM / 100)+"px";
		document.getElementById('canvas_back').style.height = round(HEIGHT * ZOOM / 100)+"px";
		for(var i in LAYERS){
			document.getElementById(LAYERS[i].name).style.width = round(WIDTH * ZOOM / 100)+"px";
			document.getElementById(LAYERS[i].name).style.height = round(HEIGHT * ZOOM / 100)+"px";
			}
		document.getElementById('canvas_front').style.width = round(WIDTH * ZOOM / 100)+"px";
		document.getElementById('canvas_front').style.height = round(HEIGHT * ZOOM / 100)+"px";

		//check main resize corners
		if(ZOOM != 100){
			document.getElementById('resize-w').style.display = "none";
			document.getElementById('resize-h').style.display = "none";
			document.getElementById('resize-wh').style.display = "none";
			}
		else{
			document.getElementById('resize-w').style.display = "block";
			document.getElementById('resize-h').style.display = "block";
			document.getElementById('resize-wh').style.display = "block";
			}

		if(scroll != undefined)
			CON.scroll_window();
		DRAW.redraw_preview();
		return true;
		};
	this.redraw_preview = function(){
		canvas_preview.beginPath();
		canvas_preview.rect(0, 0, DRAW.PREVIEW_SIZE.w, DRAW.PREVIEW_SIZE.h);
		canvas_preview.fillStyle = "#ffffff";
		canvas_preview.fill();
		DRAW.draw_background(canvas_preview, DRAW.PREVIEW_SIZE.w, DRAW.PREVIEW_SIZE.h, 5);
		
		//redraw preview area
		canvas_preview.save();
		canvas_preview.scale(DRAW.PREVIEW_SIZE.w/WIDTH, DRAW.PREVIEW_SIZE.h/HEIGHT);
		for(var i in LAYERS){
			if(LAYERS[i].visible == false) continue;
			canvas_preview.drawImage(document.getElementById(LAYERS[i].name), 0, 0, WIDTH, HEIGHT);
			}
		canvas_preview.restore();
		
		//active zone
		z_x = CON.ZOOM_X;
		z_y = CON.ZOOM_Y;
		if(z_x > DRAW.PREVIEW_SIZE.w - CON.mini_rect_data.w) 
			z_x = DRAW.PREVIEW_SIZE.w - CON.mini_rect_data.w;
		if(z_y > DRAW.PREVIEW_SIZE.h - CON.mini_rect_data.h) 
			z_y = DRAW.PREVIEW_SIZE.h - CON.mini_rect_data.h;
		
		canvas_preview.lineWidth = 1;
		canvas_preview.beginPath();
		canvas_preview.rect(round(z_x) + 0.5, round(z_y) + 0.5, CON.mini_rect_data.w, CON.mini_rect_data.h);
		canvas_preview.fillStyle = "rgba(0, 0, 0, 0.2)";
		canvas_preview.strokeStyle = "#393939";
		canvas_preview.fill();
		canvas_preview.stroke();
		return true;
		};
	this.draw_arrow = function(context, fromx, fromy, tox, toy, headlen){
		if(headlen == undefined)
			headlen = 10;	// length of head in pixels
		var dx = tox-fromx;
		var dy = toy-fromy;
		var angle = Math.atan2(dy,dx);
		context.beginPath();
		context.moveTo(fromx, fromy);
		context.lineTo(tox, toy);
		context.stroke();
		context.beginPath();
		context.moveTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
		context.lineTo(tox, toy);
		context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
		context.stroke();
		};
	//hermite resample - classic "rings.gif" 1000x1000 resize to 200x200 record -  0.040
	this.resample_hermite = function(canvas, W, H, W2, H2){
		var time1 = Date.now();
		var img = canvas.getContext("2d").getImageData(0, 0, W, H);
		var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
		var data = img.data;
		var data2 = img2.data;
		var ratio_w = W / W2;
		var ratio_h = H / H2;
		var ratio_w_half = Math.ceil(ratio_w/2);
		var ratio_h_half = Math.ceil(ratio_h/2);
		
		for(var j = 0; j < H2; j++){
			for(var i = 0; i < W2; i++){
				var x2 = (i + j*W2) * 4;
				var weight = 0;
				var weights = 0;
				var weights_alpha = 0;
				var gx_r = gx_g = gx_b = gx_a = 0;
				var center_y = (j + 0.5) * ratio_h;
				for(var yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
					var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
					var center_x = (i + 0.5) * ratio_w;
					var w0 = dy*dy //pre-calc part of w
					for(var xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
						var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
						var w = Math.sqrt(w0 + dx*dx);
						if(w >= -1 && w <= 1){
							//hermite filter
							weight = 2 * w*w*w - 3*w*w + 1;
							if(weight > 0){
								dx = 4*(xx + yy*W);
								//alpha
								gx_a += weight * data[dx + 3];
								weights_alpha += weight;
								//colors
								if(data[dx + 3] < 255)
									weight = weight * data[dx + 3] / 250;
								gx_r += weight * data[dx];
								gx_g += weight * data[dx + 1];
								gx_b += weight * data[dx + 2];
								weights += weight;
								}
							}
						}		
					}
				data2[x2]     = gx_r / weights;
				data2[x2 + 1] = gx_g / weights;
				data2[x2 + 2] = gx_b / weights;
				data2[x2 + 3] = gx_a / weights_alpha;
				}
			}
		console.log("hermite = "+(Math.round(Date.now() - time1)/1000)+" s");
		canvas.getContext("2d").clearRect(0, 0, Math.max(W, W2), Math.max(H, H2));
		canvas.getContext("2d").putImageData(img2, 0, 0);
		};
	this.resample_hermite_threads = function(canvas, W, H, W2, H2){
		var time1 = Date.now();
		var img = canvas.getContext("2d").getImageData(0, 0, W, H);
		var img2 = canvas.getContext("2d").getImageData(0, 0, W2, H2);
		var data2 = img2.data;
		var cores = 8;
		var cpu_in_use = 0;
		var progress = document.getElementById('uploadprogress');
		progress.style.display='block';
		progress.value = progress.innerHTML = 0;
		canvas.getContext("2d").clearRect(0, 0, W, H);

		for(var c = 0; c < cores; c++){
			cpu_in_use++;
			var my_worker = new Worker("libs/worker-hermite.js");
			my_worker.onmessage = function(event){		//log(event.data);return false;
				cpu_in_use--;
			 	var complete = ((cores - cpu_in_use) / cores * 100 | 0);
				progress.value = progress.innerHTML = complete;
				var offset = event.data.offset;	//log( event.data.data.length);
				
				for(var i = 0; i < event.data.data.length; i += 4){
					var x = offset + i;	//log([ x,   event.data.data[i], event.data.data[i+1],event.data.data[i+2],event.data.data[i+3],           ]); return false;
					data2[x]     = event.data.data[i];
					data2[x + 1] = event.data.data[i+1];
					data2[x + 2] = event.data.data[i+2];
					data2[x + 3] = event.data.data[i+3];
					}
				
				//finish
				if(cpu_in_use <= 0){
					console.log("hermite "+cores+" cores = "+(Math.round(Date.now() - time1)/1000)+" s");	
					canvas.getContext("2d").clearRect(0, 0, W, H);
					canvas.getContext("2d").putImageData(img2, 0, 0);
					
					progress.style.display='none';
					if(MENU.last_menu != 'layer_resize')
						DRAW.trim();
					DRAW.zoom();
					}
				};
			my_worker.postMessage([img, W, H, W2, H2, c, cores]);
			}
		};
	}
