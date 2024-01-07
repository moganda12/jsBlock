import * as THREE from 'three';
import * as datgui from 'dat.gui';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

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

const orbit = new OrbitControls(camera, renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const dirt = 'assets/minecraft/textures/dirt.png'

const axis = new THREE.AxesHelper(5);
scene.add(axis);

camera.position.set(2,2,5);
orbit.update();

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial({color: 0xFFFFFF, map: textureLoader.load(dirt)});
const box = new THREE.Mesh(boxGeometry, boxMaterial);

scene.add(box);

box.position.set(1,1,1);

const ambience = new THREE.AmbientLight(0x333333);
scene.add(ambience);

const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(dirLight);
dirLight.position.set(1,1,1);

let dt = 0.01;
let lastTime = new Date().getTime();

function renderGame(time) {
    dt = time - lastTime;
    renderer.render(scene, camera);
    lastTime = time;
};

renderer.setAnimationLoop(renderGame);
