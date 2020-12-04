var SceneManager = {
	sceneEl: null,
	entities: {
		lights: [],
		timeline: {
			sun: null,
			sky: null,
			other_objects: []
		}
	},

	// NOTE: this is the only function access to ScenarioData.light_definition, ScenarioData.scenario and ScenarioData.timeline
	queryEntitiesInScene: function(){
		// query lights
		for (let i=0; i<ScenarioData.light_definition.length; i++){
			let listLightQuery = ScenarioData.light_definition[i]["list-light-query"];
			let listObjectQuery = ScenarioData.light_definition[i]["list-object-query"];
			let data = {
				light_entities: [],
				object_entities: []
			};
			let listEntitiesResult;
			// update light
			for (let i=0; i<listLightQuery.length; i++){
				listEntitiesResult = this.sceneEl.querySelectorAll(listLightQuery[i]);
				data.light_entities.push(listEntitiesResult);
			}
			for (let i=0; i<listObjectQuery.length; i++){
				listEntitiesResult = this.sceneEl.querySelectorAll(listObjectQuery[i]);
				data.object_entities.push(listEntitiesResult);
			}
			this.entities.lights.push(data);
		}

		// query timeline
		this.entities.timeline.sun = this.sceneEl.querySelectorAll(ScenarioData.timeline.sun.id);
		this.entities.timeline.sky = this.sceneEl.querySelectorAll(ScenarioData.timeline.sky.id);
		for (let i=0; i<ScenarioData.timeline["other-objects"].length; i++){
			let objectQuery = ScenarioData.timeline["other-objects"][i]["id"];
			let listEntitiesResult = this.sceneEl.querySelectorAll(objectQuery);
			this.entities.timeline.other_objects.push(listEntitiesResult);
		}
	},

	// NOTE: all function should only access to ScenarioData.light_data, ScenarioData.timeline_data
	updateLight: function(lightIndex){
		this.updateLightIsOn(lightIndex);
		this.updateLightPower(lightIndex);
		this.updateLightColor(lightIndex);
	},
	updateLightIsOn: function(lightIndex){
		let isTurnOn = DataManager.getLightIsOn(lightIndex);
		let lightEntities = this.entities.lights[lightIndex];
		for (let i=0; i < lightEntities.light_entities.length; i++){
			for (let j=0; j<lightEntities.light_entities[i].length; j++){
				lightEntities.light_entities[i][j].setAttribute("visible", isTurnOn);
			}
		}
	},
	updateLightPower: function(lightIndex){
		let power = DataManager.getLightPower(lightIndex);
		let lightEntities = this.entities.lights[lightIndex];
		// update light intensity
		if (power.intensity == undefined){
			for (let i=0; i < lightEntities.light_entities.length; i++){
				for (let j=0; j<lightEntities.light_entities[i].length; j++){
					lightEntities.light_entities[i][j].setAttribute('light', 
						{ 'intensity': power.intensity_all }
					);
				}
			}
		}else{

		}
		// update object emissive intensity
		if (power.emissive_intensity == undefined){
			for (let i=0; i < lightEntities.object_entities.length; i++){
				for (let j=0; j<lightEntities.object_entities[i].length; j++){
					lightEntities.object_entities[i][j].setAttribute('material', 
						{ 'emissiveIntensity': power.emissive_intensity_all }
					);
				}
			}
		}else{

		}
	},

	updateLightColor: function(lightIndex){
		let color = DataManager.getLightColor(lightIndex);
		let lightEntities = this.entities.lights[lightIndex];
		switch (color.color_mode) {
			case ColorMode.TEMPERATURE:
				if (color.temperature.temperature == undefined){
					for (let i=0; i < lightEntities.light_entities.length; i++){
						for (let j=0; j<lightEntities.light_entities[i].length; j++){
							lightEntities.light_entities[i][j].setAttribute("temperature", 
								"temperature", color.temperature.temperature_all
							);
						}
					}
				}else{

				}
				if (color.temperature.emissive_temperature == undefined){
					for (let i=0; i < lightEntities.object_entities.length; i++){
						for (let j=0; j<lightEntities.object_entities[i].length; j++){
							lightEntities.object_entities[i][j].setAttribute("emissive-temperature", 
								"temperature", color.temperature.emissive_temperature_all
							);
						}
					}
				}else{

				}
				break;
			case ColorMode.RGB_PRESET:
			case ColorMode.RGB:
				for (let i=0; i < lightEntities.light_entities.length; i++){
					for (let j=0; j<lightEntities.light_entities[i].length; j++){
						lightEntities.light_entities[i][j].setAttribute('light', 
							{ 'color': color.rgb_color }
						);
					}
				}
				for (let i=0; i < lightEntities.object_entities.length; i++){
					for (let j=0; j<lightEntities.object_entities[i].length; j++){
						lightEntities.object_entities[i][j].setAttribute('material', 
							{ 'emissive': color.rgb_color }
						);
					}
				}
				break;
		}
	},

	updateSun: function(){
		for (let i=0 ;i <this.entities.timeline.sun.length; i++){
			this.entities.timeline.sun[i].setAttribute('position', ScenarioData.timeline_data.sun.position);
		}
	},

	updateSky: function(){
		for (let i=0 ;i <this.entities.timeline.sky.length; i++){
			this.entities.timeline.sky[i].setAttribute('color', ScenarioData.timeline_data.sky.color);
		}
	},

	updateOtherObject: function(){
		let listEntities = this.entities.timeline.other_objects;
		let listObjectData = ScenarioData.timeline_data.other_objects;
		for (let i=0; i < listEntities.length; i++){
			if (listObjectData[i].position != null){
				for (let j=0; j<listEntities[i].length; j++){
					listEntities[i][j].setAttribute('position', listObjectData[i].position);
				}
			}
			if (listObjectData[i].rotation != null){
				for (let j=0; j<listEntities[i].length; j++){
					listEntities[i][j].setAttribute('rotation', listObjectData[i].rotation);
				}
			}
			if (listObjectData[i].scale != null){
				for (let j=0; j<listEntities[i].length; j++){
					listEntities[i][j].setAttribute('scale', listObjectData[i].scale);
				}
			}
		}
	},

	updateAllLight: function(){
		for (let i=0; i<ScenarioData.light_data.length; i++){
			this.updateLight(i);
		}
	},

	updateAll: function(){
		this.updateAllLight();
		this.updateSun();
		this.updateSky();
		this.updateOtherObject();
	}
};