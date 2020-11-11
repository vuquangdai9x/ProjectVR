var timeInput;
var timeInputSlider;
var scene;
var time_scenario;

window.onload = function(){
	timeInput = document.getElementById("InputTime");
	timeInputSlider = document.getElementById("InputTimeSlider");
	scene = document.querySelector('a-scene');
	readJSONFile(document.getElementById("scenario-file").innerHTML, function(text){
		time_scenario = JSON.parse(text);
		console.log(time_scenario);
	});
}

function readJSONFile(file, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.overrideMimeType("application/json");
	rawFile.open("GET", file, true);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4 && rawFile.status == "200") {
			callback(rawFile.responseText);
		}
	}
	rawFile.send(null);
}

function lerpColor(a, b, amount) { 
	var ah = parseInt(a.replace(/#/g, ''), 16),
		ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
		bh = parseInt(b.replace(/#/g, ''), 16),
		br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
		rr = ar + amount * (br - ar),
		rg = ag + amount * (bg - ag),
		rb = ab + amount * (bb - ab);
	return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

function setTime(time, updateScene = true){
	if (!isNaN(time))
	{
		var hour = parseInt(parseInt(time) / 1000);
		var minute = parseInt(parseInt(time-hour*1000) * 60 / 1000);
		if (hour < 10){
			hour = "0"+hour;
		}
		if (minute < 10){
			minute = "0"+minute;
		}
		timeInput.value = hour + ":" + minute + ":00";
		timeInputSlider.value = time;
	}else if (time.match(/^\d{1,2}(:\d{1,2}){1,2}$/)){
		timeInput.value = time;
		let time_splitted = time.split(":", 3);
		time = parseInt(time_splitted[0])*1000+parseInt(time_splitted[1])*1000/60;
		timeInputSlider.value = time;
	}

	if (updateScene){
		lightEntity = scene.querySelector('#sunLight');
		if (lightEntity){
			let r = time_scenario.sun.general.sun_distance;
			let phi = time_scenario.sun.general.sun_delta_phi * Math.PI / 180.0;

			var angle, isVisible, color;
			var timelineArray = time_scenario.sun.general.timeline;
			if (timelineArray.length == 0){
				angle = parseFloat((time-6000)%24000) * 2.0 * Math.PI / 24000.0;
			}else if (timelineArray.length == 1){
				angle = timelineArray[0].angle;
				isVisible = timelineArray[0].visible;
				color = timelineArray[0].color;
			}else{
				var timePointPrev, timePointNext, lerpValue;
				if (time <= timelineArray[0].time){
					timePointPrev = timelineArray[timelineArray.length-1];
					timePointNext = timelineArray[0];
					lerpValue = (time-(timePointPrev.time-24000))/(timePointNext.time-timePointPrev.time);
				}else if (time >= timelineArray[timelineArray.length-1].time){
					timePointPrev = timelineArray[timelineArray.length-1];
					timePointNext = timelineArray[0];
					lerpValue = (time-timePointPrev.time)/(timePointNext.time+24000-timePointPrev.time);
				}else{
					for(var i = 1; i < timelineArray.length; i++) {
						if (time <= timelineArray[i].time){
							timePointPrev = timelineArray[i-1];
							timePointNext = timelineArray[i];
							lerpValue = (time-timePointPrev.time)/(timePointNext.time-timePointPrev.time);
							break;
						}
					}
				}

				// TODO: need to fix angle calculation
				let deltaAngle = timePointNext.angle-timePointPrev.angle;
				if (timePointNext.angle < 0){
					deltaAngle = timePointNext.angle + 360 - timePointPrev.angle;
				}
				angle = timePointPrev.angle + deltaAngle*lerpValue;
				angle = angle * Math.PI / 180.0;
				visible = timePointPrev.visible && timePointNext.visible;
				color = lerpColor(timePointPrev.color, timePointNext.color, lerpValue);
			}

			let posY = r * Math.sin(angle);
			let posZ = r * Math.cos(angle) * Math.sin(phi);
			let posX = r * Math.cos(angle) * Math.cos(phi);
			lightEntity.setAttribute('position', {x: posX, y: posY, z: posZ});
			lightEntity.setAttribute('visible', visible);
			lightEntity.setAttribute('light', {'color':color});
		}
	}
}