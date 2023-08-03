// Get references to the button and input elements
const service1 = document.getElementById('service1');
const s1QR1 = document.getElementById('s1-qr01');
const s1QR2 = document.getElementById('s1-qr02');
const s1changeSgln = document.getElementById('s1-change-sgln');
const service1Section = document.getElementById('service1Section');
const contentDiv1 = document.getElementById('s1-content');
const createJSONButton1 = document.getElementById('s1-createJSON');
const s1result = document.getElementById('s1-result');


createJSONButton1.addEventListener('click', () => {
    
    // Check DL identifier
    const QR1Value = s1QR1.value
    const QR2Value = s1QR2.value
    const changeSglnDL = s1changeSgln.value;
    
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

    // Generate JSON data
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
          "bizStep": "accepting",
          "epcList": [giaiDL],
          "readPoint": {"id": sglnDL},
          "bizLocation": {"id": "https://id.oliot.org/414/880123451006"},
          "sourceList":[
              {  "type":"location", 
                  "source":sglnDL
              }],
          "destinationList":[
              {  "type":"location", 
                  "destination":changeSglnDL
              }]
          }
      ]
    }
  };

    // Display the JSON data as a text box
    contentDiv1.innerHTML = `<textarea id="s1-txtArea" rows="25" cols="100">${JSON.stringify(jsonData, null, 2)}</textarea>`;

});

function httpPost1(){
        
    theUrl = "http://localhost:8091/epcis/v2/capture";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, false); // false for synchronous requestddd
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    // alert(theUrl);
    var body = document.getElementById("s1-txtArea").value;
    xmlHttp.send(body);
    var response = xmlHttp.responseText;
    console.log(response)
    // result.value = response;
    s1result.innerHTML = `<textarea readonly id="s1-txtArea" rows="25" cols="100" style="background-color: #eeeeee;">${response}</textarea>`;;

};