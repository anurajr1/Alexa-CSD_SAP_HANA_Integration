// getHelpers contains functions that make calls to the SAP HANA Services through the requestHelpers module and 'emit' the results retrieved 

// formatHelpers contains functions that take in slot values or JSON objects with results and return a formatted string. 
var format = require('formatHelpers.js'); 

// requestHelpers contains all of the functions that make http requests to HANA services 
var request = require('requestHelpers.js'); 

// threshold for multiple results in the getResult_byDate, getCompanyName_ByHits, getCountry_ByHits .... (all functions _ByHits) functions
var resultThreshold = 10; 


// gets and emits a summary of certifications found at query, 'query', and emits the prompt, 'reprompt'. 
function getSummary(query, reference, reprompt) { 

	//var summary_after = "Say repeat summary to hear summary again, all to hear all results, select to select among these findings, start over to start over, cancel to cancel"; 
	// var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 

	// call request.requestGetUnique_CompletedByHits service. If you want to get some information about the dates, you will have to make another call. Just different order (should be the same size either service)=== GOOD CHECK TO HAVE: 
	request.requestGetUnique_ByHits(query, function(response){ 

		var names = response.resultsUnique.companyName; 
		var countries = response.resultsUnique.country; 
		var regions = response.resultsUnique.region; 
		var contents = response.resultsUnique.certificationScenario;  
		var solutions = response.resultsUnique.solution; 
		var dates = response.resultsUnique.date; 
		var statuses = response.resultsUnique.status; 


		// show the sliceContentLength most popular certifications 
		var sliceLength = 3; 
		var sliceContentLength; 

		if (contents.length < sliceLength) {
			sliceContentLength = contents.length; 
		}

		else {
			sliceContentLength = sliceLength; 
		}


		var outputText = 'These certifications include ' + names.length.toString() + ' different companies and are of regions: ' + format.listOffArrayElements(regions); 
		outputText += ' and countries, ' + format.listOffArrayElements(countries); 
		//outputText += 'As for the different certification scenarios they include' + listOffElements(contents); 
		outputText += ' The most popular certification scenarios for this result set are ' + format.listOffArrayElements(contents.slice(0, sliceContentLength)); 

	//	outputText += summary_after; 
		outputText += reprompt; 

		reference.emit(':ask', outputText, reprompt); 


	}); 



} 


// gets and emits result set found at query, 'query', and emits the prompt, 'reprompt'. 
function getResults(query, reference, reprompt) { 

//	var moreResults_after = 'Say repeat all to hear all results again, select to select among these findings, start over to start over, cancel to cancel'; 

//	var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 


	request.requestGetBlanking(query, function(response) { 

		var largeOutputText = ''; 


		console.log('array length : ' + response.results.length); 

		for (var i = 0; i < response.results.length; i++) { 


			var responseDataElem = response.results[i];  
			var outputText = format.formatCertification(responseDataElem); 

		//	var outputText = 'Certification for, ' + responseDataElem.name; 
		//	outputText += '. It is in region, ' + responseDataElem.region; 
		//	outputText += ' and country,' + responseDataElem.country;  
		//	outputText += '. This is a certification status, ' + translateCertificationStatus(responseDataElem.status); 
		//	outputText += ' and of scenario, ' + responseDataElem.content + '. ';

			// reference.handler.state = states.MULTIPLE_RESULTS; 
			//reference.emit(':tell', outputText); 
			largeOutputText += outputText; 
		//	console.log(largeOutputText); 

		}


		console.log(largeOutputText); 
		largeOutputText += reprompt; 
		reference.emit(':ask', largeOutputText, reprompt); 

	}); 



}


