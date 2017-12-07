
var guiData = {
    goodWeather: 1
};

// globale Uhr (nötig für Animationen)
var clock = new THREE.Clock();

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x2271f9);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(100, 75, 20);
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Boden
// TODO "Stadtmodell"-Erzeugung nach house.js schieben, nur Meshes zurückgeben
var groundSize = 200;
var geometry = new THREE.PlaneGeometry(groundSize,groundSize);
var material = new THREE.MeshStandardMaterial({color: 0x10e52c, side: THREE.DoubleSide});
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

var light = new THREE.AmbientLight(0x404040, 2); // soft white light
scene.add(light);

var numRaindrops = 10000;
var rainParticleGroup = createRainEngine(numRaindrops);
console.log('created rain engine, ' + numRaindrops + ' particles');
scene.add(rainParticleGroup.mesh);

// TODO cloud-config-Objekt ergänzen
// TODO fog oder ergänzen => sieht vllt alles besser aus?
var numClouds = 50;
var cloudSpawnCenter = new THREE.Vector3(0, 70, -50);
var windDirection = new THREE.Vector3(0, 0, 30);
var cloudParticleGroup = createCloudEngine(numClouds, cloudSpawnCenter, windDirection);
// Aktualisierung des 'velocity'-Attributes: z.B.
// windDirection.z += 1;
// cloudParticleGroup.emitters[0].velocity.value = windDirection;
console.log('created cloud engine, ' + numClouds + ' particles');
scene.add(cloudParticleGroup.mesh);

var lightningConfig = {
    spawnY: cloudSpawnCenter.y,
    spawnRange: houseSpawnRange,
    numKinks: 3,
    lineWidth: 0.3,
    fadeOutDelay: 3,  // sec
    alphaMap: new THREE.TextureLoader().load('./textures/lightning.png'),
    // max. Spawnchance je Frame, wenn kein Blitz aktuell vorhanden; könnte man auch von deltaTime abhg machen
    // ist 0 bei maximal gutem Wetter und maxSpawnRate bei max. schlechtem Wetter
    maxSpawnRate:  0.1    
};

var lightningData = null;

// GUI
var gui = new dat.GUI();
gui.add(guiData, "goodWeather", 0, 1, 0.0001).onChange(guiChanged);
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
    var worstColor = 0.5, bestColor = 1;
    //var color = (bestColor-worstColor)*guiData.goodWeather+worstColor;
    var color = linearMap(0, 1, worstColor, bestColor, guiData.goodWeather);
    var newCloudColor = new THREE.Color(color,color,color);
    cloudParticleGroup.emitters[0].color.value = newCloudColor;
    //var minClouds = 50, maxClouds = 200;
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
        if(Math.random() <= lightningConfig.maxSpawnRate * guiData.badWeather){
            lightningData = {
                data: spawnLightning(lightningConfig),
                timeElapsed: 0
            }; 
        }
    }
    else {
        var opacityDiff = deltaTime/lightningConfig.fadeOutDelay;
        lightningData.timeElapsed += deltaTime;
        lightningData.data.materials.forEach(mat => { mat.uniforms.opacity.value -= opacityDiff; }); 
        if(lightningData.timeElapsed >= lightningConfig.fadeOutDelay){
            removeLightning(lightningData.data);
            lightningData = null;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    var deltaTime = clock.getDelta();
    render(deltaTime);
}

function render(deltaTime){
    //rainParticleGroup.tick(deltaTime);
    cloudParticleGroup.tick(deltaTime);
    lightningFadeOut(deltaTime);
    renderer.render(scene,camera);
}





