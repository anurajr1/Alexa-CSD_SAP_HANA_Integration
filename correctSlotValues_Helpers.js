 // correctSlotValues_Helpers contains functions that take in slot values and return the 'corrected' ones that will be used for the search (if any)

mappings_country = []; 

mappings_country.push(new mapping('United States', ["US", "United States of America", "America", "The States", "The US"])); 
mappings_country.push(new mapping('United Kingdom', ["UK", "The UK"])); 
mappings_country.push(new mapping('Great Britain', ["England"])); 


/*
mappings_country.push(new mapping('Afghanistan', [])); 
mappings_country.push(new mapping('Albania', [])); 
mappings_country.push(new mapping('Andorra', [])); 
mappings_country.push(new mapping('Angola', [])); 
mappings_country.push(new mapping('Antigua & Deps', [])); 
mappings_country.push(new mapping('Argentina', [])); 
mappings_country.push(new mapping('Armenia', [])); 
mappings_country.push(new mapping('Australia', [])); 
mappings_country.push(new mapping('Austria', [])); 
mappings_country.push(new mapping('Azerbaijan', [])); 
mappings_country.push(new mapping('Bahamas', [])); 
mappings_country.push(new mapping('Bahrain', [])); 
mappings_country.push(new mapping('Bangladesh', [])); 
mappings_country.push(new mapping('', [])); */ 





/*
Afghanistan
Albania
Algeria
Andorra
Angola
Antigua & Deps
Argentina
Armenia
Australia
Austria
Azerbaijan
Bahamas
Bahrain
Bangladesh
Barbados
Belarus
Belgium
Belize
Benin
Bhutan
Bolivia
Bosnia Herzegovina
Botswana
Brazil
Brunei
Bulgaria
Burkina
Burundi
Cambodia
Cameroon
Canada
Cape Verde
Central African Rep
Chad
Chile
China
Colombia
Comoros
Congo
Congo {Democratic Rep}
Costa Rica
Croatia
Cuba
Cyprus
Czech Republic
Denmark
Djibouti
Dominica
Dominican Republic
East Timor
Ecuador
Egypt
El Salvador
Equatorial Guinea
Eritrea
Estonia
Ethiopia
Fiji
Finland
France
Gabon
Gambia
Georgia
Germany
Ghana
Great Britain 
Greece
Grenada
Guatemala
Guinea
Guinea-Bissau
Guyana
Haiti
Honduras
Hungary
Iceland
India
Indonesia
Iran
Iraq
Ireland 
Israel
Italy
Ivory Coast
Jamaica
Japan
Jordan
Kazakhstan
Kenya
Kiribati
North Korea
South Korea
Kosovo
Kuwait
Kyrgyzstan
Laos
Latvia
Lebanon
Lesotho
Liberia
Libya
Liechtenstein
Lithuania
Luxembourg
Macedonia
Madagascar
Malawi
Malaysia
Maldives
Mali
Malta
Marshall Islands
Mauritania
Mauritius
Mexico
Micronesia
Moldova
Monaco
Mongolia
Montenegro
Morocco
Mozambique
Myanmar, {Burma}
Namibia
Nauru
Nepal
Netherlands
New Zealand
Nicaragua
Niger
Nigeria
Norway
Oman
Pakistan
Palau
Panama
Papua New Guinea
Paraguay
Peru
Philippines
Poland
Portugal
Qatar
Romania
Russia
Russian Federation 
Rwanda
St Kitts & Nevis
St Lucia
Saint Vincent & the Grenadines
Samoa
San Marino
Sao Tome & Principe
Saudi Arabia
Senegal
Serbia
Seychelles
Sierra Leone
Singapore
Slovakia
Slovenia
Solomon Islands
Somalia
South Africa
South Sudan
Spain
Sri Lanka
Sudan
Suriname
Swaziland
Sweden
Switzerland
Syria
Taiwan
Tajikistan
Tanzania
Thailand
Togo
Tonga
Trinidad & Tobago
Tunisia
Turkey
Turkmenistan
Tuvalu
Uganda
Ukraine
United Arab Em.
United Arab Emirates
United Kingdom
United States
Uruguay
Uzbekistan
Vanuatu
Vatican City
Venezuela
Vietnam
Yemen
Zambia
Zimbabwe


*/ 


