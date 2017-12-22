
function calcMaxAge(positionY, velocityY){
    //var minPossibleVelocity = velocity.value.y + velocity.spread.y; // beachte: velocity.value.y ist negativ, da Partikel runterfallen
    //var maxPossibleY = position.value.y + position.spread.y;
    //return Math.abs(maxPossibleY/minPossibleVelocity);
    return Math.abs(positionY/velocityY);
}


function createRainEngine(maxNumRaindrops, texture, positionY, positionSpreadY, positionSpreadXZ, velocityY, velocitySpread){
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
            value: new THREE.Color(0x034aec)
        },
        size: {
            value: 2
        },
        particleCount: maxNumRaindrops,
        activeMultiplier: 0 // beginne mit 0 Regentropfen
    });
    particleGroup.addEmitter(emitter);
    return particleGroup;
}


