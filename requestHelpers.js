// requestHelpers contains all of the functions that make http requests to HANA services 

var request = require('request'); 

// hosts for XSJS services 
var host = 'https://iccindiacsdsearchi321994trial.hanatrial.ondemand.com'; 
var hostUnique = host + '/iqs/getBy_unique.xsjs'; 
//var hostUnique_ByDate = host + '/iqs/getBy_uniqueByDate.xsjs'; 
var hostUnique_ByHits = host + '/iqs/getBy_uniqueByHits.xsjs'; 
var hostUnique_CompletedByDate = host + '/iqs/getBy_uniqueCompletedByDate.xsjs'; 
var hostUnique_CompletedByHits = host + '/iqs/getBy_uniqueCompletedByHits.xsjs'; 
var hostBlanking = host + '/iqs/getBy_blanking.xsjs'; 
var hostBlanking_Ordered = host + '/iqs/getBy_blankingOrdered.xsjs'; 
var hostBlanking_CompletedOrdered = host + '/iqs/getBy_blankingCompletedOrdered.xsjs'; 
//var hostBlanking_CompletedOrdered = host + '/iqs/getBy_blankingOrdered.xsjs'; 

var hostNum = host + '/iqs/getBy_number.xsjs'; 


// request for hostBlanking service, calls 'callback' function 
function requestGetBlanking(query, callback) {

	// var url = hostBlanking + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date, slotValue_solution); 

//	var url = hostBlanking + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

	var url = hostBlanking + query; 


    request(url, function(error, response, body) { 

    	console.log(url); 
        console.log('error: ', error); 
        console.log('statusCode: ', response && response.statusCode); 
        console.log('body: ', body); 
        callback(JSON.parse(body)); 

    }); 


}



// request for hostBlankingOrdered service, calls 'callback' function 
function requestGetBlanking_CompletedOrdered(query, callback) {

	// var url = hostBlanking + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date, slotValue_solution); 

	// var url = hostBlanking_Ordered + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

	 var url = hostBlanking_CompletedOrdered + query; 

    request(url, function(error, response, body) { 

    	console.log(url); 
        console.log('error: ', error); 
        console.log('statusCode: ', response && response.statusCode); 
        console.log('body: ', body); 
        callback(JSON.parse(body)); 

    }); 


} 

// request for hostBlankingOrdered service, calls 'callback' function 
function requestGetBlanking_Ordered(query, callback) {

    // var url = hostBlanking + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date, slotValue_solution); 

    // var url = hostBlanking_Ordered + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

     var url = hostBlanking_Ordered + query; 

    request(url, function(error, response, body) { 

        console.log(url); 
        console.log('error: ', error); 
        console.log('statusCode: ', response && response.statusCode); 
        console.log('body: ', body); 
        callback(JSON.parse(body)); 

    }); 


}


// request for hostUnique service, calls 'callback' function. 
function requestGetUnique(query, callback) {

//	var url = hostUnique + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date, slotValue_solution); 

//	var url = hostUnique + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

	var url = hostUnique + query; 


    request(url, function(error, response, body) { 

    	console.log(url); 
        console.log('error: ', error); 
        console.log('statusCode: ', response && response.statusCode); 
        console.log('body: ', body); 
        callback(JSON.parse(body)); 

    }); 


}

// request for hostUnique_byDate service, calls 'callback' function. 
function requestGetUnique_CompletedByDate(query, callback) {

//	var url = hostUnique + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date, slotValue_solution); 

//	var url = hostUnique_byDate  + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

	var url = hostUnique_CompletedByDate  + query; 

    request(url, function(error, response, body) { 

    	console.log(url); 
        console.log('error: ', error); 
        console.log('statusCode: ', response && response.statusCode); 
        console.log('body: ', body); 
        callback(JSON.parse(body)); 

    }); 


}


// request for hostUnique_ByHits service, calls 'callback' function. 
function requestGetUnique_ByHits(query, callback) {

//  var url = hostUnique + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date, slotValue_solution); 

//  var url = hostUnique_ByHits  + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

    var url = hostUnique_ByHits  + query; 

    request(url, function(error, response, body) { 

        console.log(url); 
        console.log('error: ', error); 
        console.log('statusCode: ', response && response.statusCode); 
        console.log('body: ', body); 
        callback(JSON.parse(body)); 

    }); 


}


// request for hostUnique_ByHits service, calls 'callback' function. 
function requestGetUnique_CompletedByHits(query, callback) {

//	var url = hostUnique + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date, slotValue_solution); 

//	var url = hostUnique_ByHits  + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

	var url = hostUnique_CompletedByHits  + query; 

    request(url, function(error, response, body) { 

    	console.log(url); 
        console.log('error: ', error); 
        console.log('statusCode: ', response && response.statusCode); 
        console.log('body: ', body); 
        callback(JSON.parse(body)); 

    }); 


}


// request for hostNum service, calls 'callback' function. 
function requestGetNum(query, callback) {

	// var url = hostNum + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date, slotValue_solution); 

	// var url = hostNum + format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

	var url = hostNum + query; 

    request(url, function(error, response, body) { 

    	console.log(url); 
        console.log('error: ', error); 
        console.log('statusCode: ', response && response.statusCode); 
        console.log('body: ', body); 
        callback(JSON.parse(body)); 

    }); 


}

 module.exports = { 

    requestGetBlanking: requestGetBlanking, 
    requestGetBlanking_CompletedOrdered: requestGetBlanking_CompletedOrdered, 
    requestGetUnique: requestGetUnique, 
    requestGetUnique_CompletedByDate: requestGetUnique_CompletedByDate, 
    requestGetUnique_CompletedByHits: requestGetUnique_CompletedByHits, 
    requestGetUnique_ByHits : requestGetUnique_ByHits, 
    requestGetNum: requestGetNum 

 }; 