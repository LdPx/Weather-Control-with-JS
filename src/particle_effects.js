
function calcMaxAge(positionY, velocityY){
    //var minPossibleVelocity = velocity.value.y + velocity.spread.y; // beachte: velocity.value.y ist negativ, da Partikel runterfallen
    //var maxPossibleY = position.value.y + position.spread.y;
    //return Math.abs(maxPossibleY/minPossibleVelocity);
    return Math.abs(positionY/velocityY);
}


function createDropParticleEngine(maxNumRaindrops, texture, positionY, positionSpreadY, positionSpreadXZ, velocityY, velocitySpread, size, color){
    var particleGroup = new SPE.Group({
        texture: {
            value: texture
        },
        maxParticleCount: maxNumRaindrops,
        fog: false
    });

    var emitter = new SPE.Emitter({
        maxAge: {
            value: calcMaxAge(positionY, velocityY)
        },        
        position: {
            value: new THREE.Vector3(0,positionY,0),
            spread: new THREE.Vector3(positionSpreadXZ,positionSpreadY,positionSpreadXZ)
        },
        velocity: {
            value: new THREE.Vector3(0,velocityY,0),
            spread: velocitySpread
        },
        color: {
            value: color
        },
        size: {
            value: size
        },
        particleCount: maxNumRaindrops,
        activeMultiplier: 0 // beginne mit 0 Partikeln
    });
    particleGroup.addEmitter(emitter);
    return particleGroup;
}



function createCloudEngine(maxNumClouds, texture, positionY, positionSpread, maxAge, size, sizeSpread) {
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
            value: maxAge,    
        },
        position: {
            value: new THREE.Vector3(0,positionY,0),
            spread: positionSpread,
            randomise: true,
            distribution: SPE.distributions.SPHERE
        },
        velocity: {
            value: new THREE.Vector3(), // wird nachträglich gesetzt
            randomise: true
        },
        // Größe, Varianz
        size: {
            value: size,
            spread: sizeSpread
        },
        // Transparenzverhalten: transparent->opak->transparent
        opacity: {
            value: [0, 1, 0]
        },
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




