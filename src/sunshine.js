const K = 0.01745; //fuer Bogenmassumerechnung
const EARTH_TILT = -23.45;

function createSunEngine(time, location) {
	
	
}


function calcDeclination(day){
	return EARTH_TILT * Math.cos(K * 360 * (day + 10)/365 ); //Magic-number 10 => Differenz zur Wintersonnenwende
}

function timeEquation(day){
	return 60 * (-0.171 * Math.sin(0.0337  * day + 0.465) - 0.1299 * Math.sin(0.01787 * day - 0.168));  //Magic numbaer w'scheinlich Ellipse der Erdbahn.
}

function hourAngle(day, hour, minute, lon){
	return 15 * (hour + minute / 60 - (15.0 - lon)/15.0 - 12 + timeEquation(day)/60);
}

function calcHeight(lat, lon, day, hour, minute){
	var declin = calcDeclination(day);
	var x = Math.sin(K * lat) * Math.sin(K * declin) 
		+ Math.cos(K * lat) * Math.cos(K * declin) * Math.cos(K * hourAngle(day, hour, minute, lon));
	
	return Math.asin(x)/K;
}

function calcAzimut(lat, lon, day, hour, minute, height){
	var declin = calcDeclination(day);
	var y = -(Math.sin(K * lat) * Math.sin(K * height) - Math.sin(K * declin)) /
		(Math.cos(K * lat) * Math.sin(Math.acos(Math.sin(K * height))));
	
	return Math.acos(y)/K;
}