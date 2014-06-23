//converts leap coordinates into canvas coordinates
function leapToScene( leapPos, tFrame ){
	
	//getting the interaction box 
    var iBox = tFrame.interactionBox;

    //gets top and left side of interaction area coordinates
    var left = iBox.center[0] - iBox.size[0]/2;
    var top = iBox.center[1] + iBox.size[1]/2;

    //gets us the leap position
    var x = leapPos[0] - left;
    var y = leapPos[1] - top;

    //scaling the interaction area
    x /= iBox.size[0];
    y /= iBox.size[1];
    x *= WIDTH;
    y *= HEIGHT;

    //return position with a negative y since canvas coordinate system
    // goes down instead of up
    return [ x , -y ];

}

var drawingGesture = undefined;

//connect up and start the leapmotion
Leap.loop({enableGestures: true}, function(frame) {
	
	//set the level of local zoomval to be ZOOM variable
	zoomval = ZOOM;

	//setting default zoom value to 100
	if(zoomval == undefined) {
		zoomval = 100;
	}

	if (frame != null) {
		//get the gestures and pointables
		var gestures = frame.gestures;
		var pointables = frame.pointables;

		//runs through the pointables
		if(drawingGesture != undefined) {
			
			for(var i=0;i<pointables.length;i++) {
				
				var pointable = pointables[i];

				//same detected finger
				if(pointable.id == drawingGesture.fingerId) {
					
					//gets the canvas coordinates of the pointable
					var kPos = leapToScene(pointable.tipPosition, frame);

					//sets the parameters in order to move and drag
					var gestureParameters = {
						x: kPos[0],
						y: kPos[1], 
						click_x: drawingGesture.clickX,
						click_y: drawingGesture.clickY,
						last_x: drawingGesture.lastX,
						last_y: drawingGesture.lastY,
						valid: true,
						click_valid: true,
						abs_x: kPos[0] + 100,
						abs_y: kPos[1] + 100, 
					};

					TOOLS[ACTION]("move", gestureParameters);
					TOOLS[ACTION]("drag", gestureParameters);

					drawingGesture.lastX = kPos[0];
					drawingGesture.lastY = kPos[1];

					break;
				}
			}
		}

		//go through all the gestures
		for(var i=0;i<gestures.length;i++) {
			var gesture = gestures[i];

			//determine gesture type
			var gestureType = gesture.type;

			//if circle gesture is detected
			if (gestureType == "circle") {
				
				var direction;

				//determine whether zoom in or zoom out gesture
				//a zoom in gesture
				if( gesture.normal[2]  <= 0 ){ 
					direction = 1;
				}
				
				//a zoom out gesture
				else { 
					direction = -1;
				}

				//set the zoom value based on the progress of the circle gesture and direction
		  		zoomval += gesture.progress * direction;	
			}

			//if a swipe gesture is detected
			else if(gestureType == "swipe") {
				console.log ('detect a wsipe');
				//determines x and y values
				xval = gesture.direction[0] * DRAW.PREVIEW_SIZE.w * 0.05;
				yval = gesture.direction[1] * DRAW.PREVIEW_SIZE.h * 0.05;

				//sets values for the Zoom x and Zoom y variables
				CON.ZOOM_X = Math.max(0, Math.min(CON.ZOOM_X + xval, DRAW.PREVIEW_SIZE.w));
		  		
		  		//flip the yvalue
		  		CON.ZOOM_Y = Math.max(0, Math.min(CON.ZOOM_Y - yval, DRAW.PREVIEW_SIZE.h)); 

		  		//calls the scroll window method
		  		CON.scroll_window();
			}
			
			//if a key tap gesture is detected
			else if(gestureType == "keyTap") {
				console.log('keytap');
				//gets the canvas coordinates based on the gesture's position
				var kPos = leapToScene(gesture.position, frame);

				//if the drawing gesture is undefined set values for it based on 
				//values from keytap gesture
				if(drawingGesture == undefined) {
					drawingGesture = {
						clickX: kPos[0],
						clickY: kPos[1],
						lastX: kPos[0],
						lastY: kPos[1],
						fingerId: gesture.pointableIds[0]
					};

					//click 
					TOOLS[ACTION]("click", {
						x: kPos[0],
						y: kPos[1], 
						click_x: kPos[0],
						click_y: kPos[1],
						last_x: kPos[0],
						last_y: kPos[1],
						valid: true,
						click_valid: true,
						abs_x: kPos[0],
						abs_y: kPos[1], 
					});
				}

				else {
					//set gesture parameters
					var gestureParameters = {
						x: kPos[0],
						y: kPos[1], 
						click_x: drawingGesture.clickX,
						click_y: drawingGesture.clickY,
						last_x: drawingGesture.lastX,
						last_y: drawingGesture.lastY,
						valid: true,
						click_valid: true,
						abs_x: kPos[0] + 100,
						abs_y: kPos[1] + 100, 
					};

					//perform move, drag and release 
					TOOLS[ACTION]("move", gestureParameters);
					TOOLS[ACTION]("drag", gestureParameters);
					TOOLS[ACTION]("release", gestureParameters);

					//set the drawing gesture as undefined to handle next input
					drawingGesture = undefined;
				}
			}
		}

	}
	//calls the zoom function 	
	DRAW.zoom(""+zoomval);
});