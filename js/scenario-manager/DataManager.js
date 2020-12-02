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

var ScenarioData = {
	sceneEl: null,
	light_definition: {
		list_lights: [],
		list_natural_light: []
	},
	scenario: null,
	timeline: null,
	light_data: {
		list_lights: [],
		list_natural_light: []
	}
};

var DataManager = {
	readJSONFile: function(file, callback) {
		var rawFile = new XMLHttpRequest();
		rawFile.overrideMimeType("application/json");
		rawFile.open("GET", file, true);
		rawFile.onreadystatechange = function() {
			if (rawFile.readyState === 4 && rawFile.status == "200") {
				callback(rawFile.responseText);
			}
		}
		rawFile.send(null);
	},

	fillDefaultObjectData: function(object, defaultObj){
		let _self = this;
		Object.keys(defaultObj).forEach(function(key) {
			if (object[key]==undefined || object[key]==null){
				object[key] = defaultObj[key];
			}else if (object.constructor === ({}).constructor){
				_self.fillDefaultObjectData(object[key], defaultObj[key]);
			}else{
				// do nothing
			}	
		})
	},

	loadScenarioData: function(sceneEl, scenarioDataEl, onloadedCallback){
		// * use global ScenarioData *
		ScenarioData.sceneEl = sceneEl;

		let _self = this;
		
		_self.readJSONFile(scenarioDataEl.getAttribute("data-light-prop"), function(light_prop_text){
			let light_prop_data_json = JSON.parse(light_prop_text);

			// mapping
			ScenarioData.light_definition.list_lights = light_prop_data_json["config"];
			ScenarioData.light_definition.list_natural_light = light_prop_data_json["natural-light"];

			// standardize light definition
			let listLight = ScenarioData.light_definition.list_lights;
			for (let i=0; i<listLight.length; i++){
				_self.fillDefaultObjectData(listLight[i], light_prop_data_json["default"]);
			}

			// standardize natural light definition
			listLight = ScenarioData.light_definition.list_natural_light;
			for (let i=0; i<listLight.length; i++){
				_self.fillDefaultObjectData(listLight[i], light_prop_data_json["default-natual-light"]);
			}
			
			_self.readJSONFile(scenarioDataEl.getAttribute("data-scenario"), function(scenario_text){
				let scenario_data_json = JSON.parse(scenario_text);

				ScenarioData.scenario = scenario_data_json["scenario"];
				ScenarioData.timeline = scenario_data_json["time"];

				// standardize scenario definition
				for (let i=0; i<ScenarioData.scenario.length; i++){
					_self.fillDefaultObjectData(ScenarioData.scenario[i], scenario_data_json["default-scenario"]);
				}
				// standardize timeline definition
				for (let i=0; i<ScenarioData.timeline.length; i++){
					_self.fillDefaultObjectData(ScenarioData.timeline[i], scenario_data_json["default-time"]);
				}

				_self.initLightData();

				onloadedCallback();
			});
		});
	},

	initLightData: function(){
		// init light data
		for (let i=0; i<ScenarioData.light_definition.list_lights.length; i++){
			let data={
				list_light_entities: [],
				list_object_entities: [],
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

			let light_definition = ScenarioData.light_definition.list_lights[i];
			let list_light_query = light_definition["list-light-query"];
			let list_object_query = light_definition["list-object-query"];

			for (let j=0; j<list_light_query.length; j++){
				data.list_light_entities.push(ScenarioData.sceneEl.querySelectorAll(list_light_query[j]));
			}
			for (let j=0; j<list_object_query.length; j++){
				data.list_object_entities.push(ScenarioData.sceneEl.querySelectorAll(list_object_query[j]));
			}
			
			ScenarioData.light_data.list_lights.push(data);
		}

		// init natural light data
		for (let i=0; i<ScenarioData.light_definition.list_natural_light.length; i++){
			let data={
				list_light_entities: [],
				list_object_entities: [],
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

			let light_definition = ScenarioData.light_definition.list_natural_light[i];
			let list_light_query = light_definition["list-light-query"];
			let list_object_query = light_definition["list-object-query"];

			for (let j=0; j<list_light_query.length; j++){
				data.list_light_entities.push(ScenarioData.sceneEl.querySelectorAll(list_light_query[j]));
			}
			for (let j=0; j<list_object_query.length; j++){
				data.list_object_entities.push(ScenarioData.sceneEl.querySelectorAll(list_object_query[j]));
			}
			
			ScenarioData.light_data.list_natural_light.push(data);
		}
	},

	getLightIsOn: function(light_index, isNaturalLight=false){
		let light_status_data = isNaturalLight?
			ScenarioData.light_data.list_natural_light[light_index].isLightOn
			:ScenarioData.light_data.list_light[light_index].isLightOn;
		let value;
		switch (light_status_data.modifyLevel) {
			case ModifyLevel.TIME:
				value = light_status_data.value_time;
				break;
			case ModifyLevel.SCENARIO:
				value = light_status_data.value_scenario;
				break;
			case ModifyLevel.LIGHT_CONFIG:
				value = light_status_data.value_config;
				break;
		}
		return value;
	},
	getLightPower: function(light_index, isNaturalLight=false){
		let light_power_data = isNaturalLight?
			ScenarioData.light_data.list_natural_light[light_index].power
			:ScenarioData.light_data.list_light[light_index].power;
		let value;
		switch (light_power_data.modifyLevel) {
			case ModifyLevel.TIME:
				value = light_power_data.value_time;
				break;
			case ModifyLevel.SCENARIO:
				value = light_power_data.value_scenario;
				break;
			case ModifyLevel.LIGHT_CONFIG:
				value = light_power_data.value_config;
				break;
		}
		return value;
	},
	getLightColor: function(light_index, isNaturalLight=false){
		let light_color_data = isNaturalLight?
			ScenarioData.light_data.list_natural_light[light_index].color
			:ScenarioData.light_data.list_light[light_index].color;
		let value;
		switch (light_color_data.modifyLevel) {
			case ModifyLevel.TIME:
				value = light_color_data.value_time;
				break;
			case ModifyLevel.SCENARIO:
				value = light_color_data.value_scenario;
				break;
			case ModifyLevel.LIGHT_CONFIG:
				value = light_color_data.value_config;
				break;
		}
		return value;
	},

	setLightIsOnManually: function(light_index, isTurnOn, isNaturalLight=false){
		let light_status_data = isNaturalLight?
			ScenarioData.light_data.list_natural_light[light_index].color
			:ScenarioData.light_data.list_light[light_index].color;
		light_status_data.modifyLevel = ModifyLevel.LIGHT_CONFIG;
		light_status_data.value_config = isTurnOn;
	},
	setLightPowerManually: function(light_index, power, isNaturalLight=false){
		let light_power_data = isNaturalLight?
			ScenarioData.light_data.list_natural_light[light_index].power
			:ScenarioData.light_data.list_light[light_index].power;
		light_power_data.modifyLevel = ModifyLevel.LIGHT_CONFIG;
		light_power_data.value_config = power;
	},
	setLightColorManually: function(light_index, color_mode, value, isNaturalLight=false){
		let light_color_data = isNaturalLight?
			ScenarioData.light_data.list_natural_light[light_index].color
			:ScenarioData.light_data.list_light[light_index].color;
		light_color_data.modifyLevel = ModifyLevel.LIGHT_CONFIG;
		light_color_data.value_config.color_mode = color_mode;
		switch (color_mode) {
			case ColorMode.TEMPERATURE:
				light_color_data.value_config.temperature = value;
				break;
			case ColorMode.RGB_PRESET:
				light_color_data.value_config.rgb_preset_index = value;
				break;
			case ColorMode.RGB:
				light_color_data.value_config.rgb_color = value;
				break;
		}
	},
	setScenario: function(scenario_index){
		
	},
	setTime: function(time){

	},
}