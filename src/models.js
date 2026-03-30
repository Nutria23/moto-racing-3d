import * as THREE from 'three';

export class GameModels {
    constructor() {
        this.materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.1, metalness: 0.8 }),
            paint: new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3, metalness: 0.5 }),
            tire: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }),
            glass: new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.6 }),
            light: new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 2 }),
            redLight: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2 }),
            chrome: new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.1, metalness: 1.0 })
        };
    }

    createMotorcycle() {
        const group = new THREE.Group();
        
        // Chasis principal (más estilizado)
        const bodyGeo = new THREE.BoxGeometry(0.3, 0.4, 1.3);
        const body = new THREE.Mesh(bodyGeo, this.materials.body);
        body.position.y = 0.5;
        group.add(body);

        // Tanque de combustible
        const tankGeo = new THREE.CapsuleGeometry(0.18, 0.4, 8, 16);
        tankGeo.rotateX(Math.PI/2);
        const tank = new THREE.Mesh(tankGeo, this.materials.paint);
        tank.position.set(0, 0.75, 0.1);
        group.add(tank);

        // Motor (bloque cromado)
        const engineGeo = new THREE.BoxGeometry(0.28, 0.3, 0.6);
        const engine = new THREE.Mesh(engineGeo, this.materials.chrome);
        engine.position.y = 0.35;
        group.add(engine);

        // Escape
        const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.8, 8);
        exhaustGeo.rotateX(Math.PI/2);
        const exhaust = new THREE.Mesh(exhaustGeo, this.materials.chrome);
        exhaust.position.set(0.15, 0.35, -0.4);
        group.add(exhaust);

        // Llantas (más detalle)
        const tireGeo = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
        const frontTire = new THREE.Mesh(tireGeo, this.materials.tire);
        frontTire.position.set(0, 0.3, 0.7);
        group.add(frontTire);

        const backTire = new THREE.Mesh(tireGeo, this.materials.tire);
        backTire.position.set(0, 0.3, -0.7);
        group.add(backTire);

        // Horquilla/Manubrio
        const forkGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
        forkGeo.rotateX(-Math.PI/6);
        const fork = new THREE.Mesh(forkGeo, this.materials.chrome);
        fork.position.set(0, 0.7, 0.5);
        group.add(fork);

        const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8);
        barGeo.rotateZ(Math.PI/2);
        const bars = new THREE.Mesh(barGeo, this.materials.chrome);
        bars.position.set(0, 0.95, 0.4);
        group.add(bars);

        // Asiento
        const seatGeo = new THREE.BoxGeometry(0.25, 0.1, 0.6);
        const seat = new THREE.Mesh(seatGeo, this.materials.body);
        seat.position.set(0, 0.72, -0.3);
        group.add(seat);

        // Faros
        const lightGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const light = new THREE.Mesh(lightGeo, this.materials.light);
        light.position.set(0, 0.8, 0.75);
        group.add(light);

        group.name = "motorcycle";
        return group;
    }

    createCar(color = 0x00aaff) {
        const group = new THREE.Group();
        const mat = this.materials.paint.clone();
        mat.color.set(color);

        // Chasis inferior
        const bottomGeo = new THREE.BoxGeometry(1.8, 0.7, 3.8);
        const bottom = new THREE.Mesh(bottomGeo, mat);
        bottom.position.y = 0.45;
        group.add(bottom);

        // Cabina
        const topGeo = new THREE.BoxGeometry(1.5, 0.6, 2.0);
        const top = new THREE.Mesh(topGeo, this.materials.glass);
        top.position.set(0, 1.05, -0.1);
        group.add(top);

        // Techo (del mismo color de la pintura)
        const roofGeo = new THREE.BoxGeometry(1.5, 0.05, 2.0);
        const roof = new THREE.Mesh(roofGeo, mat);
        roof.position.set(0, 1.35, -0.1);
        group.add(roof);

        // Ruedas
        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 16);
        wheelGeo.rotateZ(Math.PI/2);
        const pos = [[0.9, 0.4, 1.2], [-0.9, 0.4, 1.2], [0.9, 0.4, -1.2], [-0.9, 0.4, -1.2]];
        pos.forEach(p => {
            const w = new THREE.Mesh(wheelGeo, this.materials.tire);
            w.position.set(p[0], p[1], p[2]);
            group.add(w);
        });

        // Faros Delanteros
        const headLightGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const fl = new THREE.Mesh(headLightGeo, this.materials.light);
        fl.position.set(0.6, 0.5, 1.9); group.add(fl);
        const fr = fl.clone(); fr.position.x = -0.6; group.add(fr);

        // Faros Traseros
        const tailLightGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
        const rl = new THREE.Mesh(tailLightGeo, this.materials.redLight);
        rl.position.set(0.6, 0.5, -1.9); group.add(rl);
        const rr = rl.clone(); rr.position.x = -0.6; group.add(rr);

        return group;
    }

    createBus() {
        const group = new THREE.Group();
        const mat = this.materials.paint.clone();
        mat.color.set(0xffcc00); // Color escolar

        // Cuerpo principal
        const bodyGeo = new THREE.BoxGeometry(2.3, 2.6, 8.5);
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 1.6;
        group.add(body);

        // Ventanales laterales (largos)
        const winGeo = new THREE.BoxGeometry(2.4, 1.0, 7.5);
        const windows = new THREE.Mesh(winGeo, this.materials.glass);
        windows.position.set(0, 2.0, 0);
        group.add(windows);

        // Parabrisas
        const windshieldGeo = new THREE.BoxGeometry(2.1, 1.2, 0.1);
        const ws = new THREE.Mesh(windshieldGeo, this.materials.glass);
        ws.position.set(0, 1.8, 4.25);
        group.add(ws);

        // Ruedas
        const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 16);
        wheelGeo.rotateZ(Math.PI/2);
        const pos = [[1.2, 0.6, 3.2], [-1.2, 0.6, 3.2], [1.2, 0.6, -3.2], [-1.2, 0.6, -3.2]];
        pos.forEach(p => {
            const w = new THREE.Mesh(wheelGeo, this.materials.tire);
            w.position.set(p[0], p[1], p[2]);
            group.add(w);
        });
        return group;
    }

    createTrailer() {
        const group = new THREE.Group();
        
        // Cabina
        const cabGeo = new THREE.BoxGeometry(2.4, 2.8, 2.5);
        const cab = new THREE.Mesh(cabGeo, this.materials.paint);
        cab.position.set(0, 1.6, 4);
        group.add(cab);

        const cabWinGeo = new THREE.BoxGeometry(2.2, 1.0, 1.5);
        const cabWin = new THREE.Mesh(cabWinGeo, this.materials.glass);
        cabWin.position.set(0, 2.2, 4.2);
        group.add(cabWin);

        // Remolque
        const trailGeo = new THREE.BoxGeometry(2.6, 3.2, 8.5);
        const trail = new THREE.Mesh(trailGeo, this.materials.chrome);
        trail.position.set(0, 2.0, -1.5);
        group.add(trail);

        // Ruedas (múltiples ejes)
        const wheelGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.6, 16);
        wheelGeo.rotateZ(Math.PI/2);
        const pos = [
            [1.2, 0.65, 4.2], [-1.2, 0.65, 4.2], 
            [1.2, 0.65, -0.5], [-1.2, 0.65, -0.5],
            [1.2, 0.65, -2.5], [-1.2, 0.65, -2.5],
            [1.2, 0.65, -4.5], [-1.2, 0.65, -4.5]
        ];
        pos.forEach(p => {
            const w = new THREE.Mesh(wheelGeo, this.materials.tire);
            w.position.set(p[0], p[1], p[2]);
            group.add(w);
        });
        return group;
    }

    createRoadSegment() {
        const group = new THREE.Group();
        const roadGeo = new THREE.PlaneGeometry(12, 50);
        roadGeo.rotateX(-Math.PI/2);
        const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.receiveShadow = true;
        group.add(road);

        const sideLineGeo = new THREE.PlaneGeometry(0.2, 50);
        sideLineGeo.rotateX(-Math.PI/2);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const leftL = new THREE.Mesh(sideLineGeo, lineMat);
        leftL.position.set(-5.8, 0.01, 0);
        group.add(leftL);
        const rightL = leftL.clone(); rightL.position.x = 5.8; group.add(rightL);

        for(let i = -20; i <= 20; i += 10) {
            const dashGeo = new THREE.PlaneGeometry(0.2, 4);
            dashGeo.rotateX(-Math.PI/2);
            const line1 = new THREE.Mesh(dashGeo, lineMat);
            line1.position.set(-2, 0.01, i);
            group.add(line1);
            const line2 = line1.clone(); line2.position.x = 2; group.add(line2);
        }
        return group;
    }
}
