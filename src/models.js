import * as THREE from 'three';

export class GameModels {
    constructor() {
        this.materials = {
            body: new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.1, metalness: 0.8 }),
            paint: new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.3, metalness: 0.5 }),
            tire: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }),
            glass: new THREE.MeshStandardMaterial({ color: 0x88ccff, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.6 }),
            light: new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 1 }),
            redLight: new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1 }),
            chrome: new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.1, metalness: 1.0 })
        };
    }

    createMotorcycle() {
        const group = new THREE.Group();
        const bodyGeo = new THREE.BoxGeometry(0.4, 0.6, 1.2);
        const body = new THREE.Mesh(bodyGeo, this.materials.paint);
        body.position.y = 0.5;
        group.add(body);

        const engineGeo = new THREE.BoxGeometry(0.35, 0.4, 0.8);
        const engine = new THREE.Mesh(engineGeo, this.materials.body);
        engine.position.y = 0.3;
        group.add(engine);

        const tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16);
        tireGeo.rotateZ(Math.PI/2);
        const frontTire = new THREE.Mesh(tireGeo, this.materials.tire);
        frontTire.position.set(0, 0.3, 0.5);
        group.add(frontTire);

        const backTire = new THREE.Mesh(tireGeo, this.materials.tire);
        backTire.position.set(0, 0.3, -0.5);
        group.add(backTire);

        const barGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
        barGeo.rotateZ(Math.PI/2);
        const bars = new THREE.Mesh(barGeo, this.materials.chrome);
        bars.position.set(0, 0.8, 0.3);
        group.add(bars);

        const seatGeo = new THREE.BoxGeometry(0.3, 0.1, 0.5);
        const seat = new THREE.Mesh(seatGeo, this.materials.body);
        seat.position.set(0, 0.8, -0.1);
        group.add(seat);

        const lightGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
        const light = new THREE.Mesh(lightGeo, this.materials.light);
        light.position.set(0, 0.6, 0.6);
        group.add(light);

        group.name = "motorcycle";
        return group;
    }

    createCar(color = 0x00aaff) {
        const group = new THREE.Group();
        const mat = this.materials.paint.clone();
        mat.color.set(color);

        const bottomGeo = new THREE.BoxGeometry(1.6, 0.6, 3.5);
        const bottom = new THREE.Mesh(bottomGeo, mat);
        bottom.position.y = 0.5;
        group.add(bottom);

        const topGeo = new THREE.BoxGeometry(1.4, 0.6, 1.8);
        const top = new THREE.Mesh(topGeo, this.materials.glass);
        top.position.set(0, 1.1, -0.2);
        group.add(top);

        const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        wheelGeo.rotateZ(Math.PI/2);
        const pos = [[0.8, 0.4, 1.1], [-0.8, 0.4, 1.1], [0.8, 0.4, -1.1], [-0.8, 0.4, -1.1]];
        pos.forEach(p => {
            const w = new THREE.Mesh(wheelGeo, this.materials.tire);
            w.position.set(p[0], p[1], p[2]);
            group.add(w);
        });

        return group;
    }

    createBus() {
        const group = new THREE.Group();
        const mat = this.materials.paint.clone();
        mat.color.set(0xffcc00);
        const bodyGeo = new THREE.BoxGeometry(2.2, 2.5, 8.0);
        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 1.5;
        group.add(body);
        const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
        wheelGeo.rotateZ(Math.PI/2);
        const pos = [[1.2, 0.6, 3], [-1.2, 0.6, 3], [1.2, 0.6, -3], [-1.2, 0.6, -3]];
        pos.forEach(p => {
            const w = new THREE.Mesh(wheelGeo, this.materials.tire);
            w.position.set(p[0], p[1], p[2]);
            group.add(w);
        });
        return group;
    }

    createTrailer() {
        const group = new THREE.Group();
        const cabGeo = new THREE.BoxGeometry(2.2, 2.5, 2.0);
        const cab = new THREE.Mesh(cabGeo, this.materials.paint);
        cab.position.set(0, 1.5, 4);
        group.add(cab);
        const trailGeo = new THREE.BoxGeometry(2.4, 3.0, 7.0);
        const trail = new THREE.Mesh(trailGeo, this.materials.chrome);
        trail.position.set(0, 1.8, -1);
        group.add(trail);
        const wheelGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.5, 16);
        wheelGeo.rotateZ(Math.PI/2);
        const pos = [[1.2, 0.6, 4], [-1.2, 0.6, 4], [1.2, 0.6, -4], [-1.2, 0.6, -4]];
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
