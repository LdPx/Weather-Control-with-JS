
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x10e52c);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
camera.position.set(20, 20, 15);
camera.lookAt(new THREE.Vector3(0,0,0));

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Haus gleicher Länge, Breite, Höhe
var houseSize = 10;
var houseMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
var house = createHouseBody(houseSize, houseMaterial);
scene.add(house);

// erzeuge Hausdach
var roofHeight = 5;
var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
var roof = createRoof(houseSize, roofHeight, roofMaterial);
roof.position.set(0, 7.5, 0);
scene.add(roof);   
  
// Licht
var light = new THREE.DirectionalLight(0xffffff);
light.position.set(1, 2, 3);
light.target = house;
scene.add(light);
    

renderer.render(scene, camera);



