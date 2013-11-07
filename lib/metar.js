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
			top: match[2]
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
		var weather = { condition: match[2] };
		if(!!match[1]) {
			weather.intensity = match[1];
		}
		
		obj.weather = obj.weather || [];
		obj.weather.push(weather);
	};
	
	var cloudsParser = function(obj, match) {
		var clouds = {
			code: match[1],
			base: parseInt(match[2])
		};
		
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
			var pos = 'L';
			if(rwy > 50) {
				rwy -= 50;
				pos = 'R';
			}
			
			rwy = ((rwy > 9) ? '' : '0') + rwy + pos
		}
		
		var rwyCond = {
			rwy: rwy,
			state: 1,
			coverage: 32,
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
		{ reg: /CALM/, parser: fullMatchParserFactory('wind') },
		{ reg: /VRB(\d\d)((KT)|(KMH)|(MPS))/, parser: windVariableParser },
		{ reg: /(\d\d\d)(\d\d)(G(\d\d))?((KT)|(KMH)|(MPS))/, parser: windParser },
		{ reg: /(\d\d\d)V(\d\d\d)/, parser: windRangeParser },
		{ reg: /CAVOK/, parser: fullMatchParserFactory('visibility') },
		{ reg: /^(\d{1,4})([A-Z]{1,3})?$/, parser: visibilityParser },
		{ reg: /^(A|Q)(\d\d(\.)?\d\d)$/, parser: qnhParser },
		{ reg: /(M)?(\d\d)\/(M)?(\d\d)/, parser: temperatureParser },
		{ reg: /^[A-Z]{5}$/, parser: fullMatchParserFactory('forecast') },
		{ reg: /^QBB(\d{3})$/, parser: cloudBaseParser },
		{ reg: /^QFE(\d{3})$/, parser: qfeParser },
		{ reg: /^(\+|-)?([A-Z]{2})$/, parser: weatherParser, many: true },
		{ reg: /^([A-Z]{3})(\d{3})$/, parser: cloudsParser, many: true },
		{ reg: /^(R\d\d(L|C|R)?)\/(\d\d\d\d)/, parser: rvrParser, many: true },
		{ reg: /^(\d\d)(\d)(\d)(\d\d)(\d\d)$/, parser: rwyConditionsParser, many: true },
		{ reg: /^RMK$/, parser: null }
	];

	global.parseMetar = function(metarString) {		
		var parts = metarString.split(/\s+/);
		var obj = {};
		
		for(var i = 0; i < mapping.length; i++) {
			var map = mapping[i];
			
			for(var j = 0; j < parts.length; j++) {
				var match = parts[j].match(map.reg);
				
				if(!!match) {
					if(!!map.parser) {
						map.parser(obj, match);
					}
					
					parts.splice(j, 1);
					
					if(!map.many) {
						break;
					} else {
						j--; // continue mapping
					}
				}
			}
		}
		
		return (Object.keys(obj).length > 0) ? obj : null;
    };
})((typeof window === 'undefined') ? module.exports : window);
