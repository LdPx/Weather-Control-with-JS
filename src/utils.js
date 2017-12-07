
const CONST = {
    zerovec: new THREE.Vector3(0,0,0),
    e1: new THREE.Vector3(1,0,0),
    e2: new THREE.Vector3(0,1,0),
    e3: new THREE.Vector3(0,0,1),
};

function newArray(length) {
    return [...new Array(length)];
}

THREE.Vector3.prototype.setLength = function(len){
    var oldlen = this.length();
    return this.multiplyScalar(len/oldlen);
}

// liefert Zufallszahl zwischen [-abs,abs[
function randomOfAbs(abs){
    return Math.random()*2*abs-abs;
}

// liefert gleichverteilte Ganzzahl zwischen min (inkl.) und max (exkl.)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}