// gets and emits the getResult_ByDate result set found at query, 'query', and emits the prompt, 'reprompt'. (i.e Most recent certification)
function getResult_ByDate(query, reference, reprompt, byDate_value) { 

//	var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date);

	request.requestGetBlanking_CompletedOrdered(query, function(response) { 

		// array of all date, OfDate JSON object results 
		var results = response.results; 

		// appropriate date, OfDate JSON object based on ByDate_value (i.e most recent or least recent)
		var resultJSON = FirstOrLast_ByDate(byDate_value, results); 
		console.log('resultJSON Date' + resultJSON.date); 
		var arrayTies = resultJSON.OfDate; 
		var date = resultJSON.date; 
	 //   console.log(arrayTies[0].name); 

		// format prefices of responses given any size of 'arrayTies'
		// if within threshold, singular 
		var ifWithin_SingularPrefix = ' The ' + byDate_value + ' completed certification is the following, ' + format.formatCompletedCertifications(arrayTies); 
		// if within threshold, plural 
		var ifWithin_PluralPrefix = ' The ' + byDate_value + ' completed certifications are the following, ' + format.formatCompletedCertifications(arrayTies); 
		// if out of threshold 
		var ifOutOfPrefix = arrayTies.length.toString() + ' ties found for date, '+ resultJSON.date + '. One of the ' + byDate_value + ' completed certifications is the following, ' + format.formatCompletedCertifications(arrayTies[0]); 

		var outputText = returnWithRespect_Threshold(resultThreshold, arrayTies, ifWithin_SingularPrefix, ifWithin_PluralPrefix, ifOutOfPrefix); 

		// different prompt.... 


		
	//	var afterQuestion = '. Ask another question, say start over to start over, cancel to cancel'; 
	/*

		var outputText = ' The ' + byDate_value + ' certification is the following,'; 

		if (byDate_value === 'most recent') { 

			outputText += format.formatCertification(results[0]); 

		} 

		else if (byDate_value === 'least recent') { 

			outputText += format.formatCertification(results[results.length - 1]); 

		} 


		else { 
			console.log('error'); 
		} */ 

		//outputText += afterQuestion; 
		outputText += reprompt; 
	//	reference.emit(':ask', outputText, afterQuestion); 
		reference.emit(':ask', outputText, reprompt); 

	}); 


}


// gets the company with the ByHit_value of certífications found at query, 'query', and emits the prompt, 'reprompt'
function getCompanyName_ByHits(query, reference, reprompt, ByHit_value) {

//	var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date);

		request.requestGetUnique_CompletedByHits(query, function(response){ 

			//var outputText = 'The company with the ' + ByHit_value + ' of completed certifications is '; 
			// array of all date, OfDate JSON object results 
			var results = response.resultsUnique.companyName;
			var resultJSON = FirstOrLast_ByHits(ByHit_value, results); 

			console.log('resultJSON Hits' + resultJSON.hits); 
			var hits = resultJSON.hits; 
			var arrayTies = resultJSON.OfHits; 

			// if within threshold, singula
			var ifWithin_SingularPrefix = 'The company with the ' + ByHit_value + ' of completed certifications is ' + format.listOffArrayElements(arrayTies); 
			// if within threshold, plural 
			var ifWithin_PluralPrefix = 'At ' + hits.toString() + ' certifications, the companies with the ' + ByHit_value + ' of completed certifications are ' + format.listOffArrayElements(arrayTies); 

			// if out of threshold 
			var ifOutOfPrefix = arrayTies.length.toString() + ' ties found for ' + hits.toString() + ' certifications. One of the companies with the ' + ByHit_value + ' of completed certifications is ' + arrayTies[0];
			 
			var outputText = returnWithRespect_Threshold(resultThreshold, arrayTies, ifWithin_SingularPrefix, ifWithin_PluralPrefix, ifOutOfPrefix); 
			// var afterQuestion = '. Ask another question, say start over to start over, cancel to cancel'; 

		/*	var names = response.resultsUnique.name; 
			var countries = response.resultsUnique.country; 
			var regions = response.resultsUnique.region; 
			var contents = response.resultsUnique.content;  
			var solutions = response.resultsUnique.solution; 
			var dates = response.resultsUnique.date; 
		//	var statuses = response.resultsUnique.status; 

			if (ByHit_value === 'largest number') { 
				// outputText += names[0]; 
				outputText += format.listOffArrayElements(names[0].OfHits); 

			}

			else if (ByHit_value === 'smallest number') { 
				//outputText += names[names.length - 1]; 
				outputText += format.listOffArrayElements(names[names.length - 1].OfHits); 
			}

			else { 
				console.log('error'); 
			}

		//	outputText += afterQuestion; */ 
			outputText += reprompt; 
			reference.emit(':ask', outputText, reprompt); 

		});  


}

