// Event Data-------------------------------------------------------
var counter = 0
const capture = require('./capture.js')

function epcis_test() {

  const fs = require("fs");
  const path = require("path");

  const filename = "bunker_encounters_v20210408.csv";

  const csvPath = path.join(__dirname, '..', '..','data', filename);

  const csv = fs.readFileSync(csvPath, "utf-8");

  const rows = csv.split("\r\n");

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

  // 4) uuid create
  const eventIdGen = require('../utili/eventIdGen.js');

  // 5) epclist Automation
  let alldata = []
  let newdata = {}
  
  results.forEach( function(element, index) {
    var date = results[index].event_start

  newdata = {
    "type": "ObjectEvent",
    "eventTime": new Date(date),  //results[index].event_start
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
  if (counter == 5) {
    return false;
  }
  counter++

  let test_doc = {}

  test_doc = {
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
  
  // console.log(test_doc)
  alldata = []
  //return test_doc;
  capture.postepcis(test_doc)

  })

}

module.exports.epcis_test = epcis_test;



// ------------------------------------------------------------------
// Master Data-------------------------------------------------------


var counter_m = 0

function epcis_master_test() {

  const fs = require("fs");
  const path = require("path");

  const filename = "bunker_vessel_list_v20210408.csv";

  const csvPath = path.join(__dirname, '..', '..','data', filename);

  const csv = fs.readFileSync(csvPath, "utf-8");

  const rows = csv.split("\r\n");

  let results_m = []
  let columnTitle_m = []

  for (const i in rows) {
    const row = rows[i]
    const data = row.split(",")
    if (i === "0") {
      columnTitle_m = data
    } else {
      let row_data_m = {}
      for (const index in columnTitle_m) {
          const title = columnTitle_m [index]
          row_data_m[title] = data[index]
      }
      results_m.push(row_data_m)
    }
  }

  // 4) uuid create
  const eventIdGen = require('../utili/eventIdGen.js');

  // 5) epclist Automation
  let alldata_m = []
  let newdata_m = {}
  
  results_m.forEach( function(element, index) {

    newdata_m = {
    "id": "urn:uuid:" + eventIdGen.uuid(),
    "attributes": [
      { "id": "bunker:mmsi", 
        "attribute": "urn:epc:id:gsin:8801234." + results_m[index].bunker_mmsi},
      { "id": "bunker:imo", 
        "attribute": "urn:epc:id:gsin:8801234." + results_m[index].bunker_imo },
      { "id": "bunker:shipname", "attribute": results_m[index].bunker_shipname},
      { "id": "bunker:callsign", "attribute": results_m[index].bunker_callsign },
      { "id": "bunker:flag", "attribute": results_m[index].bunker_flag},
      { "id": "bunker:class", "attribute": results_m[index].bunker_class},
      { "id": "bunker:fristTimest", 
        "attribute":  results_m[index].bunker_first_timestamp },
      { "id": "bunker:lastTimest", 
        "attribute":  results_m[index].bunker_last_timestamp}
    ]
  }

  alldata_m.push(newdata_m)
  if (counter_m == 5) {
    return false;
  }
  counter_m++

  let master_test_doc = {}

  master_test_doc = {
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
            "vocabularyElementList": alldata_m
          }
        ]
      }
    },
    "epcisBody": {
      "eventList": []
    }
  }
  
 
  alldata_m = []

  capture.postepcis(master_test_doc)

  })

}

module.exports.epcis_master_test = epcis_master_test;