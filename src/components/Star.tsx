import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Star as StarType } from '../types';

interface StarProps {
  star: StarType;
  onClick: () => void;
  isActive?: boolean;
  opacity?: number;
  texturePath?: string;
}



export default function Star({
  star,
  onClick,
  isActive = true,
  opacity = 1,
  texturePath = '/star.png',
  isClickable = false,
}: StarProps) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const [hovered, setHovered] = useState(false);

  // Загружаем текстуру
  const texture = useTexture(texturePath);

  // Рандомная фаза для каждой звезды (генерируется один раз при создании)
  const phaseRef = useRef(Math.random() * Math.PI * 2);
  const pulseSpeedRef = useRef(0.8 + Math.random() * 0.8); // Скорость от 0.8 до 1.6
  const pulseAmplitudeRef = useRef(0.15 + Math.random() * 0.1); // Амплитуда от 0.15 до 0.35

  const BASE_SCALE = isClickable ? 2 : 1

  useFrame((state) => {
    if (!spriteRef.current) return;

    const time = state.clock.getElapsedTime();

    // Базовая пульсация (дыхание звезды)
    const pulse = Math.sin(time * pulseSpeedRef.current + phaseRef.current) * pulseAmplitudeRef.current + 1;


    // Целевая шкала при ховере
    const targetScale = hovered ? BASE_SCALE * 1.3 : BASE_SCALE;

    // Комбинируем пульсацию с ховером
    const finalScale = targetScale * pulse;

    // Плавно интерполируем масштаб
    spriteRef.current.scale.lerp(
      new THREE.Vector3(finalScale, finalScale, finalScale),
      0.15
    );

    // Мягкое изменение прозрачности (тоже с мерцанием)
    const baseOpacity = opacity * (isActive ? 1 : 0.3);
    const hoverOpacity = opacity * (isActive ? 1.2 : 0.6);
    const flicker = 0.9 + Math.sin(time * 2 + phaseRef.current) * 0.1;

    spriteRef.current.material.opacity = (hovered ? hoverOpacity : baseOpacity) * flicker;
  });

  return (
    <sprite
      ref={spriteRef}
      position={star.position}
      scale={[BASE_SCALE, BASE_SCALE, BASE_SCALE]} // Начальный размер
      onClick={(e) => {
        e.stopPropagation();
        if(!isClickable) return
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <spriteMaterial
        map={texture}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={isClickable ? '#FFDD1F' : '#FFFFFF50'}
      />
    </sprite>
  );
}