// gets the country with the ByHit_value of certífications found at query, 'query', and emits the prompt, 'reprompt'
function getCountry_ByHits(query, reference, reprompt, ByHit_value) {

//	var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date);


		request.requestGetUnique_CompletedByHits(query, function(response){ 

			// var outputText = 'The country with the ' + ByHit_value + ' of completed certifications is '; 
			// array of all date, OfDate JSON object results 
			var results = response.resultsUnique.country;
			var resultJSON = FirstOrLast_ByHits(ByHit_value, results); 

			console.log('resultJSON Hits' + resultJSON.hits); 
			var hits = resultJSON.hits; 
			var arrayTies = resultJSON.OfHits; 

			// if within threshold, singula
			var ifWithin_SingularPrefix = 'The country with the ' + ByHit_value + ' of completed certifications is '  + format.listOffArrayElements(arrayTies); 
			// if within threshold, plural 
			var ifWithin_PluralPrefix = 'At ' + hits.toString() + ' certifications, the countries with the ' + ByHit_value + ' of completed certifications are ' + format.listOffArrayElements(arrayTies); 

			// if out of threshold 
			var ifOutOfPrefix =  arrayTies.length.toString() + ' ties found for ' + hits.toString() + ' certifications. One of the countries with the ' + ByHit_value + ' of completed certifications is ' + arrayTies[0];
			 
			var outputText = returnWithRespect_Threshold(resultThreshold, arrayTies, ifWithin_SingularPrefix, ifWithin_PluralPrefix, ifOutOfPrefix); 
		//	var afterQuestion = '. Ask another question, say start over to start over, cancel to cancel'; 

			/*
			var names = response.resultsUnique.name; 
			var countries = response.resultsUnique.country; 
			var regions = response.resultsUnique.region; 
			var contents = response.resultsUnique.content;  
			var solutions = response.resultsUnique.solution; 
			var dates = response.resultsUnique.date; 
	//		var statuses = response.resultsUnique.status; 

			if (ByHit_value === 'largest number') { 
			//	outputText += countries[0]; 
				outputText += format.listOffArrayElements(countries[0].OfHits); 
			}

			else if (ByHit_value === 'smallest number') { 
			//	outputText += countries[countries.length - 1]; 
				outputText += format.listOffArrayElements(countries[countries.length - 1].OfHits); 
			}

			else { 
				console.log('error'); 
			}

			*/ 
		//	outputText += afterQuestion; 
			outputText += reprompt; 
			reference.emit(':ask', outputText, reprompt); 

		});  


}

// gets the region with the ByHit_value of certífications found at query, 'query', and emits the prompt, 'reprompt'
function getRegion_ByHits(query, reference, reprompt, ByHit_value) {

//	var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date);


		request.requestGetUnique_CompletedByHits(query, function(response){ 

			var results = response.resultsUnique.region;
			var resultJSON = FirstOrLast_ByHits(ByHit_value, results); 

			console.log('resultJSON Hits' + resultJSON.hits); 
			var hits = resultJSON.hits; 
			var arrayTies = resultJSON.OfHits; 

			// if within threshold, singula
			var ifWithin_SingularPrefix = 'The region with the ' + ByHit_value + ' of completed certifications is '  + format.listOffArrayElements(arrayTies); 
			// if within threshold, plural 
			var ifWithin_PluralPrefix = 'At ' + hits.toString() + ' certifications, the regions with the ' + ByHit_value + ' of completed certifications are ' + format.listOffArrayElements(arrayTies); 

			// if out of threshold 
			var ifOutOfPrefix =   arrayTies.length.toString() + ' ties found for ' + hits.toString() + ' certifications. One of the regions with the ' + ByHit_value + ' of completed certifications is ' + arrayTies[0];
			 
			var outputText = returnWithRespect_Threshold(resultThreshold, arrayTies, ifWithin_SingularPrefix, ifWithin_PluralPrefix, ifOutOfPrefix); 
		//	var afterQuestion = '. Ask another question, say start over to start over, cancel to cancel'; 


			/*
			var names = response.resultsUnique.name; 
			var countries = response.resultsUnique.country; 
			var regions = response.resultsUnique.region; 
			var contents = response.resultsUnique.content;  
			var solutions = response.resultsUnique.solution; 
			var dates = response.resultsUnique.date; 
	//		var statuses = response.resultsUnique.status; 

			if (ByHit_value === 'largest number') { 
		//		outputText += regions[0]; 
				outputText += format.listOffArrayElements(regions[0].OfHits); 
			}

			else if (ByHit_value === 'smallest number') { 
		//		outputText += regions[regions.length - 1]; 
				outputText += format.listOffArrayElements(regions[regions.length - 1].OfHits); 

			}

			else { 
				console.log('error'); 
			} */ 

	//		outputText += afterQuestion; 
			outputText += reprompt; 
			reference.emit(':ask', outputText, reprompt); 

		});  


}

