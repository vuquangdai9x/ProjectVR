var scenario_data;

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

function fillDefaultObjectData(object, defaultObj){
	Object.keys(defaultObj).forEach(function(key) {
		if (object[key]==undefined || object[key]==null){
			object[key] = defaultObj[key];
		}else if (object.constructor === ({}).constructor){
			fillDefaultObjectData(object[key], defaultObj[key]);
		}else{
			// do nothing
		}	
	})
}

function standardizeLightPropJson(){
	for (let i=0; i<scenario_data.light_prop.config.length; i++){
		fillDefaultObjectData(scenario_data.light_prop.config[i], scenario_data.light_prop.default);
	}
}
function standardizeScenarioJson(){
	for (let i=0; i<scenario_data.scenario.scenario.length; i++){
		fillDefaultObjectData(scenario_data.scenario.scenario[i], scenario_data.scenario["default-scenario"]);
	}
}

function loadScenarioData(sceneEl, scenarioDataEl, onloadedCallback){
	let light_prop, scenario;
	scenario_data={};
	readJSONFile(document.getElementById("scenario-file").getAttribute("data-light-prop"), function(text){
		light_prop = JSON.parse(text);
		scenario_data.light_prop = light_prop;
		standardizeLightPropJson();
		if (scenario != undefined){
			initScenarioData(sceneEl, onloadedCallback);
		}
	});
	readJSONFile(document.getElementById("scenario-file").getAttribute("data-scenario"), function(text){
		scenario = JSON.parse(text);
		scenario_data.scenario = scenario;
		standardizeScenarioJson();
		if (light_prop != undefined){
			initScenarioData(sceneEl, onloadedCallback);
		}
	});
}

const ModifyLevel = {
    TIME: 0,
    SCENARIO: 1,
    LIGHT_CONFIG: 2,
}
const ColorMode = {
    TEMPERATURE: 0,
    RGB_PRESET: 1,
    RGB: 2,
}

function initScenarioData(sceneEl, onloadedCallback){
	let list_light_config = [];

	// init light data
	for (let i=0; i<scenario_data.light_prop.config.length; i++){
		let light_static_data = scenario_data.light_prop.config[i];

		let list_light_group = [];
		let list_object_group = [];

		let list_light_query = light_static_data["list-light-query"];
		let list_object_query = light_static_data["list-object-query"];

		for (let j=0; j<list_light_query.length; j++){
			list_light_group.push(sceneEl.querySelectorAll(list_light_query[j]));
		}
		for (let j=0; j<list_object_query.length; j++){
			list_object_group.push(sceneEl.querySelectorAll(list_object_query[j]));
		}

		let data={
			list_light: list_light_group,
			list_object: list_object_group,
			isLightOn: {
				modifyLevel: ModifyLevel.TIME,
				value_config: true,
				value_scenario: false,
				value_time: true
			},
			power: {
				modifyLevel: ModifyLevel.TIME,
				value_config: 1.0,
				value_scenario: 0.8,
				value_time: 0.5
			},
			color: {
				modifyLevel: ModifyLevel.TIME,
				value_config: {
					color_mode: ColorMode.TEMPERATURE,
					temperature: 3000,
					rgb_preset_index: 0,
					rgb_color: "#ffffff"
				},
				value_scenario: {
					color_mode: ColorMode.RGB_PRESET,
					temperature: 6000,
					rgb_preset_index: 2,
					rgb_color: "#ffffff"
				},
				value_time: {
					color_mode: ColorMode.RGB,
					temperature: 6000,
					rgb_preset_index: 0,
					rgb_color: "#ff0000"
				},
			},
		};
		
		list_light_config.push(data);
	}
	scenario_data.list_light_config = list_light_config;

	scenario_data.scene_el = sceneEl;

	// setup
	onloadedCallback(scenario_data);
}

