
function createCloudEngine(maxNumClouds, spreadDistance) {
    var particleGroup = new SPE.Group({
        texture: {
            value: new THREE.TextureLoader().load('./textures/cloud.png')
        },
        // TODO prüfen ob nötig/sinnvoll
        blending: THREE.NormalBlending,
        fog: false,
        transparent: true,
        //alphaTest: true
        maxParticleCount: maxNumClouds
    });

    var emitter = new SPE.Emitter({
        particleCount: maxNumClouds,
        maxAge: {
            value: 3,
        },
        position: {
            value: new THREE.Vector3(),
            spread: new THREE.Vector3().setScalar(spreadDistance),
            randomise: true,
            distribution: SPE.distributions.SPHERE
        },
        // Geschwindigkeit
        velocity: {
            value: new THREE.Vector3(),
            randomise: true
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
            value: new THREE.Color(0xffffff),
            spread: new THREE.Color(0x404040),
            randomise: true
        },
        // leichte Drehung der Textur verlaufsweise
        angle: {
            value: [0, Math.PI * 0.125]
        }
    });
    particleGroup.addEmitter(emitter);
    return particleGroup;
}



