
function createRainEngine(maxNumRaindrops, spawnY){
    var particleGroup = new SPE.Group({
        texture: {
            value: new THREE.TextureLoader().load('./textures/raindrop.png')
        },
        maxParticleCount: maxNumRaindrops,
        fog: false
    });

    // "spread" bestimmt stets den zufälligen Wertebereich von "value" je Partikel
    var emitter = new SPE.Emitter({
        maxAge: {
            value: 2
        },
        
        position: {
            value: new THREE.Vector3(0,spawnY,0),
            spread: new THREE.Vector3(200,200,200)
        },
/*
        // Beschleunigung (brauchen wir wohl net)
        acceleration: {
            value: new THREE.Vector3(0, -10, 0),
            spread: new THREE.Vector3( 10, 0, 10 )
        },
*/
        // Geschwindigkeit
        velocity: {
            value: new THREE.Vector3(0,-100,0),
            spread: new THREE.Vector3(10,7.5,10)
        },

        color: {
            // 1 Farbe oder ein Array mehrerer Farben
            //value: [new THREE.Color('white'), new THREE.Color('red')]
            value: new THREE.Color(0x034aec)
            // TODO hier wär auch "spread" möglich _> sinnvoll?
        },

        size: {
            value: 2
        },

        particleCount: maxNumRaindrops,
        activeMultiplier: 0 // beginne mit 0 Regentropfen
    });

    particleGroup.addEmitter(emitter);
    //scene.add( particleGroup.mesh );
    //document.querySelector('.numParticles').textContent = 'Total particles: ' + emitter.particleCount;
    return particleGroup;
}


