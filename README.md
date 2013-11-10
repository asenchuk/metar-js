# metar-js

METAR weather information parser

## Example

```javascript
$ npm install metar-js
$ node
> require('metar-js').parseMetar('UMMS 101530Z 36003MPS 9999 FEW007 OVC020 06/05 Q1007 R31/290060 NOSIG')
{ airport: 'UMMS',
  hour: 15,
  min: 30,
  day: 10,
  wind: 
   { course: '360',
     speed: 3,
     measure: 'MPS' },
  visibility: 9999,
  clouds: 
   [ { code: 'FEW', base: 7 },
     { code: 'OVC', base: 20 } ],
  temperature: 6,
  dewPoint: 5,
  qnh: 1007,
  rvr: [ { rwy: '31', visibility: 2900 } ],
  forecast: 'NOSIG',
  type: 'METAR' }
```
