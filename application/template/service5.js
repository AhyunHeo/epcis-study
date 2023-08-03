// Get references to the button and input elements
const service5 = document.getElementById('service5');
const s5QR1 = document.getElementById('s5-qr01');
const s5QR2 = document.getElementById('s5-qr02');
const s5changeSgln = document.getElementById('s5-change-sgln');
const service5Section = document.getElementById('service5Section');
const contentDiv5 = document.getElementById('s5-content');
const s5result = document.getElementById('s5-result');
const createJSONButton5 = document.getElementById('s5-createJSON');

// Create a variable to store the status value from changeColor function
let currentStatus = 'available';

function changeColor(bed) {
  bed.classList.toggle('orange');
  currentStatus = bed.classList.contains('orange') ? 'active' : 'available';
  bed.setAttribute('data-status', currentStatus);
}


createJSONButton5.addEventListener('click', () => {
  
  // Update the JSON data
  const QR1Value = s5QR1.value
  const QR2Value = s5QR2.value
  
  let giaiDL;
  let sglnDL;
  
  if (QR1Value.includes("8004")) {
    giaiDL = QR1Value;
  } else if (QR1Value.includes("414") || QR1Value.includes("254")) {
    sglnDL = QR1Value;
  }
  if (QR2Value.includes("8004")) {
    giaiDL = QR2Value;
  } else if (QR2Value.includes("414") || QR2Value.includes("254")) {
    sglnDL = QR2Value;
  }
      
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const koreaTimeDiff = 9 * 60 * 60 * 1000; 
  const korNow = new Date(utc+koreaTimeDiff).toLocaleString('sv')

  const jsonData = {
    "type": "EPCISDocument",
    "schemaVersion": "2.0",
    "creationDate": korNow,
    "@context": [
      "https://gs1.github.io/EPCIS/epcis-context.jsonld"
    ],
    "epcisBody": {
      "eventList": [
          {
            "eventTime": korNow,
            "eventTimeZoneOffset": "+09:00",
            "type": "ObjectEvent",
            "action": "OBSERVE",
            "bizStep": "accepting",
            "disposition": currentStatus,
            "epcList": [giaiDL],
            "readPoint": { "id": sglnDL },
            "bizLocation": {
              "id": "https://id.oliot.org/414/880123451006"
            }
        }
      ]
    }
  };

    // Display the JSON data as a text box
    contentDiv5.innerHTML = `<textarea id="s5-txtArea" rows="25" cols="100">${JSON.stringify(jsonData, null, 2)}</textarea>`;

});


function httpPost5(){
    theUrl = "http://localhost:8091/epcis/v2/capture";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, false); // false for synchronous requestddd
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    // alert(theUrl);
    var body = document.getElementById("s5-txtArea").value;
    xmlHttp.send(body);
    var response = xmlHttp.responseText;
    console.log(response)
    // result.value = response;
    s5result.innerHTML = `<textarea readonly id="s5-txtArea" rows="25" cols="100" style="background-color: #eeeeee;">${response}</textarea>`;;

};