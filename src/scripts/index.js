import * as THREE from 'three';
import * as datgui from 'dat.gui';
import Stats from 'stats.js';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const renderer = new THREE.WebGLRenderer();

THREE.ColorManagement.enabled = false;

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(5, 5, 5);

const firstperson = new PointerLockControls( camera, renderer.domElement );

const textureLoader = new THREE.TextureLoader();
function loadTexture(path) {
    let texture = textureLoader.load(path);
    texture.magFilter = THREE.NearestFilter;
    return texture;
}

const dirt = loadTexture('./assets/minecraft/textures/block/dirt.png');

const axis = new THREE.AxesHelper(5);
scene.add(axis);

const ambience = new THREE.AmbientLight();
scene.add(ambience);
ambience.intensity = 0.1;

const dirLight = new THREE.DirectionalLight();
scene.add(dirLight);
dirLight.position.set(1,1,1);

const dirLight2 = new THREE.DirectionalLight();
scene.add(dirLight2);
dirLight2.position.set(-1,1,-0.5);

let title = document.getElementById('title');

let locked = false;

renderer.domElement.addEventListener('click', () => {
    firstperson.lock();
});

firstperson.addEventListener('lock', () => {
    title.style.display = 'none';
    locked = true;
});

firstperson.addEventListener('unlock', () => {
    title.style.display = 'block';
    locked = false;
});

let moveSpeed = new THREE.Vector3();

document.addEventListener('keydown', (keyEvent) => {
    switch (keyEvent.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveSpeed.z += 1;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveSpeed.z -= 1;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveSpeed.x -= 1;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveSpeed.x += 1;
            break;
        case 'KeyR':
            moveSpeed.y += 1;
            break;
        case 'KeyF':
            moveSpeed.y -= 1;
            break;
    }
});

document.addEventListener('keyup', (keyEvent) => {
    switch (keyEvent.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveSpeed.z -= 1;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveSpeed.z += 1;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveSpeed.x -= 1;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveSpeed.x += 1;
            break;
        case 'KeyR':
            moveSpeed.y -= 1;
            break;
        case 'KeyF':
            moveSpeed.y += 1;
            break;
    }
});

let dt = 0.01;
let lastTime = performance.now();

const dirtBlock = new THREE.MeshLambertMaterial({texture: dirt});

class VoxelWorld {

	constructor( cellSize ) {

		this.cellSize = cellSize;
		this.cellSliceSize = cellSize * cellSize;
		this.cell = new Uint8Array( cellSize * cellSize * cellSize );

	}
	computeVoxelOffset( x, y, z ) {

		const { cellSize, cellSliceSize } = this;
		const voxelX = THREE.MathUtils.euclideanModulo( x, cellSize ) | 0;
		const voxelY = THREE.MathUtils.euclideanModulo( y, cellSize ) | 0;
		const voxelZ = THREE.MathUtils.euclideanModulo( z, cellSize ) | 0;
		return voxelY * cellSliceSize +
		   voxelZ * cellSize +
		   voxelX;

	}
	getCellForVoxel( x, y, z ) {

		const { cellSize } = this;
		const cellX = Math.floor( x / cellSize );
		const cellY = Math.floor( y / cellSize );
		const cellZ = Math.floor( z / cellSize );
		if ( cellX !== 0 || cellY !== 0 || cellZ !== 0 ) {

			return null;

		}

		return this.cell;

	}
	setVoxel( x, y, z, v ) {

		const cell = this.getCellForVoxel( x, y, z );
		if ( ! cell ) {

			return; // TODO: add a new cell?

		}

		const voxelOffset = this.computeVoxelOffset( x, y, z );
		cell[ voxelOffset ] = v;

	}
	getVoxel( x, y, z ) {

		const cell = this.getCellForVoxel( x, y, z );
		if ( ! cell ) {

			return 0;

		}

		const voxelOffset = this.computeVoxelOffset( x, y, z );
		return cell[ voxelOffset ];

	}
	generateGeometryDataForCell( cellX, cellY, cellZ ) {

		const { cellSize } = this;
		const positions = [];
		const normals = [];
		const indices = [];
		const startX = cellX * cellSize;
		const startY = cellY * cellSize;
		const startZ = cellZ * cellSize;

		for ( let y = 0; y < cellSize; ++ y ) {

			const voxelY = startY + y;
			for ( let z = 0; z < cellSize; ++ z ) {

				const voxelZ = startZ + z;
				for ( let x = 0; x < cellSize; ++ x ) {

					const voxelX = startX + x;
					const voxel = this.getVoxel( voxelX, voxelY, voxelZ );
					if ( voxel ) {

						// There is a voxel here but do we need faces for it?
						for ( const { dir, corners } of VoxelWorld.faces ) {

							const neighbor = this.getVoxel(
								voxelX + dir[ 0 ],
								voxelY + dir[ 1 ],
								voxelZ + dir[ 2 ] );
							if ( ! neighbor ) {

								// this voxel has no neighbor in this direction so we need a face.
								const ndx = positions.length / 3;
								for ( const pos of corners ) {

									positions.push( pos[ 0 ] + x, pos[ 1 ] + y, pos[ 2 ] + z );
									normals.push( ...dir );

								}

								indices.push(
									ndx, ndx + 1, ndx + 2,
									ndx + 2, ndx + 1, ndx + 3,
								);

							}

						}

					}

				}

			}

		}

		return {
			positions,
			normals,
			indices,
		};

	}

}

