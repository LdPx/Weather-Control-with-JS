
// erzeugt einen Blitz
// ein Blitz besteht aus einem Hauptzweig mit Knicken
// von jedem Knick geht ein Kindeszweig aus
// dies wird rekursiv wiederholt, bis numKinks <= 0 ist
// jeder Zweig liegt in der Form {path: <Array der 3D-Punkte des Zweiges>, child: <Array der Kindeszweige>} vor
// diese Funktion liefert den Hauptzweig
function createLightning(start, dir, numKinks){
    return createLightningBranch(start, dir, numKinks);
}

// erzeugt Blitzzweig mit numKinks Knicken (d.h. ein Zweig mit 3 Knicken besteht mit Anfang & Ende aus 5 Punkten)
// Zweig verl�uft von start Richtung dir
// je Knick wird ein Kindeszweig mit dem Knick als Startpunkt und zuf�lliger Richtung childDir erzeugt
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
        var child = createLightningBranch(childStart, childDir, numKinks-1);
        if(child !== null){ 
            childs.push(child);
        }
    });
    return {
        path: path,
        childs: childs
    };
}


// erzeugt einen Liste von Punkten von Start entlang dir mit numKinks Knicken zwischen Anfang & Ende
// kinkRange bestimmt die Streuung, wie weit jeder Knick von der Anfang-Ende-Linie entfern sein darf
function createZigZagPath(start, dir, numKinks, kinkRange){
    var end = start.clone().add(dir);
    var kinkOffsets = newArray(numKinks).map((x,i) => (i+1)/(numKinks+1));  // Bruchteile, um die die Knicke bzgl. Start verschoben sind
    var kinks = kinkOffsets.map((off) => start.clone().lerp(end, off)); // verschiebe Start um Bruchteile * dir
    kinks.forEach((kink) => kink.add(randomLengthPerpendicularVector(dir,kinkRange)));   // verschiebe Knicke um Zufallswert senkrecht zu dir
    return [start].concat(kinks).concat([end]);
}

// kopiert vor den eigentlichen Pfad jedes Kindeszweiges den Pfad seines direkten Elternzweiges
// sieht besser aus, das sonst jeder Blitzzweig nicht opak mit Eltern- und Kindeszweigen verbunden ist
function extendLightningPaths(branch, parentPath){
    parentPath = parentPath || [];
    branch.childs.forEach(function(child, i){
        extendLightningPaths(child, branch.path.slice(0, i));
    });
    branch.path = parentPath.concat(branch.path);
}



// erzeugt f�r jeden Zweig ein ThreeJS-Mesh
// die Meshes werden in Listenform zur�ckgegeben
// je verwendeter lineWidth wird ein Material-Instanz erzeugt (n�tig zur sp�teren Anpassung der Transparenz und zum Aufr�umen) und zur�ckgegeben
function renderLightning(rootBranch, parentLineWidth, alphaMap){
    var materials = {};
    var meshes = [];
    renderLightningBranch(rootBranch, parentLineWidth, materials, meshes, alphaMap);
    return {
        meshes: meshes,
        materials: Object.values(materials)
    };
}   

// erzeugt f�r den Pfad von branch ein Mesh, rendert danach rekursiv die Kindeszweige von branch
// das Mash von branch ist lineWidth breit, jeder Kindeszweig ist lineWidth/2 breit
function renderLightningBranch(branch, lineWidth, materials, meshes, alphaMap){
    var mesh = renderPath(branch.path, lineWidth, materials, alphaMap);
    meshes.push(mesh);
    branch.childs.forEach((child) => {renderLightningBranch(child, lineWidth/2, materials, meshes, alphaMap);});
}

// erzeugt je Path 1 Mesh mit 1 Geometrie; das Material wird je gleicher lineWidth wiederverwendet
function renderPath(path, lineWidth, materials, alphaMap){
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
            alphaMap: alphaMap,
            //repeat: new THREE.Vector2(1,1),
            //blending: THREE.AdditiveBlending,
            opacity: 1,
            color: new THREE.Color(0xffffff)
        });
    }
    return new THREE.Mesh(line.geometry, materials[lineWidth]); 
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

// liefert zuf�lligen Vektor, der senkrecht zu vec ist und zuf�llige L�nge aus [-randomRange,randomRange[ hat
function randomLengthPerpendicularVector(vec, randomRange){
    var perpVec = arbitraryPerpendicularVector(vec);
    var angle = Math.random()*2*Math.PI;
    var randomLength = randomOfAbs(randomRange);
    var res = rotateVectorAroundAxis(perpVec, vec, angle);
    return res.setLength(randomLength);
}

