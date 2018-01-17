
// Konfigurationsobjekt, enthält die meisten Stellschrauben der Wetterdarstellung
conf = {
    url: 'http://api.openweathermap.org/data/2.5/weather?units=metric&lat=51.2&lon=6.47&APPID=43a26c85c29d39f47dc194dda192eb3a',    // URL zum Abruf d. Wetterdaten
    lat: 51.2,
	lon: 6.47,
	cameraPosition: new THREE.Vector3(100,150,20),
    //cameraPosition: new THREE.Vector3(0,600,0),
    //cameraPosition: new THREE.Vector3(0,0,300),
    positionY: 150, // Spawnhöhe Blitze, Wolken, Regen, Schnee,
    positionSpreadY: 50,    // Spawnhöhenstreuung Regen, Schnee
    cloud: {
        maxNumClouds: 250,
        texture: new THREE.TextureLoader().load('./textures/cloud.png'),
        minRaininessColor: new THREE.Color(0xffffff),   // Wolkenfarbe bei max. raininess
        maxRaininessColor: new THREE.Color(0x7f7f7f),   // Wolkenfarbe bei min. raininess
        startAngle: Math.PI/2,    // aus [0,2*PI]   // Startrichtung des Windes
        minForce: 1,   // min. Windstärke
        maxForce: 200,  // max. Windstärke
        positionSpread: new THREE.Vector3(200,10,200),  // bestimmt Bereich um zentralen Spawnpunkt, in dem Wolken zufällig gespawnt werden (Streuung in Y-Richtung klein, in X-,Z-Richtung groß)
        maxAge: 10,   // Lebenszeit jedes Wolkenpartikels; beeinflußt auch Geschwindigkeit (lange Lebenszeit -> niedrige Geschwindigkeit)
        size: 75,   // Wolkengröße
        sizeSpread: 500  // Streuung der Wolkengröße
    },
    lightning: {
        numKinks: 3,    // Anzahl Knicke des Blitz-Hauptzweiges
        lineWidth: 0.75, // Breite des Hauptzweiges
        fadeOutDelay: 1,  // Zeit, bis Blitz verschwunden (Sekunden)
        alphaMap: new THREE.TextureLoader().load('./textures/lightning.png'),   // Alphamap für Blitz, damit Ränder transparent
        maxExpectedSpawnsPerSeconds: 0.5, // max. erwartungsgemäße Dauer zwischen dem Verschwinden eines Blitzes und dem Spawn eines neuen Blitzes (d.h. bei maximalem thunder spawnen durchschnittlich maxExpectedSpawnsPerSeconds Blitze pro Sekunde (abzgl. der Fadeout-Dauer bereits gespawnter Blitze!)
        flashDelay: 1,    // Blitzlichtdauer (Sekunden)
        flashStartIntensity: 10 // Start-Blitzlichintensität
    },
    rain: {
        maxNumRaindrops: 5000, 
        texture: new THREE.TextureLoader().load('./textures/circle.png'),
        //minRaininessSkyColor: new THREE.Color(0x2271f9),    // Himmelsfarbe bei min. raininess
        //maxRaininessSkyColor: new THREE.Color(0x8b8989),    // Himmelsfarbe bei max. raininess
        velocityY: -100,    // Fallgeschwindigkeit der Tropfen
        velocitySpread: new THREE.Vector3(10,7.5,10),   // Fallstreuung der Tropfen
        size: 0.75,
        color: new THREE.Color(0x034aec)
    },
    snow: {
        maxNumSnowflakes: 5000,
        velocityY: -50, // Fallgeschwindigkeit der Schneeflocken
        velocitySpread: new THREE.Vector3(75,25,75),    // Fallstreuung der Schneeflocken
        texture: new THREE.TextureLoader().load('./textures/snowflake.png'),
        size: 2,
        color: new THREE.Color(0xffffff)
    },
    fog: {
        color: new THREE.Color(0xffffff),
        minDensity: 0,
        maxDensity: 0.01
    },
    model: {
        groundSize: 200,    // Grundfläche ist groundSize x groundSize groß, die Mitte befindet sich im Ursprung
        houseSize: 10,
        housePositionSpreadXZ: 100, // bestimmt Bereich, in dem Häuser zufällig gespawnt werden 
        numHouses: 50
    }
};

