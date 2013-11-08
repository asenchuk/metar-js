var metar = require('../');

var umms = metar.parseMetar('METAR UMMS 081400Z 26002MPS 220V300 9999 -RA OVC030 07/06 Q1013 R31/290060 NOSIG');
var ummm = metar.parseMetar('METAR UMMM 081400Z 26003MPS 6000 -SHRA BKN018CB OVC100 07/06 Q1012 R30/290050 NOSIG RMK QFE740');
var ummg = metar.parseMetar('METAR UMMG 081300Z 00000MPS 8000 -SHRA BKN030CB OVC066 08/07 Q1012 R17/CLRD// NOSIG');
var uuee = metar.parseMetar('UUEE 081400Z 21003MPS CAVOK 05/03 Q1011 75000062 25000062 NOSIG');
var uuww = metar.parseMetar('UUWW 081400Z 19003MPS CAVOK 05/02 Q1012 19000070 NOSIG');
var uudd = metar.parseMetar('UUDD 081400Z 25002MPS 220V300 CAVOK 05/02 Q1012 32010095 82010095 NOSIG');

exports.testAirportCodeParsing = function(test) {
	test.equal(umms.airport, 'UMMS');
	test.equal(ummm.airport, 'UMMM');
	test.equal(ummg.airport, 'UMMG');
	test.equal(uuee.airport, 'UUEE');
	test.equal(uuww.airport, 'UUWW');
	test.equal(uudd.airport, 'UUDD');
	test.done();
};

exports.testTimestampParsing = function(test) {
	test.equal(umms.day, 8);
	test.equal(umms.hour, 14);
	test.equal(umms.min, 0);
	
	test.equal(ummg.day, 8);
	test.equal(ummg.hour, 13);
	test.equal(umms.min, 0);
	
	test.done();
};

exports.testWindParsing = function(test) {
	test.equal(umms.wind.speed, 2);
	test.equal(umms.wind.course, 260);
	test.equal(umms.wind.measure, 'MPS');
	test.equal(umms.wind.deviation.from, 220);
	test.equal(umms.wind.deviation.to, 300);
	
	test.equal(uuee.wind.speed, 3);
	test.equal(uuee.wind.course, 210);
	test.equal(uuee.wind.measure, 'MPS');
	
	test.equal(uudd.wind.speed, 2);
	test.equal(uudd.wind.course, 250);
	test.equal(uudd.wind.measure, 'MPS');
	
	test.done();
};

exports.testVisibilityParser = function(test) {
	test.equal(umms.visibility, 9999);
	test.equal(ummm.visibility, 6000);
	test.equal(ummg.visibility, 8000);
	test.equal(uuee.visibility, 'CAVOK');
	test.equal(uuww.visibility, 'CAVOK');
	test.equal(uudd.visibility, 'CAVOK');
	
	test.done();
};