function GetLightIsOn(light_index){
	let light_status_info = scenario_data.list_light_config[light_index].isLightOn;
	let value;
	switch (light_status_info.modifyLevel) {
		case ModifyLevel.TIME:
			value = light_status_info.value_time;
			break;
		case ModifyLevel.SCENARIO:
			value = light_status_info.value_scenario;
			break;
		case ModifyLevel.LIGHT_CONFIG:
			value = light_status_info.value_config;
			break;
	}
	return value;
}
function GetLightPower(light_index){
	let light_power_info = scenario_data.list_light_config[light_index].power;
	let value;
	switch (light_power_info.modifyLevel) {
		case ModifyLevel.TIME:
			value = light_power_info.value_time;
			break;
		case ModifyLevel.SCENARIO:
			value = light_power_info.value_scenario;
			break;
		case ModifyLevel.LIGHT_CONFIG:
			value = light_power_info.value_config;
			break;
	}
	return value;
}
function GetLightColor(light_index){
	let light_color_info = scenario_data.list_light_config[light_index].color;
	let value;
	switch (light_color_info.modifyLevel) {
		case ModifyLevel.TIME:
			value = light_color_info.value_time;
			break;
		case ModifyLevel.SCENARIO:
			value = light_color_info.value_scenario;
			break;
		case ModifyLevel.LIGHT_CONFIG:
			value = light_color_info.value_config;
			break;
	}
	return value;
}

function SetTime(time, onfinishCallback=null){
	UpdateSunPositionByTime(time);
	UpdateSkyByTime(time);
	UpdateOtherObjectsByTime(time);
	UpdateLightDataByTime(time);
	UpdateAllLightInScene();
}
function SetScenario(scenario_index, onfinishCallback=null){

}
function SetLightModifyLevel(index, modifyLevel, onfinishCallback=null){

}
function SetLightStatus(index, isLightOn, onfinishCallback=null){
	let light_data = scenario_data.list_light_config[index];
	for (let i=0; i<light_data.list_light_group.length; i++){
		for (var j = 0; j < light_data.list_light_group[i].length; j++) {
			light_data.list_light_group[i][j].setAttribute('visible', isLightOn);
		}
	}
	for (let i=0; i<light_data.list_object_group.length; i++){
		for (var j = 0; j < light_data.list_object_group[i].length; j++) {
			light_data.list_object_group[i][j].setAttribute('material', "emissiveIntensity", isLightOn?1.0:0.0);
		}
	}
}
function SetAllLightStatus(scenario_data, isLightOn, onfinishCallback=null){

}
function SetLightPower(scenario_data, index, power, onfinishCallback=null){

}
function SetLightTemperature(scenario_data, index, temperature, onfinishCallback=null){

}
function SetLightColor(scenario_data, index, color, onfinishCallback=null){
	
}

function getLerpValueByTime(time, timelineArray){
	let result = {};
	if (timelineArray.length == 0){
		return null;
	}else if (timelineArray.length == 1){
		result.timePointPrev = timelineArray[0];
		result.timePointNext = timelineArray[0];
		result.lerpValue = 0;
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
		result.timePointPrev = timePointPrev;
		result.timePointNext = timePointNext;
		result.lerpValue = lerpValue;
	}
	return result;
}

