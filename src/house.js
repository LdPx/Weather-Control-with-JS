


function _createHouseBody(size, material){
    var houseGeometry = new THREE.BoxGeometry(size, size, size);
    return new THREE.Mesh(houseGeometry, material);
}


function _createRoof(roofSize, roofHeight, material){
    var roofRadius = roofSize/2*Math.sqrt(2); // "radius" ist hier Distanz Ecke-Mitte
    var roofGeometry = new THREE.CylinderGeometry(0, roofRadius, roofHeight, 4, 1);
    var roof = new THREE.Mesh(roofGeometry, material);
    roof.rotation.y += Math.PI/4;
    return roof;
}

