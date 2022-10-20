let metar = require('../');

let umms = metar.parseMetar('METAR UMMS 081400Z 26002MPS 220V300 9999 -RA OVC030 07/06 Q1013 R31/290060 NOSIG');
let ummm = metar.parseMetar('METAR UMMM 081400Z 26003MPS 6000 -SHRA BKN018CB OVC100 07/06 Q1012 R30/290050 NOSIG RMK QFE740');
let ummg = metar.parseMetar('METAR UMMG 081300Z 00000MPS CAVOK -SHRA BKN030CB OVC066 08/07 Q1012 R17/CLRD// NOSIG');

test('message type parsing', () =>  {
	expect(umms).toHaveProperty('type', 'METAR');
	expect(ummm).toHaveProperty('type', 'METAR');
	expect(ummg).toHaveProperty('type', 'METAR');
});

test('message type parsing', () =>  {
	expect(umms).toHaveProperty('airport', 'UMMS');
	expect(ummm).toHaveProperty('airport', 'UMMM');
	expect(ummg).toHaveProperty('airport', 'UMMG');
});

test('time stamp parsing', () => {
	expect(umms.day).toBe(8);
	expect(umms.hour).toBe(14);
	expect(umms.min).toBe(0);

	expect(ummg.day).toBe(8);
	expect(ummg.hour).toBe(13);
	expect(ummg.min).toBe(0);

	let obj = metar.parseMetar('ENBN 150020Z VRB04KT 9999NDV FEW040/// 09/05 Q0999=');
	expect(obj).toHaveProperty('hour', 0);
});

test('end of message parsing', () => {
	let obj = metar.parseMetar('ENBN 142020Z 17007KT 9999 -SHRA SCT029 BKN041 09/05 Q1001=');
	expect(obj).toHaveProperty('qnh', 1001);
});

test('qnh parsing', () =>  {
	expect(umms).toHaveProperty('qnh', 1013);
	expect(ummm).toHaveProperty('qnh', 1012);
	expect(ummg).toHaveProperty('qnh', 1012);
});

test('visibility parsing', () =>  {
	expect(umms).toHaveProperty('visibility', 9999);
	expect(ummm).toHaveProperty('visibility', 6000);
	expect(ummg).toHaveProperty('visibility', 'CAVOK');
});

test('qfe parsing', () => {
	expect(ummm).toHaveProperty('qfe', 986);
});

test('wind parsing', () => {
	expect(umms.wind).toStrictEqual({
		speed: 2,
		course: '260',
		measure: 'MPS',
		deviation: {
			from: '220',
			to: '300'
		}
	});
});

test('weather parsing', () => {
	expect(umms.weather).toStrictEqual([{
		intensity: '-',
		condition: 'RA'
	}]);

	expect(ummm.weather).toStrictEqual([{
		intensity: '-',
		descriptor: 'SH',
		condition: 'RA'
	}]);

	expect(ummg.weather).toStrictEqual([{
		intensity: '-',
		descriptor: 'SH',
		condition: 'RA'
	}]);
});

test('clouds parsing', () => {
	expect(umms.clouds).toStrictEqual([{code: 'OVC', base: 30}]);

	expect(ummm.clouds).toStrictEqual([
		{code: 'BKN', base: 18, descriptor: 'CB'},
		{code: 'OVC', base: 100},
	]);

	expect(ummg.clouds).toStrictEqual([
		{code: 'BKN', base: 30, descriptor: 'CB'},
		{code: 'OVC', base: 66},
	]);

});

test('temperature parsing', () => {
	expect(umms).toMatchObject({temperature: 7, dewPoint: 6});
	expect(ummm).toMatchObject({temperature: 7, dewPoint: 6});
	expect(ummg).toMatchObject({temperature: 8, dewPoint: 7});
});

test('rvr parsing', () => {
	expect(umms.rvr).toEqual([{rwy: '31', visibility: 2900}]);
	expect(ummm.rvr).toEqual([{rwy: '30', visibility: 2900}]);
});

test('qnh parsing', () =>  {
	expect(umms).toHaveProperty('forecast', 'NOSIG');
	expect(ummm).toHaveProperty('forecast', 'NOSIG');
	expect(ummg).toHaveProperty('forecast', 'NOSIG');
});

test('modifier parsing', () => {
	let obj = metar.parseMetar('CWRJ 091900Z AUTO 24009KT 00/M04 RMK AO1 SLP226 T00001042 58002');
	expect(obj).toHaveProperty('modifier', 'AUTO');
});
