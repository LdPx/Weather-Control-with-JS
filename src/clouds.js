
function createCloudEngine(maxNumClouds, texture, positionY, positionSpread) {
    var particleGroup = new SPE.Group({
        texture: {
            value: texture
        },
        blending: THREE.NormalBlending,
        fog: false,
        transparent: true,
        maxParticleCount: maxNumClouds
    });

    var emitter = new SPE.Emitter({
        particleCount: maxNumClouds,
        maxAge: {
            value: 2,    
			spread: null
        },
        position: {
            value: new THREE.Vector3(0,positionY,0),
            spread: positionSpread,
            randomise: true,
            distribution: SPE.distributions.SPHERE
        },
        // Geschwindigkeit
        velocity: {
            value: new THREE.Vector3(),
            randomise: true
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



