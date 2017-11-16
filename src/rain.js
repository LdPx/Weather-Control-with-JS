
// TODO konfigurierbarer machen?
function createRainEngine(numRaindrops, spawnCenter, spawnRadius){
    particleGroup = new SPE.Group({
        texture: {
            value: new THREE.TextureLoader().load('./textures/raindrop.png')
        }
    });

    // "spread" bestimmt stets den zufälligen Wertebereich von "value" je Partikel
    emitter = new SPE.Emitter({
        maxAge: {
            value: 20
        },
        
        position: {
            value: spawnCenter,
            spread: spawnRadius
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
            value: new THREE.Vector3(0, -25, 0),
            spread: new THREE.Vector3(10, 7.5, 10)
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

        particleCount: numRaindrops
    });

    particleGroup.addEmitter(emitter);
    //scene.add( particleGroup.mesh );
    //document.querySelector('.numParticles').textContent = 'Total particles: ' + emitter.particleCount;
    return particleGroup;
}