// gets the content with the ByHit_value of certífications found at query, 'query', and emits the prompt, 'reprompt'
function getCertificationScenario_ByHits(query, reference, reprompt, ByHit_value) {

//	var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date);


		request.requestGetUnique_CompletedByHits(query, function(response){ 


			var results = response.resultsUnique.certificationScenario;

			var resultJSON = FirstOrLast_ByHits(ByHit_value, results); 

			console.log('resultJSON Hits' + resultJSON.hits); 
			var hits = resultJSON.hits; 
			var arrayTies = resultJSON.OfHits; 

			// if within threshold, singula
			var ifWithin_SingularPrefix = 'The certification scenario with the ' + ByHit_value + ' of completed certifications is '  + format.listOffArrayElements(arrayTies); 
			// if within threshold, plural 
			var ifWithin_PluralPrefix = 'At ' + hits.toString() + ' certifications, the certification scenarios with the ' + ByHit_value + ' of completed certifications are ' + format.listOffArrayElements(arrayTies); 

			// if out of threshold 
			var ifOutOfPrefix =   arrayTies.length.toString() + ' ties found for ' + hits.toString() + ' certifications. One of the certification scenarios with the ' + ByHit_value + ' of completed certifications is ' + arrayTies[0];
			 
			var outputText = returnWithRespect_Threshold(resultThreshold, arrayTies, ifWithin_SingularPrefix, ifWithin_PluralPrefix, ifOutOfPrefix); 

			/* 
			var outputText = 'The certification scenario with the ' + ByHit_value + ' of completed certifications is '; 
		//	var afterQuestion = '. Ask another question, say start over to start over, cancel to cancel'; 

			var names = response.resultsUnique.name; 
			var countries = response.resultsUnique.country; 
			var regions = response.resultsUnique.region; 
			var contents = response.resultsUnique.content;  
			var solutions = response.resultsUnique.solution; 
			var dates = response.resultsUnique.date; 
	//		var statuses = response.resultsUnique.status; 

			if (ByHit_value === 'largest number') { 
		//		outputText += contents[0]; 
				outputText += format.listOffArrayElements(contents[0].OfHits); 
			}

			else if (ByHit_value === 'smallest number') { 
				outputText += format.listOffArrayElements(contents[contents.length - 1].OfHits);  
			}

			else { 
				console.log('error'); 
			}
				*/ 
		//	outputText += afterQuestion; 
			outputText += reprompt; 
			reference.emit(':ask', outputText, reprompt); 

		});  


}


