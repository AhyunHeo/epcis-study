const service3 = document.getElementById('service3');
const service3Section = document.getElementById('service3Section');
const s3QR1 = document.getElementById('s3-qr01');
const s3QR2 = document.getElementById('s3-qr02');
const s3bizStep = document.getElementById('s3-bizStep');
const s3company = document.getElementById('s3-company');
const createJSONButton3 = document.getElementById('s3-createJSON');
const contentDiv3 = document.getElementById('s3-content');
const s3result = document.getElementById('s3-result');


createJSONButton3.addEventListener('click', () => {
    // Check DL identifier
    const QR1Value = s2QR1.value
    const QR2Value = s2QR2.value
    const bizStepCBV = s3bizStep.value;
    const companyUCBV = s3company.value;

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
          "https://gs1.github.io/EPCIS/epcis-context.jsonld",
          {
              "MRO": "https://example.org/epcis"
          }
      ],
    "epcisBody" : {
      "eventList" : [
          {
          "eventTime": korNow,
          "eventTimeZoneOffset": "+09:00",
          "type": "ObjectEvent",
          "action": "OBSERVE",
          "bizStep": bizStepCBV,
          "epcList": [giaiDL],
          "readPoint": {"id": sglnDL},
          "bizLocation": {"id": "https://id.oliot.org/414/880123451006"} ,
          "MRO:company": companyUCBV
          }
      ]
    }
  };

    // Display the JSON data as a text box
    contentDiv3.innerHTML = `<textarea id="s3-txtArea" rows="25" cols="100">${JSON.stringify(jsonData, null, 2)}</textarea>`;

});

function httpPost3(){
        
    theUrl = "http://localhost:8091/epcis/v2/capture";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, false);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    // alert(theUrl);
    var body = document.getElementById("s3-txtArea").value;
    xmlHttp.send(body);
    var response = xmlHttp.responseText;
    console.log(response)
    // result.value = response;
    s3result.innerHTML = `<textarea readonly id="s3-txtArea" rows="25" cols="100" style="background-color: #eeeeee;">${response}</textarea>`;;

};