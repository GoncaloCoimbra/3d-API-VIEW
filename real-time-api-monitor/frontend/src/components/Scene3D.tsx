import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  Stars, 
  Float, 
  Html, 
  MeshTransmissionMaterial, 
  Line, 
  Environment,
  ContactShadows,
  PerspectiveCamera
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";

// --- Interfaces ---
interface Endpoint {
  id: string;
  name: string;
  status: string;
  responseTime: number;
  relatedEndpoints?: string[];
  tags?: string[];
}

interface Scene3DProps {
  endpoints: Endpoint[];
  onSelect: (endpoint: Endpoint) => void;
  selectedId?: string;
  activeTag?: string;
}

// --- 1. Atmosfera: Poeira Estelar Dinâmica ---
function Atmosphere() {
  const points = useMemo(() => {
    const p = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      p[i * 3] = (Math.random() - 0.5) * 70;
      p[i * 3 + 1] = (Math.random() - 0.5) * 70;
      p[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null!);
  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.015;
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#6366f1" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// --- 2. Feedback de Pulso: Onda de Choque para Erros ---
function ErrorPulse({ color }: { color: string }) {
  const circleRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 1.5;
    const s = 1 + (t % 2); 
    circleRef.current.scale.set(s, s, s);
    if (circleRef.current.material) {
      (circleRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - (s - 1) / 2);
    }
  });

  return (
    <mesh ref={circleRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1, 1.15, 64]} />
      <meshBasicMaterial color={color} transparent opacity={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

// --- 3. Partículas de Transmissão: Fluxo de Dados nas Linhas ---
function DataParticle({ 
  startPos, 
  endPos, 
  color, 
  speed = 1, 
  delay = 0 
}: { 
  startPos: THREE.Vector3; 
  endPos: THREE.Vector3; 
  color: string;
  speed?: number;
  delay?: number;
}) {
  const particleRef = useRef<THREE.Mesh>(null!);
  const trailRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime() * speed - delay;
    const t = (elapsed % 2) / 2; // Loop de 0 a 1
    
    if (particleRef.current && t >= 0) {
      // Interpolação suave entre start e end
      const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, t);
      particleRef.current.position.copy(currentPos);
      
      // Efeito de fade in/out
      const opacity = Math.sin(t * Math.PI) * 0.9;
      if (particleRef.current.material) {
        (particleRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      }
      
      // Trail (rastro) segue a partícula com um pequeno delay
      if (trailRef.current && t > 0.1) {
        const trailPos = new THREE.Vector3().lerpVectors(startPos, endPos, Math.max(0, t - 0.1));
        trailRef.current.position.copy(trailPos);
        if (trailRef.current.material) {
          (trailRef.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.4;
        }
      }
    }
  });

  return (
    <group>
      {/* Partícula principal */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>
      
      {/* Rastro da partícula */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>
    </group>
  );
}

// --- 4. Sistema de Múltiplas Partículas por Conexão ---
function ConnectionParticles({ 
  startPos, 
  endPos, 
  isActive,
  status 
}: { 
  startPos: THREE.Vector3; 
  endPos: THREE.Vector3; 
  isActive: boolean;
  status: string;
}) {
  const particleCount = isActive ? 3 : 1; // Mais partículas quando ativo
  const baseSpeed = status === 'error' ? 0.3 : (status === 'slow' ? 0.6 : 1.2);
  
  const particleColor = useMemo(() => {
    switch (status) {
      case 'online': return '#00ff88';
      case 'slow': return '#ffaa00';
      case 'error': return '#ff4444';
      default: return '#6366f1';
    }
  }, [status]);

  return (
    <>
      {Array.from({ length: particleCount }).map((_, i) => (
        <DataParticle
          key={i}
          startPos={startPos}
          endPos={endPos}
          color={particleColor}
          speed={baseSpeed * (0.8 + Math.random() * 0.4)}
          delay={i * 0.6}
        />
      ))}
    </>
  );
}

// --- Rig da Câmara ---
function CameraRig({ selectedPos, isCameraLocked }: { selectedPos: THREE.Vector3 | null, isCameraLocked: boolean }) {
  const { camera } = useThree();
  useFrame(() => {
    if (selectedPos && isCameraLocked) {
      camera.position.lerp(new THREE.Vector3(selectedPos.x, selectedPos.y + 6, selectedPos.z + 14), 0.05);
      camera.lookAt(selectedPos);
    }
  });
  return null;
}

// --- Componente do Nodo Individual ---
function APINode({ endpoint, position, onSelect, isSelected, isDimmed, onHover, isHighlighted }: any) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [internalHover, setInternalHover] = useState(false);

  const theme = useMemo(() => {
    switch (endpoint.status) {
      case "online": return { color: "#00ff88" };
      case "slow": return { color: "#ffaa00" };
      case "error": return { color: "#ff4444" };
      default: return { color: "#6366f1" };
    }
  }, [endpoint.status]);

  useFrame(() => {
    if (meshRef.current) {
      const s = isDimmed ? 0.5 : (isSelected || internalHover ? 1.4 : 1.0);
      meshRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      {endpoint.status === "error" && <ErrorPulse color={theme.color} />}

      <Float speed={isDimmed ? 0.5 : 2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onSelect(endpoint); }}
          onPointerEnter={() => { setInternalHover(true); onHover(endpoint.id); }}
          onPointerLeave={() => { setInternalHover(false); onHover(null); }}
        >
          {endpoint.status === "online" && <sphereGeometry args={[0.8, 64, 64]} />}
          {endpoint.status === "slow" && <octahedronGeometry args={[1.1, 0]} />}
          {endpoint.status === "error" && <boxGeometry args={[1, 1, 1]} />}
          {endpoint.status === "offline" && <tetrahedronGeometry args={[1.2, 0]} />}

          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={2.0}
            chromaticAberration={0.06}
            anisotropy={0.3}
            distortion={0.4}
            color={theme.color}
            transmission={1}
            ior={1.4}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {(isSelected || internalHover || isHighlighted) && !isDimmed && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.7, 0.015, 16, 100]} />
          <meshBasicMaterial color={theme.color} transparent opacity={0.6} />
        </mesh>
      )}

      {!isDimmed && (
        <Html position={[0, 2.8, 0]} center distanceFactor={12} occlude={[meshRef]}>
          <div 
            className={`node-label ${isSelected ? 'active' : ''}`}
            style={{ '--node-color': theme.color } as React.CSSProperties}
          >
            <span className="node-status-dot"></span>
            {endpoint.name}
            <div className="node-ms">{endpoint.responseTime}ms</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Scene3D({ endpoints, onSelect, selectedId, activeTag = "all" }: Scene3DProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isCameraLocked, setIsCameraLocked] = useState(false);

  useEffect(() => { if (selectedId) setIsCameraLocked(true); }, [selectedId]);

  const positions = useMemo(() => {
    const radius = 13;
    return endpoints.map((_, i) => {
      const angle = (i / endpoints.length) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(i * 0.8) * 2, Math.sin(angle) * radius);
    });
  }, [endpoints.length]);

  const selectedPosition = useMemo(() => {
    const idx = endpoints.findIndex(e => e.id === selectedId);
    return idx !== -1 ? positions[idx] : null;
  }, [selectedId, endpoints, positions]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#010206", borderRadius: "20px", overflow: "hidden" }}>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false, stencil: false }}>
        <PerspectiveCamera makeDefault position={[0, 15, 30]} fov={45} />
        <CameraRig selectedPos={selectedPosition} isCameraLocked={isCameraLocked} />
        
        <color attach="background" args={["#010206"]} />
        <fog attach="fog" args={["#010206", 20, 60]} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[15, 15, 15]} intensity={1.5} color="#6366f1" />
        
        <Atmosphere />
        <Stars radius={100} depth={50} count={2000} factor={4} fade speed={0.5} />
        <Environment preset="night" />

        {endpoints.map((ep, i) => 
          ep.relatedEndpoints?.map((relId) => {
            const targetIdx = endpoints.findIndex(e => e.id === relId);
            if (targetIdx === -1) return null;
            const isRelatedToHover = hoveredNode === ep.id || hoveredNode === relId;
            const isRelatedToSelected = selectedId === ep.id || selectedId === relId;
            const anyHover = hoveredNode !== null;

            return (
              <group key={`${ep.id}-${relId}`}>
                {/* Linha de conexão */}
                <Line
                  points={[positions[i], positions[targetIdx]]}
                  color={isRelatedToHover ? "#00ff88" : "#6366f1"}
                  lineWidth={isRelatedToHover ? 2.5 : 0.6}
                  transparent
                  opacity={isRelatedToHover ? 0.9 : (anyHover ? 0.02 : 0.15)}
                />
                
                {/* Partículas de transmissão */}
                <ConnectionParticles
                  startPos={positions[i]}
                  endPos={positions[targetIdx]}
                  isActive={isRelatedToHover || isRelatedToSelected}
                  status={ep.status}
                />
              </group>
            );
          })
        )}

        {endpoints.map((endpoint, i) => (
          <APINode
            key={endpoint.id}
            endpoint={endpoint}
            position={positions[i]}
            onSelect={onSelect}
            onHover={setHoveredNode}
            isSelected={selectedId === endpoint.id}
            isHighlighted={hoveredNode === endpoint.id}
            isDimmed={activeTag !== "all" && !endpoint.tags?.includes(activeTag)}
          />
        ))}

        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={0.25} mipmapBlur intensity={1.5} radius={0.4} />
          <Noise opacity={0.03} />
          <Vignette darkness={1.2} offset={0.05} />
        </EffectComposer>

        <ContactShadows position={[0, -6, 0]} opacity={0.4} scale={40} blur={2.5} far={10} />

        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={10}
          maxDistance={45}
          onStart={() => setIsCameraLocked(false)}
        />
      </Canvas>
    </div>
  );
}