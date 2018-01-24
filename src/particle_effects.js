
// berechnet die Zeit, die ein Partikel der Geschwindigkeit velocityY zum Zurücklegen der Strecke positionY benötigt
function calcMaxAge(positionY, velocityY){
    //var minPossibleVelocity = velocity.value.y + velocity.spread.y; // beachte: velocity.value.y ist negativ, da Partikel runterfallen
    //var maxPossibleY = position.value.y + position.spread.y;
    //return Math.abs(maxPossibleY/minPossibleVelocity);
    return Math.abs(positionY/velocityY);
}


// erzeugt eine Partikelengine für herunterfallende Partikel (Regen, Schnee) und gibt eine SPE.Group zurück
// eine Partikelengine besteht hier aus einer SPE.Group und einem SPE.Emitter
// (vgl. https://squarefeet.github.io/ShaderParticleEngine/docs/api/global.html#EmitterOptions , https://github.com/squarefeet/ShaderParticleEngine )
// die Engine kann dynamisch durch Änderung der Emitterattribute angepasst werden
// maxNumParticles: emittierte Partikelengine bei activeMultiplier=1
// texture: Textur jedes Partikels
// positionY: mittlere Spawnhöhe der Partikel
// positionSpreadY: Streuung der Spawnhöhe
// positionSpreadXZ: Streuung von x-,z-Koordinate (dadurch kann z.B. die ganze Grundfläche beregnet werden)
// velocityY: Fallgeschwindigkeit
// velocitySpread: Streuung der Geschwindigkeit in x-,y-,z-Richtung
// size: Partikelsklalierungsfaktor, color: Partikelfarbe
function createDropParticleEngine(maxNumParticles, texture, positionY, positionSpreadY, positionSpreadXZ, velocityY, velocitySpread, size, color){
    var particleGroup = new SPE.Group({
        texture: {
            value: texture
        },
        maxParticleCount: maxNumParticles,
        fog: false  // Nebel vernebelt Partikel nicht
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
        particleCount: maxNumParticles,
        activeMultiplier: 0 // beginne mit 0 Partikeln
    });
    particleGroup.addEmitter(emitter);
    return particleGroup;
}


// erzeugt eine Partikelengine für Wolkenpartikel, gibt die zug. SPE.Group zurück
// maxNumClouds: max. gleichzeitigt vorhandene Wolken bei activeMultiplier=1
// texture: Textur für Partikel
// positionY: Spawnhöhe
// positionSpread: Spawnpunktvarianz bzgl. x-,y-,z-Koordinate
// maxAge: Lebenszeit je Wolkenpartikel (die dynamische Anpassung dieses Parameters ist problematisch)
// size: Partikelskalierungsfaktor
// sizeSpread: Streuung der Partikelskalierungsfaktoren je Partikel
function createCloudEngine(maxNumClouds, texture, positionY, positionSpread, maxAge, size, sizeSpread) {
    var particleGroup = new SPE.Group({
        texture: {
            value: texture
        },
        blending: THREE.NormalBlending, // TODO prüfen, ob man das braucht?
        fog: false,
        transparent: true,
        maxParticleCount: maxNumClouds
    });

    var emitter = new SPE.Emitter({
        maxAge: {
            value: maxAge,    
        },
        position: {
            value: new THREE.Vector3(0,positionY,0),
            spread: positionSpread,
            randomise: true,
        },
        velocity: {
            value: new THREE.Vector3(), // wird nachträglich gesetzt
            randomise: true
        },
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
        },
        particleCount: maxNumClouds,
        activeMultiplier: 0 
    });
    particleGroup.addEmitter(emitter);
    return particleGroup;
}




