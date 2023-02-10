var request = require('request');

require('dotenv').config({ path: "../config/.env" })


const examples = require('./examples');


exports.postepcis = (epcisDoc)=>{

    request({
        uri:process.env.EPCIS_CAPTURE_END_POINT,
        method: 'POST',
        body: epcisDoc,
        json:true

    }, function(error, response, body){
        console.log('---------checked-get-func---------')
        if (!error && response.statusCode == 200) {
            console.log('---------checked---------')
            console.log("response " , response.statusCode);
        }
        else{
            console.log(error);
        }
      });

}