requestWeatherData();
setInterval(function(){ requestWeatherData(); }, 60000);	// interval parameter?

var guiData = {
    raininess: 0,
    snowiness: 0,
    cloudiness: 0,
    thunder: 0,
    fog_density: conf.fog.minDensity,
    wind_angle: conf.cloud.startAngle,
    wind_force: conf.cloud.minForce,
    load_weather_data: requestWeatherData,
	turbidity: 10,
	rayleigh: 2,
	mieCoefficient: 0.005,
	mieDirectionalG: 0.8,
	luminance: 1,
	inclination: 0.49, // elevation / inclination
	azimuth: 0.25, // Facing front,
	sun: ! true
};

function onRaininessChanged(){
    // Interpolation der Wolkenfarbe zwischen minRaininessColor und maxRaininessColor um Faktor raininess
    var newCloudColor = conf.cloud.minRaininessColor.clone().lerp(conf.cloud.maxRaininessColor, guiData.raininess);
    cloudParticleGroup.emitters[0].color.value = newCloudColor;
    //scene.background = conf.rain.minRaininessSkyColor.clone().lerp(conf.rain.//maxRaininessSkyColor, guiData.raininess);
    rainParticleGroup.emitters[0].activeMultiplier = guiData.raininess; // emittiere den Anteil raininess der max. vorhandenen Wolken
}

function onSnowinessChanged(){
    snowParticleGroup.emitters[0].activeMultiplier = guiData.snowiness;
}

function onCloudinessChanged(){
    cloudParticleGroup.emitters[0].activeMultiplier = guiData.cloudiness;
	
	dirLight.intensity = 1 - guiData.cloudiness;

}

function onFogDensityChanged(){  
    scene.fog.density = guiData.fog_density;
}

function onSunChanged() {

	var uniforms = sky.material.uniforms;
	uniforms.turbidity.value = guiData.turbidity;
	uniforms.rayleigh.value = guiData.rayleigh;
	uniforms.luminance.value = guiData.luminance;
	uniforms.mieCoefficient.value = guiData.mieCoefficient;
	uniforms.mieDirectionalG.value = guiData.mieDirectionalG;

	var now = new Date();
	var start = new Date(now.getFullYear(), 0, 0);
	var diff = now - start;
	var oneDay = 1000 * 60 * 60 * 24;
	//var day = Math.floor(diff / oneDay); //day of the year
	//var hours = now.getHours() - 1;
	var day = 100;
	var hours = 16;
	var minutes = now.getMinutes();
	/*
	
	Höhenwinkel und azimut müssen auf -Werte gechekct werden.
	
	*/
	var height = calcHeight(conf.lat, conf.lon, day, hours, minutes );
	
	guiData.inclination = ((height + 90) / 180) ;

	guiData.azimuth = ((calcAzimuth(conf.lat, conf.lon, day, hours, minutes, height) / 360) +0.5) ;
	
	var theta = Math.PI  * ( guiData.inclination - 0.5 );
	var phi = 2 * Math.PI * ( guiData.azimuth - 0.5 );

	sunSphere.position.x = distance * Math.cos( phi );
	sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
	sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
	
	dirLight.position.x = distance * Math.cos( phi );
	dirLight.position.y = distance * Math.sin( phi ) * Math.sin( theta );
	dirLight.position.z = distance * Math.sin( phi ) * Math.cos( theta );


	sunSphere.visible = guiData.sun;

	uniforms.sunPosition.value.copy( sunSphere.position );
	//Schatten anpassen.
}

// passt Spawnpunkt der Wolken und Flugrichtung der Wolken an Windgeschwindigkeit, -winkel und maxAge an
// je höher die Windgeschwindigkeit, desto weiter weg vom Ursprung spawnen Wolken
// je höher maxAge, desto langsamer fliegen die Wolken (damit sie etwa am anderen Ende des Modells verschwinden)
function updateWind(angle, windForce){
    var x = windForce*Math.cos(angle);
    var z = windForce*Math.sin(angle);
    cloudParticleGroup.emitters[0].velocity.value.set(-x, 0, -z).multiplyScalar(2.0/conf.cloud.maxAge);
    cloudParticleGroup.emitters[0].position.value.set(x, conf.positionY, z);
    updateCloudDirViz();
}

