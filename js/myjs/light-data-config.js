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
				modifyLevel: ModifyLevel.SCENARIO,
				value_config: true,
				value_scenario: false,
				value_time: true
			},
			power: {
				modifyLevel: ModifyLevel.SCENARIO,
				value_config: 1.0,
				value_scenario: 0.8,
				value_time: 0.5
			},
			color: {
				modifyLevel: ModifyLevel.LIGHT_CONFIG,
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