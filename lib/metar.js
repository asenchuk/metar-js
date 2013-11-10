(function(global) {
	var messageTypes = {
		metar: 'METAR',
		sa: 'METAR',
		speci: 'SPECI',
		sp: 'SPECI'
	};
	
	var fullMatchParserFactory = function(key) {
		return function(obj, match) {
			obj[key] = match[0];
		};
	};
	
	var messageTypeParser = function(obj, match) {
		obj.type = messageTypes[match[0].toLowerCase()];
	};
	
	var timestampParser = function(obj, match) {
		var mins = match[3];
		if(mins) {
			obj.hour = parseInt(match[2]);
			obj.min = parseInt(mins);
			obj.day = parseInt(match[1]);
		} else {
			obj.hour = parseInt(match[1]);
			obj.min = parseInt(match[2]);
		}
	};
	
	var windVariableParser = function(obj, match) {
		obj.wind = {
			course: "VRB",
			speed: parseInt(match[1]),
			measure: parseInt(match[2])
		};
	};

	var windParser = function(obj, match) {
		obj.wind = obj.wind || {};
		obj.wind = {
			course: match[1],
			speed: parseInt(match[2]),
			measure: match[5]
		};
		
		var ghost = match[4];
		if(ghost) {
			obj.wind.ghost = parseInt(ghost);
		}
	};
	
	var windRangeParser = function(obj, match) {
		obj.wind = obj.wind || {};
		obj.wind.deviation = {
			from: match[1],
			to: match[2]
		};
	};
	
	var visibilityParser = function(obj, match) {
		var dist = parseInt(match[1]);
		var direction = match[2];
		if(!!direction) {
			obj.visibility = {
				distance: dist,
				direction: direction
			};
		} else {
			obj.visibility = dist;
		}
	};
	
	var qnhParser = function(obj, match) {
		var pressure = parseFloat(match[2]);
		if(match[1] === "A") {
			pressure = parseInt(pressure * 33.86 / (!!match[3] ? 1 : 100));
		}
		
		obj.qnh = pressure;
	};
	
	var temperatureParser = function(obj, match) {
		obj.temperature = (!!match[1] ? -1 : 1) * parseInt(match[2]);
		obj.dewPoint = (!!match[3] ? -1 : 1) * parseInt(match[4]);
	};
	
	var cloudBaseParser = function(obj, match) {
		obj.cloudBase = parseInt(match[1]);
	};
	
	var qfeParser = function(obj, match) {
		var pressure = parseInt(match[1]);
		obj.qfe = parseInt(pressure * 1013.25 / 760);
	};
	
	var weatherParser = function(obj, match) {
		var weather = { condition: match[3] };
		
		if(!!match[1]) {
			weather.intensity = match[1];
		}
		
		if(!!match[2]) {
			weather.descriptor = match[2];
		}
		
		obj.weather = obj.weather || [];
		obj.weather.push(weather);
	};
	
	var cloudsParser = function(obj, match) {
		var clouds = {
			code: match[1],
			base: parseInt(match[2])
		};
		
		if(!!match[3]) {
			clouds.descriptor = match[3];
		}
		
		obj.clouds = obj.clouds || [];
		obj.clouds.push(clouds);
	};
	
	var rvrParser = function(obj, match) {
		var rvr = {
			rwy: match[1],
			visibility: parseInt(match[3])
		};
		
		obj.rvr = obj.rvr || [];
		obj.rvr.push(rvr);
	};
	
	var rwyConditionsParser = function(obj, match) {
		var rwy = parseInt(match[1]);
		if(rwy != 88 && rwy != 99) {
			var pos = '';
			if(rwy > 50) {
				rwy -= 50;
				pos = 'R';
			}
			
			rwy = ((rwy > 9) ? '' : '0') + rwy + pos;
		}
		
		var rwyCond = {
			rwy: rwy,
			state: parseInt(match[2]),
			coverage: parseInt(match[3]),
			depth: parseInt(match[4]),
			frictionCoefficient: parseInt(match[5]) / 100
		};
		
		obj.rwyConditions = obj.rwyConditions || [];
		obj.rwyConditions.push(rwyCond);
	};
	
	var mapping = [
		{ reg: /(METAR)|(SA)|(SPECI)|(SP)/, parser: messageTypeParser },
		{ reg: /^[A-Z]{4}$/, parser: fullMatchParserFactory('airport') },
		{ reg: /(\d\d)(\d\d)(\d\d)?Z/, parser: timestampParser },
		{ reg: /(AUTO)|(COR)/, parser: fullMatchParserFactory('modifier') },
		{ reg: /CALM/, parser: fullMatchParserFactory('wind') },
		{ reg: /VRB(\d\d)((KT)|(KMH)|(MPS))/, parser: windVariableParser },
		{ reg: /(\d\d\d)(\d\d)(G(\d\d))?((KT)|(KMH)|(MPS))/, parser: windParser },
		{ reg: /(\d\d\d)V(\d\d\d)/, parser: windRangeParser },
		{ reg: /CAVOK/, parser: fullMatchParserFactory('visibility') },
		{ reg: /^(\d{1,4})([A-Z]{1,3})?$/, parser: visibilityParser },
		{ reg: /^(\+|-)?([A-Z]{2})?([A-Z]{2})$/, parser: weatherParser, many: true },
		{ reg: /SCK/, parser: fullMatchParserFactory('clouds') },
		{ reg: /^([A-Z]{3})(\d{3})([A-Z]{2,3})?$/, parser: cloudsParser, many: true },
		{ reg: /^(M)?(\d\d)\/(M)?(\d\d)$/, parser: temperatureParser },
		{ reg: /^(A|Q)(\d\d(\.)?\d\d)$/, parser: qnhParser },
		{ reg: /^R(\d\d(L|C|R)?)\/(\d\d\d\d)/, parser: rvrParser, many: true },
		{ reg: /^(\d\d)(\d)(\d)(\d\d)(\d\d)$/, parser: rwyConditionsParser, many: true },
		{ reg: /^[A-Z]{5}$/, parser: fullMatchParserFactory('forecast') },
		{ reg: /^QBB(\d{3})$/, parser: cloudBaseParser, remark: true },
		{ reg: /^QFE(\d{3})$/, parser: qfeParser, remark: true }
	];
	
	global.parseMetar = function(message) {
		var maps = mapping.slice(0); // clone maps
		var parts = message.split(/\s+/);
		var remark = false;
		var obj = {};
		
		for(var i in parts) {
			var part = parts[i];
			
			if(part === 'RMK') {
				remark = true;
				continue;
			}
			
			for(var j = 0; j < maps.length; j++) {
				var map = maps[j];
				
				if(!!map.remark != remark) {
					continue;
				}
				
				var match = part.match(map.reg);
				if(!!match) {
					map.parser(obj, match);
					
					if(!map.many) {
						maps.splice(j, 1);
					} 
					
					break;
				}
			}
		}
		
		if(!!obj.airport && !!obj.day && !!obj.hour) {
			obj.type = obj.type || messageTypes.metar;
		} else {
			obj = null;
		}
		
		return obj;
	};
})((typeof window === 'undefined') ? module.exports : window);
