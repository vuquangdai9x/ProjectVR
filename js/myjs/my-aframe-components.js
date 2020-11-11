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
		targetLight: {type: 'selectorAll'},
	},
	init: function () {
		var _self = this;
		let isLightOn = this.data.lightOn;
		console.log(this.data.targetLight.length);
		for (var i = 0; i < this.data.targetLight.length; i++) {
			this.data.targetLight[i].setAttribute("visible", isLightOn);
		}
		_self.el.setAttribute("material", {
			'emissiveIntensity': (isLightOn?1.0:0.0)
		});
		this.el.addEventListener('click', function () {
			_self.toggleLight();
		});
	},
	toggleLight: function() {
		let isLightOn = !this.data.lightOn;
		this.data.lightOn = isLightOn;
		for (var i = 0; i < this.data.targetLight.length; i++) {
			this.data.targetLight[i].setAttribute("visible", isLightOn);
		}
		this.el.setAttribute("material", {
			'emissiveIntensity': (isLightOn?1.0:0.0)
		});
	}
});