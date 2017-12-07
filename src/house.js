

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

// erzeugt einfaches Haus; Breite, Höhe, Tiefe von Körper & Dach ergeben sich aus size
// pos ist Mittelpunkt des Hauskörpers
function createHouse(pos, size, bodyMaterial, roofMaterial){
    // erzeuge Hauskörper 
    var body = createHouseBody(size, bodyMaterial);
    body.position.set(pos.x, pos.y, pos.z);
    body.castShadow = body.receiveShadow = true;
    // erzeuge Hausdach
    var roofHeight = houseSize/2;
    var roof = createRoof(houseSize, roofHeight, roofMaterial);
    roof.position.set(pos.x, pos.y+houseSize/2+roofHeight/2, pos.z);
    roof.castShadow = roof.receiveShadow = true;

    return {
        body: body,
        roof: roof
    };
}
