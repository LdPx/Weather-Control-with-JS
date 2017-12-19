
conf = {
    cloud: {
        maxNumClouds: 250,
        minRaininessColor: new THREE.Color(0xffffff),
        maxRaininessColor: new THREE.Color(0x7f7f7f),
        spawnHeight: 70,
        startAngle: Math.PI,    // rad, aus [0,2*PI]
        spreadDistance: 50 // Wolken werden um aktuellen Spawnpunkt zufällig gespawnt, mit Abstand aus [0,spread] 
    },
    lightning: {
        spawnY: 70,
        numKinks: 3,
        lineWidth: 0.3,
        fadeOutDelay: 1,  // sec
        alphaMap: new THREE.TextureLoader().load('./textures/lightning.png'),
        // max. Spawnchance je Frame, wenn kein Blitz aktuell vorhanden (könnte man auch von deltaTime abhg machen)
        // ist 0 bei min. raininess und maxSpawnRate bei max. raininess
        maxSpawnRate:  0.1,
        flashDelay: 1,    // sec
        flashStartIntensity: 10
    },
    rain: {
        maxNumRaindrops: 50000, // feucht!
        minRaininessSkyColor: new THREE.Color(0x2271f9),
        maxRaininessSkyColor: new THREE.Color(0x8b8989),
    },
    fog: {
        color: new THREE.Color(0xffffff),
        minDensity: 0,
        maxDensity: 0.01
    },
    model: {
        groundSize: 200,
        houseSize: 10,
        spawnRange: 50, // für Häuser & Blitze: x-,z-Komponente aus [-spawnRange,spawnRange]
        numHouses: 50
    }
};

// globale Uhr (nötig für Animationen)
var clock = new THREE.Clock();

var scene = new THREE.Scene();
scene.background = conf.rain.minRaininessSkyColor;
scene.fog = new THREE.FogExp2(conf.fog.color, conf.fog.minDensity);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
//camera.position.set(250,100,200);
camera.position.set(100, 75, 20);
console.log('set camera to', camera.position);
camera.lookAt(scene.position);

var renderer = new THREE.WebGLRenderer();
//renderer.physicallyCorrectLights = true;    
//renderer.gammaInput = true;
//renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Boden
// TODO "Stadtmodell"-Erzeugung nach house.js schieben, nur Meshes zurückgeben
var geometry = new THREE.PlaneGeometry(conf.model.groundSize,conf.model.groundSize);
//var material = new THREE.MeshStandardMaterial({color: 0x10e52c, side: THREE.DoubleSide});
var material = new THREE.MeshStandardMaterial({ambient: 0x050505, color: 0x10e52c, specular: 0x555555, shininess: 30, side: THREE.DoubleSide});
var plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI/2;
plane.receiveShadow = true;
scene.add(plane);

var bodyMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
for(var i = 0; i < conf.model.numHouses; i++){
    var x = getRandomInt(-conf.model.spawnRange, conf.model.spawnRange);
    var z = getRandomInt(-conf.model.spawnRange, conf.model.spawnRange);
    var pos = new THREE.Vector3(x, conf.model.houseSize/2, z);
    var house = createHouse(pos, conf.model.houseSize, bodyMaterial, roofMaterial);
    scene.add(house.body);
    scene.add(house.roof);
}
      
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


// zur Anzeige des Wolken-Spawnpunktes
var cloudSpawnPointViz = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial( {color: 0x00ff00} ) );
cloudSpawnPointViz.add(new THREE.AxisHelper(20));
scene.add(cloudSpawnPointViz);

// TODO bringt's das?
//var hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
//scene.add(hemLight);


var ambientLight = new THREE.AmbientLight(0x404040, 2); // soft white light
scene.add(ambientLight);

//var lightningFlash = new THREE.PointLight(0xffffff, 0, 0, 2);
var lightningFlash = new THREE.AmbientLight(0x404040, 0);
scene.add(lightningFlash);

var rainParticleGroup = createRainEngine(conf.rain.maxNumRaindrops);
console.log('created rain engine, ' + conf.rain.maxNumRaindrops + ' particles');
scene.add(rainParticleGroup.mesh);

var windDirection = new THREE.Vector3(0, 0, 30);
var cloudParticleGroup = createCloudEngine(conf.cloud.maxNumClouds, windDirection, conf.cloud.spreadDistance);
console.log('created cloud engine, ' + conf.cloud.minNumClouds + ' particles');
scene.add(cloudParticleGroup.mesh);

var lightningData = null;

var guiData = {
    raininess: 0,
    cloudiness: 0.1,
    fog_density: conf.fog.minDensity,
    wind_angle: conf.cloud.startAngle,
    load_weather_data: requestWeatherData
};

