
var request = require('request');

const params= '?MATCH_epc=urn:epc:id:sgtin:0614141.107346.6089'

const uri_val=process.env.EPCIS_QUERY_END_POINT+params;
console.log(uri_val);

exports.getEPCIS2 = (epcisDoc)=>{

    const options = {
        //uri: "http://localhost:8084/epcis/resource/events?",
        //uri: 'http://localhost:8084/epcis/resource/events?MATCH_epc=urn:epc:id:sgtin:0614141.107346.6089'
        //uri: 'http://dfpl.sejong.ac.kr:8084/epcis/resource/events?MATCH_epc=urn:epc:id:sgtin:0614141.107346.6089'
        // uri: 'http://dfpl.sejong.ac.kr:8084/epcis/resource/events?eventType=ObjectEvent'
        uri: 'http://localhost:8084/epcis/resource/events?eventType=ObjectEvent'
    };

    request.get(options, function (error, response, body) {
        console.log('---------checked-get-func---------')
        if (!error) {
            console.log('---------checked-if---------')
            console.log("response " , response.statusCode);
            console.log(body);
        }
        else{
            console.log(error);
        }
    });

}

