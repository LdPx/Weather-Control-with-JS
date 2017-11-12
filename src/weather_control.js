
// liefert gleichverteilte Ganzzahl zwischen min (inkl.) und max (exkl.)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
      
// Licht
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(20, 40, 100);

light.castShadow = true;            // default false

//Set up shadow properties for the light
light.shadow.mapSize.set(512, 512); // TODO was ist das?
// Frustum der Schattenkamera
light.shadow.camera.near = 0.5;    
light.shadow.camera.far = 1000;     
light.shadow.camera.right = 100;
light.shadow.camera.left = -100;
light.shadow.camera.top	= 100;
light.shadow.camera.bottom = -100;
scene.add(light);

// visualisiere direktionale Lichtquelle
var helper = new THREE.DirectionalLightHelper(light, 5);
scene.add(helper);

var helper = new THREE.CameraHelper(light.shadow.camera);
console.log('shadow camera position: ' + JSON.stringify(light.shadow.camera.position));
scene.add(helper);

/*
var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);
light.position.set(0, 10, 10);
scene.add( light );
*/
renderer.render(scene, camera);



