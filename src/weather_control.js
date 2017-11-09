
// liefert gleichverteilte Ganzzahl zwischen min (inkl.) und max (exkl.)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var scene = new THREE.Scene();
scene.background = new THREE.Color(0x10e52c);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(100, 40, 20);
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var numHouses = 50;
var range = 100;
for(var i = 0; i < numHouses; i++){

    var x = getRandomInt(0,range)-range/2;
    var z = getRandomInt(0,range)-range/2;

    // Haus gleicher Länge, Breite, Höhe
    var houseSize = 10;
    var houseMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
    var house = createHouseBody(houseSize, houseMaterial);
    house.position.set(x, 0, z);
    scene.add(house);

    // erzeuge Hausdach
    var roofHeight = 5;
    var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
    var roof = createRoof(houseSize, roofHeight, roofMaterial);
    roof.position.set(x, 7.5, z);
    scene.add(roof);   
}
      
// Licht
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(1, 2, 3);
scene.add(light);

renderer.render(scene, camera);



