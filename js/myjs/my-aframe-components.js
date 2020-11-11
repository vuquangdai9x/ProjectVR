AFRAME.registerComponent('update-shadowmap-when-loaded', {
	init: function () {
		var _self = this;
		this.el.addEventListener('loaded', function () {
			console.log("loaded");
			_self.el.sceneEl.renderer.shadowMap.needsUpdate = true;
		});
		this.el.addEventListener('model-loaded', function () {
			console.log("model-loaded");
			_self.el.sceneEl.renderer.shadowMap.needsUpdate = true;
		});
	},
});

AFRAME.registerComponent('update-shadowmap-on-change-prop', {
	init: function () {
		var _self = this;
		this.el.addEventListener('componentchanged', function () {
			_self.el.sceneEl.renderer.shadowMap.needsUpdate = true;
		});
	},
});

AFRAME.registerComponent('click-to-toggle-light', {
	schema: {
		lightOn: {type: 'boolean', default: true},
		targetLight: {type: 'selector'},
		colorWhenLightOn: {type: 'color', default: '#fff'},
		colorWhenLightOff: {type: 'color', default: '#777'}
	},
	init: function () {
		var _self = this;
		let isLightOn = this.data.lightOn;
		this.data.targetLight.setAttribute("visible", isLightOn);
		_self.el.setAttribute("material", {
			'color': (isLightOn?_self.data.colorWhenLightOn:_self.data.colorWhenLightOff)
		});
		this.el.addEventListener('click', function () {
			let isLightOn = !_self.data.lightOn;
			_self.data.lightOn = isLightOn;
			_self.data.targetLight.setAttribute("visible", isLightOn);
			_self.el.setAttribute("material", {
				'color': (isLightOn?_self.data.colorWhenLightOn:_self.data.colorWhenLightOff)
			});
		});
	},
});