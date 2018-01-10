
function createControls(camera, renderer){
    var controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 10.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    // a, s, d
    controls.keys = [65, 83, 68];
    //controls.addEventListener('change', render);
    return controls;
}