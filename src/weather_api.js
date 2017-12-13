		/*
		var weather = {
			// location
			lon:-1,
			lat:-1,
			cityName:"",
			//id
			country:"",
			
			// general
			wId:-1,
			wMain:"",
			wDescription:"",
			sunriseUnix:-1,
			sunriseDate: undefined,	//.getHours();	//.getMinutes();	//.getSeconds();
			sunsetUnix:-1,
			sunsetDate: undefined,	//.getHours();	//.getMinutes();	//.getSeconds();
			TimeOfData:-1,
			
			// weather
			temp:-99,
			pressure:-1,
			pressureSeaLevel:-1,
			pressureGroundLevel:-1,
			humidity:-1,
			windSpeed:-1,
			windSpeedPercent:0,	// 100% = 80km/h
			windSpeedPercentFactor:0,	// 1 = 100%
			windDirectionDegree:-1,
			windDirectionLetter:'X',
			windDirection2D: [0,0], // ???
			thunder: false,
			drizzle: false,
			rain: false,
			snow: false,
			fog: false, // ???
			// clouds ???
			// hail ???
			
			cloudPercent:-1,
			cloudPercentFactor:0,	// 1 = 100%
			rain3h:-1,
			snow3h:-1
		};*/

        
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
            weather.windSpeed = json.wind.speed;
            weather.windSpeedPercent = weather.windSpeed/0.8;
            weather.windSpeedPercentFactor = weather.windSpeed/80;
            weather.windDirectionDegree = json.wind.deg;
            weather.windDirection2D = getWindDirection2D(weather.windDirectionDegree);
            weather.cloudPercent = json.clouds.all;
            weather.cloudPercentFactor = weather.cloudPercent/100;
            if(json.hasOwnProperty('rain')){
                weather.rain3h = json.rain["3h"];	// Who is making this stuff up!?
            } else {
                weather.rain3h = 0;
            }
            if(json.hasOwnProperty('snow')){
                weather.snow3h = json.snow["3h"];
            } else {
                weather.snow3h = 0;
            }
            return weather;
		}
		
        // TODO durch THREEJS-gedToRad ersetzen
		Math.radians = function(degrees) {
			return ((degrees * Math.PI / 180) - Math.PI);
		};
		
		function getWindDirection2D(degree = 0) {
			rads = Math.radians(degree);
			vec2D = [Math.cos(rads), Math.sin(rads)];			
			return vec2D;
			//return [Math.cos(Math.radians(degree)), Math.sin(Math.radians(degree))]
		}
		