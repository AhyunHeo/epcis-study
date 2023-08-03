const service4 = document.getElementById('service4');
const service4Section = document.getElementById('service4Section');
const s4giai = document.getElementById('s4-giai');
const s4departSgln = document.getElementById('s4-depart-sgln');
const s4arriveSgln = document.getElementById('s4-arrive-sgln');
const s4departing = document.getElementById('s4-departing');
const loaderDiv4 = document.getElementById('s4-loader');
const createJSONButton4 = document.getElementById('s4-createJSON');
const contentDiv4 = document.getElementById('s4-content');
const s4result = document.getElementById('s4-result');


s4departing.addEventListener('click', () => {
    loaderDiv4.style.display = 'block';

    loaderDiv4.innerHTML = `<button class="btn btn-primary" style="margin-left: 10px;" type="button" disabled>
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    배송중...</button>`;
});

createJSONButton4.addEventListener('click', () => {

    loaderDiv4.style.display = 'none';

    // Generate JSON data
    const giaiDL = s4giai.value;
    const depart_sglnDL = s4departSgln.value;
    const arrive_sglnDL = s4arriveSgln.value;

    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const koreaTimeDiff = 9 * 60 * 60 * 1000; 
    const korNow = new Date(utc+koreaTimeDiff).toLocaleString('sv')

    const jsonData = { "type": "EPCISDocument",
    "schemaVersion": "2.0",
    "creationDate": korNow,
    "@context": [
          "https://gs1.github.io/EPCIS/epcis-context.jsonld"
      ],
    "epcisBody" : {
      "eventList" : [
          {
          "eventTime": korNow,
          "eventTimeZoneOffset": "+09:00",
          "type": "ObjectEvent",
          "action": "OBSERVE",
          "bizStep": "departing",
          "disposition": "in_transit",
          "epcList": [giaiDL],
          "readPoint": {"id": depart_sglnDL},
          "bizLocation": {"id": "https://id.oliot.org/414/880123451006"}
          },
          {
          "eventTime": korNow,
          "eventTimeZoneOffset": "+09:00",
          "type": "ObjectEvent",
          "action": "OBSERVE",
          "bizStep": "arriving",
          "epcList": [giaiDL],
          "readPoint": {"id": arrive_sglnDL},
          "bizLocation": {"id": "https://id.oliot.org/414/880123451006"}
          }
      ]
    }
  };

    // Display the JSON data as a text box
    contentDiv4.innerHTML = `<textarea id="s4-txtArea" rows="25" cols="100">${JSON.stringify(jsonData, null, 2)}</textarea>`;

});



function httpPost4(){
        
    theUrl = "http://localhost:8091/epcis/v2/capture";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, false); // false for synchronous requestddd
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    // alert(theUrl);
    var body = document.getElementById("s4-txtArea").value;
    xmlHttp.send(body);
    var response = xmlHttp.responseText;
    console.log(response)
    // result.value = response;
    s4result.innerHTML = `<textarea readonly id="s4-txtArea" rows="25" cols="100" style="background-color: #eeeeee;">${response}</textarea>`;;

};