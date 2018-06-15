// formatHelpers contains functions that take in slot values or JSON objects with results and return a formatted string. 


// returns query URL style taking in the values of slots
function queryToURLForm(companyName, country, region, certificationScenario, date) {

	var query = '?'; 
	var insertedYet = false; 

	// append name 
	if (companyName !== null) {

		query += 'companyName=' + companyName; 
		insertedYet = true; 
	}

		// append name 
	if (country !== null) {

		// if it is not the first parameter, append with &
		if (insertedYet) { 	
			query += '&'; 
		}

		query += 'country=' + country; 
		insertedYet = true; 
	}

	// append region 
	if (region !== null) { 

		// if it is not the first parameter, append with &
		if (insertedYet) { 	
			query += '&'; 
		}

		//query += 'region=' + region; 
		query += 'region=' + region; 
		insertedYet = true; 
	}


	//append content
	if(certificationScenario !== null) { 

		// if it is not the first parameter, append with &
		if (insertedYet) { 	
			query += '&'; 
		}

		query += 'certificationScenario=' + certificationScenario; 
		insertedYet = true; 
	}

	// append date  
	if(date !== null) { 

		// if it is not the first parameter, append with &
		if (insertedYet) { 	
			query += '&'; 
		}

		query += 'startDate=' + date; 
		insertedYet = true; 
	}


/*
	// append solution
	if(solution != null) { 

		// if it is not the first parameter, append with &
		if (insertedYet) { 	
			query += '&'; 
		}

		query += 'solutionName=' + solution; 
		insertedYet = true; 
	} */ 

	console.log(query); 
	return query;   


 }

// returns query in string form 
function formatQuery(companyName, country, region, certificationScenario, date) {

	var query; 

	if ((companyName === null) && (country === null) && (region === null) && (certificationScenario === null) && (date === null)) { 

		query = 'all entries'; 

	}

	else { 

		query = 'Entry'; 

		if (companyName !== null) {

			query  += ' for ' + companyName; 

		}

		if (country !== null) {

			query  += ' in ' + country; 

		}

		else if (region !== null) {

			query += ' in ' + region; 
		}

		if (certificationScenario !== null) {

			query  += ' of ' + certificationScenario; 

		}

		if (date !== null) {

			query +=' from ' + date; 
		}
		
		}
	
	return query; 

} 

// takes in a JSON result, certifications, and returns a formatted string of the certification results 
function formatCertifications(certifications) { 

	var largeOutput = ''; 

	for (var i = 0; i <= certifications.length; i++) { 
		largeOutput += formatCertification(certifications[i]); 
	}

	return largeOutput; 


}

// takes in a JSON result, certification, and returns a formatted string of the certification result 
function formatCertification(certification) { 


	var name = certification.companyName; 
	var region = certification.region; 
	var country = certification.country; 
	var status = certification.status; 
	var solution = certification.solution; 
	var certificationScenario = certification.certificationScenario; 

	var outputText = 'Certification for, ' + name; 
	outputText += '. It is in region, ' + region; 
	outputText += ' and country, ' + country;  
	outputText += '. The certification status is, ' + translateCertificationStatus(status); 
	outputText += ' and the scenario is, ' + certificationScenario + '. ';  

	return(outputText); 

}

//takes in a JSON result,, certifications, and returns a formatted string of the completed certification results 
function formatCompletedCertifications(certifications) { 

	var largeOutput = ''; 


	for (var i = 0; i < certifications.length; i++) { 
	//	console.log('certification ' + i.toString() + ' name: ' + certifications[i].name); 
		// var certification = certifications[i]; 

		largeOutput += formatCompletedCertification(certifications[i]); 
	}

	return largeOutput; 

}



// takes in a JSON result, certification, and returns a formatted string of the completed certification result 
function formatCompletedCertification(certification) { 

	var name = certification.companyName; 
	var region = certification.region; 
	var country = certification.country; 
//	var status = certification.status; 
	var solution = certification.solution; 
	var certificationScenario = certification.certificationScenario; 

	var outputText = 'Certification for, ' + name; 
	outputText += '. It is in region, ' + region; 
	outputText += ' and country, ' + country;  
//	outputText += '. This is a certification status, ' + translateCertificationStatus(status); 
//	outputText += ' and of scenario, ' + content + '. ';  
	outputText += '. This is a certification scenario, ' + certificationScenario + '. ';  

	return(outputText); 

} 


// returns a string that includes all of the strings in array, toBeListed in speechAsset form 
function listOffArrayElements(toBeListed) { 


	var outputText = ''; 

	for (var i = 0; i < toBeListed.length; i++) {

		outputText += toBeListed[i]; 

		if (i < toBeListed.length - 1) {

			outputText += ', ';

		}


	}

	outputText += '.'; 

	return outputText; 


}




// takes in certification status as it appears in the database and returns listener friendly one 
function translateCertificationStatus(status) {

	if (status === "Certification Completed"){ 
		return('Completed'); 
	}

	if (status === "Certification In Process") { 
		return('In progress'); 
	}

 }

 
 module.exports = { 

 	queryToURLForm: queryToURLForm, 
 	formatQuery: formatQuery, 
 	formatCertification: formatCertification, 
 	formatCompletedCertifications: formatCompletedCertifications,
 	listOffArrayElements: listOffArrayElements, 
 	translateCertificationStatus: translateCertificationStatus, 

 }; 