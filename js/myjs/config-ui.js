var scenarioData;
var selectedScenarioIndex, selectedTime, selectedLightIndex;

var listLightImgUI, listScenarioImgUI, 
	scenarioNameUI, scenarioDescriptionUI,
	lightNameUI, lightDescriptionUI,
	lightStatusButton,
	lightPowerValueUI, lightPowerSliderUI;

function UI_mappingUI(){
	listLightImgUI = document.querySelector("#list-light-group > div");
	listScenarioImgUI = document.querySelector("#list-scenario");
	scenarioNameUI = document.querySelector("#config-scenario > h3");
	scenarioDescriptionUI = document.querySelector("#config-scenario > p");
	lightNameUI = document.querySelector("#light-group-info > h3");	
	lightDescriptionUI = document.querySelector("#light-group-description");
	lightStatusButton = document.querySelector("#light-group-info button :first-child");
	lightPowerValueUI = document.querySelector("#config-light-power > p");
	lightPowerSliderUI = document.querySelector("#config-light-power > input");
}

function UI_setUpUI(scenario_data){
	scenarioData = scenario_data;
	console.log(scenarioData);

	UI_mappingUI();

	// set up list light menu
	let listLightConfig = scenarioData.light_prop.config;
	for (let i=0; i<listLightConfig.length; i++){
		let button = document.createElement("button");
		let imgUrl = (listLightConfig[i].img != undefined) ? listLightConfig[i].img : scenarioData.light_prop.default.img;
		button.setAttribute("style", "background-image: url("+imgUrl+");");
		button.addEventListener("click", ()=>{UI_selectLight(i);});
		button.addEventListener("mouseenter", ()=>{UI_previewLight(i);});
		button.addEventListener("mouseleave", ()=>{UI_previewLight(selectedLightIndex);});
		button.classList.add("button-hover-fade");
		listLightImgUI.appendChild(button);
	}
	UI_selectLight(0);

	// set up list light scenario
	let listScenario = scenarioData.scenario.scenario;
	for (let i=0; i<listScenario.length; i++){
		let button = document.createElement("button");
		let imgUrl = (listScenario[i].img != undefined) ? listScenario[i].img : scenarioData.scenario.default["scenario-img"];
		button.setAttribute("style", "background-image: url("+imgUrl+");");
		button.addEventListener("click", ()=>{UI_selectScenario(i);});
		button.addEventListener("mouseenter", ()=>{UI_previewScenario(i);});
		button.addEventListener("mouseleave", ()=>{UI_previewScenario(selectedScenarioIndex);});
		button.classList.add("button-hover-fade");
		listScenarioImgUI.appendChild(button);
	}
	UI_selectScenario(0);
}

function UI_selectTime(time){

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
	let lightColorPreviewUI = document.querySelector("#light-color-preview");
	let lightTemperatureContainerUI = document.querySelector("#config-light-temperature");
	let lightTemperatureSliderUI = document.querySelector("#config-light-temperature > input");
	let listColorRgbUI = document.querySelector("#config-light-color-rgb");
	let selectColorRgbButtonUI = document.querySelector("#config-light-color-rgb > label");

	let lightColor = GetLightColor(index);
	let isUseTemperature = (lightStaticData.color["use-temperature"]!=undefined)?
								lightStaticData.color["use-temperature"]
								:scenarioData.light_prop.default.color["use-temperature"];
	let isUseRGBPreset = (lightStaticData.color["use-rgb"]!=undefined)?
								lightStaticData.color["use-rgb"]
								:scenarioData.light_prop.default.color["use-rgb"];
	let isAllowSelectRGB = (lightStaticData.color["allow-select-rgb"]!=undefined)?
								lightStaticData.color["allow-select-rgb"]
								:scenarioData.light_prop.default.color["allow-select-rgb"];
	if (isUseTemperature && lightTemperatureContainerUI.hasAttribute("hidden")){
		lightTemperatureContainerUI.removeAttribute("hidden");
	}else if (!isUseTemperature && !lightTemperatureContainerUI.hasAttribute("hidden")){
		lightTemperatureContainerUI.setAttribute("hidden","");
	}
	if (isUseRGBPreset && listColorRgbUI.hasAttribute("hidden")){
		listColorRgbUI.removeAttribute("hidden");
	}else if (!isUseRGBPreset && !listColorRgbUI.hasAttribute("hidden")){
		listColorRgbUI.setAttribute("hidden","");
	}

	if (lightStaticData["use-temperature"])
	switch (lightColor.color_mode) {
		case ColorMode.TEMPERATURE:

			break;
		case ColorMode.RGB_PRESET:
			break;
		case ColorMode.RGB:
			break;
	}
}

function turnOffAllLights(){

}