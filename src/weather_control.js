
conf = {
    url: 'http://api.openweathermap.org/data/2.5/weather?units=metric&lat=51.2&lon=6.47&APPID=43a26c85c29d39f47dc194dda192eb3a',
    spawnY: 70, // Spawnhöhe Blitze, Wolken, Regen, Schnee,
    positionSpreadY: 50,
    cloud: {
        maxNumClouds: 250,
        texture: new THREE.TextureLoader().load('./textures/cloud.png'),
        minRaininessColor: new THREE.Color(0xffffff),
        maxRaininessColor: new THREE.Color(0x7f7f7f),
        startAngle: Math.PI/2,    // rad, aus [0,2*PI]
        startSpeed: 8,
        minForce: 0.25,
        maxForce: 2,
        spreadDistance: 50 // Wolken werden um aktuellen Spawnpunkt zufällig gespawnt, mit Abstand aus [0,spread] 
    },
    lightning: {
        numKinks: 3,
        lineWidth: 0.3,
        fadeOutDelay: 1,  // sec
        alphaMap: new THREE.TextureLoader().load('./textures/lightning.png'),
        // bei maximaler raininiess spawnen durchschnittlich maxExpectedSpawnsPerSeconds Blitze pro Sekunde (abzgl. der Fadeout-Dauer bereits gespawnter Blitze!)
        maxExpectedSpawnsPerSeconds: 0.25,          
        flashDelay: 1,    // sec
        flashStartIntensity: 10
    },
    rain: {
        maxNumRaindrops: 5000, 
        texture: new THREE.TextureLoader().load('./textures/raindrop.png'),
        minRaininessSkyColor: new THREE.Color(0x2271f9),
        maxRaininessSkyColor: new THREE.Color(0x8b8989),
        velocityY: -100,
        velocitySpread: new THREE.Vector3(10,7.5,10)
    },
    snow: {
        maxNumSnowflakes: 5000,
        texture: new THREE.TextureLoader().load('./textures/snowflake.png'),
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
//camera.position.set(125, 25, 125);
//camera.position.set(0, 200, 0);
//camera.position.set(0,0,200);
console.log('set camera to', camera.position);
camera.lookAt(scene.position);

var renderer = new THREE.WebGLRenderer();
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


var ambientLight = new THREE.AmbientLight(0x404040, 2); 
scene.add(ambientLight);

// Blitzlicht
var lightningFlash = new THREE.AmbientLight(0x404040, 0);
scene.add(lightningFlash);

//var rainParticleGroup = createRainEngine(conf.rain.maxNumRaindrops, conf.rain.texture, conf.spawnY);
var rainParticleGroup = createRainEngine(conf.rain.maxNumRaindrops, conf.rain.texture, conf.spawnY, 
    conf.positionSpreadY, conf.model.groundSize, conf.rain.velocityY, conf.rain.velocitySpread);

console.log('created rain engine:', 'group', rainParticleGroup, 'emitter', rainParticleGroup.emitters[0]);
scene.add(rainParticleGroup.mesh);

var snowParticleGroup = createSnowEngine(conf.snow.maxNumSnowflakes, conf.snow.texture, conf.spawnY);
console.log('created snow engine:', 'group', snowParticleGroup, 'emitter', snowParticleGroup.emitters[0]);
scene.add(snowParticleGroup.mesh);

var cloudParticleGroup = createCloudEngine(conf.cloud.maxNumClouds, conf.cloud.texture, conf.cloud.spreadDistance);
console.log('created cloud engine:', 'group', cloudParticleGroup, 'emitter', cloudParticleGroup.emitters[0]);
scene.add(cloudParticleGroup.mesh);

var lightningData = null;

var guiData = {
    raininess: 0,
    snowiness: 0,
    cloudiness: 0.1,
    fog_density: conf.fog.minDensity,
    wind_angle: conf.cloud.startAngle,
    wind_force: conf.cloud.minForce,
    load_weather_data: requestWeatherData,
};


// GUI
var gui = new dat.GUI();
gui.add(guiData, "raininess", 0, 1, 0.01).onChange(guiChanged);
gui.add(guiData, "snowiness", 0, 1, 0.01).onChange(onSnowinessChanged);
gui.add(guiData, "cloudiness", 0.1, 1, 0.01).onChange(guiChanged);
gui.add(guiData, "fog_density", conf.fog.minDensity, conf.fog.maxDensity, 0.0001).onChange(guiChanged);
gui.add(guiData, "wind_angle", 0, 2*Math.PI, 0.01).onChange(onWindAngleChanged);
gui.add(guiData, "wind_force", conf.cloud.minForce, conf.cloud.maxForce, 0.1).onChange(onWindForceChanged);
gui.add(guiData, "load_weather_data");
guiChanged();
onSnowinessChanged(guiData.snowiness);
onWindAngleChanged(guiData.wind_angle);

window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

animate();

// TODO in mehrere Callbacks aufsplitten (Performance) ?
function guiChanged(){  
    var newCloudColor = conf.cloud.minRaininessColor.clone().lerp(conf.cloud.maxRaininessColor, guiData.raininess);
    cloudParticleGroup.emitters[0].color.value = newCloudColor;
    cloudParticleGroup.emitters[0].activeMultiplier = guiData.cloudiness;
    scene.background = conf.rain.minRaininessSkyColor.clone().lerp(conf.rain.maxRaininessSkyColor, guiData.raininess);
    rainParticleGroup.emitters[0].activeMultiplier = guiData.raininess;
    scene.fog.density = guiData.fog_density;
}

// funktioniert (leider) nur so, nicht mit direkter Änderung im Emitter
function setMaxAge(emitter, maxAge){
    for ( var index = 0; index < emitter.particleCount; index++ ) {            
        var array = emitter.attributes.params.typedArray.array;
        var i = emitter.attributes.params.typedArray.indexOffset + ( index * emitter.attributes.params.typedArray.componentSize );
        array[i+2] = maxAge;
    }  
}

function updateWindFromCloudSpawnPos(){
    var windDir = cloudParticleGroup.emitters[0].velocity.value;
    var pos = cloudParticleGroup.emitters[0].position.value;
    windDir.set(pos.x,0,pos.z);
    windDir.multiplyScalar(-guiData.wind_force);   // Wind bewegt Wolken stets durch (0,conf.spawnY,0)
    setMaxAge(cloudParticleGroup.emitters[0], 2.0/guiData.wind_force);  // Wolken leben umgekehrt proportional zur Windstärke
}


function onWindAngleChanged(angle){
    var cloudSpawnDist = conf.model.groundSize/2;
    var x = cloudSpawnDist*Math.cos(angle);
    var y = conf.spawnY;
    var z = cloudSpawnDist*Math.sin(angle);
    cloudParticleGroup.emitters[0].position.value.set(x,y,z);
    cloudSpawnPointViz.position.set(x,y,z);
    updateWindFromCloudSpawnPos();
}

function onWindForceChanged(force){
    updateWindFromCloudSpawnPos();
}

function onSnowinessChanged(snowiness){
    snowParticleGroup.emitters[0].activeMultiplier = snowiness;
}

function spawnLightning(){
    var x = getRandomInt(-conf.model.spawnRange, conf.model.spawnRange);
    var z = getRandomInt(-conf.model.spawnRange, conf.model.spawnRange);
    var lightningStart = new THREE.Vector3(x,conf.spawnY,z);
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

function lightningFadeOut(dt){
    if(lightningData === null){
        if(Math.random() < dt * conf.lightning.maxExpectedSpawnsPerSeconds * guiData.raininess){
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
    })
    .fail(function(jqXHR, textStatus, errorThrown){
        alert("weather api call failed\n" + JSON.stringify({url: url, jqXHR: jqXHR, textStatus: textStatus, errorThrown: errorThrown}));
    });
}

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





