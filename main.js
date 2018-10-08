//Plane variables
var size = 20;
var detail = 10;
var height = 2;

var scene,camera,renderer;

var plane,directLight;

var time = 0;

init();

function init(){
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,0.1,1000);
	//camera.lookAt({
	//	x: 0,
        //	y: 0,
        //	z: 0
    	//});

	camera.position.z = 50;
	camera.position.y = 50;
	camera.rotation.x = -Math.PI/4;

	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );
	
	//creating the plane
	var geometry = new THREE.PlaneBufferGeometry(size,size,detail,detail);
	var position = geometry.attributes.position;
	position.dynamic = true;

	//changing plane height
	for(var i = 0; i < position.count; i++)
		position.setZ(i, height*Math.sin(i/2)*Math.cos(i+4));
	
	var material = new THREE.MeshLambertMaterial( {color: 0xa5b1c9});
	plane = new THREE.Mesh(geometry, material);
	plane.receiveShadow = true;
	plane.castShadow = true;
	plane.rotation.x = -Math.PI/2;
	plane.rotation.z = Math.PI/4;
	scene.add(plane);

	//test shadows
	createCube();
	
	//main lights
	directLight = new THREE.PointLight( 0xFFFFFF, 0.7, 0, 2);
	directLight.position.z = 5;
	directLight.castShadow = true;
	//directLight.shadowCameraVisible = true;
	directLight.shadow.mapSize.width = 4096;
	directLight.shadow.mapSize.height = 4096;
	directLight.shadow.camera.near = 0.5;
	directLight.shadow.camera.far = 1000;

	scene.add( directLight);
	scene.add( new THREE.AmbientLight( 0x404040 ));

}

function createCube(){
	var geometry = new THREE.CubeGeometry(3,3,3);
	var material = new THREE.MeshLambertMaterial( {color: 0x01a6ff});
	var cube = new THREE.Mesh(geometry, material);
	cube.position.y = 5;
	cube.rotation.x = 0.3;
	cube.rotation.z = 0.7;
	cube.castShadow = true;

	scene.add(cube);
}





function animate(){
	time += 0.01;
	requestAnimationFrame(animate);
	renderer.render(scene,camera);
	updateRotation();
	//plane.rotation.y += 0.05;
//	if(plane.rotation.y > 0.3)
//		plane.rotation.y = -0.3;
}

animate();

function updateRotation(){
	directLight.position.set( 10*Math.sin(time) , 5 , 10*Math.cos(time) );
}