function UpdateSunPositionByTime(time){
	let sunEntity = scenario_data.scene_el.querySelector(scenario_data.scenario.time.sun_position.id);
	if (sunEntity){
		let lerpResult = getLerpValueByTime(time, scenario_data.scenario.time.sun_position.timeline);
		if (lerpResult == null){
			// do nothing, keep sun position when inti scene
		}else{
			let r = scenario_data.scenario.time.sun_position.distance;
			let phi = scenario_data.scenario.time.sun_position.delta_phi * Math.PI / 180.0;
			let angle;

			// standalize angle values
			let prevAngle = lerpResult.timePointPrev.angle;
			let nextAngle = lerpResult.timePointNext.angle;
			if (lerpResult.timePointNext.clockwise){
				// clockwise, nextAngle must less than prevAngle
				while (nextAngle > prevAngle){
					nextAngle -= 360;
				}
				while (prevAngle - nextAngle >= 360){
					nextAngle += 360;
				}
			}else{
				// counter clockwise, nextAngle must greater than prevAngle
				while (nextAngle < prevAngle){
					nextAngle += 360;
				}
				while (nextAngle - prevAngle >= 360){
					prevAngle += 360;
				}
			}

			// update angle
			angle = lerpFloat(prevAngle,nextAngle,lerpResult.lerpValue);
			angle = angle * Math.PI / 180.0;
			
			let posY = r * Math.sin(angle);
			let posZ = r * Math.cos(angle) * Math.sin(phi);
			let posX = r * Math.cos(angle) * Math.cos(phi);
			sunEntity.setAttribute('position', {x: posX, y: posY, z: posZ});
		}	
	}
}

function UpdateSkyByTime(time){
	let skyEntity = scenario_data.scene_el.querySelector(scenario_data.scenario.time.sky.id);
	if (skyEntity){
		let color;
		let lerpResult = getLerpValueByTime(time, scenario_data.scenario.time.sky.timeline);
		if (lerpResult == null){
			color = "#ffffff";
		}else{
			color = lerpColor(lerpResult.timePointPrev.color, lerpResult.timePointNext.color, lerpResult.lerpValue);
		}	
		skyEntity.setAttribute('color', color);
	}
}

function UpdateOtherObjectsByTime(time){
	let listObj = scenario_data.scenario.time["other-objects"];
	for (let objIndex = 0; objIndex<listObj.length; objIndex++){
		let objEntity = scenario_data.scene_el.querySelector(listObj[objIndex].id);
		if (objEntity){
			let lerpResult = getLerpValueByTime(time, listObj[objIndex].timeline);
			if (lerpResult == null){
				// do nothing
			}else{
				objEntity.setAttribute("visible", lerpResult.timePointNext.visible);
				if (lerpResult.timePointNext.position != null && lerpResult.timePointPrev.position != null){
					let prev = lerpResult.timePointPrev.position;
					let next = lerpResult.timePointNext.position;
					objEntity.setAttribute("position", {
						x: lerpFloat(prev.x, next.x, lerpResult.lerpValue),
						y: lerpFloat(prev.y, next.y, lerpResult.lerpValue),
						z: lerpFloat(prev.z, next.z, lerpResult.lerpValue)
					});
				}
				if (lerpResult.timePointNext.rotation != null && lerpResult.timePointPrev.rotation != null){
					let prev = lerpResult.timePointPrev.rotation;
					let next = lerpResult.timePointNext.rotation;
					objEntity.setAttribute("rotation", {
						x: lerpFloat(prev.x, next.x, lerpResult.lerpValue),
						y: lerpFloat(prev.y, next.y, lerpResult.lerpValue),
						z: lerpFloat(prev.z, next.z, lerpResult.lerpValue)
					});
				}
				if (lerpResult.timePointNext.scale != null && lerpResult.timePointPrev.scale != null){
					let prev = lerpResult.timePointPrev.scale;
					let next = lerpResult.timePointNext.scale;
					objEntity.setAttribute("scale", {
						x: lerpFloat(prev.x, next.x, lerpResult.lerpValue),
						y: lerpFloat(prev.y, next.y, lerpResult.lerpValue),
						z: lerpFloat(prev.z, next.z, lerpResult.lerpValue)
					});
				}
			}	
		}
	}
}

