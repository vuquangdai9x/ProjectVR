var scenarioData;
var selectedScenarioIndex, selectedTime, selectedLightIndex;

var listLightImgUI, listScenarioImgUI, 
	scenarioNameUI, scenarioDescriptionUI,
	lightNameUI, lightDescriptionUI,
	lightStatusButton,
	lightPowerValueUI, lightPowerSliderUI,
	lightColorPreviewUI, lightTemperatureContainerUI, lightTemperatureSliderUI,
	listColorRgbContainerUI, selectColorRgbButtonUI, listColorRgbUI,
	timeInputSliderUI, timeInputUI, timeDescriptionUI;

function UI_mappingUI(){
	listLightImgUI = document.querySelector("#list-light-group > div"); //
	listScenarioImgUI = document.querySelector("#list-scenario");
	scenarioNameUI = document.querySelector("#config-scenario > h3");
	scenarioDescriptionUI = document.querySelector("#config-scenario > p");
	lightNameUI = document.querySelector("#light-group-info > h3");	
	lightDescriptionUI = document.querySelector("#light-group-description");
	lightStatusButton = document.querySelector("#light-group-info button :first-child");
	lightPowerValueUI = document.querySelector("#config-light-power > p");
	lightPowerSliderUI = document.querySelector("#config-light-power > input");
	lightColorPreviewUI = document.querySelector("#light-color-preview");
	lightTemperatureContainerUI = document.querySelector("#config-light-temperature");
	lightTemperatureSliderUI = document.querySelector("#config-light-temperature > input");
	listColorRgbContainerUI = document.querySelector("#config-light-color-rgb");
	selectColorRgbButtonUI = document.querySelector("#config-light-color-rgb > label");
	listColorRgbUI = []; // create later
	timeInputUI = document.querySelector("#input-time > input");
	timeInputSliderUI = document.querySelector("#input-time-slider > input");
	timeDescriptionUI = document.querySelector("#time-description");
}

function UI_setUpUI(scenario_data){
	scenarioData = scenario_data;

	UI_mappingUI();

	// set up list light menu
	let listLightConfig = scenarioData.light_prop.config;
	for (let i=0; i<listLightConfig.length; i++){
		let button = document.createElement("button");
		let imgUrl = listLightConfig[i].img;
		button.style.backgroundImage = "url("+imgUrl+")";
		button.addEventListener("click", ()=>{UI_selectLight(i);});
		button.addEventListener("mouseenter", ()=>{UI_previewLight(i);});
		button.addEventListener("mouseleave", ()=>{UI_previewLight(selectedLightIndex);});
		button.classList.add("button-hover-fade");
		listLightImgUI.appendChild(button);

		// set up list color preset
		let listColorPresetEl = document.createElement("div");
		let listColorPresetData = listLightConfig[i].color["list-rgb"];
		for (let j=0; j<listColorPresetData.length; j++){
			let colorItem = document.createElement("button");
			colorItem.style.backgroundColor = listColorPresetData[j];
			colorItem.classList.add("button-hover-fade");
			colorItem.addEventListener("click", ()=>{});
			colorItem.addEventListener("mouseenter", ()=>{});
			colorItem.addEventListener("mouseleave", ()=>{});
			listColorPresetEl.appendChild(colorItem);
		}
		listColorRgbContainerUI.appendChild(listColorPresetEl);
		listColorRgbUI.push(listColorPresetEl);
	}
	UI_selectLight(0);

	// set up list light scenario
	let listScenario = scenarioData.scenario.scenario;
	for (let i=0; i<listScenario.length; i++){
		let button = document.createElement("button");
		let imgUrl = listScenario[i].img;
		button.style.backgroundImage = "url("+imgUrl+")";
		button.addEventListener("click", ()=>{UI_selectScenario(i);});
		button.addEventListener("mouseenter", ()=>{UI_previewScenario(i);});
		button.addEventListener("mouseleave", ()=>{UI_previewScenario(selectedScenarioIndex);});
		button.classList.add("button-hover-fade");
		listScenarioImgUI.appendChild(button);
	}
	UI_selectScenario(0);

	UI_selectCurrentTime();
}

function UI_selectTime(time){
	if (!isNaN(time))
	{
		// ok
	}else if (time.match(/^\d{1,2}(:\d{1,2}){1,2}$/)){
		let time_splitted = time.split(":", 3);
		time = (parseInt(time_splitted[0])+parseInt(time_splitted[1])/60)*1000;
	}
	time = time % 24000;
	time = parseInt(time);
	selectedTime = time;

	SetTime(time);
	UI_updateTimeUI(time);
}

function UI_selectCurrentTime(){
	let today = new Date();
	let time = (parseInt(today.getHours()) + parseInt(today.getMinutes()) / 60) * 1000;
	time = parseInt(time);
	UI_selectTime(time);
}

