// Get references to the button and input elements
const service2 = document.getElementById('service2');
const service2Section = document.getElementById('service2Section');
const s2QR1 = document.getElementById('s2-qr01');
const s2QR2 = document.getElementById('s2-qr02');
const s2bizStep = document.getElementById('s2-bizStep');
const s2company = document.getElementById('s2-company');
const s2manager = document.getElementById('s2-manager');
const s2contact = document.getElementById('s2-contact');
const s2contents = document.getElementById('s2-contents');
const createJSONButton2 = document.getElementById('s2-createJSON');
const contentDiv2 = document.getElementById('s2-content');
const s2result = document.getElementById('s2-result');


createJSONButton2.addEventListener('click', () => {
    // Check DL identifier
    const QR1Value = s2QR1.value
    const QR2Value = s2QR2.value
    const bizStepCBV = s2bizStep.options[s2bizStep.selectedIndex].getAttribute("value1");
    const dispositionCBV = s2bizStep.options[s2bizStep.selectedIndex].getAttribute("value2");
    const nextBizStepCBV = s2bizStep.options[s2bizStep.selectedIndex].getAttribute("value3");
    const nextDispositionCBV = s2bizStep.options[s2bizStep.selectedIndex].getAttribute("value4");
    const company = s2company.value;
    const manager = s2manager.value;
    const contact = s2contact.value;
    const contents = s2contents.value;

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

    let eventlist = [
        {
        "eventTime": korNow,
        "eventTimeZoneOffset": "+09:00",
        "type": "ObjectEvent",
        "action": "OBSERVE",
        "bizStep": bizStepCBV,
        "disposition": dispositionCBV,
        "epcList": [giaiDL],
        "readPoint": {"id": sglnDL},
        "bizLocation": {"id": "https://id.oliot.org/414/880123451006"}
        },
        {
          "eventTime": korNow,
          "eventTimeZoneOffset": "+09:00",
          "type": "ObjectEvent",
          "action": "OBSERVE",
          "bizStep": nextBizStepCBV,
          "disposition": nextDispositionCBV,
          "epcList": [giaiDL],
          "readPoint": {"id": sglnDL},
          "bizLocation": {"id": "https://id.oliot.org/414/880123451006"} ,
          "MRO:company": company,
          "MRO:manager": manager,
          "MRO:contact": contact,
          "MRO:contents": contents
          }
    ];
    
    if ((nextBizStepCBV == null) && (nextDispositionCBV == null)) {
        eventlist = [
            {
            "eventTime": korNow,
            "eventTimeZoneOffset": "+09:00",
            "type": "ObjectEvent",
            "action": "OBSERVE",
            "bizStep": bizStepCBV,
            "disposition": dispositionCBV,
            "epcList": [giaiDL],
            "readPoint": {"id": sglnDL},
            "bizLocation": {"id": "https://id.oliot.org/414/880123451006"},
            "MRO:company": company,
            "MRO:manager": manager,
            "MRO:contact": contact,
            "MRO:contents": contents
            }
        ]
      } else if (nextDispositionCBV == null) {
        eventlist = [
            {
            "eventTime": korNow,
            "eventTimeZoneOffset": "+09:00",
            "type": "ObjectEvent",
            "action": "OBSERVE",
            "bizStep": bizStepCBV,
            "disposition": dispositionCBV,
            "epcList": [giaiDL],
            "readPoint": {"id": sglnDL},
            "bizLocation": {"id": "https://id.oliot.org/414/880123451006"}
            },
            {
              "eventTime": korNow,
              "eventTimeZoneOffset": "+09:00",
              "type": "ObjectEvent",
              "action": "OBSERVE",
              "bizStep": nextBizStepCBV,
              "epcList": [giaiDL],
              "readPoint": {"id": sglnDL},
              "bizLocation": {"id": "https://id.oliot.org/414/880123451006"} ,
              "MRO:company": company,
              "MRO:manager": manager,
              "MRO:contact": contact,
              "MRO:contents": contents
              }
        ]
      };

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
      "eventList" : eventlist
    }
    };


    // Display the JSON data as a text box
    contentDiv2.innerHTML = `<textarea id="s2-txtArea" rows="25" cols="100">${JSON.stringify(jsonData, null, 2)}</textarea>`;

});

function httpPost2(){
        
    theUrl = "http://localhost:8091/epcis/v2/capture";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", theUrl, false); // false for synchronous requestddd
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    // alert(theUrl);
    var body = document.getElementById("s2-txtArea").value;
    xmlHttp.send(body);
    var response = xmlHttp.responseText;
    console.log(response)
    // result.value = response;
    s2result.innerHTML = `<textarea readonly id="s2-txtArea" rows="25" cols="100" style="background-color: #eeeeee;">${response}</textarea>`;;

};