function UpdateLightDataByTime(time){
	let listLight = scenario_data.scenario.time.lights;
	for (let i = 0; i<listLight.length; i++){
		let lightIndex = listLight[i].index;
		let lightData = scenario_data.list_light_config[lightIndex];
		let lightStaticData = scenario_data.light_prop.config[lightIndex];

		let lerpResult = getLerpValueByTime(time, listLight[lightIndex].timeline);
		if (lerpResult == null){
			// do nothing
		}else{
			lightData.isLightOn.value_time = lerpResult.timePointNext.turnOn;
			lightData.power.value_time = lerpFloat(
				lerpResult.timePointPrev.power, 
				lerpResult.timePointNext.power, 
				lerpResult.lerpValue);
			if (lerpResult.timePointPrev["color-type"]==lerpResult.timePointNext["color-type"]){
				switch (lerpResult.timePointPrev["color-type"]) {
					case "temperature":
						lightData.color.value_time.color_mode = ColorMode.TEMPERATURE;
						lightData.color.value_time.temperature = lerpFloat(
							lerpResult.timePointPrev["color-temperature"], 
							lerpResult.timePointNext["color-temperature"],
							lerpResult.lerpValue);
						break;
					case "preset":
						lightData.color.value_time.color_mode = ColorMode.RGB_PRESET;
						lightData.color.value_time.rgb_preset_index = lerpResult.timePointNext["color-preset-index"];
						break;
					case "rgb":
						lightData.color.value_time.color_mode = ColorMode.RGB;
						lightData.color.value_time.rgb_color = lerpColor(
							lerpResult.timePointPrev["color-rgb"], 
							lerpResult.timePointNext["color-rgb"],
							lerpResult.lerpValue);
						break;
				}
			}else{
				let colorPrev, colorNext;
				switch (lerpResult.timePointPrev["color-type"]) {
					case "temperature":
						colorPrev = getColorFromTemperature(lerpResult.timePointPrev["color-temperature"]);
						break;
					case "preset":
						colorPrev = lightStaticData.color["list-rgb"][lerpResult.timePointPrev["color-preset-index"]];
						break;
					case "rgb":
						colorPrev = lerpResult.timePointPrev["color-rgb"];
						break;
				}
				switch (lerpResult.timePointNext["color-type"]) {
					case "temperature":
						colorNext = getColorFromTemperature(lerpResult.timePointNext["color-temperature"]);
						break;
					case "preset":
						colorNext = lightStaticData.color["list-rgb"][lerpResult.timePointNext["color-preset-index"]];
						break;
					case "rgb":
						colorNext = lerpResult.timePointNext["color-rgb"];
						break;
				}
				lightData.color.value_time.color_mode = ColorMode.RGB;
				lightData.color.value_time.rgb_color = lerpColor(colorPrev, colorNext, lerpResult.lerpValue);
			}
		}
	}
}

function UpdateAllLightInScene(){
	for (let i=0; i<scenario_data.list_light_config.length; i++){
		UpdateLightInScene(i);
	}
	for (let i=0; i<scenario_data.list_light_config.length; i++){
		UpdateLightInScene(i);
	}
}

