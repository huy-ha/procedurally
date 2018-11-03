//Plane variables
var scene,camera,renderer,orbitControl;

var directLight;

var stats;

var time = 0;

function init(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,0.1,1000);

	camera.position.z = 50;
	camera.position.y = 50;
	camera.rotation.x = -Math.PI/4;

	renderer = new THREE.WebGLRenderer( {antialias: true} );
	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );

	orbitControl = new THREE.OrbitControls( camera , renderer.domElement);
	createPlane();
	addLights();
	addStats();
	addGui();
	// addHelpers();
	animate();
}

function createPlane(){
	let size = 20;
	let detail = 20;
	let height = 2;
	let depth = 3;

	//creating the plane
	let geometry = new THREE.PlaneBufferGeometry(size,size,detail,detail);
	let count = geometry.attributes.position.count;
	geometry.attributes.position.dynamic = true;

	console.log("top plane with " + count + " vertices");
	//changing topPlane height
	for(let i = 0; i < count; i++){
		geometry.attributes.position.setZ(i, height * Math.sin( i*i/detail ) * Math.cos(i/detail));
	}
	
	let material = new THREE.MeshPhongMaterial( {color: 0xa5b1c9});
	let topPlane  = new THREE.Mesh(geometry, material);
	topPlane.receiveShadow = true;
	topPlane.castShadow = true;
	topPlane.rotation.x = -Math.PI/2;
	topPlane.rotation.z = Math.PI/4;
	topPlane.updateMatrixWorld();
	

	//bottom plane:
	geometry = new THREE.PlaneBufferGeometry(size,size,detail,detail);
	let bottomPlane = new THREE.Mesh(geometry,material);
	bottomPlane.name = "bottom-plane";
	bottomPlane.position.setZ(-depth);
	bottomPlane.updateMatrixWorld();

	//create connecting mesh between two meshes
	let topSide = new THREE.Geometry();
	let bottomSide = new THREE.Geometry();
	let rightSide = new THREE.Geometry();
	let leftSide = new THREE.Geometry();
	let topPos = topPlane.geometry.attributes.position.array;
	let botPos = bottomPlane.geometry.attributes.position.array;
	//adding vertices to geometry
	for(let i = 0; i < count;i++){
		let top = new THREE.Vector3(topPos[3*i],topPos[3*i+1],topPos[3*i+2]);
		// top.applyMatrix4(topPlane.matrixWorld);
		let bottom = new THREE.Vector3(botPos[3*i],botPos[3*i+1],botPos[3*i+2]-depth);
		if( i/(detail+1) < 1){
			topSide.vertices.push(top);
		    topSide.vertices.push(bottom);
		}if(i/(detail + 1) >= detail){
			bottomSide.vertices.push(top);
		    bottomSide.vertices.push(bottom);
		}if(i%(detail+1) == 0){
			leftSide.vertices.push(top);
			leftSide.vertices.push(bottom);
		}if((i+1)%(detail+1) == 0){
			rightSide.vertices.push(top);
			rightSide.vertices.push(bottom);
		}
	}
	//creating faces from vertices
	for(let i = 0; i < topSide.vertices.length-3;i+=2){
		topSide.faces.push(new THREE.Face3(i+2,i+1,i));
		topSide.faces.push(new THREE.Face3(i+1,i+2,i+3));
		bottomSide.faces.push(new THREE.Face3(i,i+1,i+2));
		bottomSide.faces.push(new THREE.Face3(i+3,i+2,i+1));
		leftSide.faces.push(new THREE.Face3(i,i+1,i+2));
		leftSide.faces.push(new THREE.Face3(i+3,i+2,i+1));
		rightSide.faces.push(new THREE.Face3(i+2,i+1,i));
		rightSide.faces.push(new THREE.Face3(i+1,i+2,i+3));
	}

	topPlane.add( new THREE.Mesh( topSide, material) );
	topPlane.add( new THREE.Mesh(bottomSide,material) );
	topPlane.add( new THREE.Mesh(leftSide,material) );
	topPlane.add( new THREE.Mesh(rightSide,material) );
	topPlane.add(bottomPlane);
	console.log(topPlane.children[0].geometry.vertices);
	scene.add(topPlane);
}

function addLights(){
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

function addStats(){
	stats = new Stats();
	stats.setMode(0);
	stats.domElement.style.position = "absolute";
	stats.domElement.style.left = '0px';
    stats.domElement.style.right = '0px';
	stats.domElement.style.width = '160px';
	document.body.appendChild( stats.domElement);
}

function addGui(){
	let gui = new dat.GUI();
	// gui.add(controlObject, "rotationSpeed", -0.005, 0.01);
 //    gui.add(controlObject, "cloudSpeed", -0.001,0.001);
}

function addHelpers(){
	let helper = new THREE.CameraHelper( directLight.shadow.camera );
	scene.add( directLight, helper );
	let axesHelper = new THREE.AxesHelper( 5 );
	scene.add( axesHelper );	
}

function animate(){
	time += 0.01;
	requestAnimationFrame(animate);
	renderer.render(scene,camera);

	directLight.position.set( 10*Math.sin(time) , 5 , 10*Math.cos(time));
	stats.update();
	orbitControl.update();
}

function handleResize(){
    w = window.innerWidth;
    h = window.innerHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h);
    console.log("window resized");
}

window.onload = init;
window.addEventListener('resize',handleResize,false);

