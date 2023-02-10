// NodeJS에서 CSV 읽기

// 1) 모듈 추가----------------------------------------------------------
// fs와 path 모듈은 Node.js에 포함되어있기 때문에 따로 설치할 필요는 없다
const fs = require("fs");
const path = require("path");

// 2) CSV 파일 읽기------------------------------------------------------
const filename = "bunker_vessel_list_v20210408.csv";

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

// console.log(Object.keys(results).length);   // row 개수
// console.log(Object.keys(results[0]).length);   // col 개수


// 4) uuid create
const eventIdGen = require('./src/utili/eventIdGen.js.js');

// 5) epclist Automation
let alldata = []
let newdata = {}

results.forEach(function(element, index) {
  newdata = {
    "id": "urn:uuid" + eventIdGen.uuid(),
    "attributes": [
      { "id": "bunker:mmsi", 
        "attribute": "urn:epc:id:gsin:8801234." + results[index].bunker_mmsi},
      { "id": "bunker:imo", 
        "attribute": "urn:epc:id:gsin:8801234." + results[index].bunker_imo },
      { "id": "bunker:shipname", "attribute": results[index].bunker_shipname},
      { "id": "bunker:callsign", "attribute": results[index].bunker_callsign },
      { "id": "bunker:flag", "attribute": results[index].bunker_flag},
      { "id": "bunker:class", "attribute": results[index].bunker_class},
      { "id": "bunker:fristTimest", 
        "attribute":  results[index].bunker_first_timestamp },
      { "id": "bunker:lastTimest", 
        "attribute":  results[index].bunker_last_timestamp}

    ]
  }

  alldata.push(newdata)
});


// epcis Document
const epcisDoc = {
  "@context": ["https://ref.gs1.org/standards/epcis/2.0.0/epcis-context.jsonld",
      {"example": "http://ns.example.com/epcis/"},
      {"bunker": "http://schema.org/bunker"}
    ],

  "type": "EPCISDocument",
  "schemaVersion": "2.0",
  "creationDate": "2022-07-10T07:45:23.646Z",
  "epcisHeader": {
    "epcisMasterData": {
      "vocabularyList": [
        {
          "type": "urn:epcglobal:epcis:vtype:EPCClass",
          "vocabularyElementList": alldata
        }
      ]
    }
  },
  "epcisBody": {
    "eventList": []
  }
}


// console.log(alldatas);
console.log(alldata[0]);
// console.log(epcisDoc);




// var request = require('request');

// require('dotenv').config({ path: "./src/config/.env" })
// const examples = require(epcisDoc);

// const EPCIS_CAPTURE_END_POINT="http://localhost:8083/epcis/capture"

// exports.postepcis = (epcisDoc)=>{

//     request({
//         uri:process.env.EPCIS_CAPTURE_END_POINT,
//         method: 'POST',
//         body: epcisDoc,
//         json:true

//     }, function(error, response, body){
//         if (!error && response.statusCode == 200) {
//             console.log("response " , response.statusCode);
//         }
//         else{
//             console.log(error);
//         }
//       });

// }