// gets the date with the ByHit_value of certífications found at query, 'query', and emits the prompt, 'reprompt'
function getDate_ByHits(query, reference, reprompt, ByHit_value) {

//	var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date);


		request.requestGetUnique_CompletedByHits(query, function(response){ 

			var results = response.resultsUnique.date;

			var resultJSON = FirstOrLast_ByHits(ByHit_value, results); 

			console.log('resultJSON Hits' + resultJSON.hits); 
			var hits = resultJSON.hits; 
			var arrayTies = resultJSON.OfHits; 

			// if within threshold, singula
			var ifWithin_SingularPrefix = 'The date with the ' + ByHit_value + ' of completed certifications is '  + format.listOffArrayElements(arrayTies); 
			// if within threshold, plural 
			var ifWithin_PluralPrefix = 'At ' + hits.toString() + ' certifications, the dates with the ' + ByHit_value + ' of completed certifications are ' + format.listOffArrayElements(arrayTies); 

			// if out of threshold 
			var ifOutOfPrefix =   arrayTies.length.toString() + ' ties found. One of the dates with the ' + ByHit_value + ' of completed certifications is ' + arrayTies[0];
			 
			var outputText = returnWithRespect_Threshold(resultThreshold, arrayTies, ifWithin_SingularPrefix, ifWithin_PluralPrefix, ifOutOfPrefix); 

			/*
			var outputText = 'The date with the ' + ByHit_value + ' of completed certifications is '; 
	//		var afterQuestion = '. Ask another question, say start over to start over, cancel to cancel'; 

			var names = response.resultsUnique.name; 
			var countries = response.resultsUnique.country; 
			var regions = response.resultsUnique.region; 
			var contents = response.resultsUnique.content;  
			var solutions = response.resultsUnique.solution; 
			var dates = response.resultsUnique.date; 
//			var statuses = response.resultsUnique.status; 

			if (ByHit_value === 'largest number') { 
			//	outputText += dates[0]; 
				outputText += format.listOffArrayElements(dates[0].OfHits); 
			}

			else if (ByHit_value === 'smallest number') { 
			//	outputText += dates[dates.length - 1]; 
				outputText += format.listOffArrayElements(dates[dates.length - 1].OfHits); 
			}

			else { 
				console.log('error'); 
			}

			*/ 
		//	outputText += afterQuestion; 
			outputText += reprompt; 
			reference.emit(':ask', outputText, reprompt); 

		});  


}

// appropriate output text among, 'ifWithin_Singular', 'ifWithin_Plural' and 'ifOutOf' based on the size of array, 'ties'
// threshold cannot be negative 
function returnWithRespect_Threshold(threshold, ties, ifWithin_SingularPrefix, ifWithin_PluralPrefix, ifOutOfPrefix) { 


	// if 'value' is less than or equal to 'threshold'
	if (ties.length <= threshold) {

		if (ties.length == 1) { 
	//		return ifWithin_SingularPrefix + format.formatCompletedCertifications(ties[0]); 
			return ifWithin_SingularPrefix; 
		}

		else { 
		//	return ifWithin_PluralPrefix + format.formatCompletedCertifications(ties); 
			return ifWithin_PluralPrefix; 
		}
	}

	// if 'value' is out of 'threshold'
	else { 
	//	return ifOutOfPrefix + 'One of them is ' + format.formatCertifications(ties[0]); 
		return ifOutOfPrefix; 
	}


} 


// returns correct element of 'array' depending on the value, ByDate_value 
function FirstOrLast_ByDate(ByDate_value, array) {

	return(FirstOrLast(ByDate_value, 'most recent', 'least recent', array)); 


}
// returns correct element of 'array' depending on the value, ByHits_value
function FirstOrLast_ByHits(ByHits_value, array) {

	return(FirstOrLast(ByHits_value, 'largest number', 'smallest number', array)); 


}

// if value is equal to 'forFirst', returns first element of 'array', if equal to 'forLast' returns the last element
function FirstOrLast(value, forFirst, forLast, array) {

	if (value === forFirst) {
		return array[0]; 
	 }

	else if (value === forLast) {
		return array[array.length - 1]; 
	}

	else { 
		console.log('Invalid slot value; ' + value); 
	}

}

 module.exports = { 

 	getSummary: getSummary, 
 	getResults: getResults, 
 	getResult_ByDate: getResult_ByDate, 
 	getCompanyName_ByHits: getCompanyName_ByHits, 
 	getCountry_ByHits: getCountry_ByHits, 
 	getRegion_ByHits: getRegion_ByHits, 
 	getCertificationScenario_ByHits: getCertificationScenario_ByHits, 
 	getDate_ByHits: getDate_ByHits

 }; 