function onWindAngleChanged(){
    updateWind(guiData.wind_angle, guiData.wind_force);
}

function onWindForceChanged(){
    updateWind(guiData.wind_angle, guiData.wind_force);
}

// erzeuge neuen Blitz
function spawnLightning(){
    var x = randomOfAbs(conf.model.groundSize/2);   // spawne Blitz irgendwo im Modellbereich
    var z = randomOfAbs(conf.model.groundSize/2);
    var lightningStart = new THREE.Vector3(x,conf.positionY,z); // Blitz startet auf Wolkenhöhe und endet auf dem Boden, je mit gleicher x-,z-Koordinate
    var lightningDir = new THREE.Vector3(x,0,z).sub(lightningStart);
    var lightningModel = createLightning(lightningStart, lightningDir, conf.lightning.numKinks);    // erzeuge 3D-Punktpfade der Zweige
    extendLightningPaths(lightningModel);   // jeden Blitzzweig-Pfad um seinen Elternzweig-Pfad zur Ästhetik
    var lightningData = renderLightning(lightningModel, conf.lightning.lineWidth, conf.lightning.alphaMap); // erzeuge Meshes mit Materials
    lightningData.meshes.forEach((mesh) => {scene.add(mesh);});
    return lightningData;
}

// entferne Modelldaten des akt. Blitz
function removeLightning(lightningData){
    lightningData.meshes.forEach(function(mesh){
        scene.remove(mesh);
        mesh.geometry.dispose();
    });
    lightningData.materials.forEach((material) => { material.dispose(); });
}

// aktualisiere Blitz-Darstellung
function lightningFadeOut(dt){
    if(lightningData === null){ // kein Blitz vorhanden?
        if(Math.random() < dt*conf.lightning.maxExpectedSpawnsPerSeconds*guiData.thunder){  // erzeuge zufällig neuen Blitz (mehr dt vergangen -> höhere Spawnchance, maxExpectedSpawnsPerSeconds höher -> höhere Spawnchance, thunder höher -> höhere Spawnchance)
            lightningData = {
                data: spawnLightning(), 
                timeElapsed: 0
            }; 
            lightningFlash.intensity = conf.lightning.flashStartIntensity;
        }
    }
    else {
        // lasse Blitz im Verlauf der Zeit transparenter werden (d.h. verringere Opakheit des Blitzes proportional zu dt)
        var opacityDiff = dt/conf.lightning.fadeOutDelay;
        lightningData.timeElapsed += dt;
        lightningData.data.materials.forEach(mat => { mat.uniforms.opacity.value -= opacityDiff; });    // verringere bei allen Materials die Opakheit
        // verringere Intensität des Blitzlichtes, proportional zu dt (bis Blitz länger als flashDelay Zeiteinheiten existent)
        if(lightningData.timeElapsed < conf.lightning.flashDelay){
            var flashIntensityDiff = conf.lightning.flashStartIntensity*dt/conf.lightning.flashDelay;
            lightningFlash.intensity -= flashIntensityDiff;
        }
        // entferne Blitz, falls insg. mehr als fadeOutDelay Zeiteinheiten existent
        if(lightningData.timeElapsed >= conf.lightning.fadeOutDelay){
            removeLightning(lightningData.data);
            lightningData = null;
        }
    }
}

// lädt Wetterdaten asynchron von der konfigurierten URL, fügt benötigte Daten in guiData ein
function requestWeatherData(){
    var url = conf.url;
    $.getJSON(url)
    .done(function(json){
        var weather = owpjsonToWeather(json);   // konvertiere Daten vom OWP-JSON-Darstellung in hier benötigte Darstellung
        console.log('loaded weather', weather);
        
		guiData.raininess = weather.rain3h;
		onRaininessChanged();
		
		guiData.snowiness = weather.snow3h;
		onSnowinessChanged();
		
		guiData.cloudiness = weather.cloudPercentFactor;
		onCloudinessChanged();
		
		guiData.thunder = weather.thunder;
		
		guiData.fog_density = weather.fog;
		onFogDensityChanged();
		
		guiData.wind_angle = weather.windDirectionRad;
		onWindAngleChanged();
		
		guiData.wind_force = weather.windSpeed;	// Better value?
		onWindForceChanged();
		
		
		
		for (var i in gui.__controllers) {
			gui.__controllers[i].updateDisplay();
		}
    })
    .fail(function(jqXHR, textStatus, errorThrown){
        alert("weather api call failed\n" + JSON.stringify({url: url, jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown}));
    });
}

