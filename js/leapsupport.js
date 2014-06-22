function leapToScene( leapPos, tFrame ){
    var iBox = tFrame.interactionBox;

    var left = iBox.center[0] - iBox.size[0]/2;
    var top = iBox.center[1] + iBox.size[1]/2;

    var x = leapPos[0] - left;
    var y = leapPos[1] - top;

    x /= iBox.size[0];
    y /= iBox.size[1];

    x *= WIDTH;
    y *= HEIGHT;

    return [ x , -y ];

}

var lineGesture = undefined;

// var test=100;
// var global=0;
// var third = 0;
//recalc represents the bar to move L-> R
//if(recalc != undefined){
		//zoom-in or zoom-out
Leap.loop({enableGestures: true}, function(frame) {
	zoomval = ZOOM;

	if(zoomval == undefined) {
		zoomval = 100;
	}

	if (frame != null) {
		var gestures = frame.gestures;
		var pointables = frame.pointables;
		// console.log (gestures.length );

		if(lineGesture != undefined) {
			for(var i=0;i<pointables.length;i++) {
				var pointable = pointables[i];

				if(pointable.id == lineGesture.fingerId) {
					var pos = leapToScene(pointable.tipPosition, frame);

					var parameters = {
						x: pos[0],
						y: pos[1], 
						click_x: lineGesture.clickX,
						click_y: lineGesture.clickY,
						last_x: lineGesture.lastX,
						last_y: lineGesture.lastY,
						valid: true,
						click_valid: true,
						abs_x: pos[0] + 100,
						abs_y: pos[1] + 100, 
					};

					TOOLS[ACTION]("move", parameters);
					TOOLS[ACTION]("drag", parameters);

					lineGesture.lastX = pos[0];
					lineGesture.lastY = pos[1];

					break;
				}
			}
		}

		for(var i=0;i<gestures.length;i++) {
			var gesture = gestures[i];

			var gestureType = gesture.type;
			// console.log (gestureType);

			if (gestureType == "circle") {
				// var pos = leapToScene( gestures[0].center, frame );
				var direction;

				if( gesture.normal[2]  <= 0 ){
					direction = 1;
				}
				else {
					direction = -1;
				}

		  		zoomval += gesture.progress * direction;//*100;	
			}
			else if(gestureType == "swipe") {
				// console.log(gesture.direction);

				deltaX = gesture.direction[0] * DRAW.PREVIEW_SIZE.w * 0.05;
				deltaY = gesture.direction[1] * DRAW.PREVIEW_SIZE.h * 0.05;

				CON.ZOOM_X = Math.max(0, Math.min(CON.ZOOM_X + deltaX, DRAW.PREVIEW_SIZE.w));
		  		CON.ZOOM_Y = Math.max(0, Math.min(CON.ZOOM_Y - deltaY, DRAW.PREVIEW_SIZE.h)); 

		  		CON.scroll_window();
			}
			else if(gestureType == "keyTap") {
				var pos = leapToScene(gesture.position, frame);

				if(lineGesture == undefined) {
					lineGesture = {
						clickX: pos[0],
						clickY: pos[1],
						lastX: pos[0],
						lastY: pos[1],
						fingerId: gesture.pointableIds[0]
					};

					TOOLS[ACTION]("click", {
						x: pos[0],
						y: pos[1], 
						click_x: pos[0],
						click_y: pos[1],
						last_x: pos[0],
						last_y: pos[1],
						valid: true,
						click_valid: true,
						abs_x: pos[0],
						abs_y: pos[1], 
					});
				}
				else {
					var parameters = {
						x: pos[0],
						y: pos[1], 
						click_x: lineGesture.clickX,
						click_y: lineGesture.clickY,
						last_x: lineGesture.lastX,
						last_y: lineGesture.lastY,
						valid: true,
						click_valid: true,
						abs_x: pos[0] + 100,
						abs_y: pos[1] + 100, 
					};

					TOOLS[ACTION]("move", parameters);
					TOOLS[ACTION]("drag", parameters);
					TOOLS[ACTION]("release", parameters);

					lineGesture = undefined;
				}
			}
		}

  		// console.log ('i wanna se' + zoomval);
  		// test = zoomval;
	}
		
// 	if (gestures.length > 0 && gestures[0].type=="circle") {
// 		zoomval = gestures[0].progress*100;	
// //		console.log ('state is ' + gestures[0].state);
// 		var radius = gestures[0].radius;
// 		var clockwise = false;

//   		if( gestures[0].normal[2]  <= 0 ){
// //    	console.log ("its rtue");
//   			ZOOM = zoomval;
//     		clockwise = true;
// 		// console.log ('tj aj test' + test);

// 		}
// 		global = test;
// 	}
//      console.log ('dat roll' + global);
	// third = global;
  //console.log ('lemme seet' + third);

	//	console.log ('tracking ZOOM' + ZOOM);

//console.log ('testing to check value of zoomval' + zoomval);
	// console.log ("zoom val got here" + zoomval);

	// ZOOM = zoomval;
	// ZOOM = test;

	DRAW.zoom(""+zoomval);
});