
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(50, 50, 50);
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/*
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
*/


// Länge & Breite 
var houseSize = 10;
var house = createHouse(houseSize);
scene.add(house);

// erzeuge Hausdach
var roofHeight = 5;
var roof = createRoof(houseSize, roofHeight);
roof.position.set(0, 7.5, 0);
scene.add(roof);    
    


renderer.render(scene, camera);



