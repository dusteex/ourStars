import { Canvas } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

function StarSprite() {
  const texture = useTexture('/star.png') // Путь к твоему файлу (в папке public)

  return (
    <sprite position={[0, 0, 0]} scale={[1, 1, 1]}>
      <spriteMaterial
        map={texture}
        transparent={true}
        opacity={1}
        depthWrite={false} // Важно для правильной сортировки
        blending={THREE.AdditiveBlending} // Яркое свечение (как bloom)
        color="#ffffff" // Можно тонировать: "#ffff00" для жёлтой, "#00ffff" для голубой
      />
    </sprite>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.5} />

      <StarSprite />
    </Canvas>
  )
}