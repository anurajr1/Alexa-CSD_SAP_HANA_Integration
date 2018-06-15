"use strict"; 

var global_region = 'AMERICAS'; 

const Alexa = require('alexa-sdk'); // import the library

// formatHelpers contains functions that take in slot values or JSON objects with results and return a formatted string. 
var format = require('formatHelpers.js'); 

// correctSlotValues_Helpers contains functions that take in slot values and return the 'corrected' ones that will be used for the search (if any)
var correctSlotValues_Helpers = require('correctSlotValues_Helpers.js'); 

// getHelpers contains functions that make calls to the SAP HANA Services through the requestHelpers module and 'emit' the results retrieved 
var get = require('getHelpers.js'); 

// requestHelpers contains all of the functions that make http requests to HANA services 
var request = require('requestHelpers.js'); 

// AlexaDeviceAddressClient requests permission from skill user to authorize use of their location and makes a call to get this address. 
const AlexaDeviceAddressClient = require('AlexaDeviceAddressClient.js'); 

// countryCodeConversion.js contains function, getCountryName which given country code, returns corresponding country, or if not found returns back the code. 
const countryCodeConversion = require('countryCodeConversion.js'); 

// Messages contains messages that are used by ifLocation_Here() to let user know the status of the request (if it succeeded or not)
const Messages = require('Messages.js');

const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address";
const PERMISSIONS = [ALL_ADDRESS_PERMISSION];


var alexa; 


// slots for certification searches (i.e Certifications in Americas)
var slotValue_companyName = null; 
var slotValue_country = null; 
var slotValue_region = null; 
var slotValue_certificationScenario = null; 
var slotValue_date = null; 


// slots for questions about certifications (i.e. Company with the largest number of certifications in Americas) --- Unabled 
var slotValue_companyNameQSpecif = null; 
var slotValue_countryQSpecif = null; 
var slotValue_regionQSpecif = null; 
var slotValue_certificationScenarioQSpecif = null; 
var slotValue_dateQSpecif = null;  


// var slotValue_solution = null; 


// updated speech prompts helper functions 
// This is the initial welcome message 
var welcomeMessage = 'Welcome to Alexa V.I.A.I. Ask for certification information or anything general.'; 

// If the user cannot hear 
var againWelcomeMessage = 'Welcome to Alexa V.I.A.I. Ask for certification information or anything general... If you want to cancel, say cancel'; 

// exit message 
var exitMessage = 'Okay, bye for now'; 

// updated speech prompts 
var oneResult_ifNo = 'Okay. You can start over by saying start over or say cancel to cancel.'; 
var againOneResult_ifNo = 'You can start over by saying start over or say cancel to cancel.'; 
var againNoResults = 'No results found. You can start over by saying start over or say cancel to cancel.'; 
var againOneResult = 'One result found. Would you like to hear it?'; 
var oneResult_ifNo = 'Okay. You can start over by saying start over or say cancel to cancel.'; 
var againOneResult_ifNo = 'You can start over by saying start over or say cancel to cancel.'; 
var noResults_expand = 'No results found. Would you like to search in the region?';
var noResults_expand_ifNo = 'Okay. You can start over by saying start over or say cancel to cancel';

// REPROMPTSSS 
// after ask general question 
var afterSearchQuestion = '. Ask another question, say start over to start over, cancel to cancel'; 

// threshold for multiple results (i.e if above resultThreshold will not offer the HearAll option)
var resultThreshold = 10; 


// these should have slot arguments too.... 

function updated_noResults() { 
	return('No results found for ' + format.formatQuery(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date) + '.' + ' You can start over by saying start over or say cancel to cancel.'); 
}


function updated_oneResult() { 
	return('One result found for ' + format.formatQuery(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date) + '. Would you like to hear it?'); 
}

//function updated_againOneResult() { 
//	return('One result found. Would you like to hear it?'); 
//}

function updated_moreResults(total, successful, inProgress) { 
	//return(total.toString() + 'results found for ' + format.formatQuery() + '. Would you like to hear it?'); 

	return(total.toString() + ' results found for ' + format.formatQuery(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date) + '. Of these, ' + successful.toString() + ' are completed and ' + inProgress.toString() + ' are in progress. . Say all to hear all results, summary for a summary, select to select among these findings or ask a question. '); 
}



function updated_againMoreResults(total) { 
	//return(total.toString() + 'results found for ' + format.formatQuery() + '. Would you like to hear it?'); 

	return(total.toString() + ' results found. Say all to hear all results, summary for a summary, select to select among these findings or ask a question. '); 
}

// more than resultThreshold results found 
function updated_moreThanThreshold(total, successful, inProgress) { 
	//return(total.toString() + 'results found for ' + format.formatQuery() + '. Would you like to hear it?'); 

	return(total.toString() + ' results found for ' + format.formatQuery(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date) + '. Of these, ' + successful.toString() + ' are completed and ' + inProgress.toString() + ' are in progress. . Say summary for a summary, select to select among these findings or ask a question. '); 
}

