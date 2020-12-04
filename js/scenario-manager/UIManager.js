var UIManager = {
	selectedScenarioIndex: -1, 
	selectedTime: -1, 
	selectedLightIndex: -1,
	mappingUI: function(){
		this.elementUI = {
			light:{
				menu: document.querySelector("#list-light-group > div"),
				name: document.querySelector("#light-group-info > h3"),
				description: document.querySelector("#light-group-description"),
				status_btn: document.querySelector("#light-group-info button :first-child"),
				power:{
					value: document.querySelector("#config-light-power > p"),
					slider: document.querySelector("#config-light-power > input")
				},
				color:{
					preview: document.querySelector("#light-color-preview"),
					temperature: {
						container: document.querySelector("#config-light-temperature"),
						slider: document.querySelector("#config-light-temperature > input")
					},
					preset: {
						container: document.querySelector("#config-light-color-rgb"),
						selectColorDirectly: document.querySelector("#config-light-color-rgb > label"),
						list: []
					}
				}
			},
			scenario:{
				menu: document.querySelector("#list-scenario"),
				name: document.querySelector("#config-scenario > h3"),
				description: document.querySelector("#config-scenario > p"),
			},
			time:{
				inputDirectly: document.querySelector("#input-time > input"),
				slider: document.querySelector("#input-time-slider > input"),
				note: document.querySelector("#time-description")
			}
		};
	},

	initUI: function(){
		this.mappingUI();
		let _self = this;

		// set up list light menu
		for (let i=0; i<ScenarioData.light_definition.length; i++){
			if (! ScenarioData.light_definition[i]["allow_config_manually"]) continue;

			let button = document.createElement("button");
			let imgUrl = ScenarioData.light_definition[i].img;
			button.style.backgroundImage = "url("+imgUrl+")";
			button.addEventListener("click", ()=>{_self.selectLight(i);});
			button.addEventListener("mouseenter", ()=>{_self.previewLight(i);});
			button.addEventListener("mouseleave", ()=>{_self.previewLight(_self.selectedLightIndex);});
			button.classList.add("button-hover-fade");
			this.elementUI.light.menu.appendChild(button);

			// set up list color preset
			let listColorPresetEl = document.createElement("div");
			let listColorPresetData = ScenarioData.light_definition[i].color["list-rgb"];
			for (let j=0; j<listColorPresetData.length; j++){
				let colorItem = document.createElement("button");
				colorItem.style.backgroundColor = listColorPresetData[j];
				colorItem.classList.add("button-hover-fade");
				colorItem.addEventListener("click", ()=>{_self.setLightColorPreset(j);});
				colorItem.addEventListener("mouseenter", ()=>{});
				colorItem.addEventListener("mouseleave", ()=>{});
				listColorPresetEl.appendChild(colorItem);
			}
			this.elementUI.light.color.preset.container.appendChild(listColorPresetEl);
			this.elementUI.light.color.preset.list.push(listColorPresetEl);
		}

		// set up list light scenario
		for (let i=0; i<ScenarioData.scenario.length; i++){
			let button = document.createElement("button");
			let imgUrl = ScenarioData.scenario[i].img;
			button.style.backgroundImage = "url("+imgUrl+")";
			button.addEventListener("click", ()=>{_self.selectScenario(i);});
			button.addEventListener("mouseenter", ()=>{_self.previewScenario(i);});
			button.addEventListener("mouseleave", ()=>{_self.previewScenario(_self.selectedScenarioIndex);});
			button.classList.add("button-hover-fade");
			this.elementUI.scenario.menu.appendChild(button);
		}

		this.selectLight(0);
		this.selectScenario(0);
		this.setCurrentTime();
	},

	/*
	//	time selection
	*/

	setTime: function(time){
		if (!isNaN(time))
		{
			// ok
		}else if (time.match(/^\d{1,2}(:\d{1,2}){1,2}$/)){
			let time_splitted = time.split(":", 3);
			time = (parseInt(time_splitted[0])+parseInt(time_splitted[1])/60)*1000;
		}
		time = time % 24000;
		time = parseInt(time);
		this.selectedTime = time;

		DataManager.setTime(time);
		SceneManager.updateAll();

		// update UI
		this.elementUI.time.inputDirectly.value = getTimeStringFromValue(this.selectedTime,1);
		this.elementUI.time.slider.value = this.selectedTime;
		this.elementUI.time.note.innerHTML = ScenarioData.timeline_data.note;
	},

	setCurrentTime: function(){
		let today = new Date();
		let time = (parseInt(today.getHours()) + parseInt(today.getMinutes()) / 60) * 1000;
		time = parseInt(time);
		this.setTime(time);
	},

	/*
	//	scenario selection
	*/

	// trigger when user click on scenario image
	selectScenario: function(index){
		if (index < 0 || index >= ScenarioData.scenario.length) index=0;
		this.selectedScenarioIndex = index;
		
		DataManager.setScenario(index);
		SceneManager.updateAll();

		this.previewScenario(index);
	},

	// trigger when user hover on scenario image, or when select scenario
	previewScenario: function(index){
		this.elementUI.scenario.name.innerHTML = ScenarioData.scenario[index].name;
		this.elementUI.scenario.description.innerHTML = ScenarioData.scenario[index].description;
	},

	/*
	//	light selection
	*/
	updateLightStatusUI: function(index){
		let _self = this;
		// light status (on/off)
		if (DataManager.getLightIsOn(_self.selectedLightIndex)){
			this.elementUI.light.status_btn.classList.remove("lightbulb-off");
			this.elementUI.light.status_btn.classList.add("lightbulb-on");
		}else{
			this.elementUI.light.status_btn.classList.add("lightbulb-off");
			this.elementUI.light.status_btn.classList.remove("lightbulb-on");
		}
	},
	updateLightPowerUI: function(){
		let _self = this;
		let lightDef = ScenarioData.light_definition[_self.selectedLightIndex];
		let lightPower = DataManager.getLightPower(_self.selectedLightIndex);
		this.elementUI.light.power.value.innerHTML = parseInt(lightPower.value*100) + "%";
		this.elementUI.light.power.slider.min = lightDef.power.min.value;
		this.elementUI.light.power.slider.max = lightDef.power.max.value;
		this.elementUI.light.power.slider.value = lightPower.value;
	},
	updateLightColorUI: function(){
		let _self = this;
		let lightDef = ScenarioData.light_definition[_self.selectedLightIndex];
		let lightColorData = DataManager.getLightColor(_self.selectedLightIndex);

		switch (lightColorData.color_mode) {
			case ColorMode.TEMPERATURE:
				this.elementUI.light.color.preview.style.backgroundColor = getColorFromTemperature(lightColorData.temperature.value);
				break;
			case ColorMode.RGB_PRESET:
			case ColorMode.RGB:
				this.elementUI.light.color.preview.style.backgroundColor = lightColorData.rgb_color;
				break;
		}

		this.elementUI.light.color.temperature.container.hidden = lightDef.color["use-temperature"];
		this.elementUI.light.color.temperature.slider.min = lightDef.color.temperature.min.value;
		this.elementUI.light.color.temperature.slider.max = lightDef.color.temperature.max.value;
		this.elementUI.light.color.temperature.slider.value = lightColorData.temperature.value;

		this.elementUI.light.color.preset.container.hidden = lightDef.color["use-rgb"];

		for (let i=0; i<this.elementUI.light.color.preset.list.length; i++){
			this.elementUI.light.color.preset.list[i].hidden = !(i==_self.selectedLightIndex);
		}

		this.elementUI.light.color.preset.selectColorDirectly.hidden = lightDef.color["allow-select-rgb"];
	},

	// trigger when user click on light image
	selectLight: function(index){
		if (index < 0 || index >= ScenarioData.light_data.length) return;
		this.selectedLightIndex = index;
		this.previewLight(index);
	},

	// trigger when user hover on light image, or when select light
	previewLight: function(index){
		let lightDef = ScenarioData.light_definition[index];
		let lightData = ScenarioData.light_data[index];

		// light info
		this.elementUI.light.name.innerHTML = lightDef.name;
		this.elementUI.light.description.innerHTML = lightDef.description;

		this.updateLightStatusUI();
		this.updateLightPowerUI();
		this.updateLightColorUI();
	},

	/*
	//	light config
	*/
	setStatusAllLight: function(isTurnOn){
		DataManager.setLightIsOnManuallyAll(isTurnOn);
		SceneManager.updateAllLight();
		this.previewLight();
	},
	toggleLightStatus: function(){
		let _self = this;
		let isLightOn = DataManager.getLightIsOn(_self.selectedLightIndex);
		this.setLightStatus(!isLightOn);
	},
	setLightStatus: function(isOn){
		let _self = this;
		DataManager.setLightIsOnManually(_self.selectedLightIndex, isOn);
		SceneManager.updateLightIsOn(_self.selectedLightIndex);
		this.updateLightStatusUI();
	},
	setLightPower: function(power){
		let _self = this;
		DataManager.setLightPowerManually(_self.selectedLightIndex, power);
		SceneManager.updateLightPower(_self.selectedLightIndex);
		this.updateLightPowerUI();
	},

	setLightTemperature: function(temperature){
		let _self = this;
		DataManager.setLightColorManually(_self.selectedLightIndex, ColorMode.TEMPERATURE, temperature);
		SceneManager.updateLightColor(_self.selectedLightIndex);
		this.updateLightColorUI();
	},
	setLightColorPreset: function(preset_index){
		let _self = this;
		DataManager.setLightColorManually(_self.selectedLightIndex, ColorMode.RGB_PRESET, preset_index);
		SceneManager.updateLightColor(_self.selectedLightIndex);
		this.updateLightColorUI();
	},
	setLightColorRGB: function(color){
		let _self = this;
		DataManager.setLightColorManually(_self.selectedLightIndex, ColorMode.RGB, color);
		SceneManager.updateLightColor(_self.selectedLightIndex);
		this.updateLightColorUI();
	},

	resetLight: function(){
		let _self = this;
		DataManager.resetLight(_self.selectedLightIndex);
		SceneManager.updateLight(_self.selectedLightIndex);
		this.previewLight(_self.selectedLightIndex);
	},

	resetAllLight: function(){
		let _self = this;
		DataManager.resetAllLight();
		SceneManager.updateAllLight();
		this.previewLight(_self.selectedLightIndex);
	}
}