function UpdateLightInScene(index){
	let lightStaticData = scenario_data.light_prop.config[index];
	let lightData = scenario_data.list_light_config[index];

	let isTurnOn, powerValue, colorValue;
	switch (lightData.isLightOn.modifyLevel) {
		case ModifyLevel.LIGHT_CONFIG:
			isTurnOn = lightData.isLightOn.value_config;
			break;
		case ModifyLevel.SCENARIO:
			isTurnOn = lightData.isLightOn.value_scenario;
			break;
		case ModifyLevel.TIME:
			isTurnOn = lightData.isLightOn.value_time;
			break;
	}
	switch (lightData.power.modifyLevel) {
		case ModifyLevel.LIGHT_CONFIG:
			powerValue = lightData.power.value_config;
			break;
		case ModifyLevel.SCENARIO:
			powerValue = lightData.power.value_scenario;
			break;
		case ModifyLevel.TIME:
			powerValue = lightData.power.value_time;
			break;
	}
	switch (lightData.color.modifyLevel) {
		case ModifyLevel.LIGHT_CONFIG:
			colorValue = lightData.color.value_config;
			break;
		case ModifyLevel.SCENARIO:
			colorValue = lightData.color.value_scenario;
			break;
		case ModifyLevel.TIME:
			colorValue = lightData.color.value_time;
			break;
	}

	for (let i=0; i<lightData.list_light.length; i++){
		for (let j=0; j<lightData.list_light[i].length; j++){
			let lightEntity = lightData.list_light[i][j];
			lightEntity.setAttribute("visible", isTurnOn);

			let lerpPowerValue = (powerValue-lightStaticData.power.min.value)/(lightStaticData.power.max.value-lightStaticData.power.min.value);
			let intensity = lerpFloat(lightStaticData.power.min["config-intensity-all"],lightStaticData.power.max["config-intensity-all"],lerpPowerValue);
			lightEntity.setAttribute('light', { 'intensity': intensity });

			let lerpTemperatureValue;
			let temperature;
			switch (colorValue.color_mode) {
				case ColorMode.TEMPERATURE:
					lerpTemperatureValue = (colorValue.temperature-lightStaticData.color.temperature.min.value)/(lightStaticData.color.temperature.max.value-lightStaticData.color.temperature.min.value);
					temperature = lerpFloat(lightStaticData.color.temperature.min["config-temperature-all"],lightStaticData.color.temperature.max["config-temperature-all"],lerpTemperatureValue);
					lightEntity.setAttribute("light-temperature", "temperature", temperature);
					break;
				case ColorMode.RGB_PRESET:
					lightEntity.setAttribute('light', { 'color': lightStaticData.color["list-rgb"][colorValue.rgb_preset_index] });
					break;
				case ColorMode.RGB:
					lightEntity.setAttribute('light', { 'color': colorValue.rgb_color });
					break;
			}
		}
	}
	for (let i=0; i<lightData.list_object.length; i++){
		for (let j=0; j<lightData.list_object[i].length; j++){
			let objEntity = lightData.list_object[i][j];
			let lerpPowerValue = (powerValue-lightStaticData.power.min.value)/(lightStaticData.power.max.value-lightStaticData.power.min.value);
			let intensity = lerpFloat(lightStaticData.power.min["config-emissive-intensity-all"],lightStaticData.power.max["config-emissive-intensity-all"],lerpPowerValue);
			objEntity.setAttribute('material', { 'emissiveIntensity': intensity });

			let lerpTemperatureValue;
			let temperature;
			switch (colorValue.color_mode) {
				case ColorMode.TEMPERATURE:
					lerpTemperatureValue = (colorValue.temperature-lightStaticData.color.temperature.min.value)/(lightStaticData.color.temperature.max.value-lightStaticData.color.temperature.min.value);
					temperature = lerpFloat(lightStaticData.color.temperature.min["config-emissive-color-all"],lightStaticData.color.temperature.max["config-emissive-color-all"],lerpTemperatureValue);
					objEntity.setAttribute("emissive-temperature", "temperature", temperature);
					break;
				case ColorMode.RGB_PRESET:
					objEntity.setAttribute('material', { 'emissive': lightStaticData.color["list-rgb"][colorValue.rgb_preset_index] });
					break;
				case ColorMode.RGB:
					objEntity.setAttribute('material', { 'emissive': colorValue.rgb_color });
					break;
			}
		}
	}
}

