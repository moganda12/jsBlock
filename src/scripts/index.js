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

camera.position.set(10, 10, 10);

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
const boxMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF, map: dirt});
const box = new THREE.Mesh(boxGeometry, boxMaterial);

scene.add(box);

box.position.set(1,1,1);

const ambience = new THREE.AmbientLight(0x333333);
scene.add(ambience);

const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(dirLight);
dirLight.position.set(1,1,1);


renderer.domElement.addEventListener('click', () => {
    firstperson.lock();
});

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

document.addEventListener('keydown', (kevent) => {
    switch (kevent.code) {
        case 'ArrowUp':
        case 'keyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'keyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'keyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'keyD':
            moveRight = true;
            break;
        case 'keyR':
            moveUp = true;
            break;
        case 'keyF':
            moveDown = true;
            break;
        default:
            break;
    };
});

document.addEventListener('keyup', (kevent) => {
    switch (kevent.code) {
        case 'ArrowUp':
        case 'keyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'keyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'keyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'keyD':
            moveRight = false;
            break;
        case 'keyR':
            moveUp = false;
            break;
        case 'keyF':
            moveDown = false;
            break;
        default:
            break;
    };
});

let dt = 0.01;
let lastTime = new Date().getTime();

function renderGame(time) {
    let velocity = new THREE.Vector3();
    let velz = moveBackward - moveForward;
    let velx = moveRight - moveLeft;
    let vely = moveDown - moveUp;
    let v3dmul = Math.sqrt(velz+velx+vely);
    velx *= v3dmul;
    vely *= v3dmul;
    velz *= v3dmul;
    velocity.set(velx,vely,velz);
    camera.position.x += velocity.x * dt;
    camera.position.y += velocity.y * dt;
    camera.position.z += velocity.z * dt;
    dt = time - lastTime;
    renderer.render(scene, camera);
    lastTime = time;
};

renderer.setAnimationLoop(renderGame);