function UI_getTimeStringFromValue(int_value, display_type = 0){
	let hour = parseInt(int_value / 1000);
	let minute = parseInt((int_value - hour*1000) * 60 / 1000);

	let time_string = "";
	switch (display_type) {
		case 0:
			if (minute == 0){
				time_string = hour + "h";
			}else{
				time_string = hour + "h" + minute;
			}
			break;
		case 1:
			if (hour < 10) hour = "0"+hour;
			if (minute < 10) minute = "0"+minute;
			time_string = hour + ":" + minute + ":00";
			break;
	}
	return time_string;
}

function UI_updateTimeUI(time){
	if (time < 0) time = 0;
	else if (time >= 24000) time = 24000-1;
	
	timeInputUI.value = UI_getTimeStringFromValue(time,1);
	timeInputSliderUI.value = time;

	let listNote = scenarioData.scenario.time.note;
	let noteIndex1, noteIndex2;
	if (time < listNote[0].time || time > listNote[listNote.length-1].time){
		noteIndex1 = listNote.length-1;
		noteIndex2 = 0;
	}else{
		for (let i=1; i<listNote.length; i++){
			if (listNote[i-1].time <= time && time <= listNote[i].time){
				noteIndex1 = i-1;
				noteIndex2 = i; 
				break;
			}
		}
	}
	timeDescriptionUI.innerHTML = "<b>" + UI_getTimeStringFromValue(listNote[noteIndex1].time) + "</b>" + ": " + listNote[noteIndex1].text
					+ "<br>"
					+ "<b>" + UI_getTimeStringFromValue(listNote[noteIndex2].time) + "</b>"  + ": " + listNote[noteIndex2].text;
}

function UI_selectScenario(index){
	selectedScenarioIndex = index;
	UI_previewScenario(index);
	SetScenario(scenarioData,index);
}
function UI_previewScenario(index){
	if (index < 0 || index >= scenarioData.scenario.scenario.length){
		index = 0;
	}
	scenarioNameUI.innerHTML = scenarioData.scenario.scenario[index].name;
	scenarioDescriptionUI.innerHTML = scenarioData.scenario.scenario[index].description;
}

function UI_selectLight(index){
	selectedLightIndex = index;
	UI_previewLight(index);
}

function UI_previewLight(index){
	if (index < 0 || index >= scenarioData.light_prop.config.length) return;
	let lightStaticData = scenarioData.light_prop.config[index];
	let lightData = scenarioData.list_light_config[index];

	// light info
	lightNameUI.innerHTML = lightStaticData.name;
	lightDescriptionUI.innerHTML = lightStaticData.description;

	// light status (on/off)
	if (GetLightIsOn(index)){
		lightStatusButton.classList.remove("lightbulb-off");
		lightStatusButton.classList.add("lightbulb-on");
	}else{
		lightStatusButton.classList.add("lightbulb-off");
		lightStatusButton.classList.remove("lightbulb-on");
	}

	// light power
	let lightPower = GetLightPower(index);
	lightPowerValueUI.innerHTML = parseInt(lightPower*100) + "%";
	lightPowerSliderUI.min = lightStaticData.power.min.value;
	lightPowerSliderUI.max = lightStaticData.power.max.value;
	lightPowerSliderUI.value = lightPower;

	// light color
	let lightColorData = GetLightColor(index);

	switch (lightColorData.color_mode) {
		case ColorMode.TEMPERATURE:
			lightColorPreviewUI.style.backgroundColor = getColorFromTemperature(lightColorData.temperature);
			break;
		case ColorMode.RGB_PRESET:
			lightColorPreviewUI.style.backgroundColor = lightStaticData.color["list-rgb"][lightColorData.rgb_preset_index];
			break;
		case ColorMode.RGB:
			lightColorPreviewUI.style.backgroundColor = lightColorData.rgb_color;
			break;
	}

	let isUseTemperature = lightStaticData.color["use-temperature"];
	if (isUseTemperature && lightTemperatureContainerUI.hidden){
		lightTemperatureContainerUI.hidden = false;
	}else if (!isUseTemperature && !lightTemperatureContainerUI.hidden){
		lightTemperatureContainerUI.hidden = true;
	}
	lightTemperatureSliderUI.min = lightStaticData.color.temperature.min.value;
	lightTemperatureSliderUI.max = lightStaticData.color.temperature.max.value;
	lightTemperatureSliderUI.value = lightColorData.temperature;

	let isUseRGBPreset = lightStaticData.color["use-rgb"];
	if (isUseRGBPreset && listColorRgbContainerUI.hidden){
		listColorRgbContainerUI.hidden = false;
	}else if (!isUseRGBPreset && !listColorRgbContainerUI.hidden){
		listColorRgbContainerUI.hidden = true;
	}

	for (let i=0; i<listColorRgbUI.length; i++){
		listColorRgbUI[i].hidden = !(i==index);
	}

	let isAllowSelectRGB = lightStaticData.color["allow-select-rgb"];
	if (isAllowSelectRGB && selectColorRgbButtonUI.hidden){
		selectColorRgbButtonUI.hidden = false;
	}else if (!isAllowSelectRGB && !selectColorRgbButtonUI.hidden){
		selectColorRgbButtonUI.hidden = true;
	}
}

function turnOffAllLights(){
	
}