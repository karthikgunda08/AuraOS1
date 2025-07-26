// src/components/Basic3dViewPanel.tsx
import React, { useLayoutEffect, useRef, useEffect, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Level, Placement, PropertyLine, TerrainMesh, SunPosition, SelectedObject, HolocronHotspot, DigitalTwinData, LiveSelection, User, Collaborator, ConstructionPhase, DigitalTwinDataOverlay, Wall, Zone, InfrastructureLine } from '../types';

export interface View3DHandles {
  exportAsPNG: () => string | undefined;
  exportAsGLB: (projectName: string) => void;
}

export interface Basic3dViewPanelProps {
    levels: Level[];
    zones: Zone[];
    infrastructure: InfrastructureLine[];
    activeLevelIndex: number;
    propertyLines: PropertyLine[];
    terrainMesh: TerrainMesh | null;
    selectedObject: SelectedObject | null;
    setSelectedObject: (payload: React.SetStateAction<SelectedObject | null>) => void;
    sunPosition: SunPosition;
    isWalkthroughActive: boolean;
    setIsWalkthroughActive: (active: boolean) => void;
    constructionSequence: ConstructionPhase[] | null;
    activeTimelineWeek: number | null;
    hotspots?: HolocronHotspot[];
    onHotspotClick?: (hotspot: HolocronHotspot) => void;
    isDigitalTwinModeActive: boolean;
    digitalTwinData: DigitalTwinData | null;
    activeDataOverlays: DigitalTwinDataOverlay;
    liveSelections: Record<string, LiveSelection>;
    currentUser: User | null;
    collaborators: Collaborator[];
}

const createWallWithOpenings = (wall: Wall, placements: Placement[]) => {
    const wallGroup = new THREE.Group();
    const wallVec = new THREE.Vector2(wall.x2 - wall.x1, wall.y2 - wall.y1);
    const wallLength = wallVec.length();
    const wallAngle = Math.atan2(wallVec.y, wallVec.x);

    let currentPosition = 0;
    const openings = placements
        .filter(p => p.wallId === wall.id)
        .map(p => ({
            start: (p.positionRatio * wallLength) - p.width / 2,
            end: (p.positionRatio * wallLength) + p.width / 2,
            height: p.height,
        }))
        .sort((a, b) => a.start - b.start);

    openings.forEach(opening => {
        // Wall segment before opening
        const segmentLength = opening.start - currentPosition;
        if (segmentLength > 0.1) {
            const segment = new THREE.Mesh(new THREE.BoxGeometry(segmentLength, wall.height, wall.thickness));
            segment.position.x = currentPosition + segmentLength / 2;
            wallGroup.add(segment);
        }
        
        // Wall segment above opening (lintel)
        const lintelHeight = wall.height - opening.height;
        if (lintelHeight > 0.1) {
             const lintel = new THREE.Mesh(new THREE.BoxGeometry(opening.end - opening.start, lintelHeight, wall.thickness));
            lintel.position.x = opening.start + (opening.end - opening.start) / 2;
            lintel.position.y = opening.height + lintelHeight / 2;
            wallGroup.add(lintel);
        }

        currentPosition = opening.end;
    });

    // Final wall segment after last opening
    if (wallLength - currentPosition > 0.1) {
        const finalSegmentLength = wallLength - currentPosition;
        const finalSegment = new THREE.Mesh(new THREE.BoxGeometry(finalSegmentLength, wall.height, wall.thickness));
        finalSegment.position.x = currentPosition + finalSegmentLength / 2;
        wallGroup.add(finalSegment);
    }

    wallGroup.position.set(wall.x1, wall.height / 2, -wall.y1);
    wallGroup.rotation.y = -wallAngle;
    
    const offsetX = (wall.x2 - wall.x1) / 2;
    const offsetZ = -(wall.y2 - wall.y1) / 2;
    wallGroup.position.x += offsetX;
    wallGroup.position.z += offsetZ;
    
    return wallGroup;
};