function updated_againMoreThanThreshold(total, successful, inProgress) { 
	//return(total.toString() + 'results found for ' + format.formatQuery() + '. Would you like to hear it?'); 

	return(total.toString() + ' results found. Say summary for a summary, select to select among these findings or ask a question. '); 
}



// states 
var states = { 

	STARTMODE: "STARTMODE", 
	ONE_RESULT: "ONE_RESULT", 
	NO_RESULTS: "NO_RESULTS", 
	MULTIPLE_RESULTS: "MULTIPLE_RESULTS", 
//	EXPAND_SEARCH: "EXPAND_SEARCH", 
	NARROWDOWN_COMPANY_NAME: "NARROWDOWN_COMPANY_NAME", 
	NARROWDOWN_COUNTRY: "NARROWDOWN_COUNTRY", 
	NARROWDOWN_REGION : "NARROWDOWN_REGION", 
	NARROWDOWN_CERTIFICATION_SCENARIO: "NARROWDOWN_CERTIFICATION_SCENARIO", 
	NARROWDOWN_DATE: "NARROWDOWN_DATE"

}; 



// set state to start up and welcome the user 
const newSessionHandlers = {
    "LaunchRequest" : function() {

        this.handler.state = states.STARTMODE; 
        this.emit(':ask', welcomeMessage, againWelcomeMessage); 


        }, 

     "Unhandled" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage); 
	} 
}; 

