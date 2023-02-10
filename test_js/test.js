// NodeJS에서 CSV 읽기

// 1) 모듈 추가----------------------------------------------------------
// fs와 path 모듈은 Node.js에 포함되어있기 때문에 따로 설치할 필요는 없다
const fs = require("fs");
const path = require("path");

// 2) CSV 파일 읽기------------------------------------------------------
const filename = "bunker_encounters_v20210408.csv";

// __dirname : 현재위치 가져오기
// path 모듈 join 메소드 : 현재위치의 data 폴더에서 filename 파일 패스 지정
const csvPath = path.join(__dirname, '/','data', filename);
// console.log(csvPath);

// csvPath를 utf-8 인코딩 방식으로 지정
const csv = fs.readFileSync(csvPath, "utf-8");

// 3) row를 list로 split 하기--------------------------------------------
const rows = csv.split("\r\n");
// console.log(rows)

let results = []
let columnTitle = []
for (const i in rows) {
  const row = rows [i]
  const data = row.split(",")
  if (i === "0") {
    columnTitle = data
  } else {
    let row_data = {}
    for (const index in columnTitle) {
        const title = columnTitle [index]
        row_data[title] = data [index]
    }
    results.push(row_data)
  }
}
// console.log(results[0]['event'])

// console.log(Object.keys(results).length);   // row 개수 : 14589
// console.log(Object.keys(results[0]).length);   // col 개수 : 10


// 4) uuid create
const eventIdGen = require('./src/utili/eventIdGen.js.js');

// 5) epclist Automation
let alldata = []
let newdata = {}

results.forEach(function(element, index) {
  newdata = {
    "type": "ObjectEvent",
    "eventTime": results[index].event_start,
    "eventTimeZoneOffset": "-06:00",
    "eventID": "urn:uuid:" + eventIdGen.uuid(),
    "epcList": [
      "urn:epc:id:gsin:8801234." + results[index].bunker_ssvid,
      "urn:epc:id:gsin:8801234." + results[index].neighbor_ssvid
    ],
    "action": "OBSERVE",
    "bizStep": "ecounter-ex:bizStep-ecounter",
  
    "readPoint": {"id": "geo:" + results[index].mean_latitude + "," + results[index].mean_longitude},
    "bizLocation": {"id": "geo:" + results[index].mean_latitude + "," + results[index].mean_longitude},
  
    "encounter:eventid" : results[index].event,
    "encounter:eventendTime" : results[index].event_end,
    "encounter:distance-km" : results[index].median_distance_km,
    "encounter:speed-knots" : results[index].median_speed_knots,
    "encounter:duration-hr" : results[index].event_duration_hr
  }

  alldata.push(newdata)
});


// epcis Document
exports.epcisDoc = {
  "@context": 
    [
      "https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
      {"encounter":"http://example.com/encounter"}
    ],

  "type": "EPCISDocument",
  "schemaVersion": "2.0",
  "creationDate": new Date(),
  "epcisBody": 
    {
      "eventList": alldata
    }
}

// console.log(alldata);
// console.log(epcisDoc);

// console.log('epcList :' + epcisDoc.epcisBody.eventList[0].epcList);
// console.log('readPoint :' + epcisDoc.epcisBody.eventList[0].readPoint.id);
// console.log('bizLocation :' + epcisDoc.epcisBody.eventList[0].bizLocation.id);
