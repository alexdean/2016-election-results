var camera, scene, renderer;
var geometry, material, mesh;

init();
animate();

function buildCountyMesh(data) {
  center_x_degrees = -98;
  center_y_degrees = 40;
  pixels_per_degree = 80;
  cylinder_radius = 5;

  x_offset = center_x_degrees * pixels_per_degree;
  y_offset = center_y_degrees * pixels_per_degree;

  height = parseInt(data['dem'] / 1000);
  x = parseInt(data['x'] * pixels_per_degree * -1 + x_offset);
  z = parseInt(data['y'] * pixels_per_degree - y_offset);
  y = height / 2; // align bases of all cylinders. (origin is at centroid?)
  var geometry = new THREE.CylinderBufferGeometry( cylinder_radius, cylinder_radius, height, 8 );
  var material = new THREE.MeshPhongMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,
  });
  var dem = new THREE.Mesh( geometry, material );
  dem.position.set(x + cylinder_radius, y, z);

  height = parseInt(data['gop'] / 1000);
  x = parseInt(data['x'] * pixels_per_degree * -1 + x_offset);
  z = parseInt(data['y'] * pixels_per_degree - y_offset);
  y = height / 2; // align bases of all cylinders. (origin is at centroid?)
  var geometry = new THREE.CylinderBufferGeometry( cylinder_radius, cylinder_radius, height, 8 );
  var material = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
  });
  var rep = new THREE.Mesh( geometry, material );
  rep.position.set(x - cylinder_radius, y, z);

  return [dem, rep];
}

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('rgb(255, 255, 255)');

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = -2000;
  camera.position.y = 2000;
  camera.lookAt( new THREE.Vector3(0,0,0) );
  scene.add(camera);

  var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.55, 1, 1.0 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.5 );
  hemiLight.position.set( 0, 500, 0 );
  scene.add( hemiLight );

  var pLight = new THREE.PointLight( 0xffffff, 1.0, 10000 );
  pLight.position.set( 500, 500, 500 );
  scene.add( pLight );

  jQuery.getJSON('tmp/data.json', function(data) {
    jQuery.each(data, function(key, value) {
      var geoms = buildCountyMesh(value);
      jQuery.each(geoms, function(key, geom) {
        scene.add(geom);
      })
    })
  });

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // https://github.com/mrdoob/three.js/tree/dev/examples/js/controls
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;

  document.body.appendChild(renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
