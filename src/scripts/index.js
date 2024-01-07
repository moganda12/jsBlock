import * as THREE from 'three';

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

const axis = new THREE.AxesHelper(5);
scene.add(axis);

camera.position.set(2,2,5);

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x006700});
const box = new THREE.Mesh(boxGeometry, boxMaterial);

scene.add(box);

function renderGame() {
    box.rotation.x += 0.1;
    box.rotation.y += 0.1;
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(renderGame);