const createZoneMesh = (zone: Zone) => {
    const zoneColors: Record<string, number> = {
        residential: 0x2563eb,
        commercial: 0xf59e0b,
        green_space: 0x10b981,
        infrastructure: 0x64748b,
    };
    const shape = new THREE.Shape(zone.path.map(p => new THREE.Vector2(p.x, -p.y)));
    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshStandardMaterial({
        color: zoneColors[zone.type] || 0x94a3b8,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.5; // Slightly above ground
    mesh.userData = { id: zone.id, type: 'zone' };
    return mesh;
};

const createRoadMesh = (road: InfrastructureLine) => {
    const roadGroup = new THREE.Group();
    roadGroup.userData = { id: road.id, type: 'infrastructure' };
    const material = new THREE.MeshStandardMaterial({ color: 0x475569 });
    
    for (let i = 0; i < road.path.length - 1; i++) {
        const p1 = road.path[i];
        const p2 = road.path[i + 1];
        const segmentVec = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y);
        const length = segmentVec.length();
        const angle = Math.atan2(segmentVec.y, segmentVec.x);

        const geometry = new THREE.BoxGeometry(length, 2, road.width || 10);
        const segmentMesh = new THREE.Mesh(geometry, material);
        segmentMesh.position.set(p1.x + segmentVec.x / 2, 1, -(p1.y + segmentVec.y / 2));
        segmentMesh.rotation.y = -angle;
        roadGroup.add(segmentMesh);
    }
    return roadGroup;
};

export const Basic3dViewPanel = forwardRef<View3DHandles, Basic3dViewPanelProps>((props, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const { levels, activeLevelIndex, selectedObject, setSelectedObject } = props;

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const projectGroupRef = useRef<THREE.Group | null>(null);

    const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const highlightMaterial = new THREE.MeshStandardMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });

    useEffect(() => {
        if (!mountRef.current) return;
        const currentMount = mountRef.current;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1e293b);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 10000);
        camera.position.set(400, 500, -600);
        cameraRef.current = camera;
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls;
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(200, 300, 200);
        scene.add(dirLight);

        const projectGroup = new THREE.Group();
        projectGroupRef.current = projectGroup;
        scene.add(projectGroup);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (currentMount && rendererRef.current && cameraRef.current) {
                cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        const onCanvasClick = (event: MouseEvent) => {
            if (!mountRef.current || !cameraRef.current || !projectGroupRef.current) return;

            const rect = mountRef.current.getBoundingClientRect();
            const mouse = new THREE.Vector2();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, cameraRef.current);

            const intersects = raycaster.intersectObjects(projectGroupRef.current.children, true);

            if (intersects.length > 0) {
                let clickedObject: THREE.Object3D | null = intersects[0].object;
                while (clickedObject && !clickedObject.userData.id) {
                    clickedObject = clickedObject.parent;
                }
                
                if (clickedObject && clickedObject.userData.id) {
                    const { id, type, levelIndex } = clickedObject.userData;
                    setSelectedObject({ id, type, levelIndex });
                }
            } else {
                setSelectedObject(null);
            }
        };
        currentMount.addEventListener('click', onCanvasClick);

        return () => {
            window.removeEventListener('resize', handleResize);
            currentMount.removeEventListener('click', onCanvasClick);
            if (currentMount && rendererRef.current) {
                currentMount.removeChild(rendererRef.current.domElement);
            }
            rendererRef.current?.dispose();
        };
    }, [setSelectedObject]);

    useLayoutEffect(() => {
        const projectGroup = projectGroupRef.current;
        if (!projectGroup) return;

        while (projectGroup.children.length) {
            projectGroup.remove(projectGroup.children[0]);
        }
        
        // Render elements from active level for building designs
        const activeLevel = props.levels[props.activeLevelIndex];
        if (activeLevel) {
            activeLevel.walls.forEach(wall => {
                const wallMesh = createWallWithOpenings(wall, activeLevel.placements);
                wallMesh.traverse(child => { if (child instanceof THREE.Mesh) child.material = defaultMaterial; });
                wallMesh.userData = { id: wall.id, type: 'wall', levelIndex: props.activeLevelIndex };
                projectGroup.add(wallMesh);
            });
            
            activeLevel.rooms.forEach(room => {
                const roomWalls = room.wallIds.map(id => activeLevel.walls.find(w => w.id === id)).filter(Boolean) as Wall[];
                if (roomWalls.length < 3) return;

                const points: THREE.Vector2[] = [];
                roomWalls.forEach(w => {
                    points.push(new THREE.Vector2(w.x1, w.y1));
                    points.push(new THREE.Vector2(w.x2, w.y2));
                });
                const uniquePoints = Array.from(new Set(points.map(p => `${p.x},${p.y}`))).map(s => {
                    const [x,y] = s.split(',').map(parseFloat);
                    return new THREE.Vector2(x,y);
                });
                
                const center = uniquePoints.reduce((acc, p) => acc.add(p), new THREE.Vector2()).divideScalar(uniquePoints.length);
                uniquePoints.sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));

                if(uniquePoints.length > 2) {
                    const floorShape = new THREE.Shape(uniquePoints.map(p => new THREE.Vector2(p.x, -p.y)));
                    const floorGeom = new THREE.ShapeGeometry(floorShape);
                    const floorMesh = new THREE.Mesh(floorGeom, floorMaterial.clone());
                    floorMesh.rotation.x = -Math.PI / 2;
                    floorMesh.position.y = activeLevel.elevation;
                    floorMesh.userData = { id: room.id, type: 'room', levelIndex: props.activeLevelIndex };
                    projectGroup.add(floorMesh);
                }
            });
        }
        
        // Render master plan elements from top-level props for master plans
        (props.zones || []).forEach(zone => {
            const zoneMesh = createZoneMesh(zone);
            projectGroup.add(zoneMesh);
        });

        (props.infrastructure || []).forEach(road => {
            if(road.type === 'road') {
                const roadMesh = createRoadMesh(road);
                projectGroup.add(roadMesh);
            }
        });

    }, [props.levels, props.activeLevelIndex, props.zones, props.infrastructure]);


    useLayoutEffect(() => {
        const projectGroup = projectGroupRef.current;
        if (!projectGroup) return;

        projectGroup.traverse(child => {
            const data = child.userData;
            if (child instanceof THREE.Mesh) {
                if (data.type === 'room') child.material = floorMaterial;
                else if (data.type === 'zone') { /* Keep zone material */ }
                else child.material = defaultMaterial;
            } else if (child instanceof THREE.Group) { // Handle walls and roads
                 child.children.forEach(c => { if (c instanceof THREE.Mesh) c.material = defaultMaterial; });
            }
        });

        if (selectedObject && selectedObject.levelIndex === activeLevelIndex) {
            const objectToHighlight = projectGroup.children.find(child => child.userData.id === selectedObject.id);
            if (objectToHighlight) {
                objectToHighlight.traverse(child => {
                    if (child instanceof THREE.Mesh) child.material = highlightMaterial;
                });
            }
        }
    }, [selectedObject, activeLevelIndex, levels]);

    React.useImperativeHandle(ref, () => ({
        exportAsPNG: () => rendererRef.current?.domElement.toDataURL('image/png'),
        exportAsGLB: (projectName: string) => console.log(`Exporting ${projectName}.glb...`),
    }));

    return <div className="w-full h-full bg-slate-900" ref={mountRef}></div>;
});

Basic3dViewPanel.displayName = 'Basic3dViewPanel';