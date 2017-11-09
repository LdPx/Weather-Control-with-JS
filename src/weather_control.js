
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(20, 20, 15);
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
var houseMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
var house = _createHouseBody(houseSize, houseMaterial);
scene.add(house);

// erzeuge Hausdach
var roofHeight = 5;
var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
var roof = _createRoof(houseSize, roofHeight, roofMaterial);
roof.position.set(0, 7.5, 0);
scene.add(roof);   
  
// Licht
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(1, 2, 3);
light.target = house;
scene.add(light);
    

renderer.render(scene, camera);



