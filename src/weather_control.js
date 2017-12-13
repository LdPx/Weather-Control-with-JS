
conf = {
    cloud: {
        maxNumClouds: 250,
        spawnCenter: new THREE.Vector3(0, 70, -50),
        minRaininessColor: new THREE.Color(0xffffff),
        maxRaininessColor: new THREE.Color(0x7f7f7f),
    },
    lightning: {
        spawnY: 70,
        numKinks: 3,
        spawnRange: houseSpawnRange,
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
        minRaininessColor: new THREE.Color(0x2271f9),
        maxRaininessColor: new THREE.Color(0x8b8989),
    }    
};

// globale Uhr (nötig für Animationen)
var clock = new THREE.Clock();

var scene = new THREE.Scene();
scene.background = conf.rain.minRaininessColor;
//scene.fog = new THREE.FogExp2(0xefd1b5, 0.01);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(100, 75, 20);
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
//renderer.physicallyCorrectLights = true;    
//renderer.gammaInput = true;
//renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Boden
// TODO "Stadtmodell"-Erzeugung nach house.js schieben, nur Meshes zurückgeben
var groundSize = 200;
var geometry = new THREE.PlaneGeometry(groundSize,groundSize);
//var material = new THREE.MeshStandardMaterial({color: 0x10e52c, side: THREE.DoubleSide});
var material = new THREE.MeshStandardMaterial({ambient: 0x050505, color: 0x10e52c, specular: 0x555555, shininess: 30, side: THREE.DoubleSide});
var plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI/2;
plane.receiveShadow = true;
scene.add(plane);

var numHouses = 50;
var houseSpawnRange = groundSize/4;
var houseSize = 10;
var bodyMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
for(var i = 0; i < numHouses; i++){
    var x = getRandomInt(-houseSpawnRange, houseSpawnRange);
    var z = getRandomInt(-houseSpawnRange, houseSpawnRange);
    var pos = new THREE.Vector3(x, houseSize/2, z);
    var house = createHouse(pos, houseSize, bodyMaterial, roofMaterial);
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

// TODO fog oder ergänzen => sieht vllt alles besser aus?
var windDirection = new THREE.Vector3(0, 0, 30);
var cloudParticleGroup = createCloudEngine(conf.cloud.maxNumClouds, conf.cloud.spawnCenter, windDirection);
// Aktualisierung des 'velocity'-Attributes: z.B.
// windDirection.z += 1;
// cloudParticleGroup.emitters[0].velocity.value = windDirection;
console.log('created cloud engine, ' + conf.cloud.minNumClouds + ' particles');
scene.add(cloudParticleGroup.mesh);

var lightningData = null;

var guiData = {
    raininess: 0,
    cloudiness: 0.1,
    explode: requestWeatherData
};

// GUI
var gui = new dat.GUI();
gui.add(guiData, "raininess", 0, 1, 0.01).onChange(guiChanged);
gui.add(guiData, "cloudiness", 0.1, 1, 0.01).onChange(guiChanged);
gui.add(guiData, 'explode');
// alternativ: onFinishChange -> Callback erst bei Fokusverlust aufgerufen
guiChanged();

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
    scene.background = conf.rain.minRaininessColor.clone().lerp(conf.rain.maxRaininessColor, guiData.raininess);
    rainParticleGroup.emitters[0].activeMultiplier = guiData.raininess;
}

function spawnLightning(conf){
    var x = getRandomInt(-conf.spawnRange, conf.spawnRange);
    var z = getRandomInt(-conf.spawnRange, conf.spawnRange);
    var lightningStart = new THREE.Vector3(x,conf.spawnY,z);
    var lightningDir = new THREE.Vector3(x,0,z).sub(lightningStart);
    var lightningModel = createLightning(lightningStart, lightningDir, conf.numKinks);
    extendLightningPaths(lightningModel);
    var lightningData = renderLightning(lightningModel, conf.lineWidth, conf.alphaMap);
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
                data: spawnLightning(conf.lightning),
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





