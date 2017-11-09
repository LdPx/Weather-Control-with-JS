
function createHouse(houseSize){
    var houseGeometry = new THREE.BoxGeometry(houseSize, houseSize, houseSize);
    var houseMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
    return new THREE.Mesh(houseGeometry, houseMaterial);
}


function createRoof(roofSize, roofHeight){
    var roofRadius = roofSize/2*Math.sqrt(2); // "radius" ist hier Distanz Ecke-Mitte
    var roofGeometry = new THREE.CylinderGeometry(0, roofRadius, roofHeight, 4, 1);
    var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
    var roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.rotation.y += Math.PI/4;
    return roof;
}

