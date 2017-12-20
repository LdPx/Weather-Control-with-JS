
function createSnowEngine(maxNumSnowflakes, texture){
    var particleGroup = new SPE.Group({
        texture: {
            value: texture
        },
        maxParticleCount: maxNumSnowflakes,
        fog: false
    });

    var emitter = new SPE.Emitter({
        maxAge: {
            value: 2
        },        
        position: {
            value: new THREE.Vector3(0,100,0),
            spread: new THREE.Vector3(200,0,200)
        },
        // Geschwindigkeit
        velocity: {
            value: new THREE.Vector3(0,-100,0),
            spread: new THREE.Vector3(10,7.5,10)
        },
        color: {
            value: new THREE.Color(0xffffff)
        },
        size: {
            value: 2
        },

        particleCount: maxNumSnowflakes,
        activeMultiplier: 0 // beginne mit 0 Regentropfen
    });

    particleGroup.addEmitter(emitter);
    return particleGroup;
}


