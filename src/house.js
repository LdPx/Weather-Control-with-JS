

function createHouseBody(size, material){
    var houseGeometry = new THREE.BoxGeometry(size, size, size);
    return new THREE.Mesh(houseGeometry, material);
}


function createRoof(size, height, material){
    var roofRadius = size/2*Math.sqrt(2); // "radius" ist hier Distanz Ecke-Mitte
    var roofGeometry = new THREE.CylinderGeometry(0, roofRadius, height, 4, 1);
    var roof = new THREE.Mesh(roofGeometry, material);
    roof.rotation.y += Math.PI/4;
    return roof;
}

