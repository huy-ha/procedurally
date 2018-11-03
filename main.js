//Plane variables
var scene,camera,renderer,orbitControl;

var directLight;

var stats;

function init(){
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x51f6ff);
	camera = new THREE.PerspectiveCamera(30,window.innerWidth/window.innerHeight,0.1,1000);

	camera.position.z = 50;
	camera.position.y = 30;
	camera.lookAt(0,0,0);

	renderer = new THREE.WebGLRenderer( {antialias: true} );
	renderer.setSize( window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild( renderer.domElement );

	orbitControl = new THREE.OrbitControls( camera , renderer.domElement);
	control = new function(){
		this.rotationSpeed = 0.5;
		this.x = 10;
		this.y = 10;
		this.z = 10;
	};
	createPlane();
	addLights();
	addStats();
	addGui(control);
	// addHelpers();
	animate();
}

function createPlane(){
	let size = 20;
	let detail = 200;
	let depth = 5;

	let scale1 = 0.01;
	let height1 = 3;
	let scale2 = 0.05;
	let height2 = 0.2;
	let scale3 = 0.3;
	let height3 = 0.05;


	//creating the plane
	let geometry = new THREE.PlaneBufferGeometry(size,size,detail,detail);
	let count = geometry.attributes.position.count;
	geometry.attributes.position.dynamic = true;

	console.log("top plane with " + count + " vertices");
	//changing topPlane height
	resetNoise();
	for(let i = 0; i < count; i++){
		// geometry.attributes.position.setZ(i, height * Math.sin( 15*i/(detail*detail) ) * Math.cos( 15*(i%detail)/detail ));
		let y = Math.floor(i/(detail + 1));
		let x = i%(detail + 1);
		geometry.attributes.position.array[i*3+2] =  height1 * noise( scale1 * x ,  scale1 * y );
	}

	resetNoise();
	for(let i = 0; i < count; i++){
		// geometry.attributes.position.setZ(i, height * Math.sin( 15*i/(detail*detail) ) * Math.cos( 15*(i%detail)/detail ));
		let y = Math.floor(i/(detail + 1));
		let x = i%(detail + 1);
		geometry.attributes.position.array[i*3+2] +=  height2 * noise( scale2 * x ,  scale2 * y );
	}

	resetNoise();
	for(let i = 0; i < count; i++){
		// geometry.attributes.position.setZ(i, height * Math.sin( 15*i/(detail*detail) ) * Math.cos( 15*(i%detail)/detail ));
		let y = Math.floor(i/(detail + 1));
		let x = i%(detail + 1);
		geometry.attributes.position.array[i*3+2] +=  height3 * noise( scale3 * x ,  scale3 * y );
	}
	

	let material = new THREE.MeshPhongMaterial();
	let materialColor = new THREE.TextureLoader().load("assets/Rough_rock_023_COLOR.jpg");
	materialColor.wrapS = materialColor.wrapT = THREE.RepeatWrapping;
	materialColor.repeat.set(8, 8);
	let materialNorm = new THREE.TextureLoader().load("assets/Rough_rock_023_NRM.jpg");
	materialNorm.wrapS = materialNorm.wrapT = THREE.RepeatWrapping;
	materialNorm.repeat.set(8, 8);
	material.map = materialColor;
	material.normalMap = materialNorm;

	var topPlane  = new THREE.Mesh(geometry, material);
	topPlane.receiveShadow = true;
	topPlane.castShadow = true;
	topPlane.rotation.x = -Math.PI/2;
	topPlane.rotation.z = Math.PI/4;
	topPlane.updateMatrixWorld();

	//bottom plane:
	geometry = new THREE.PlaneBufferGeometry(size,size,detail,detail);
	// material = new THREE.MeshPhongMaterial({color:0xfc3adc});
	let material2 = new THREE.MeshPhongMaterial();
	materialColor = new THREE.TextureLoader().load("assets/Rough_rock_004_COLOR.png");
	materialColor.wrapS = materialColor.wrapT = THREE.RepeatWrapping;
	materialColor.repeat.set(8, 8);
	materialNorm = new THREE.TextureLoader().load("assets/Rough_rock_004_NRM.png");
	materialNorm.wrapS = materialNorm.wrapT = THREE.RepeatWrapping;
	materialNorm.repeat.set(8, 8);
	material2.map = materialColor;
	material2.normalMap = materialNorm;

	let bottomPlane = new THREE.Mesh(geometry,material);
	bottomPlane.name = "bottom-plane";
	bottomPlane.position.setZ(-depth);
	bottomPlane.rotation.x = Math.PI;
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
		let bottom = new THREE.Vector3(botPos[3*i],botPos[3*i+1],botPos[3*i+2]-depth);
		if( i/(detail+1) < 1){
			topSide.vertices.push(top);
		    topSide.vertices.push(bottom);
		}if(i/(detail + 1) >= detail){
			bottomSide.vertices.push(top);
		    bottomSide.vertices.push(bottom);
		}if(i%(detail+1) === 0){
			leftSide.vertices.push(top);
			leftSide.vertices.push(bottom);
		}if((i+1)%(detail+1) === 0){
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

	topSide.computeFaceNormals();
	topSide.computeVertexNormals();
	bottomSide.computeFaceNormals();
	bottomSide.computeVertexNormals();
	leftSide.computeFaceNormals();
	leftSide.computeVertexNormals();
	rightSide.computeFaceNormals();
	rightSide.computeVertexNormals();

	topPlane.add( new THREE.Mesh( topSide, material) );
	topPlane.add( new THREE.Mesh(bottomSide,material) );
	topPlane.add( new THREE.Mesh(leftSide,material) );
	topPlane.add( new THREE.Mesh(rightSide,material) );
	topPlane.add(bottomPlane);
	topPlane.name = "plane";
	scene.add(topPlane);
}

function addLights(){
	//main lights
	directLight = new THREE.PointLight( 0xFFFFFF, 0.7, 0, 2);
	directLight.position.z = 10;
	directLight.position.y = 10;
	directLight.castShadow = true;
	//directLight.shadowCameraVisible = true;
	directLight.shadow.mapSize.width = 4096;
	directLight.shadow.mapSize.height = 4096;
	directLight.shadow.camera.near = 0.5;
	directLight.shadow.camera.far = 1000;

	scene.add( directLight);
	// scene.add( new THREE.AmbientLight( 0x404040 ));
	scene.add( new THREE.AmbientLight( 0xaaaaaa));
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

function addGui(control){
	let gui = new dat.GUI();
	gui.add(control, "rotationSpeed", -1, 1);
	gui.add(control, "x", -100, 100);
	gui.add(control, "y", -100, 100);
	gui.add(control, "z", -100, 100);
}

function addHelpers(){
	let helper = new THREE.CameraHelper( directLight.shadow.camera );
	scene.add( directLight, helper );
	let axesHelper = new THREE.AxesHelper( 5 );
	scene.add( axesHelper );	
}

function animate(){
	// time += 0.01;
	scene.getObjectByName("plane").rotation.z += control.rotationSpeed/500;
	requestAnimationFrame(animate);
	renderer.render(scene,camera);
	directLight.position.set( control.x , control.y , control.z);
	stats.update();
	orbitControl.update();
}

function resetNoise(){
    for (let i = 0; i < Math.random()*200 +100; i++){
        let a = Math.floor(Math.random()*256);
        let b = Math.floor(Math.random()*256);
        let temp = p[a];
        p[a] = p[b];
        p[b] = temp;
    }
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