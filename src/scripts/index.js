import * as THREE from 'three';
import * as datgui from 'dat.gui';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';

const renderer = new THREE.WebGLRenderer();

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

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({map: dirt});
const box = new THREE.Mesh(boxGeometry, boxMaterial);

scene.add(box);

box.position.set(1,1,1);

const ambience = new THREE.AmbientLight(0x333333);
scene.add(ambience);

const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(dirLight);
dirLight.position.set(1,1,1);

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
            moveSpeed.x += 1;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveSpeed.x -= 1;
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

function renderGame() {
    let time = performance.now();
    dt = time - lastTime;
    if(locked) {
        let moveCorMod = Math.sqrt(Math.abs(moveSpeed.x) + Math.abs(moveSpeed.y) + Math.abs(moveSpeed.z));
        moveSpeed.multiplyScalar(moveCorMod);
        moveSpeed.multiplyScalar(dt/1000);
        camera.position.add(moveSpeed);
    }
    renderer.render(scene, camera);
    lastTime = time;
};

renderer.setAnimationLoop(renderGame);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
