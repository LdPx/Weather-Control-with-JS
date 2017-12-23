

function createCity(groundSize, numHouses, housePositionSpreadXZ, houseSize){
    var geometry = new THREE.PlaneGeometry(groundSize, groundSize);
    //var material = new THREE.MeshStandardMaterial({color: 0x10e52c, side: THREE.DoubleSide});
    var material = new THREE.MeshStandardMaterial({ambient: 0x050505, color: 0x10e52c, specular: 0x555555, shininess: 30, side: THREE.DoubleSide});
    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI/2;
    plane.receiveShadow = true;

    var bodyMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0x724b33, specular: 0x555555, shininess: 30});
    var roofMaterial = new THREE.MeshPhongMaterial({ambient: 0x050505, color: 0xc62411, specular: 0x555555, shininess: 30});
    var houseMeshes = [];
    for(var i = 0; i < numHouses; i++){
        var x = randomOfAbs(housePositionSpreadXZ/2);
        var z = randomOfAbs(housePositionSpreadXZ/2);
        var pos = new THREE.Vector3(x, houseSize/2, z);
        var house = createHouse(pos, houseSize, bodyMaterial, roofMaterial);
        houseMeshes.push(house);
    }
    return {
        planeMesh: plane,
        houseMeshes: houseMeshes
    };
}


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
    var roofHeight = size/2;
    var roof = createRoof(size, roofHeight, roofMaterial);
    roof.position.set(pos.x, pos.y+size/2+roofHeight/2, pos.z);
    roof.castShadow = roof.receiveShadow = true;

    return {
        body: body,
        roof: roof
    };
}
