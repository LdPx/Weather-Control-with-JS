
function createCloudEngine(numClouds, spawnCenter, velocity) {
    var particleGroup = new SPE.Group({
        texture: {
            value: new THREE.TextureLoader().load('./textures/cloud.png')
        },
        // TODO prüfen ob nötig/sinnvoll
        blending: THREE.NormalBlending,
        fog: true,
        transparent: true
    });

    var emitter = new SPE.Emitter({
        particleCount: numClouds,
        maxAge: {
            value: 3,
        },
        position: {
            value: spawnCenter,
            spread: new THREE.Vector3(100, 30, 100)
        },
        // Geschwindigkeit
        velocity: {
            value: velocity
        },
        // leichtes Wackeln
        wiggle: {
            spread: 25
        },
        // Größe, Varianz
        size: {
            value: 75,
            spread: 50
        },
        // Transparenzverhalten: transparent->opak->transparent
        opacity: {
            value: [0, 1, 0]
        },
        // Farbe, Varianz
        color: {
            //value: new THREE.Color(1,1,1),
            //spread: new THREE.Color(0.1, 0.1, 0.1)
        },
        // leichte Drehung der Textur verlaufsweise
        angle: {
            value: [0, Math.PI * 0.125]
        }
    });
    particleGroup.addEmitter(emitter);
    return particleGroup;
}