// Corrections for the top 50 companies that appear in the database 
mappings_name = []; 
mappings_name.push(new mapping('MOBOLUTIONS, LLC', ["MOBOLUTIONS"])); 
mappings_name.push(new mapping('EMC CORPORATION', ["EMC"])); 
mappings_name.push(new mapping('INTERNATIONAL BUSINESS MACHINES', [])); 
mappings_name.push(new mapping('HUAWEI TECHNOLOGIES CO., LTD', ['HUAWEI', 'HUAWEI TECHNOLOGIES']));
mappings_name.push(new mapping('UNICOM GLOBAL', ['UNICOM']));
mappings_name.push(new mapping('INFOSYS LIMITED', []));
mappings_name.push(new mapping('AVAYA INC', ['AVAYA']));
mappings_name.push(new mapping('OpenText Software GmbH', ['Open Text Software', 'OpenText Software']));
mappings_name.push(new mapping('BASIS TECHNOLOGIES INTERNATIONAL', []));
mappings_name.push(new mapping('T-Systems International GmbH', ['T Systems International','T-Systems International']));
mappings_name.push(new mapping('HIGHRADIUS CORPORATION', ['HIGH RADIUS', 'HIGHRADIUS']));
mappings_name.push(new mapping('TJC SA', []));
mappings_name.push(new mapping('Hewlett Packard Ltd', []));
mappings_name.push(new mapping('Commvault Systems, Inc.', ['Commvault Systems']));
mappings_name.push(new mapping('PROMETHEUS GROUP, INC.', ['PROMETHEUS GROUP']));
mappings_name.push(new mapping('DOCFLOW BEST PRACTICE, LTD', ['DOCFLOW BEST PRACTICE']));
mappings_name.push(new mapping('S&N AG', []));
mappings_name.push(new mapping('GABINET DE SOFTWARE PROFESSIONAL', []));
mappings_name.push(new mapping('SECURITY WEAVER, LLC', ['SECURITY WEAVER']));
mappings_name.push(new mapping('ARTERIA TECHNOLOGIES PVT LTD', ['ARTERIA TECHNOLOGIES']));
mappings_name.push(new mapping('INNOVAPPTIVE INC.', ['INNOVAPPTIVE']));









 //var mapObject_1 = {mapTo : 'United States', mapFrom : ["US", "United States of America", "America", "The States"]};
 //mappings_country.push(map)


 //   mappings_country = pushIntoMappings(mappings_country, 'United States', ["US", "United States of America", "America", "The States"]); 
//    mappings_country = pushIntoMappings(mappings_country, 'United Kingdom', ["UK", "Britain", "England"]); 


function mapping(mapTo, mapFrom) { 

    this.mapTo = mapTo; 
    this.mapFrom = mapFrom; 

}

// pushes object {mapTo : mapTo_value, mapFrom : mapFrom_value} into mappings
//function pushIntoMappings(mappings, mapTo_value, mapFrom_value) {

 //   var mapObject_1 = {mapTo : mapTo_value, mapFrom : mapFrom_value};
    
//    mappings.push(mapObject_1);    

//    return mappings; 
//}

// mappings is an array of objects type mapping, {mapTo : value, mapFrom : value}, where mapTo is the valid string, 
// and mapFrom is the array that contains all of the possible strings that map to that mapTo string. 
// for instance mapTo is United States, mapFrom is ['United States', 'USA', 'America', 'The states']. 
// function returns null if toBeMapped string does not match an element in mapFrom, or mapTo if it does
function mapTo(mappings, toBeMapped){
    
    // traverse mapping objects in mappings 
    for  (var i = 0; i < mappings.length; i++){ 
        
        // traverse strings in mapping.mapFrom
        for (var j = 0; j < mappings[i].mapFrom.length; j++) { 
            
            if (toBeMapped === mappings[i].mapFrom[j].toUpperCase()) { 
                return mappings[i].mapTo.toUpperCase(); 
        }
        
        }
        
    }
    
    return null; 
    
}

function correctCountry(country) { 

    if (mapTo(mappings_country, country) !== null) {
        country = mapTo(mappings_country, country); 
    }

    return country; 
}

function correctCompanyName(companyName) { 

    if (mapTo(mappings_name, companyName) !== null) {
        companyName = mapTo(mappings_name, companyName); 
    }

    return companyName; 
}

 module.exports = { 

    correctCountry: correctCountry, 
    correctCompanyName: correctCompanyName

 }; 