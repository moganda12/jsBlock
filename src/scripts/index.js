import * as THREE from 'three';
import * as datgui from 'dat.gui';
import Stats from 'stats.js';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls.js';

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

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
const boxMaterial = new THREE.MeshLambertMaterial({map: dirt});
const box = new THREE.Mesh(boxGeometry, boxMaterial);

scene.add(box);

box.position.set(1,1,1);

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