// start state 
var Start_Mode = Alexa.CreateStateHandler(states.STARTMODE, { 

	// search intent, set state to SEARCH_INITIAL 
	"Search" : function() { 
		/*this.handler.state = states.SEARCH_INITIAL; 
		this.emitWithState("Search"); */


		// initialize global variables to null 
		slotValue_companyName = null; 
		slotValue_country = null; 
		slotValue_region = null; 

		slotValue_certificationScenario = null; 
		slotValue_date = null; 
	//	slotValue_solution = null; 

		// --------------------------------------- helper function for this?? --------------------------

		// name 
		if (this.event.request.intent.slots.companyName) { 

			if (this.event.request.intent.slots.companyName.value) { 
				slotValue_companyName = this.event.request.intent.slots.companyName.value.toUpperCase(); 
				console.log('name before correct:' + slotValue_companyName); 
				slotValue_companyName = correctSlotValues_Helpers.correctCompanyName(slotValue_companyName).toUpperCase(); 
			}
		}

		// country
				// region 
		if (this.event.request.intent.slots.country) { 

			if (this.event.request.intent.slots.country.value) { 
				slotValue_country = this.event.request.intent.slots.country.value.toUpperCase(); 

				// if you can request for slot values multiple times, you can even call the ifLocation_Here function here, and then this defines the slots... maybe overwriting... F
		//		if (slotValue_country === 'HERE') {
		//			ifLocation_Here(this); 
		//		}

				console.log('country before correct: ' + slotValue_country); 
				slotValue_country = correctSlotValues_Helpers.correctCountry(slotValue_country).toUpperCase(); 
			}
		}

		// region 
		if (this.event.request.intent.slots.region) { 

			if (this.event.request.intent.slots.region.value) { 
				slotValue_region = this.event.request.intent.slots.region.value.toUpperCase(); 
			}
		}

		// certification scenario 
		if (this.event.request.intent.slots.certificationScenario) { 

			if (this.event.request.intent.slots.certificationScenario.value) { 
				slotValue_certificationScenario = this.event.request.intent.slots.certificationScenario.value.toUpperCase();
				
			}
		}

		// date 
		if (this.event.request.intent.slots.date) { 

			if (this.event.request.intent.slots.date.value) { 
				slotValue_date = this.event.request.intent.slots.date.value; 
			}

		}

		console.log('company name: ' + slotValue_companyName); 
		console.log('country: ' + slotValue_country); 
		console.log('region: ' + slotValue_region); 
		console.log('content: '+ slotValue_certificationScenario); 
		console.log('date: '+ slotValue_date); 
	//	console.log('solution: '+ slotValue_solution); 


		// perform search, redirect based on search. 
		directBasedOnNum(this); 

	}, 

	"Search_Here" : function() { 

		ifLocation_Here(this); 


	}, 

		// ready for: what is the company of the greatest number of certifications in Canada ?  (i.e slot arguments)		

		// slotValue_questionRegion 
		// slotValue_questionCountry.... slotValue_questionContent, slotValue_questionDate
		// request for these, then 

		// now you are struggling with your decision to make your slots global you are going to have to use the same ones kid. 
		// slotValue_name = null .... 
		// nullify them here, and then collect them... best you can do... 


	// get the name of company with the byHit of certifications 
	"SearchByHit_getCompanyName" : function() { 	

		slotValue_companyNameQSpecif = null; 
		slotValue_countryQSpecif = null; 
		slotValue_regionQSpecif = null; 

		slotValue_certificationScenarioQSpecif = null; 
		slotValue_dateQSpecif = null; 
 

		if (this.event.request.intent.slots.ByHit) { 

			if (this.event.request.intent.slots.ByHit.value) { 
				
				var ByHit_value = this.event.request.intent.slots.ByHit.value; 

			}
		}

		var query = format.queryToURLForm(slotValue_companyNameQSpecif, slotValue_countryQSpecif, slotValue_regionQSpecif, slotValue_certificationScenarioQSpecif, slotValue_dateQSpecif);
		get.getCompanyName_ByHits(query, this, afterSearchQuestion, ByHit_value); 

	}, 

	// get the country with the byHit of certifications 
	"SearchByHit_getCountry" : function() { 	

		slotValue_companyNameQSpecif = null; 
		slotValue_countryQSpecif = null; 
		slotValue_regionQSpecif = null; 

		slotValue_certificationScenarioQSpecif = null; 
		slotValue_dateQSpecif = null; 

		if (this.event.request.intent.slots.ByHit) { 

			if (this.event.request.intent.slots.ByHit.value) { 
				
				var ByHit_value = this.event.request.intent.slots.ByHit.value; 

			}
		}

		var query = format.queryToURLForm(slotValue_companyNameQSpecif, slotValue_countryQSpecif, slotValue_regionQSpecif, slotValue_certificationScenarioQSpecif, slotValue_dateQSpecif);
		get.getCountry_ByHits(query, this, afterSearchQuestion, ByHit_value); 

	}, 

		// get the region with the byHit of certifications 
	"SearchByHit_getRegion" : function() { 	

		slotValue_companyNameQSpecif = null; 
		slotValue_countryQSpecif = null; 
		slotValue_regionQSpecif = null; 

		slotValue_certificationScenarioQSpecif = null; 
		slotValue_dateQSpecif = null; 
	
		if (this.event.request.intent.slots.ByHit) { 

			if (this.event.request.intent.slots.ByHit.value) { 
				
				var ByHit_value = this.event.request.intent.slots.ByHit.value; 

			}
		}

		var query = format.queryToURLForm(slotValue_companyNameQSpecif, slotValue_countryQSpecif, slotValue_regionQSpecif, slotValue_certificationScenarioQSpecif, slotValue_dateQSpecif);
		get.getRegion_ByHits(query, this, afterSearchQuestion, ByHit_value); 

	}, 


	// get the content with the byHit of certifications 
	"SearchByHit_getCertificationScenario" : function() { 		

		slotValue_companyNameQSpecif = null; 
		slotValue_countryQSpecif = null; 
		slotValue_regionQSpecif = null; 

		slotValue_certificationScenarioQSpecif = null; 
		slotValue_dateQSpecif = null; 

		if (this.event.request.intent.slots.ByHit) { 

			if (this.event.request.intent.slots.ByHit.value) { 
				
				var ByHit_value = this.event.request.intent.slots.ByHit.value; 

			}
		}

		var query = format.queryToURLForm(slotValue_companyNameQSpecif, slotValue_countryQSpecif, slotValue_regionQSpecif, slotValue_certificationScenarioQSpecif, slotValue_dateQSpecif);
		get.getCertificationScenario_ByHits(query, this, afterSearchQuestion, ByHit_value); 

	}, 

	// get the date with the byHit of certifications 
	"SearchByHit_getDate" : function() { 	

		slotValue_companyNameQSpecif = null; 
		slotValue_countryQSpecif = null; 
		slotValue_regionQSpecif = null; 

		slotValue_certificationScenarioQSpecif = null; 
		slotValue_dateQSpecif = null; 

		if (this.event.request.intent.slots.ByHit) { 

			if (this.event.request.intent.slots.ByHit.value) { 
				
				var ByHit_value = this.event.request.intent.slots.ByHit.value; 

			}
		}

		var query = format.queryToURLForm(slotValue_companyNameQSpecif, slotValue_countryQSpecif, slotValue_regionQSpecif, slotValue_certificationScenarioQSpecif, slotValue_dateQSpecif);
		get.getDate_ByHits(query, this, afterSearchQuestion, ByHit_value); 

	}, 

	// get byDate certification 
	"SearchByDate" : function() { 	

		slotValue_companyNameQSpecif = null; 
		slotValue_countryQSpecif = null; 
		slotValue_regionQSpecif = null; 

		slotValue_certificationScenarioQSpecif = null; 
		slotValue_dateQSpecif = null; 

		if (this.event.request.intent.slots.ByDate) { 

			if (this.event.request.intent.slots.ByDate.value) { 
				
				var ByDate_value = this.event.request.intent.slots.ByDate.value; 
			
			}
		}

		var query = format.queryToURLForm(slotValue_companyNameQSpecif, slotValue_countryQSpecif, slotValue_regionQSpecif, slotValue_certificationScenarioQSpecif, slotValue_dateQSpecif);
		get.getResult_ByDate(query, this, afterSearchQuestion, ByDate_value); 

	//	this.emit(':tell', 'testing'); 

	}, 

	// start over
	"AMAZON.StartOverIntent" : function() { 

		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// help 
	"AMAZON.HelpIntent" : function() { 

		this.emit(':ask', welcomeMessage, againWelcomeMessage); 

	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	"Unhandled" : function() { 

		this.emit(':ask', welcomeMessage, againWelcomeMessage); 
	} 


}); 

// one search result intent handler 
var One_Result = Alexa.CreateStateHandler(states.ONE_RESULT, {

	// yes 
	"AMAZON.YesIntent" : function() { 

		var query = format.queryToURLForm(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date); 
		var oneResult_after = 'Say repeat to hear result again, start over to start over, cancel to cancel'; 

		get.getResults(query, this, oneResult_after); 
//		this.emit(':ask', 'testing', 'testing'); 

	}, 

	// yes 
	"Repeat" : function() { 
		//say repeat to hear entry again, start over to start over, exit to exit. 
		// ---------------------------------------------- fix me !!!!! there should be a function within same state -----------------------------
		this.handler.state = states.ONE_RESULT; 
		this.emitWithState('AMAZON.YesIntent'); 
	}, 

	// no 
	"AMAZON.NoIntent" : function() { 

		this.emit(':ask', oneResult_ifNo, againOneResult_ifNo); 

	}, 

		// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

		// help 
	"AMAZON.HelpIntent" : function() { 

		// ------------------------------------------FIX MEEEE..... If slot values are not global then this message will not work-----------------------------------
		this.emit(':ask', updated_oneResult(), againOneResult); 

	}, 

	// unhandled 
	"Unhandled" : function() { 

		this.emit(':ask', updated_oneResult(), againOneResult); 
	}


 }); 


// no search result intent handler (might not be needed, I can just have this in SEARCH intent) 
var No_Results = Alexa.CreateStateHandler(states.NO_RESULTS, {

	// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

		// help 
	"AMAZON.HelpIntent" : function() { 

		// ------------------------------------------FIX MEEEE..... If slot values are not global then this message will not work-----------------------------------
		this.emit(':ask', updated_noResults(), againNoResults); 

	}, 

	// unhandled 
	"Unhandled" : function() { 

		this.emit(':ask', updated_noResults(), againNoResults); 
	}

 }); 


// more search result intent handler 
var Multiple_Results = Alexa.CreateStateHandler(states.MULTIPLE_RESULTS, {

	"Select" : function() { 

		// The user wants to keep selecting SELECT HERE

		// for now.... 	
		directSelect(this); 

	}, 

	// repeat all 
	"RepeatAll" : function() { 

// ---------------------------------------------- fix me !!!!! there should be a function within same state -----------------------------
		this.handler.state = states.MULTIPLE_RESULTS; 
		this.emitWithState('HearAll'); 

	}, 

	// repeat summary 
		// repeat all 
	"RepeatSummary" : function() { 

// ---------------------------------------------- fix me !!!!! there should be a function within same state -----------------------------
		this.handler.state = states.MULTIPLE_RESULTS; 
		this.emitWithState('Summary'); 

	}, 

	// all 
	"HearAll" : function() { 

		var query = format.queryToURLForm(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date); 
		var reference = this; 


		// ensure that the result set size is below the resultThreshold value if user wants to hear all. 
		request.requestGetNum(query, function(response) { 

			var total = response.results.total; 

			if (total <= resultThreshold) {

				var moreResults_after = 'Say repeat all to hear all results again, select to select among these findings, start over to start over, cancel to cancel'; 
				get.getResults(query, reference, moreResults_after); 

			 }

			 else { 
			 	var moreResultsNoHearAll_error = 'Too many results. Say summary for a summary, select to select among these findings or ask a question.'; 
			 	var moreResultsNoHearAll_againError = 'Say summary for a summary, select to select among these findings or ask a question.'
			 	reference.emit(':ask', moreResultsNoHearAll_error, moreResultsNoHearAll_againError); 
			 }

		}); 

	}, 

	// short summary 
	"Summary" : function() { 

		var query = format.queryToURLForm(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date); 
	//	var reprompt; 

		// reprompt if result set size is within threshold 
		var reprompt_withinThresh = "Say repeat summary to hear summary again, all to hear all results, select to select among these findings, start over to start over, cancel to cancel";
		// reprompt if result set size is not within threshold 		
		var reprompt_outOfThresh = "Say repeat summary to hear summary again, select to select among these findings, start over to start over, cancel to cancel";
		var reprompt; 
		var reference = this; 

		request.requestGetNum(query, function(response){ 

			var total = response.results.total;

			if (total <= resultThreshold) { 
				reprompt = reprompt_withinThresh; 
			}

			else { 
				reprompt = reprompt_outOfThresh; 
			}

			get.getSummary(query, reference, reprompt); 

		});  

	}, 

	"SearchByDate_afterSearch" : function() { 	

		// no slots are set to null here because this is a question within the original search. Note that we use slots: slotValue_name, slotValueregion, slotValue_content, slotValuecountry, slotValue date for query. 

		if (this.event.request.intent.slots.ByDate) { 

			if (this.event.request.intent.slots.ByDate.value) { 
				
				var ByHit_value = this.event.request.intent.slots.ByDate.value; 

			}
		}

		var query = format.queryToURLForm(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date); 
	//	var reprompt = 'Ask another question, say all to hear all results, summary for a summary, select to select among these findings or ask a question.'


		// reprompt if result set size is within threshold 
		var reprompt_withinThresh = 'Ask another question, say all to hear all results, summary for a summary, select to select among these findings or ask a question.'; 
		// // reprompt if result set size is not within threshold 
		var reprompt_outOfThresh = 'Ask another question, say summary for a summary, select to select among these findings or ask a question.'; 
	//	var reprompt = determineReprompt(query, resultThreshold, reprompt_withinThresh, reprompt_outOfThresh); 
		var reprompt; 


		var reference = this; 

		request.requestGetNum(query, function(response){ 

			var total = response.results.total;

			if (total <= resultThreshold) { 
				reprompt = reprompt_withinThresh; 
			}

			else { 
				reprompt = reprompt_outOfThresh; 
			}

			get.getResult_ByDate(query, reference, reprompt, ByHit_value); 

		});  


	}, 


		// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

		// help 
	"AMAZON.HelpIntent" : function() { 

		var reference = this; 

		var query = format.queryToURLForm(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date); 

		request.requestGetNum(query, function(response) { 


			var total = response.results.total; 
			var successful = response.results.successful; 
			var inProgress = response.results.inProgress; 

/*			reference.emit(':ask', updated_moreResults(total, successful, inProgress), updated_againMoreResults(total)); */ 
			
			// if result set size within threshold 
			if (total <= resultThreshold) { 
				reference.emit(':ask', updated_moreResults(total, successful, inProgress), updated_againMoreResults(total)); 
			}

			// if above threshold 
			else { 
				reference.emit(':ask', updated_moreThanThreshold(total, successful, inProgress), updated_againMoreThanThreshold(total)); 

			}


		// ------------------------------------------FIX MEEEE..... If slot values are not global then this message will not work-----------------------------------
		//emitMoreResults(); 
		//this.emit(':ask', updated_moreResults(), updated_againMoreResults()); 

	}); 

		// ------------------------------------------FIX MEEEE..... If slot values are not global then this message will not work-----------------------------------
		//emitMoreResults(); 
		//this.emit(':ask', updated_moreResults(), updated_againMoreResults()); 

	}, 

	// unhandled 
	"Unhandled" : function() { 

		this.handler.state = states.MULTIPLE_RESULTS; 
		this.emitWithState('AMAZON.HelpIntent'); 

/*
		var query = format.queryToURLForm(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date); 
		var reference = this; 

		request.requestGetNum(query, function(response) { 


			var total = response.results.total; 
			var successful = response.results.successful; 
			var inProgress = response.results.inProgress; 

			reference.emit(':ask', updated_moreResults(total, successful, inProgress), updated_againMoreResults(total)); 


		// ------------------------------------------FIX MEEEE..... If slot values are not global then this message will not work-----------------------------------
		//emitMoreResults(); 
		//this.emit(':ask', updated_moreResults(), updated_againMoreResults()); 

	});  */ 


		//this.emit(':ask', updated_moreResults(), updated_againMoreResults()); 
		//emitMoreResults(); 
	}

// two options: Would you like to keep selecting? Yes-- continue, No-- short summary? or exit? 
// 


 });

/*
// start state. Sort of like the main menu 
var Expand_Search = Alexa.CreateStateHandler(states.EXPAND_SEARCH, { 

	// yes 
	"AMAZON.YesIntent" : function() { 

		slotValue_country = null; 
		slotValue_region = global_region.toUpperCase(); 

		directBasedOnNum(this); 

	}, 

	// no 
	"AMAZON.NoIntent" : function() { 

		this.emit(':ask', noResults_expand_ifNo, noResults_expand_ifNo); 

	}, 

	// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// help 
	"AMAZON.HelpIntent" : function() { 

		this.emit(':ask', noResults_expand, noResults_expand); 

	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	"Unhandled" : function() { 
		
		this.emit(':ask', noResults_expand, noResults_expand); 

	} 


}); 

*/ 


// user provides a company name to narrow down result set by company name 
var NarrowDown_companyName = Alexa.CreateStateHandler(states.NARROWDOWN_COMPANY_NAME, { 

	// yes 
	"NarrowDown_companyName" : function() { 

		//==================================================================== SEARCH ======================================================================
		if (this.event.request.intent.slots.companyName) { 

			if (this.event.request.intent.slots.companyName.value) { 
				slotValue_companyName = this.event.request.intent.slots.companyName.value.toUpperCase(); 
				console.log('name before correct:' + slotValue_companyName); 
				slotValue_companyName = correctSlotValues_Helpers.correctCompanyName(slotValue_companyName).toUpperCase(); 
			}
		}

		directBasedOnNum(this); 

	}, 

	// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// help 
	"AMAZON.HelpIntent" : function() { 

	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	"Unhandled" : function() { 

	} 


}); 


// user provides a country name to narrow down result set by country 
var NarrowDown_country = Alexa.CreateStateHandler(states.NARROWDOWN_COUNTRY, { 

	// yes 
	"NarrowDown_country" : function() { 

		//==================================================================== SEARCH ======================================================================
		if (this.event.request.intent.slots.country) { 

			if (this.event.request.intent.slots.country.value) { 
				slotValue_country = this.event.request.intent.slots.country.value.toUpperCase(); 
				console.log('country before correct: ' + slotValue_country); 
				slotValue_country = correctSlotValues_Helpers.correctCountry(slotValue_country).toUpperCase(); 
			}
		}

		directBasedOnNum(this); 

	}, 

	// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// help 
	"AMAZON.HelpIntent" : function() { 

	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	"Unhandled" : function() { 

	} 


}); 

// user provides a region name to narrow down result set by region 
var NarrowDown_region = Alexa.CreateStateHandler(states.NARROWDOWN_REGION, { 

	// yes 
	"NarrowDown_region" : function() { 

		//==================================================================== SEARCH ======================================================================
		if (this.event.request.intent.slots.region) { 

			if (this.event.request.intent.slots.region.value) { 
				slotValue_region = this.event.request.intent.slots.region.value.toUpperCase(); 
			}
		}

		directBasedOnNum(this); 

	}, 

	// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// help 
	"AMAZON.HelpIntent" : function() { 

	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	"Unhandled" : function() { 

	} 


}); 


// user provides a certification scenario name to narrow down result set by certification scenario 
var NarrowDown_certificationScenario = Alexa.CreateStateHandler(states.NARROWDOWN_CERTIFICATION_SCENARIO, { 

	// yes 
	"NarrowDown_certificationScenario" : function() { 

		//==================================================================== SEARCH ======================================================================
		if (this.event.request.intent.slots.certificationScenario) { 

			if (this.event.request.intent.slots.certificationScenario.value) { 
				slotValue_certificationScenario = this.event.request.intent.slots.certificationScenario.value.toUpperCase(); 
			}
		}

		directBasedOnNum(this); 

	}, 

	// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// help 
	"AMAZON.HelpIntent" : function() { 

	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	"Unhandled" : function() { 

	} 


}); 

// user provides a date to narrow down result set by date
var NarrowDown_date = Alexa.CreateStateHandler(states.NARROWDOWN_DATE, { 

	// yes 
	"NarrowDown_date" : function() { 

		//==================================================================== SEARCH ======================================================================
		if (this.event.request.intent.slots.date) { 

			if (this.event.request.intent.slots.date.value) { 
				slotValue_date = this.event.request.intent.slots.date.value.toUpperCase(); 
			}
		}

		directBasedOnNum(this); 

	}, 

	// start over
	"AMAZON.StartOverIntent" : function() { 

		this.handler.state = states.STARTMODE; 
		this.emit(':ask', welcomeMessage, againWelcomeMessage);

	}, 

	// stop 
	"AMAZON.StopIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	// help 
	"AMAZON.HelpIntent" : function() { 

	}, 

	// cancel 
	"AMAZON.CancelIntent" : function() { 

		this.emit(':tell', exitMessage, exitMessage); 
	}, 

	"Unhandled" : function() { 

	} 


}); 






// execution starts here 
exports.handler = function (event, context, callback) {

    var alexa = Alexa.handler(event, context); 
    //alexa.registerHandlers(newSessionHandlers, startGameHandlers, EST_Handlers); 
   // alexa.registerHandlers(newSessionHandlers, Start_Mode, No_Results, One_Result, Expand_Search, Multiple_Results, NarrowDown_companyName, NarrowDown_country, NarrowDown_region, NarrowDown_certificationScenario, NarrowDown_date); 
   alexa.registerHandlers(newSessionHandlers, Start_Mode, No_Results, One_Result, Multiple_Results, NarrowDown_companyName, NarrowDown_country, NarrowDown_region, NarrowDown_certificationScenario, NarrowDown_date); 
    alexa.execute(); 
}; 



// set state and emit text based on number of results 
function directBasedOnNum(reference) {


	console.log('name: ' + slotValue_companyName); 
	console.log('country: ' + slotValue_country); 
	console.log('region: ' + slotValue_region); 
	console.log('content: '+ slotValue_certificationScenario); 
	console.log('date: '+ slotValue_date); 
	// console.log('solution: '+ slotValue_solution); 


	var query = format.queryToURLForm(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date); 

	request.requestGetNum(query, function(response) { 

		var total = response.results.total; 
		var successful = response.results.successful; 
		var inProgress = response.results.inProgress; 

		var outputText = ''; 

		// var numResults = output; 

		// if 0 results found 
		if (total === 0) { 

		/*	expand results unabled 

		// zero results, country given
		if (slotValue_country !== null) { 

				// attempt to offer to expand results in entire region - unabled 

				// nullify current slotValue_country and run search in region 
				// var URL = hostNum + format.queryToURLForm(slotValue_name, null, global_region, slotValue_content, slotValue_date, slotValue_solution); 

				//var URL = hostNum + format.queryToURLForm(slotValue_name, null, global_region, slotValue_content, slotValue_date); 

				var query_2 = format.queryToURLForm(slotValue_name, null, global_region, slotValue_content, slotValue_date); 

    			//Request(URL, function(response) { 

    			request.requestGetNum(query_2, function(response) { 

					var outputText_noResults = 'No results found for ' + format.formatQuery(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date) + '. You can start over by saying start over or say cancel to cancel.' 
					var outputText_offerExpand = 'No results found for ' + format.formatQuery(slotValue_name, slotValue_country, slotValue_region, slotValue_content, slotValue_date) + '. Would you like to search in the region?'; 

					var total = response.results.total; 

					// if results in region 
					if (total > 0) { 

						reference.handler.state = states.EXPAND_SEARCH; 
						reference.emit(':ask', outputText_offerExpand, outputText_offerExpand); 

					}

					// if no results in region 
					else { 

						reference.handler.state = states.NO_RESULTS; 
				//		reference.emit(':ask', outputText_noResults, outputText_noResults); 
						reference.emit(':ask', updated_noResults(), againNoResults); 

					}

				}); 

			//	var expandQuery = 'No results found for ' + format.formatQuery() + '. Would you like to search in the region?'; 
			//	reference.handler.state = states.EXPAND_SEARCH; 
			//	reference.emit(':ask', expandQuery, expandQuery); 

			} 

			else { 

				reference.handler.state = states.NO_RESULTS; 
				reference.emit(':ask', updated_noResults(), againNoResults); 

		 	} 



		 	*/  


				reference.handler.state = states.NO_RESULTS; 
				reference.emit(':ask', updated_noResults(), againNoResults); 


		}

		// if 1 result found 
		else if (total === 1) { 
			reference.handler.state = states.ONE_RESULT;
			reference.emit(':ask', updated_oneResult(), againOneResult);

		} 

		// multiple results found 
		else {

			// would you like to narrow down answers 
			reference.handler.state = states.MULTIPLE_RESULTS;  

			// if within threshold
			if (total <= resultThreshold) { 
				reference.emit(':ask', updated_moreResults(total, successful, inProgress), updated_againMoreResults(total)); 
			}

			// if above threshold 
			else { 
				reference.emit(':ask', updated_moreThanThreshold(total, successful, inProgress), updated_againMoreThanThreshold(total)); 

			}
		

			// ------------------------------------------------------------- WOULD THIS WORK?????? --------------------------------------------------------------------
//			emitMoreResults(reference); 
			// var outputText = numResults + ' results found for ' + format.formatQuery() + '. Continue selecting?'; 
			//reference.emit(':ask', updated_moreResults(total, successful, inProgress), updated_againMoreResults(total)); 

			} 

	   }); 

	//	var numResults = getNumResults(); 
	//	var query = format.formatQuery();


}


// based on the values of the given result set user is redirected to the appropriate narrow down state 
function directSelect(reference) {

	// narrow down speech prompts 
	var narrowDown_byCompanyName = 'Say a company name.'; 
	var narrowDown_byCountry = 'Say a country.'; 
	var narrowDown_byRegion = 'Say a region.'; 
	var narrowDown_byCertificationScenario = 'Say a certification scenario.'; 
	var narrowDown_byDate = 'Say a date.'; 

	var narrowDown_exit = 'You can start over by saying start over or say cancel to cancel.'; 
	var notFurtherNarrowedDown = 'Result set cannot be narrowed down. Say all to hear all results, summary for a summary, select to select among these findings or ask a question.'; 


	// examine current result set 
	var query = format.queryToURLForm(slotValue_companyName, slotValue_country, slotValue_region, slotValue_certificationScenario, slotValue_date); 


	// find a slot value that is not selected yet and that will narrow down results 
	request.requestGetUnique(query, function(response) { 


		var names = response.resultsUnique.companyName; 
		var countries = response.resultsUnique.country; 
		var regions = response.resultsUnique.region; 
		var certificationScenarios = response.resultsUnique.certificationScenario;  
		var solutions = response.resultsUnique.solution; 
		var dates = response.resultsUnique.date; 
		var statuses = response.resultsUnique.status; 


		// check country
		if ((slotValue_country === null) && (countries.length > 1)) { 

			reference.handler.state = states.NARROWDOWN_COUNTRY; 
			reference.emit(':ask', narrowDown_byCountry, 'To further select ' + narrowDown_byCountry + 'Otherwise, ' + narrowDown_exit); 

		} 

		// check name
		else if ((slotValue_companyName === null) && (names.length > 1)) { 

			reference.handler.state = states.NARROWDOWN_COMPANY_NAME; 
			reference.emit(':ask', narrowDown_byCompanyName, 'To further select ' + narrowDown_byCompanyName + 'Otherwise, ' + narrowDown_exit); 

		}

		// check region 
		else if ((slotValue_region === null) && (regions.length > 1)) { 

			reference.handler.state = states.NARROWDOWN_REGION; 
			reference.emit(':ask', narrowDown_byRegion, 'To further select ' + narrowDown_byRegion + 'Otherwise, ' + narrowDown_exit); 

		} 

		// check content

		else if ((slotValue_certificationScenario === null) && (certificationScenarios.length > 1)) { 

			reference.handler.state = states.NARROWDOWN_CERTIFICATION_SCENARIO; 
			reference.emit(':ask', narrowDown_byCertificationScenario, 'To further select ' + narrowDown_byCertificationScenario + 'Otherwise, ' + narrowDown_exit); 

		} 

		// check date
		else if ((slotValue_date === null) && (dates.length > 1)) { 

			reference.handler.state = states.NARROWDOWN_DATE; 
			reference.emit(':ask', narrowDown_byDate, 'To further select ' + narrowDown_byDate + 'Otherwise, ' + narrowDown_exit); 

		} 

		// result set can no longer be narrowed down 
		else { 

		//	reference.emit(':ask')
			reference.emit(':ask', notFurtherNarrowedDown, notFurtherNarrowedDown); 
			console.log('COULD NOT NARROW DOWN'); 
		}


	 }); 

}


// ifLocation_Here retrieves the slot values given and calls function directBasedOnNum(reference) to perform redirection based on number of results found 
// It works exactly the same as the function that handles the Search intent, except for the fact that it doesn't retrieve location slot values (country nor region), 
// and that it sets slotValue_country to the current location of the user. 
// Uses the AlexaDeviceAddressClient to perform that location call
function ifLocation_Here(reference) { 

	 console.info("Starting ifLocation_Here()");

     const consentToken = reference.event.context.System.user.permissions.consentToken;

     // If we have not been provided with a consent token, this means that the user has not
     // authorized your skill to access this information. In this case, you should prompt them
     // that you don't have permissions to retrieve their address.
     if(!consentToken) {
         reference.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);

         // Lets terminate early since we can't do anything else.
         console.log("User did not give us permissions to access their address.");
         console.info("Ending ifLocation_Here()");
         return;
        }

     const deviceId = reference.event.context.System.device.deviceId;
     const apiEndpoint = reference.event.context.System.apiEndpoint;

     const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
     let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();

     deviceAddressRequest.then((addressResponse) => {
            switch(addressResponse.statusCode) {
                case 200:
                    console.log("Address successfully retrieved, now responding to user.");
                    const address = addressResponse.address;

			        slotValue_companyName = null; 
					slotValue_country = null; 
					slotValue_region = null; 

					slotValue_certificationScenario = null; 
					slotValue_date = null; 

					// set country slot to the retrieved location 
					slotValue_country =  countryCodeConversion.getCountryName(address['countryCode']).toUpperCase(); 

				//	slotValue_solution = null; 

					// --------------------------------------- helper function for this?? --------------------------


					// get other slot values 
					// name 
					if (reference.event.request.intent.slots.companyName) { 

						if (reference.event.request.intent.slots.companyName.value) { 
							slotValue_companyName = reference.event.request.intent.slots.companyName.value.toUpperCase(); 
							console.log('name before correct:' + slotValue_companyName); 
							slotValue_companyName = correctSlotValues_Helpers.correctCompanyName(slotValue_companyName).toUpperCase(); 
						}
					}

					// content 
					if (reference.event.request.intent.slots.certificationScenario) { 

						if (reference.event.request.intent.slots.certificationScenario.value) { 
							slotValue_certificationScenario = reference.event.request.intent.slots.certificationScenario.value.toUpperCase(); 
							
						}
					}

					// date 
					if (reference.event.request.intent.slots.date) { 

						if (reference.event.request.intent.slots.date.value) { 
							slotValue_date = reference.event.request.intent.slots.date.value; 
						}

					}

					// for demo.... 

					console.log('company name: ' + slotValue_companyName); 
					console.log('country: ' + slotValue_country); 
					console.log('region: ' + slotValue_region); 
					console.log('content: '+ slotValue_certificationScenario); 
					console.log('date: '+ slotValue_date); 

					// perform search, redirect based on search. 
                    directBasedOnNum(reference); 

              //      directBasedOnNum(reference); 
                    break;
                case 204:
                    // This likely means that the user didn't have their address set via the companion app.
                    console.log("Successfully requested from the device address API, but no address was returned.");
                    reference.emit(":tell", Messages.NO_ADDRESS);
                    break;
                case 403:
                    console.log("The consent token we had wasn't authorized to access the user's address.");
                    reference.emit(":tellWithPermissionCard", Messages.NOTIFY_MISSING_PERMISSIONS, PERMISSIONS);
                    break;
                default:
                    reference.emit(":ask", Messages.LOCATION_FAILURE, Messages.LOCATION_FAILURE);
            }

            console.info("Ending ifLocation_Here()");
        });

     deviceAddressRequest.catch((error) => {
         reference.emit(":tell", Messages.ERROR);
         console.error(error);
         console.info("Ending ifLocation_Here()");
     });


} 


