
// Konfigurationsobjekt, enthält die meisten Stellschrauben der Wetterdarstellung
conf = {
    url: 'http://api.openweathermap.org/data/2.5/weather?units=metric&lat=51.2&lon=6.47&APPID=43a26c85c29d39f47dc194dda192eb3a',    // URL zum Abruf d. Wetterdaten
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
        minForce: 10,   // min. Windstärke
        maxForce: 200,  // max. Windstärke
        positionSpread: new THREE.Vector3(200,10,200),  // bestimmt Bereich um zentralen Spawnpunkt, in dem Wolken zufällig gespawnt werden (Streuung in Y-Richtung klein, in X-,Z-Richtung groß)
        maxAge: 2,   // Lebenszeit jedes Wolkenpartikels; beeinflußt auch Geschwindigkeit (lange Lebenszeit -> niedrige Geschwindigkeit)
        size: 75,   // Wolkengröße
        sizeSpread: 50  // Streuung der Wolkengröße
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
        texture: new THREE.TextureLoader().load('./textures/raindrop2.png'),
        minRaininessSkyColor: new THREE.Color(0x2271f9),
        maxRaininessSkyColor: new THREE.Color(0x8b8989),
        velocityY: -100,    // Fallgeschwindigkeit der Tropfen
        velocitySpread: new THREE.Vector3(10,7.5,10),   // Fallstreuung der Tropfen
        size: 2,
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

var guiData = {
    raininess: 0,
    snowiness: 0,
    cloudiness: 0,
    thunder: 0,
    fog_density: conf.fog.minDensity,
    wind_angle: conf.cloud.startAngle,
    wind_force: conf.cloud.minForce,
    load_weather_data: requestWeatherData,
};

function onRaininessChanged(){
    // Interpolation der Wolkenfarbe zwischen minRaininessColor und maxRaininessColor um Faktor raininess
    var newCloudColor = conf.cloud.minRaininessColor.clone().lerp(conf.cloud.maxRaininessColor, guiData.raininess);
    cloudParticleGroup.emitters[0].color.value = newCloudColor;
    scene.background = conf.rain.minRaininessSkyColor.clone().lerp(conf.rain.maxRaininessSkyColor, guiData.raininess);
    rainParticleGroup.emitters[0].activeMultiplier = guiData.raininess; // emittiere den Anteil raininess der max. vorhandenen Wolken
}

function onSnowinessChanged(){
    snowParticleGroup.emitters[0].activeMultiplier = guiData.snowiness;
}

function onCloudinessChanged(){
    cloudParticleGroup.emitters[0].activeMultiplier = guiData.cloudiness;
}

function onFogDensityChanged(){  
    scene.fog.density = guiData.fog_density;
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
    var lightningModel = createLightning(lightningStart, lightningDir, conf.lightning.numKinks);
    extendLightningPaths(lightningModel);   // jeden Blitzzweig-Pfad um seinen Elternzweig-Pfad zur Ästhetik
    var lightningData = renderLightning(lightningModel, conf.lightning.lineWidth, conf.lightning.alphaMap);
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

function lightningFadeOut(dt){
    if(lightningData === null){
        if(Math.random() < dt*conf.lightning.maxExpectedSpawnsPerSeconds*guiData.thunder){
            lightningData = {
                data: spawnLightning(),
                timeElapsed: 0
            }; 
            lightningFlash.intensity = conf.lightning.flashStartIntensity;
        }
    }
    else {
        var opacityDiff = dt/conf.lightning.fadeOutDelay;
        lightningData.timeElapsed += dt;
        lightningData.data.materials.forEach(mat => { mat.uniforms.opacity.value -= opacityDiff; }); 
        if(lightningData.timeElapsed < conf.lightning.flashDelay){
            var flashIntensityDiff = conf.lightning.flashStartIntensity*dt/conf.lightning.flashDelay;
            lightningFlash.intensity -= flashIntensityDiff;
        }
        if(lightningData.timeElapsed >= conf.lightning.fadeOutDelay){
            removeLightning(lightningData.data);
            lightningData = null;
        }
    }
}

function requestWeatherData(){
    var url = conf.url;
    $.getJSON(url)
    .done(function(json){
        var weather = owpjsonToWeather(json);
        console.log('loaded weather', weather);
		guiData.cloudiness = weather.cloudPercentFactor;
		for (var i in gui.__controllers) {
			gui.__controllers[i].updateDisplay();
		}
    })
    .fail(function(jqXHR, textStatus, errorThrown){
        alert("weather api call failed\n" + JSON.stringify({url: url, jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown}));
    });
}

function newCloudDirViz(){
    var vel = cloudParticleGroup.emitters[0].velocity.value;
    var pos = cloudParticleGroup.emitters[0].position.value;
    var cloudDirViz = new THREE.ArrowHelper(vel.clone().normalize(), pos, vel.length());
    cloudDirViz.position.set(pos.x,pos.y,pos.z);
    return cloudDirViz;
}
function updateCloudDirViz(){
    var vel = cloudParticleGroup.emitters[0].velocity.value;
    var pos = cloudParticleGroup.emitters[0].position.value;
    cloudDirViz.position.set(pos.x,pos.y,pos.z);
    cloudDirViz.setDirection(vel.clone().normalize());
    cloudDirViz.setLength(vel.length());
}

var clock = new THREE.Clock();

var scene = new THREE.Scene();
scene.background = conf.rain.minRaininessSkyColor;
scene.fog = new THREE.FogExp2(conf.fog.color, conf.fog.minDensity);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
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
var dirLight = new THREE.DirectionalLight(0xffffff, 1);
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


// visualisiere direktionale Lichtquelle
scene.add(new THREE.DirectionalLightHelper(dirLight, 5));
// visualisiere Schatten der direktionalen Lichtquelle
scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
// visualisiere x-,y-,z-Achse
scene.add(new THREE.AxisHelper(1000));


var ambientLight = new THREE.AmbientLight(0x404040, 2); 
scene.add(ambientLight);

// Blitzlicht
var lightningFlash = new THREE.AmbientLight(0x404040, 0);
scene.add(lightningFlash);

var rainParticleGroup = createDropParticleEngine(conf.rain.maxNumRaindrops, conf.rain.texture, conf.positionY, conf.positionSpreadY, conf.model.groundSize, conf.rain.velocityY, conf.rain.velocitySpread, conf.rain.size, conf.rain.color);
console.log('created rain engine:', 'group', rainParticleGroup, 'emitter', rainParticleGroup.emitters[0]);
scene.add(rainParticleGroup.mesh);

var snowParticleGroup = createDropParticleEngine(conf.snow.maxNumSnowflakes, conf.snow.texture, conf.positionY, conf.positionSpreadY, conf.model.groundSize, conf.snow.velocityY, conf.snow.velocitySpread, conf.snow.size, conf.snow.color);
console.log('created snow engine:', 'group', snowParticleGroup, 'emitter', snowParticleGroup.emitters[0]);
scene.add(snowParticleGroup.mesh);

var cloudParticleGroup = createCloudEngine(conf.cloud.maxNumClouds, conf.cloud.texture, conf.positionY, conf.cloud.positionSpread, conf.cloud.maxAge, conf.cloud.size, conf.cloud.sizeSpread);
console.log('created cloud engine:', 'group', cloudParticleGroup, 'emitter', cloudParticleGroup.emitters[0]);
scene.add(cloudParticleGroup.mesh);


// zur Anzeige der Wolkenrichtung
var cloudDirViz = newCloudDirViz();
scene.add(cloudDirViz);


var lightningData = null;

// GUI
var gui = new dat.GUI();
gui.add(guiData, "raininess", 0, 1, 0.01).onChange(onRaininessChanged);
gui.add(guiData, "snowiness", 0, 1, 0.01).onChange(onSnowinessChanged);
gui.add(guiData, "cloudiness", 0, 1, 0.01).onChange(onCloudinessChanged);
gui.add(guiData, "thunder", 0, 1, 0.01);
gui.add(guiData, "fog_density", conf.fog.minDensity, conf.fog.maxDensity, 0.0001).onChange(onFogDensityChanged);
gui.add(guiData, "wind_angle", 0, 2*Math.PI, 0.01).onChange(onWindAngleChanged);
gui.add(guiData, "wind_force", conf.cloud.minForce, conf.cloud.maxForce, 0.1).onChange(onWindForceChanged);
gui.add(guiData, "load_weather_data");
onRaininessChanged();
onSnowinessChanged();
onCloudinessChanged();
onFogDensityChanged();
onWindAngleChanged();
onWindForceChanged();

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

animate();


function animate() {
    var dt = clock.getDelta();
    requestAnimationFrame(animate);
    render(dt);
}

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