// erzeugt Pfeil zur Visualisierung der Windrichtung (Pfeil befindet sich auf Wolkenhöhe)
function newCloudDirViz(){
    var vel = cloudParticleGroup.emitters[0].velocity.value;
    var pos = cloudParticleGroup.emitters[0].position.value;
    var cloudDirViz = new THREE.ArrowHelper(vel.clone().normalize(), pos, vel.length());
    cloudDirViz.position.set(pos.x,pos.y,pos.z);
    return cloudDirViz;
}
// aktualisiert Visualisierung der Windrichtung
function updateCloudDirViz(){
    var vel = cloudParticleGroup.emitters[0].velocity.value;
    var pos = cloudParticleGroup.emitters[0].position.value;
    cloudDirViz.position.set(pos.x,pos.y,pos.z);
    cloudDirViz.setDirection(vel.clone().normalize());
    cloudDirViz.setLength(vel.length());
}
function initSky() {

	// Add Sky
	sky = new THREE.Sky();
	sky.scale.setScalar( 450000 );
	scene.add( sky );

	// Add Sun Helper
	sunSphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry( 20000, 16, 8 ),
		new THREE.MeshBasicMaterial( { color: 0xffffff } )
	);
	sunSphere.position.y = - 700000;
	sunSphere.visible = false;
	scene.add( sunSphere );

	onSunChanged();
}


var sky, sunSphere;
var distance = 900; //sun

// Uhr (z.B. nötig für delta time-Berechnung)
var clock = new THREE.Clock();

var scene = new THREE.Scene();
//scene.background = conf.rain.minRaininessSkyColor;  // Himmelsfarbe
scene.fog = new THREE.FogExp2(conf.fog.color, conf.fog.minDensity); // Nebel

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 2000000);
camera.position.set(conf.cameraPosition.x,conf.cameraPosition.y,conf.cameraPosition.z);
console.log('set camera to', camera.position);
camera.lookAt(scene.position);

var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Modell: Boden, Häuser (bestehend aus Körper, Dach)
var cityMeshes = createCity(conf.model.groundSize, conf.model.numHouses, conf.model.housePositionSpreadXZ, conf.model.houseSize);
scene.add(cityMeshes.planeMesh);
cityMeshes.houseMeshes.forEach(houseMesh => {
    scene.add(houseMesh.body);
    scene.add(houseMesh.roof);
});


      
// Licht: Farbe, Intensität
var dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(20, 100, 100);
dirLight.castShadow = true;            // default false

// Schattenauflösung (muss 2er-Potenz sein; größer => genauer & rechenaufwändiger)
dirLight.shadow.mapSize.set(512, 512);
// Frustum der Schattenkamera 
dirLight.shadow.camera.near = 0.5;    
dirLight.shadow.camera.far = 1000;     
dirLight.shadow.camera.right = 100;
dirLight.shadow.camera.left = -100;
dirLight.shadow.camera.top	= 100;
dirLight.shadow.camera.bottom = -100;
scene.add(dirLight);

initSky();

// visualisiere direktionale Lichtquelle
scene.add(new THREE.DirectionalLightHelper(dirLight, 5));
// visualisiere Schatten der direktionalen Lichtquelle
scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
// visualisiere x-,y-,z-Achse
scene.add(new THREE.AxisHelper(1000));

// ambientes Licht
var ambientLight = new THREE.AmbientLight(0x404040, 2); 
scene.add(ambientLight);

// Blitzlicht (Startintensität 0)
var lightningFlash = new THREE.AmbientLight(0x404040, 0);
scene.add(lightningFlash);

// Regen-Partikelengine
var rainParticleGroup = createDropParticleEngine(conf.rain.maxNumRaindrops, conf.rain.texture, conf.positionY, conf.positionSpreadY, conf.model.groundSize, conf.rain.velocityY, conf.rain.velocitySpread, conf.rain.size, conf.rain.color);
console.log('created rain engine:', 'group', rainParticleGroup, 'emitter', rainParticleGroup.emitters[0]);
scene.add(rainParticleGroup.mesh);

