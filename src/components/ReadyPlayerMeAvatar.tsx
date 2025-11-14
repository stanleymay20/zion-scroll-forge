import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ReadyPlayerMeAvatarProps {
  avatarUrl?: string;
  isSpeaking: boolean;
  isThinking: boolean;
  audioElement?: HTMLAudioElement | null;
}

interface MorphTarget {
  name: string;
  influence: number;
}

function AvatarModel({ 
  avatarUrl, 
  isSpeaking, 
  isThinking,
  audioElement 
}: ReadyPlayerMeAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [morphTargets, setMorphTargets] = useState<any>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Safe model loading control
  const [canLoadModel, setCanLoadModel] = useState(false);

  // Validate URL before attempting to load GLB to avoid runtime crashes
  useEffect(() => {
    const url = avatarUrl?.trim();
    if (!url || !url.endsWith('.glb')) {
      setCanLoadModel(false);
      return;
    }
    let cancelled = false;
    fetch(url, { method: 'HEAD' })
      .then((res) => { if (!cancelled) setCanLoadModel(res.ok); })
      .catch(() => { if (!cancelled) setCanLoadModel(false); });
    return () => { cancelled = true; };
  }, [avatarUrl]);

  // Load the GLB model only when validated
  const gltf = canLoadModel ? useGLTF(avatarUrl as string) as any : null;
  const scene = gltf?.scene;

  // Setup audio analyzer for lip-sync
  useEffect(() => {
    if (audioElement && isSpeaking) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    }

    return () => {
      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [audioElement, isSpeaking]);

  // Find morph targets in the loaded model
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
            setMorphTargets({
              dictionary: mesh.morphTargetDictionary,
              influences: mesh.morphTargetInfluences
            });
          }
        }
      });
    }
  }, [scene]);

  // Animation loop for lip-sync and expressions
  useFrame(() => {
    if (!groupRef.current || !morphTargets) return;

    // Lip-sync animation based on audio
    if (isSpeaking && analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate average volume
      const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
      const normalizedVolume = Math.min(average / 128, 1);

      // Apply to mouth morph targets
      const mouthOpenIndex = morphTargets.dictionary['mouthOpen'] || 
                            morphTargets.dictionary['jawOpen'] ||
                            morphTargets.dictionary['viseme_aa'];
      
      if (mouthOpenIndex !== undefined) {
        morphTargets.influences[mouthOpenIndex] = normalizedVolume * 0.8;
      }

      // Add subtle smile when speaking
      const smileIndex = morphTargets.dictionary['mouthSmile'];
      if (smileIndex !== undefined) {
        morphTargets.influences[smileIndex] = 0.3 + (normalizedVolume * 0.2);
      }
    } else {
      // Reset mouth when not speaking
      const mouthOpenIndex = morphTargets.dictionary['mouthOpen'] || 
                            morphTargets.dictionary['jawOpen'] ||
                            morphTargets.dictionary['viseme_aa'];
      if (mouthOpenIndex !== undefined) {
        morphTargets.influences[mouthOpenIndex] *= 0.9; // Smooth closing
      }
    }

    // Thinking expression
    if (isThinking) {
      const browIndex = morphTargets.dictionary['browInnerUp'];
      if (browIndex !== undefined) {
        morphTargets.influences[browIndex] = 0.6;
      }
    } else {
      const browIndex = morphTargets.dictionary['browInnerUp'];
      if (browIndex !== undefined) {
        morphTargets.influences[browIndex] *= 0.9;
      }
    }

    // Gentle idle animation
    const time = Date.now() * 0.001;
    groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.02;
  });

  if (!scene) {
    // Fallback placeholder when model cannot be loaded
    return (
      <group ref={groupRef}>
        <mesh position={[0, -0.5, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color={new THREE.Color('#7c3aed')} roughness={0.5} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={2.5} 
        position={[0, -1.5, 0]} 
      />
    </group>
  );
}

export const ReadyPlayerMeAvatar = ({ 
  avatarUrl, 
  isSpeaking, 
  isThinking,
  audioElement 
}: ReadyPlayerMeAvatarProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 2, 0]} intensity={0.5} />
        
        <AvatarModel
          avatarUrl={avatarUrl}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
          audioElement={audioElement}
        />
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

// Preload the default avatar
// (preload removed to avoid fetching invalid default models)