function UpdateNaturalLightInScene(index){
	let lightStaticData = scenario_data.light_prop.config[index];
	let lightData = scenario_data.list_light_config[index];

	let isTurnOn, powerValue, colorValue;
	switch (lightData.isLightOn.modifyLevel) {
		case ModifyLevel.LIGHT_CONFIG:
			isTurnOn = lightData.isLightOn.value_config;
			break;
		case ModifyLevel.SCENARIO:
			isTurnOn = lightData.isLightOn.value_scenario;
			break;
		case ModifyLevel.TIME:
			isTurnOn = lightData.isLightOn.value_time;
			break;
	}
	switch (lightData.power.modifyLevel) {
		case ModifyLevel.LIGHT_CONFIG:
			powerValue = lightData.power.value_config;
			break;
		case ModifyLevel.SCENARIO:
			powerValue = lightData.power.value_scenario;
			break;
		case ModifyLevel.TIME:
			powerValue = lightData.power.value_time;
			break;
	}
	switch (lightData.color.modifyLevel) {
		case ModifyLevel.LIGHT_CONFIG:
			colorValue = lightData.color.value_config;
			break;
		case ModifyLevel.SCENARIO:
			colorValue = lightData.color.value_scenario;
			break;
		case ModifyLevel.TIME:
			colorValue = lightData.color.value_time;
			break;
	}

	for (let i=0; i<lightData.list_light.length; i++){
		for (let j=0; j<lightData.list_light[i].length; j++){
			let lightEntity = lightData.list_light[i][j];
			lightEntity.setAttribute("visible", isTurnOn);

			let lerpPowerValue = (powerValue-lightStaticData.power.min.value)/(lightStaticData.power.max.value-lightStaticData.power.min.value);
			let intensity = lerpFloat(lightStaticData.power.min["config-intensity-all"],lightStaticData.power.max["config-intensity-all"],lerpPowerValue);
			lightEntity.setAttribute('light', { 'intensity': intensity });

			let lerpTemperatureValue;
			let temperature;
			switch (colorValue.color_mode) {
				case ColorMode.TEMPERATURE:
					lerpTemperatureValue = (colorValue.temperature-lightStaticData.color.temperature.min.value)/(lightStaticData.color.temperature.max.value-lightStaticData.color.temperature.min.value);
					temperature = lerpFloat(lightStaticData.color.temperature.min["config-temperature-all"],lightStaticData.color.temperature.max["config-temperature-all"],lerpTemperatureValue);
					lightEntity.setAttribute("light-temperature", "temperature", temperature);
					break;
				case ColorMode.RGB_PRESET:
					lightEntity.setAttribute('light', { 'color': lightStaticData.color["list-rgb"][colorValue.rgb_preset_index] });
					break;
				case ColorMode.RGB:
					lightEntity.setAttribute('light', { 'color': colorValue.rgb_color });
					break;
			}
		}
	}
	for (let i=0; i<lightData.list_object.length; i++){
		for (let j=0; j<lightData.list_object[i].length; j++){
			let objEntity = lightData.list_object[i][j];
			let lerpPowerValue = (powerValue-lightStaticData.power.min.value)/(lightStaticData.power.max.value-lightStaticData.power.min.value);
			let intensity = lerpFloat(lightStaticData.power.min["config-emissive-intensity-all"],lightStaticData.power.max["config-emissive-intensity-all"],lerpPowerValue);
			objEntity.setAttribute('material', { 'emissiveIntensity': intensity });

			let lerpTemperatureValue;
			let temperature;
			switch (colorValue.color_mode) {
				case ColorMode.TEMPERATURE:
					lerpTemperatureValue = (colorValue.temperature-lightStaticData.color.temperature.min.value)/(lightStaticData.color.temperature.max.value-lightStaticData.color.temperature.min.value);
					temperature = lerpFloat(lightStaticData.color.temperature.min["config-emissive-color-all"],lightStaticData.color.temperature.max["config-emissive-color-all"],lerpTemperatureValue);
					objEntity.setAttribute("emissive-temperature", "temperature", temperature);
					break;
				case ColorMode.RGB_PRESET:
					objEntity.setAttribute('material', { 'emissive': lightStaticData.color["list-rgb"][colorValue.rgb_preset_index] });
					break;
				case ColorMode.RGB:
					objEntity.setAttribute('material', { 'emissive': colorValue.rgb_color });
					break;
			}
		}
	}
}