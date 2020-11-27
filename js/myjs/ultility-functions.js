function lerpColor(a, b, amount) {
	var ah = parseInt(a.replace(/#/g, ''), 16),
		ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
		bh = parseInt(b.replace(/#/g, ''), 16),
		br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
		rr = ar + amount * (br - ar),
		rg = ag + amount * (bg - ag),
		rb = ab + amount * (bb - ab);
	return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
};
var temperature_color_map = [
		{
			"name": "Darkness",
			"temp": 0,
			"rgb": "#000000"
		},
		{
			"name": "Candle",
			"temp": 1900,
			"rgb": "#ff9329"
		},
		{
			"name": "40W Tungsten",
			"temp": 2600,
			"rgb": "#ffc58f"
		},
		{
			"name": "100W Tungsten",
			"temp": 2850,
			"rgb": "#ffd6aa"
		},
		{
			"name": "Halogen",
			"temp": 3200,
			"rgb": "#fff1e0"
		},
		{
			"name": "Carbon Arc",
			"temp": 5200,
			"rgb": "#fffaf4"
		},
		{
			"name": "High Noon Sun",
			"temp": 5400,
			"rgb": "#fffffb"
		},
		{
			"name": "Direct Sunlight",
			"temp": 6000,
			"rgb": "#ffffff"
		}
	];
function getColorFromTemperature(temperature){
	let lerpValue, color;
	if (temperature < temperature_color_map[0].temp){
		color = temperature_color_map[0].rgb;
	}
	else if (temperature >= temperature_color_map[temperature_color_map.length-1].temp){
		color = temperature_color_map[temperature_color_map.length-1].rgb;
	}
	else{
		for (let i=1; i<temperature_color_map.length; i++){
			if (temperature_color_map[i-1].temp <= temperature && temperature <= temperature_color_map[i].temp){
				lerpValue = (temperature - temperature_color_map[i-1].temp)/(temperature_color_map[i].temp - temperature_color_map[i-1].temp);
				color = lerpColor(temperature_color_map[i-1].rgb,temperature_color_map[i].rgb,lerpValue);
				break;
			}
		}
	}
	return color;
}