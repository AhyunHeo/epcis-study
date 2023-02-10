var request = require('request');
require('dotenv').config({ path: "./src/config/.env" })

const capture = require('../src/capture/capture.js');
const test = require('test.js');

// const EPCIS_CAPTURE_END_POINT="http://localhost:8083/epcis/capture"

// exports.postepcis = (epcisDoc)=>{

//     request({
//         uri: EPCIS_CAPTURE_END_POINT,
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


capture.postepcis(test.epcisDoc)