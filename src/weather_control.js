
// liefert gleichverteilte Ganzzahl zwischen min (inkl.) und max (exkl.)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
var groundSize = 200;
var geometry = new THREE.PlaneGeometry(groundSize,groundSize);
var material = new THREE.MeshStandardMaterial({color: 0x10e52c, side: THREE.DoubleSide});
var plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI/2;
plane.receiveShadow = true;
scene.add(plane);

var numHouses = 50;
var range = groundSize/2;
var houseSize = 10, roofHeight = 5;
for(var i = 0; i < numHouses; i++){

    // Hausposition
    var x = getRandomInt(0,range)-range/2;
    var z = getRandomInt(0,range)-range/2;

    // Haus gleicher Länge, Breite, Höhe
    var houseMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
    var house = createHouseBody(houseSize, houseMaterial);
    house.position.set(x, houseSize/2, z);
    house.castShadow = house.receiveShadow = true;
    scene.add(house);

    // erzeuge Hausdach
    var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
    var roof = createRoof(houseSize, roofHeight, roofMaterial);
    roof.position.set(x, houseSize+roofHeight/2, z);
    roof.castShadow = roof.receiveShadow = true;
    scene.add(roof);   
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
var hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemLight);

var numRaindrops = 10000;
var rainParticleGroup = createRainEngine(numRaindrops);
console.log('created rain engine, ' + numRaindrops + ' particles');
scene.add(rainParticleGroup.mesh);

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

animate();

function animate() {
    requestAnimationFrame( animate );
    var deltaTime = clock.getDelta();
    render(deltaTime);
}

function render(deltaTime){
    //rainParticleGroup.tick(deltaTime);
    cloudParticleGroup.tick(deltaTime);
    renderer.render(scene,camera);
}




