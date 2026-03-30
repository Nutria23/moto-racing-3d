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
        this.scene.fog = new THREE.Fog(0x87ceeb, 10, 150);

        // Ajustamos el FOV para una vista más dinámica
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 4, -10); // Un poco más atrás y abajo para mejor vista
        
        this.models = new GameModels();
        this.initLights();
        
        this.isRunning = false;
        this.speed = 0.5;
        this.maxSpeed = 1.6;
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

        // Efecto de velocidad (líneas de viento)
        this.speedLines = [];
        this.initSpeedLines();
    }

    initLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambient);
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(20, 40, 20);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    initSpeedLines() {
        const geo = new THREE.BufferGeometry();
        const pts = new Float32Array([0, 0, 0, 0, 0, 2]);
        geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        for(let i = 0; i < 20; i++) {
            const line = new THREE.Line(geo, mat);
            line.visible = false;
            this.scene.add(line);
            this.speedLines.push(line);
        }
    }

    start() {
        this.reset();
        this.isRunning = true;
        this.animate();
    }

    reset() {
        while(this.scene.children.length > 0){ this.scene.remove(this.scene.children[0]); }
        this.initLights();
        this.initSpeedLines();
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

        // Controles de Deslizamiento (Swipe) Corregidos
        window.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            const diff = e.changedTouches[0].clientX - this.touchStartX;
            if (Math.abs(diff) > 20) { // Mayor sensibilidad
                if (diff > 0) this.moveLane(1);  // Swipe Derecha -> Mover Derecha
                else this.moveLane(-1);         // Swipe Izquierda -> Mover Izquierda
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
            const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
            vehicle = this.models.createCar(colors[Math.floor(Math.random() * colors.length)]);
        } else if (type === 'bus') {
            vehicle = this.models.createBus();
        } else {
            vehicle = this.models.createTrailer();
        }
        const lane = Math.floor(Math.random() * 3) - 1;
        vehicle.position.set(lane * this.laneWidth, 0, 200);
        this.scene.add(vehicle);
        this.traffic.push(vehicle);
    }

    update(delta) {
        if (!this.isRunning) return;

        // Carretera infinita
        this.roadSegments.forEach(seg => {
            seg.position.z -= this.speed * 120 * delta;
            if (seg.position.z < -50) seg.position.z += 250;
        });

        // Movimiento del jugador con inercia e INCLINACIÓN
        const targetX = this.lane * this.laneWidth;
        const xDiff = targetX - this.player.position.x;
        this.player.position.x += xDiff * 0.12;
        
        // Efecto realista de inclinación (Moto se inclina hacia el giro)
        this.player.rotation.z = -xDiff * 0.3;
        this.player.rotation.y = xDiff * 0.1;

        // CÁMARA FOLLOW (Sigue al jugador lateralmente para evitar que desaparezca)
        // Lerp para suavizar el seguimiento
        this.camera.position.x += (this.player.position.x - this.camera.position.x) * 0.08;
        this.camera.lookAt(this.player.position.x * 0.5, 1.5, 20); // Mira hacia adelante

        // Tráfico
        this.traffic.forEach((v, index) => {
            v.position.z -= (this.speed * 120 + 10) * delta;
            const dist = this.player.position.distanceTo(v.position);
            
            // Colisiones más precisas
            const dx = Math.abs(this.player.position.x - v.position.x);
            const dz = Math.abs(this.player.position.z - v.position.z);
            
            if (dz < 2.0 && dx < 1.0) {
                this.handleCollision(v);
            }

            if (v.position.z < -50) {
                this.scene.remove(v);
                this.traffic.splice(index, 1);
            }
        });

        // Spawn de tráfico mejorado
        const now = Date.now();
        if (now - this.lastSpawnTime > 1200 && Math.random() < 0.4) {
            this.spawnTraffic();
            this.lastSpawnTime = now;
        }

        // Efecto de líneas de velocidad
        this.updateSpeedLines();

        this.distance += this.speed * 0.15;
        this.speed = Math.min(this.maxSpeed, 0.5 + (this.distance / 1500));
        this.updateHUD();
    }

    updateSpeedLines() {
        this.speedLines.forEach(line => {
            if (!line.visible && Math.random() < 0.1) {
                line.visible = true;
                line.position.set(
                    (Math.random() - 0.5) * 20,
                    Math.random() * 5,
                    150
                );
            }
            if (line.visible) {
                line.position.z -= this.speed * 300 * 0.016;
                if (line.position.z < -20) line.visible = false;
            }
        });
    }

    handleCollision(v) {
        // Al chocar perdemos vida y nos detenemos un poco
        this.health -= 0.8;
        this.speed *= 0.98;
        if (this.health <= 0) this.gameOver();
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
