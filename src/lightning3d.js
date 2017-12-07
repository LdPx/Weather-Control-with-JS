
// erzeugt einen Blitz
// ein Blitz besteht aus einem Hauptzweig mit Knicken
// von jedem Knick geht ein Kindeszweig aus
// dies wird rekursiv wiederholt, bis numKinks <= 0 ist
// jeder Zweig liegt in der Form {path: <Array der 3D-Punkte des Zweiges>, child: <Array der Kindeszweige>} vor
// dieser Funktion liefert den Hauptzweig
function createLightning(start, dir, numKinks){
    return createLightningBranch(start, dir, numKinks);
}

// erzeugt & zeichnet Blitz
// Hauptzweig verläuft von start Richtung dir
// je Zweig werden numKinks Knicke erzeugt
// je Knick wird ein Kindeszweig mit dem Knick als Startpunkt und zufälliger Richtung childDir erzeugt
// numKinks, kinkRange, childAngleRange nehmen im Verlauf der Rekursionstiefe ab
function createLightningBranch(start, dir, numKinks){
    if(numKinks <= 0){
        return null;
    }
    var kinkRange = dir.length()/4; // bestimmt Streuung je Knick
    var childDirRange = dir.length()/5; // bestimmt Steuung je childDir
    //var path = parentPath.concat(createZigZagPath(start, dir, numKinks, kinkRange));
    var path = createZigZagPath(start, dir, numKinks, kinkRange);
    var childs = [];
    path.forEach(function(childStart,i){
        var childDir = randomLengthPerpendicularVector(dir, childDirRange).add(dir);
        childDir.setLength(dir.length()/2);
        var child = createLightningBranch(childStart, childDir, numKinks-1, path.slice(0,i));
        if(child !== null){
            childs.push(child);
        }
    });
    return {
        path: path,
        childs: childs
    };
}


// heißt 'Knick' wirklich 'kink'?
function createZigZagPath(start, dir, numKinks, kinkRange){
    var end = start.clone().add(dir);
    //console.log('start', start, 'end', end, 'dir', dir);
    var kinkOffsets = newArray(numKinks).map((x,i) => (i+1)/(numKinks+1));  // Bruchteile, um die die Knicke bzgl. Start verschoben sind
    var kinks = kinkOffsets.map((off) => start.clone().lerp(end, off)); // verschiebe Start um Bruchteile * dir
    kinks.forEach((kink) => kink.add(randomLengthPerpendicularVector(dir,kinkRange)));   // verschiebe Knicke um Zufallswert senkrecht zu dir
    return [start].concat(kinks).concat([end]);
}

// kopiert vor den eigentlichen Pfad jedes Kindeszweiges den Pfad seines direkten Elternzweiges
// ermöglicht schönere Visualisierung
function extendLightningPaths(branch, parentPath){
    parentPath = parentPath || [];
    branch.childs.forEach(function(child, i){
        extendLightningPaths(child, branch.path.slice(0, i));
    });
    branch.path = parentPath.concat(branch.path);
}



// erzeugt für jeden Zweig ein 3js-Mesh
// die meshes werden NICHT hierarchisch gespeichert
function renderLightning(rootBranch, parentLineWidth){
    var materials = {};
    var meshes = [];
    renderLightningBranch(rootBranch, parentLineWidth, materials, meshes);
    return {
        meshes: meshes,
        materials: materials
    };
}   


function renderLightningBranch(branch, lineWidth, materials, meshes){
    var mesh = renderPath(branch.path, lineWidth, materials);
    meshes.push(mesh);
    branch.childs.forEach((child) => {renderLightningBranch(child, lineWidth/2, materials, meshes);});
}

// erzeugt je Path 1 Mesh mit 1 Geometrie; das Material wird je gleicher lineWidth wiederverwendet
function renderPath(path, lineWidth, materials){
    var geometry = new THREE.Geometry();
    geometry.vertices = path;
    var line = new MeshLine();
    line.setGeometry(geometry);
    // jedes MeshLineMaterial unterscheidet sich nur anhand seiner lineWidth
    // wegen Performance: erzeuge je lineWidth bzw. Blitz-Zweig-Level genau 1 Material
    if((lineWidth in materials) === false){
        materials[lineWidth] = new MeshLineMaterial({
            lineWidth: lineWidth,
            //alphaTest: true,
            depthTest: false,
            transparent: true,
            useAlphaMap: 1,
            alphaMap: new THREE.TextureLoader().load('./img/res2.png'),
            //repeat: new THREE.Vector2(1,1),
            //blending: THREE.AdditiveBlending,
            opacity: 1,
            color: new THREE.Color(0xffffff)
        });
    }
    return new THREE.Mesh(line.geometry, materials[lineWidth]); 
}


THREE.Vector3.prototype.setLength = function(len){
    var oldlen = this.length();
    return this.multiplyScalar(len/oldlen);
}


const CONST = {
    zerovec: new THREE.Vector3(0,0,0),
    e1: new THREE.Vector3(1,0,0),
    e2: new THREE.Vector3(0,1,0),
    e3: new THREE.Vector3(0,0,1),
};

function newArray(length) {
    return [...new Array(length)];
}

// liefert Zufallszahl zwischen [-abs,abs[
function randomOfAbs(abs){
    return Math.random()*2*abs-abs;
}

// rotiert vec um die Achse axis um den Winkel angle
function rotateVectorAroundAxis(vec, axis, angle){
    var u = axis.clone().normalize();
    var cosa = Math.cos(angle), sina = Math.sin(angle);
    // https://en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
    var R = new THREE.Matrix3();
    R.set(
        cosa+u.x*u.x*(1-cosa), u.x*u.y*(1-cosa)-u.z*sina, u.x*u.z*(1-cosa)+u.y*sina,
        u.y*u.x*(1-cosa)+u.z*sina, cosa+u.y*u.y*(1-cosa), u.y*u.z*(1-cosa)-u.x*sina,
        u.z*u.x*(1-cosa)-u.y*sina, u.z*u.y*(1-cosa)+u.x*sina, cosa+u.z*u.z*(1-cosa)
    );
    return vec.clone().applyMatrix3(R);
}

// liefert beliebigen senkrechten Vektor zu vec
function arbitraryPerpendicularVector(vec){
    var res = vec.clone().cross(CONST.e1);
    if(res.equals(CONST.zerovec) == false){
        return res;
    }
    return vec.clone().cross(CONST.e2);
}

// liefert zufälligen Vektor, der senkrecht zu vec ist und zufällige Länge aus [-randomRange,randomRange[ hat
function randomLengthPerpendicularVector(vec, randomRange){
    var perpVec = arbitraryPerpendicularVector(vec);
    var angle = Math.random()*2*Math.PI;
    var randomLength = randomOfAbs(randomRange);
    var res = rotateVectorAroundAxis(perpVec, vec, angle);
    return res.setLength(randomLength);
}