// GUI
var gui = new dat.GUI();
gui.add(guiData, "raininess", 0, 1, 0.01).onChange(guiChanged);
gui.add(guiData, "cloudiness", 0.1, 1, 0.01).onChange(guiChanged);
gui.add(guiData, "fog_density", conf.fog.minDensity, conf.fog.maxDensity, 0.0001).onChange(guiChanged);
gui.add(guiData, "wind_angle", 0, 2*Math.PI, 0.01).onChange(onWindAngleChanged);
gui.add(guiData, "load_weather_data");
// alternativ: onFinishChange -> Callback erst bei Fokusverlust aufgerufen
guiChanged();
onWindAngleChanged(guiData.wind_angle);

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

animate();

// TODO in mehrere Callbacks aufsplitten (Performance) ?
function guiChanged(){
    console.log('gui changed', guiData);    
    var newCloudColor = conf.cloud.minRaininessColor.clone().lerp(conf.cloud.maxRaininessColor, guiData.raininess);
    cloudParticleGroup.emitters[0].color.value = newCloudColor;
    cloudParticleGroup.emitters[0].activeMultiplier = guiData.cloudiness;
    scene.background = conf.rain.minRaininessSkyColor.clone().lerp(conf.rain.maxRaininessSkyColor, guiData.raininess);
    rainParticleGroup.emitters[0].activeMultiplier = guiData.raininess;
    scene.fog.density = guiData.fog_density;
}

function onWindAngleChanged(angle){
    var cloudSpawnDist = conf.model.groundSize/2;
    var x = cloudSpawnDist*Math.cos(angle);
    var y = conf.cloud.spawnHeight;
    var z = cloudSpawnDist*Math.sin(angle);
    cloudParticleGroup.emitters[0].position.value.set(x,y,z);
    cloudSpawnPointViz.position.set(x,y,z);
}

function spawnLightning(){
    var x = getRandomInt(-conf.model.spawnRange, conf.model.spawnRange);
    var z = getRandomInt(-conf.model.spawnRange, conf.model.spawnRange);
    var lightningStart = new THREE.Vector3(x,conf.lightning.spawnY,z);
    var lightningDir = new THREE.Vector3(x,0,z).sub(lightningStart);
    var lightningModel = createLightning(lightningStart, lightningDir, conf.lightning.numKinks);
    extendLightningPaths(lightningModel);
    var lightningData = renderLightning(lightningModel, conf.lightning.lineWidth, conf.lightning.alphaMap);
    lightningData.meshes.forEach((mesh) => {scene.add(mesh);});
    return lightningData;
}

function removeLightning(lightningData){
    lightningData.meshes.forEach(function(mesh){
        scene.remove(mesh);
        mesh.geometry.dispose();
    });
    lightningData.materials.forEach((material) => { material.dispose(); });
}

function lightningFadeOut(deltaTime){
    if(lightningData === null){
        if(Math.random() <= conf.lightning.maxSpawnRate * guiData.raininess){
            lightningData = {
                data: spawnLightning(),
                timeElapsed: 0
            }; 
            lightningFlash.intensity = conf.lightning.flashStartIntensity;
        }
    }
    else {
        var opacityDiff = deltaTime/conf.lightning.fadeOutDelay;
        lightningData.timeElapsed += deltaTime;
        lightningData.data.materials.forEach(mat => { mat.uniforms.opacity.value -= opacityDiff; }); 
        if(lightningData.timeElapsed < conf.lightning.flashDelay){
            var flashIntensityDiff = conf.lightning.flashStartIntensity*deltaTime/conf.lightning.flashDelay;
            lightningFlash.intensity -= flashIntensityDiff;
        }
        if(lightningData.timeElapsed >= conf.lightning.fadeOutDelay){
            removeLightning(lightningData.data);
            lightningData = null;
        }
    }
}

function requestWeatherData(){
    var url = 'http://api.openweathermap.org/data/2.5/weather?units=metric&lat=51.2&lon=6.47&APPID=43a26c85c29d39f47dc194dda192eb3a';
    $.getJSON(url)
    .done(function(json){
        var weather = owpjsonToWeather(json);
        console.log('loaded weather', weather);
    })
    .fail(function(jqXHR, textStatus, errorThrown){
        alert("weather api call failed\n" + JSON.stringify({url: url, jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown}));
    });
}

function animate() {
    requestAnimationFrame(animate);
    var deltaTime = clock.getDelta();
    render(deltaTime);
}

function render(deltaTime){
    rainParticleGroup.tick(deltaTime);
    cloudParticleGroup.tick(deltaTime);
    lightningFadeOut(deltaTime);
    renderer.render(scene,camera);
}





