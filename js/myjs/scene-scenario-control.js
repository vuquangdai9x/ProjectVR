import "./ultility-functions.js";

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
		updateSunPosition(time);
		updateLightSources(time);
		updateEntities(time);
	}
}

function updateSunPosition(time){
	let sunEntity = scene.querySelector("#"+time_scenario.sun.general.id);
	if (sunEntity){
		let r = time_scenario.sun.general.sun_distance;
		let phi = time_scenario.sun.general.sun_delta_phi * Math.PI / 180.0;
		let angle;
		let timelineArray = time_scenario.sun.general.timeline;
		if (timelineArray.length == 0){
			angle = parseFloat((time-6000)%24000) * 2.0 * Math.PI / 24000.0;
		}else if (timelineArray.length == 1){
			angle = timelineArray[0].angle;
		}else{
			let timePointPrev, timePointNext, lerpValue;
			let deltaAngle;

			if (time <= timelineArray[0].time){
				timePointPrev = timelineArray[timelineArray.length-1];
				timePointNext = timelineArray[0];
				lerpValue = (time-(timePointPrev.time-24000))/(timePointNext.time-timePointPrev.time);
				if (timePointNext.angle < timePointPrev.angle){
					deltaAngle = timePointNext.angle + 360 - timePointPrev.angle;
				}else{
					deltaAngle = timePointNext.angle-timePointPrev.angle;
				}
			}else if (time >= timelineArray[timelineArray.length-1].time){
				timePointPrev = timelineArray[timelineArray.length-1];
				timePointNext = timelineArray[0];
				lerpValue = (time-timePointPrev.time)/(timePointNext.time+24000-timePointPrev.time);
				if (timePointNext.angle < timePointPrev.angle){
					deltaAngle = timePointNext.angle + 360 - timePointPrev.angle;
				}else{
					deltaAngle = timePointNext.angle-timePointPrev.angle;
				}
			}else{
				for(let i = 1; i < timelineArray.length; i++) {
					if (time <= timelineArray[i].time){
						timePointPrev = timelineArray[i-1];
						timePointNext = timelineArray[i];
						lerpValue = (time-timePointPrev.time)/(timePointNext.time-timePointPrev.time);
						deltaAngle = timePointNext.angle-timePointPrev.angle;
						break;
					}
				}
			}
			angle = timePointPrev.angle + deltaAngle*lerpValue;
			angle = angle * Math.PI / 180.0;
		}

		let posY = r * Math.sin(angle);
		let posZ = r * Math.cos(angle) * Math.sin(phi);
		let posX = r * Math.cos(angle) * Math.cos(phi);
		sunEntity.setAttribute('position', {x: posX, y: posY, z: posZ});
	}
}

function updateLightSources(time){
	let listLights = time_scenario.light_sources.general;
	for(let i = 0; i < listLights.length; i++) {
		let lightEntity = scene.querySelector("#"+listLights[i].id);
		if (! lightEntity) continue;

		let timelineArray = listLights[i].timeline;
		let visible, color, intensity;
		if (timelineArray.length <= 0){
			// do nothing
		}else if (timelineArray.length == 1){
			visible = timelineArray[0].visible;
			color = timelineArray[0].color;
			intensity = timelineArray[0].intensity;
		}else{
			let timePointPrev, timePointNext, lerpValue;
			if (time <= timelineArray[0].time){
				timePointPrev = timelineArray[timelineArray.length-1];
				timePointNext = timelineArray[0];
				lerpValue = (time-(timePointPrev.time-24000))/(timePointNext.time-timePointPrev.time);
			}else if (time >= timelineArray[timelineArray.length-1].time){
				timePointPrev = timelineArray[timelineArray.length-1];
				timePointNext = timelineArray[0];
				lerpValue = (time-timePointPrev.time)/(timePointNext.time+24000-timePointPrev.time);
			}else{
				for(let i = 1; i < timelineArray.length; i++) {
					if (time <= timelineArray[i].time){
						timePointPrev = timelineArray[i-1];
						timePointNext = timelineArray[i];
						lerpValue = (time-timePointPrev.time)/(timePointNext.time-timePointPrev.time);
						break;
					}
				}
			}
			visible = timePointNext.visible && timePointPrev.visible;
			color = lerpColor(timePointPrev.color,timePointNext.color,lerpValue);
			intensity = timePointPrev.intensity+lerpValue*(timePointNext.intensity-timePointPrev.intensity);
		}
		lightEntity.setAttribute('visible', visible);
		lightEntity.setAttribute('light', {
			'color': color,
			'intensity': intensity
		});
	}
}

function updateEntities(time){
	let listEntities = time_scenario.entities.general;
	for(let i = 0; i < listEntities.length; i++) {
		let entity = scene.querySelector("#"+listEntities[i].id);
		if (! entity) continue;

		let timelineArray = listEntities[i].timeline;
		let visible;
		if (timelineArray.length <= 0){
			// do nothing
		}else if (timelineArray.length == 1){
			visible = timelineArray[0].visible;
			let listComponents = timelineArray[0].components;
			for(let i = 0; i < listComponents.length; i++) {
				entity.setAttribute(listComponents[i].name, listComponents[i].properties);
			}
		}else{
			let timePointPrev, timePointNext, lerpValue;
			if (time <= timelineArray[0].time){
				timePointPrev = timelineArray[timelineArray.length-1];
				timePointNext = timelineArray[0];
				lerpValue = (time-(timePointPrev.time-24000))/(timePointNext.time-timePointPrev.time);
			}else if (time >= timelineArray[timelineArray.length-1].time){
				timePointPrev = timelineArray[timelineArray.length-1];
				timePointNext = timelineArray[0];
				lerpValue = (time-timePointPrev.time)/(timePointNext.time+24000-timePointPrev.time);
			}else{
				for(let i = 1; i < timelineArray.length; i++) {
					if (time <= timelineArray[i].time){
						timePointPrev = timelineArray[i-1];
						timePointNext = timelineArray[i];
						lerpValue = (time-timePointPrev.time)/(timePointNext.time-timePointPrev.time);
						break;
					}
				}
			}
			visible = timePointNext.visible && timePointPrev.visible;

			let listComponents = timePointPrev.components;
			for(let i = 0; i < listComponents.length; i++) {
				for (const key of Object.keys(listComponents[i].properties)) {
					if (!isNaN(listComponents[i].properties[key])){
						let value = timePointPrev.components[i].properties[key]+lerpValue*(timePointNext.components[i].properties[key]-timePointPrev.components[i].properties[key]);
						let prop = {};
						prop[key] = value;
						entity.setAttribute(listComponents[i].name, prop);
					}else if (listComponents[i].properties[key].match(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/)){
						// is color
						let value = lerpColor(
							timePointPrev.components[i].properties[key], 
							timePointNext.components[i].properties[key],
							lerpValue);
						let prop = {};
						prop[key] = value;
						entity.setAttribute(listComponents[i].name, prop);
					}
				}
			}
		}
		entity.setAttribute('visible', visible);
	}
}