# SearchSAPICC


## Dependencies 

1. index.js

    Dependencies: 
* formatHelpers.js
* correctSlotValues_Helpers.js
* getHelpers.js
* requestHelpers.js
* AlexaDeviceAddressClient.js
* countryCodeConversion.js
* Messages.js

* node_modules Folder *  <br /><br />



2. getHelpers.js 

    Dependencies: 
* formatHelpers.js
* requestHelpers.js  <br /><br />


3. requestHelpers.js 

    Dependencies: 
* request (downloaded with npm, included in node_modules folder)  <br /><br />


4. formatHelpers.js 

    No Dependencies<br /><br />
    

5. correctSlotValues_Helpers.js

    No Dependencies<br /><br />
    

6. AlexaDeviceAddressClient.js

    No Dependencies<br /><br />
    

7. countryCodeConversion.js

    No Dependencies<br /><br />
    

8. Messages.js

    No Dependencies<br /><br />
    



node_modules folder:

alexa-sdk 

request 


## Notes on src code: 


### Abilities that Can Be Enabled 
#### 1. Expand feature 

When no results are found for a given entry and a value for country has been offered, it would be nice if the skill checked for results 
not in the country but in the region and offered the user to hear results from that region. This is enabled. 

The only thing that is missing for such an ability is a list that maps every country in the skill portal to its region. Then, the 
Expand intent in lies 789 - 846 should be uncommented, the corresponding state in line 133 should be uncommented, 
and the handler should be registered with the other slots (uncomment 1115, comment out 1116). Also in the redirectNum function, lines 
should be 1149 - 1206 uncommented and and lines 1209 - 1210 commented out. 



#### 2. Most/Least Recent, Largest/Smallest Number of Certification Intents: 

Intents that respond to queries that have ('most recent', 'least recent', 'largest number', 'smallest number') slot values, that is, intents: 
SearchByDate, SearchByHit_getCompanyName, SearchByHit_getCountry, SearchByHit_getRegion, SearchByHit_getCertificationScenario, SearchByHit_getDate, 
currently accept no other slot value apart from the byDate or byHit value (i.e 'most recent', 'least recent', 'largest number', 'smallest number')´. 

This can be changed. The global variables in the index.js code, slotValue_companyNameQSpecif, slotValue_countryQSpecif, slotValue_regionQSpecif, 
slotValue_certificationScenarioQSpecif, slotValue_dateQSpecif are set up so that such values are enabled. So for instance, one could ask for the 
'most recent certification for IBM Deutschland' where IBM Deutschland is the slotValue_companyNameQSpecif, or ask for 'least recent certification 
in Canada' where Canada is the slotValue_countryQSpecif. One would just need to add the code that requests those values and assigns them to these 
global variables as is done in the Search intent function. 

Note that if one wants to enable this, one needs to watch out for conflicts of slot value arguments. For instance the SearchByHit_getCompanyName 
could not request a company name, the SearchByHit_getCountry could not request a country name, the SearchByHit_getRegion could not request 
a region name etc etc. It would be nice to enable this feautre as skill could handle queries like, 'Get company with the largest number of 
certifications of Hybris Commerce Suite Extension'. 

The intent schema and sample utterances must then be updated in the skill portal. 


### Code Layout

1. Global slot variables  
The variables for the slot values are global. This is so because intents other than the ones that request such values 
need these values and I did not find another way to share these with them. An improvement for this code would definitely be 
some sort of argument passing between different slot values. 

Note that functions in getHelpers and request do not use these values. They instead take a query URL which contains 
the values for these slots. 

2. Request functions 
I struggled a lot with the asynchronous property of http rest calls. Note that all of my functions in getHelpers modules 
or any of the functions that include a REST call do not return anything. They end with an emit statement or a call 
to another function which is usually one that further directs based on the response of the REST call. This is so 
because I could not figure out how to arrange code outside my function, that is, the function which contained the REST call, 
to 'wait' for the response. I am sure this could be handled by REST 'promises'. The modularity of my code could be improved 
by having better control of these REST calls. * 

* I would get for instance, a successful REST call response but the code that would follow such a call would contain an undefined 
value.  


