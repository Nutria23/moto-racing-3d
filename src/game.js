import * as THREE from 'three';
import { GameModels } from './models.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 10, 100);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, -8);
        this.camera.lookAt(0, 2, 10);

        this.models = new GameModels();
        this.initLights();
        
        this.isRunning = false;
        this.speed = 0.5;
        this.maxSpeed = 1.2;
        this.lane = 0;
        this.laneWidth = 4;
        this.health = 100;
        this.distance = 0;
        
        this.player = null;
        this.roadSegments = [];
        this.traffic = [];
        this.lastSpawnTime = 0;
        this.touchStartX = 0;
        this.bindEvents();
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 1.0);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    start() {
        this.reset();
        this.isRunning = true;
        this.animate();
    }

    reset() {
        while(this.scene.children.length > 0){ this.scene.remove(this.scene.children[0]); }
        this.initLights();
        this.roadSegments = [];
        for(let i = 0; i < 5; i++) {
            const seg = this.models.createRoadSegment();
            seg.position.z = i * 50;
            this.scene.add(seg);
            this.roadSegments.push(seg);
        }
        this.player = this.models.createMotorcycle();
        this.player.position.set(0, 0, 0);
        this.scene.add(this.player);
        this.health = 100;
        this.distance = 0;
        this.speed = 0.5;
        this.lane = 0;
        this.traffic = [];
        this.updateHUD();
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener('touchstart', (e) => this.touchStartX = e.touches[0].clientX);
        window.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - this.touchStartX;
            if (Math.abs(diff) > 30) {
                if (diff > 0) this.moveLane(1);
                else this.moveLane(-1);
            }
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.moveLane(-1);
            if (e.key === 'ArrowRight') this.moveLane(1);
        });
    }

    moveLane(dir) {
        if (!this.isRunning) return;
        this.lane = Math.max(-1, Math.min(1, this.lane + dir));
    }

    spawnTraffic() {
        const types = ['car', 'bus', 'trailer'];
        const type = types[Math.floor(Math.random() * types.length)];
        let vehicle;
        if (type === 'car') {
            const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
            vehicle = this.models.createCar(colors[Math.floor(Math.random() * colors.length)]);
        } else if (type === 'bus') {
            vehicle = this.models.createBus();
        } else {
            vehicle = this.models.createTrailer();
        }
        const lane = Math.floor(Math.random() * 3) - 1;
        vehicle.position.set(lane * this.laneWidth, 0, 150);
        this.scene.add(vehicle);
        this.traffic.push(vehicle);
    }

    update(delta) {
        if (!this.isRunning) return;
        this.roadSegments.forEach(seg => {
            seg.position.z -= this.speed * 100 * delta;
            if (seg.position.z < -50) seg.position.z += 250;
        });
        const targetX = this.lane * this.laneWidth;
        this.player.position.x += (targetX - this.player.position.x) * 0.15;
        this.player.rotation.z = -(this.player.position.x - targetX) * 0.2;
        this.traffic.forEach((v, index) => {
            v.position.z -= (this.speed * 100 + 5) * delta;
            const dist = this.player.position.distanceTo(v.position);
            if (dist < 2.5) this.handleCollision(v);
            if (v.position.z < -50) {
                this.scene.remove(v);
                this.traffic.splice(index, 1);
            }
        });
        const now = Date.now();
        if (now - this.lastSpawnTime > 1500 && Math.random() < 0.3) {
            this.spawnTraffic();
            this.lastSpawnTime = now;
        }
        this.distance += this.speed * 0.1;
        this.speed = Math.min(this.maxSpeed, 0.5 + (this.distance / 1000));
        this.updateHUD();
    }

    handleCollision(v) {
        const dx = Math.abs(this.player.position.x - v.position.x);
        const dz = Math.abs(this.player.position.z - v.position.z);
        if (dz > 1.5 && dx < 0.5) this.gameOver();
        else if (dx > 0.5 && dx < 1.5) {
            this.health -= 0.5;
            if (this.health <= 0) this.gameOver();
        }
    }

    updateHUD() {
        document.getElementById('health-bar-fill').style.width = `${this.health}%`;
        document.getElementById('health-text').innerText = `${Math.ceil(this.health)}%`;
        document.getElementById('score').innerText = `${Math.floor(this.distance)}m`;
        document.getElementById('speed-meter').innerText = `${Math.floor(this.speed * 200)} KM/H`;
    }

    gameOver() {
        this.isRunning = false;
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('final-score').innerText = Math.floor(this.distance);
    }

    animate() {
        if (!this.isRunning) return;
        requestAnimationFrame(() => this.animate());
        this.update(0.016);
        this.renderer.render(this.scene, this.camera);
    }
}
