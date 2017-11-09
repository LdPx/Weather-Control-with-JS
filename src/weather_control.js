
// liefert gleichverteilte Ganzzahl zwischen min (inkl.) und max (exkl.)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x2271f9);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(100, 40, 20);
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Boden
var groundSize = 200;
var geometry = new THREE.PlaneGeometry(groundSize,groundSize);
var material = new THREE.MeshBasicMaterial({color: 0x10e52c, side: THREE.DoubleSide});
var plane = new THREE.Mesh(geometry, material);
plane.rotation.x = Math.PI/2;
scene.add(plane);

var numHouses = 50;
var range = groundSize/2;
var houseSize = 10, roofHeight = 5;
for(var i = 0; i < numHouses; i++){

    var x = getRandomInt(0,range)-range/2;
    var z = getRandomInt(0,range)-range/2;

    // Haus gleicher Länge, Breite, Höhe
    var houseMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
    var house = createHouseBody(houseSize, houseMaterial);
    house.position.set(x, houseSize/2, z);
    scene.add(house);

    // erzeuge Hausdach
    var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
    var roof = createRoof(houseSize, roofHeight, roofMaterial);
    roof.position.set(x, houseSize+roofHeight/2, z);
    scene.add(roof);   
}
      
// Licht
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(1, 2, 3);
scene.add(light);

renderer.render(scene, camera);