// Schnee-Partikelengine
var snowParticleGroup = createDropParticleEngine(conf.snow.maxNumSnowflakes, conf.snow.texture, conf.positionY, conf.positionSpreadY, conf.model.groundSize, conf.snow.velocityY, conf.snow.velocitySpread, conf.snow.size, conf.snow.color);
console.log('created snow engine:', 'group', snowParticleGroup, 'emitter', snowParticleGroup.emitters[0]);
scene.add(snowParticleGroup.mesh);

// Wolken-Partikelengine
var cloudParticleGroup = createCloudEngine(conf.cloud.maxNumClouds, conf.cloud.texture, conf.positionY, conf.cloud.positionSpread, conf.cloud.maxAge, conf.cloud.size, conf.cloud.sizeSpread);
console.log('created cloud engine:', 'group', cloudParticleGroup, 'emitter', cloudParticleGroup.emitters[0]);
scene.add(cloudParticleGroup.mesh);


// zur Anzeige der Wolkenrichtung
var cloudDirViz = newCloudDirViz();
scene.add(cloudDirViz);

// Daten des aktuellen Blitzes (Modelldaten, Materials, Lebenszeit)
var lightningData = null;   

// control-Objekt zur Kamerabewegung
// das Objekt ist konfigurierbar (siehe dazu die Beispiele der ThreeJS-Website und den Quellcode von TrackballControls
// auf https://github.com/mrdoob/three.js/blob/master/examples/js/controls/TrackballControls.js )
var controls = new THREE.TrackballControls(camera, renderer.domElement);


// GUI
var gui = new dat.GUI();
gui.add(guiData, "raininess", 0, 1, 0.01).onChange(onRaininessChanged);
gui.add(guiData, "snowiness", 0, 1, 0.01).onChange(onSnowinessChanged);
gui.add(guiData, "cloudiness", 0, 1, 0.01).onChange(onCloudinessChanged);
gui.add(guiData, "thunder", 0, 1, 0.01);
gui.add(guiData, "fog_density", conf.fog.minDensity, conf.fog.maxDensity, 0.0001).onChange(onFogDensityChanged);
gui.add(guiData, "wind_angle", 0, 2*Math.PI, 0.01).onChange(onWindAngleChanged);
gui.add(guiData, "wind_force", conf.cloud.minForce, conf.cloud.maxForce, 0.1).onChange(onWindForceChanged);
gui.add( guiData, "turbidity", 1.0, 20.0, 0.1 ).onChange( onSunChanged );
gui.add( guiData, "rayleigh", 0.0, 4, 0.001 ).onChange( onSunChanged );
gui.add( guiData, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( onSunChanged );
gui.add( guiData, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( onSunChanged );
gui.add( guiData, "luminance", 0.0, 2 ).onChange( onSunChanged );
gui.add( guiData, "inclination", 0, 1, 0.0001 ).onChange( onSunChanged );
gui.add( guiData, "azimuth", 0, 1, 0.0001 ).onChange( onSunChanged );
gui.add( guiData, "sun" ).onChange( onSunChanged );
gui.add(guiData, "load_weather_data");

onRaininessChanged();
onSnowinessChanged();
onCloudinessChanged();
onFogDensityChanged();
onWindAngleChanged();
onWindForceChanged();
onSunChanged();

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}, false);

animate();


function animate() {
    var dt = clock.getDelta();
    requestAnimationFrame(animate); // animiere nächsten Frame
    controls.update();
    render(dt);
}

// aktualisiere Darstellung
// dt ist Zeitdifferenz (delta time) zwischen akt. Frame und letztem Frame
// Aktualisierung der Partikelengines, des Blitzes hängt von dt ab
function render(dt){
    cloudParticleGroup.tick(dt);
    rainParticleGroup.tick(dt);
    snowParticleGroup.tick(dt);
    lightningFadeOut(dt);
    renderer.render(scene,camera);
}


/*
// funktioniert (leider) nur so, nicht mit direkter Änderung im Emitter
function setMaxAge(emitter, maxAge){
    for ( var index = 0; index < emitter.particleCount; index++ ) {            
        var array = emitter.attributes.params.typedArray.array;
        var i = emitter.attributes.params.typedArray.indexOffset + ( index * emitter.attributes.params.typedArray.componentSize );
        array[i+2] = maxAge;
    }  
}
*/


