
// konvertiert das von OWP zurückgegeben JSON-Objekt json in ein für unsere Zwecke einfacheres Objekt 
function owpjsonToWeather(json){
        
    var weather = {};
    
    weather.lon = json.coord.lon;
    weather.lat = json.coord.lat;
    weather.cityName = json.name;
    weather.country = json.sys.country;
    
    weather.wId = json.weather.id;
    weather.wMain = json.weather.main;
    weather.wDescription = json.weather.description;
    weather.sunriseUnix = json.sys.sunrise;
    weather.sunriseDate = new Date(weather.sunriseUnix*1000);
    weather.sunsetUnix = json.sys.sunset;
    weather.sunsetDate = new Date(weather.sunsetUnix*1000);
    weather.TimeOfData = json.dt;
    
    weather.temp = json.main.temp;
    weather.pressure = json.main.pressure;
    weather.pressureSeaLevel = json.main.sea_level;
    weather.pressureGroundLevel = json.main.grnd_level;
    weather.humidity = json.main.humidity;
    weather.windSpeed = json.wind.speed + 10;	// Fix?
    weather.windSpeedPercent = weather.windSpeed/0.8;
    weather.windSpeedPercentFactor = weather.windSpeed/80;
    weather.windDirectionDegree = json.wind.deg;
    weather.windDirectionRad = Math.radians(weather.windDirectionDegree);
    weather.windDirection2D = getWindDirection2D(weather.windDirectionDegree);
    weather.cloudPercent = json.clouds.all;
    weather.cloudPercentFactor = weather.cloudPercent/100;
	
	weather.rain3h = 0;
    if(json.hasOwnProperty('rain')){	// 1mm equals 1L/m²
        weather.rain3h = json.rain["3h"] / 39;	// using 1/8 of the record precipitation of 312mm in 24h from 12.08.02
		if(weather.rain3h > 1){
			weather.rain3h = 1;
		}
	}
	
	weather.snow3h = 0;
    if(json.hasOwnProperty('snow')){
        weather.snow3h = json.snow["3h"] / 18;	// 1/8 of the record (Zugspitze)
		if(weather.snow3h > 1){
			weather.snow3h = 1;
		}
	}
	
	weather.thunder = 0;
	if((weather.wId > 199) && (weather.wId < 299)){	// thunderstorm
		weather.thunder = 0.5;
		if(weather.wId == 210){	// light thunderstorm
			weather.thunder = 0.3;
		} else if(weather.wId == 212){	// heavy thunderstorm
			weather.thunder = 0.9;
		}
	}
	
	// Maybe with a colore value?
	weather.fog = 0;
	if(weather.wId == 701){	// mist
			weather.fog = 0.004;
	} else if(weather.wId == 711 || weather.wId == 721){	// smoke & haze
			weather.fog = 0.006;
	}  else if(weather.wId == 741 || weather.wId == 761){	// fog & dust
			weather.fog = 0.008;
	}
	
	// Weather condition codes group 6xx: Snow???
	
    return weather;
}

// TODO durch THREEJS-gedToRad ersetzen
Math.radians = function(degrees) {
    return ((degrees * Math.PI / 180));
};

function getWindDirection2D(degree = 0) {
    rads = Math.radians(degree);
    vec2D = [Math.cos(rads), Math.sin(rads)];			
    return vec2D;
    //return [Math.cos(Math.radians(degree)), Math.sin(Math.radians(degree))]
}