VoxelWorld.faces = [
	{ // left
		dir: [ - 1, 0, 0, ],
		corners: [
			[ 0, 1, 0 ],
			[ 0, 0, 0 ],
			[ 0, 1, 1 ],
			[ 0, 0, 1 ],
		],
	},
	{ // right
		dir: [ 1, 0, 0, ],
		corners: [
			[ 1, 1, 1 ],
			[ 1, 0, 1 ],
			[ 1, 1, 0 ],
			[ 1, 0, 0 ],
		],
	},
	{ // bottom
		dir: [ 0, - 1, 0, ],
		corners: [
			[ 1, 0, 1 ],
			[ 0, 0, 1 ],
			[ 1, 0, 0 ],
			[ 0, 0, 0 ],
		],
	},
	{ // top
		dir: [ 0, 1, 0, ],
		corners: [
			[ 0, 1, 1 ],
			[ 1, 1, 1 ],
			[ 0, 1, 0 ],
			[ 1, 1, 0 ],
		],
	},
	{ // back
		dir: [ 0, 0, - 1, ],
		corners: [
			[ 1, 0, 0 ],
			[ 0, 0, 0 ],
			[ 1, 1, 0 ],
			[ 0, 1, 0 ],
		],
	},
	{ // front
		dir: [ 0, 0, 1, ],
		corners: [
			[ 0, 0, 1 ],
			[ 1, 0, 1 ],
			[ 0, 1, 1 ],
			[ 1, 1, 1 ],
		],
	},
];

const cellSize = 32;

const world = new VoxelWorld( cellSize );

for ( let y = 0; y < cellSize; ++ y ) {

	for ( let z = 0; z < cellSize; ++ z ) {

		for ( let x = 0; x < cellSize; ++ x ) {

			const height = ( Math.sin( x / cellSize * Math.PI * 2 ) + Math.sin( z / cellSize * Math.PI * 3 ) ) * ( cellSize / 6 ) + ( cellSize / 2 );
			if ( y < height ) {

				world.setVoxel( x, y, z, 1 );

			}

		}

	}

}

const { positions, normals, indices } = world.generateGeometryDataForCell( 0, 0, 0 );
const geometry = new THREE.BufferGeometry();
const material = new THREE.MeshLambertMaterial( { color: 'green' } );

const positionNumComponents = 3;
const normalNumComponents = 3;
geometry.setAttribute(
	'position',
	new THREE.BufferAttribute( new Float32Array( positions ), positionNumComponents ) );
geometry.setAttribute(
	'normal',
	new THREE.BufferAttribute( new Float32Array( normals ), normalNumComponents ) );
geometry.setIndex( indices );
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );


function renderGame() {
    stats.begin();
    let time = performance.now();
    dt = time - lastTime;
    if(locked) {
        let moveCorMod = Math.sqrt(Math.abs(moveSpeed.x) + Math.abs(moveSpeed.y) + Math.abs(moveSpeed.z));
        let finalSpeed = moveSpeed;
        finalSpeed.multiplyScalar(moveCorMod);
        finalSpeed.multiplyScalar(dt/1000);
        finalSpeed.multiplyScalar(5);
        firstperson.moveRight(finalSpeed.x);
        firstperson.moveForward(finalSpeed.z);
        camera.position.y += finalSpeed.y;
    };

    renderer.render(scene, camera);
    lastTime = time;
    stats.end();
};

renderer.setAnimationLoop(renderGame);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
