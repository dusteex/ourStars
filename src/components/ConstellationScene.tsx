import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Constellation, Star, Connection } from '../types';
import StarComponent from './Star';
import { Vector3, BufferGeometry, Float32BufferAttribute } from 'three';
import { getStarWorldPosition } from '../utils/getStarWorldPosition';

interface ConstellationSceneProps {
  constellations: Constellation[];
  selectedConstellation: Constellation;
  previousConstellation: Constellation | null;
  onStarClick: (star: Star) => void;
  isTransitioning: boolean;
  isZoomingToStar: boolean;
  targetStar: Star | null;
}

interface BackgroundStar {
  id: number;
  position: [number, number, number];
  size: number;
  speed: number;
  opacity: number;
}

export default function ConstellationScene({
  constellations,
  selectedConstellation,
  previousConstellation,
  onStarClick,
  isTransitioning,
  isZoomingToStar,
  targetStar,
}: ConstellationSceneProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new Vector3(...selectedConstellation.cameraPosition));
  const targetLookAt = useRef(new Vector3(...selectedConstellation.cameraLookAt));
  const starZoomPosition = useRef<Vector3 | null>(null);
  const starLookAt = useRef<Vector3 | null>(null);
  const starZoomStartTime = useRef<number>(0);
  const starZoomStartPosition = useRef<Vector3 | null>(null);
  const starZoomStartLookAt = useRef<Vector3 | null>(null);
  const isZoomingOut = useRef<boolean>(false);
  const zoomOutStartTime = useRef<number>(0);
  const zoomOutStartPosition = useRef<Vector3 | null>(null);
  const zoomOutStartLookAt = useRef<Vector3 | null>(null);

  // Ref для фоновых звезд
  const backgroundStarsRef = useRef<THREE.Points>(null);
  const backgroundStarsPositionsRef = useRef<Float32Array>(new Float32Array());

  // Состояния для плавного перехода
  const transitionStartTime = useRef<number>(0);
  const transitionStartPosition = useRef<Vector3>(new Vector3());
  const transitionStartLookAt = useRef<Vector3>(new Vector3());
  const intermediatePosition = useRef<Vector3 | null>(null);
  const intermediateLookAt = useRef<Vector3 | null>(null);
  const transitionPhase = useRef<'zoomOut' | 'travel' | 'zoomIn'>('zoomOut');

  // Создаем массив фоновых звезд
  const backgroundStars = useMemo(() => {
    const stars: BackgroundStar[] = [];
    const count = 800; // Количество фоновых звезд

    for (let i = 0; i < count; i++) {
      // Создаем звезды в сферическом пространстве вокруг камеры
      const distance = 15 + Math.random() * 35; // Расстояние от 15 до 50 единиц
      const theta = Math.random() * Math.PI * 2; // Угол в горизонтальной плоскости
      const phi = Math.random() * Math.PI - Math.PI / 2; // Угол в вертикальной плоскости

      const x = Math.cos(theta) * Math.cos(phi) * distance;
      const y = Math.sin(phi) * distance;
      const z = Math.sin(theta) * Math.cos(phi) * distance;

      stars.push({
        id: i,
        position: [x, y, z],
        size: 0.02 + Math.random() * 0.03, // Размер от 0.02 до 0.05
        speed: 0.005 + Math.random() * 0.015, // Скорость от 0.01 до 0.03
        opacity: 0.3 + Math.random() * 0.4, // Прозрачность от 0.3 до 0.7
      });
    }

    // Создаем массив позиций для BufferGeometry
    const positions = new Float32Array(stars.length * 3);
    stars.forEach((star, i) => {
      positions[i * 3] = star.position[0];
      positions[i * 3 + 1] = star.position[1];
      positions[i * 3 + 2] = star.position[2];
    });

    backgroundStarsPositionsRef.current = positions;

    return stars;
  }, []);

  useEffect(() => {
    if (!isZoomingToStar && starZoomPosition.current) {
      isZoomingOut.current = true;
      zoomOutStartTime.current = Date.now();
      zoomOutStartPosition.current = camera.position.clone();
      zoomOutStartLookAt.current = starLookAt.current!.clone();

      targetPosition.current.set(...selectedConstellation.cameraPosition);
      targetLookAt.current.set(...selectedConstellation.cameraLookAt);
    } else if (!isZoomingToStar) {
      targetPosition.current.set(...selectedConstellation.cameraPosition);
      targetLookAt.current.set(...selectedConstellation.cameraLookAt);
      starZoomPosition.current = null;
      starLookAt.current = null;
      isZoomingOut.current = false;
    }
  }, [selectedConstellation, isZoomingToStar, camera.position]);

  useEffect(() => {
    if (isTransitioning && previousConstellation) {
      transitionStartTime.current = Date.now();
      transitionStartPosition.current.copy(camera.position);
      transitionStartLookAt.current.copy(
        new Vector3(...previousConstellation.cameraLookAt)
      );
      transitionPhase.current = 'zoomOut';

      const cameraDirection = new Vector3()
        .subVectors(transitionStartPosition.current, new Vector3(...previousConstellation.cameraLookAt))
        .normalize();

      intermediatePosition.current = transitionStartPosition.current.clone().add(
        cameraDirection.multiplyScalar(2)
      );

      const nextPos = new Vector3(...selectedConstellation.cameraPosition);
      intermediateLookAt.current = nextPos.clone();
    }
  }, [isTransitioning, previousConstellation, selectedConstellation, camera.position]);

  useEffect(() => {
    if (targetStar && isZoomingToStar) {
      starZoomStartTime.current = Date.now();
      starZoomStartPosition.current = camera.position.clone();
      starZoomStartLookAt.current = new Vector3().copy(
        new Vector3(...selectedConstellation.cameraLookAt)
      );

      const starPos = new Vector3(...targetStar.position);
      const direction = new Vector3()
        .subVectors(starPos, new Vector3(...selectedConstellation.cameraPosition))
        .normalize();

      starZoomPosition.current = starPos.clone().add(
        direction.multiplyScalar(-2)
      );
      starLookAt.current = starPos.clone();
    } else {
      starZoomStartPosition.current = null;
      starZoomStartLookAt.current = null;
    }
  }, [targetStar, isZoomingToStar, selectedConstellation, camera.position]);

  // Анимация фоновых звезд
  useFrame(() => {
    // Движение фоновых звезд по горизонтали
    if (backgroundStarsRef.current) {
      const positions = backgroundStarsRef.current.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        // Двигаем звезды по оси X
        positions[i] -= backgroundStars[i / 3].speed;

        // Если звезда ушла слишком далеко влево, перемещаем ее вправо
        if (positions[i] < -50) {
          positions[i] = 50;
          // Также немного меняем вертикальное положение для разнообразия
          positions[i + 1] = (Math.random() - 0.5) * 30;
          positions[i + 2] = (Math.random() - 0.5) * 30 - 20;
        }
      }

      backgroundStarsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Ease-in-out функция для плавного ускорения и замедления
    const easeInOut = (t: number) => {
      return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
    };

    if (isZoomingToStar && starZoomPosition.current && starLookAt.current && starZoomStartPosition.current) {
      const elapsed = (Date.now() - starZoomStartTime.current) / 1000;
      const zoomDuration = 1.2;
      const progress = Math.min(elapsed / zoomDuration, 1);

      const easedProgress = easeInOut(progress);

      const currentPos = new Vector3().copy(starZoomStartPosition.current);
      currentPos.lerp(starZoomPosition.current, easedProgress);
      camera.position.copy(currentPos);

      const currentLookAt = new Vector3().copy(starZoomStartLookAt.current!);
      currentLookAt.lerp(starLookAt.current, easedProgress);
      camera.lookAt(currentLookAt);
    } else if (isZoomingOut.current && zoomOutStartPosition.current && zoomOutStartLookAt.current) {
      const elapsed = (Date.now() - zoomOutStartTime.current) / 1000;
      const zoomOutDuration = 1.2;
      const progress = Math.min(elapsed / zoomOutDuration, 1);

      const easedProgress = easeInOut(progress);

      const currentPos = new Vector3().copy(zoomOutStartPosition.current);
      currentPos.lerp(targetPosition.current, easedProgress);
      camera.position.copy(currentPos);

      const currentLookAt = new Vector3().copy(zoomOutStartLookAt.current);
      currentLookAt.lerp(targetLookAt.current, easedProgress);
      camera.lookAt(currentLookAt);

      if (progress >= 1) {
        isZoomingOut.current = false;
        zoomOutStartPosition.current = null;
        zoomOutStartLookAt.current = null;
        starZoomPosition.current = null;
        starLookAt.current = null;
      }
    } else if (isTransitioning && intermediatePosition.current && intermediateLookAt.current) {
      const elapsed = (Date.now() - transitionStartTime.current) / 1000;
      const totalDuration = 1.5;
      const progress = Math.min(elapsed / totalDuration, 1);

      const easeInOut = (t: number) => {
        return t < 0.5
          ? 2 * t * t
          : 1 - Math.pow(-2 * t + 2, 2) / 2;
      };

      const lookAtProgress = Math.pow(progress, 0.7);
      const lookAtEased = easeInOut(lookAtProgress);

      const currentLookAt = new Vector3().copy(transitionStartLookAt.current);
      currentLookAt.lerp(targetLookAt.current, lookAtEased);

      if (progress < 0.2) {
        transitionPhase.current = 'zoomOut';
        const phaseProgress = progress / 0.2;
        const easedPhase = easeInOut(phaseProgress);

        const currentPos = new Vector3().copy(transitionStartPosition.current);
        currentPos.lerp(intermediatePosition.current!, easedPhase);
        camera.position.lerp(currentPos, 0.4);

        camera.lookAt(currentLookAt);
      } else {
        transitionPhase.current = progress < 0.7 ? 'travel' : 'zoomIn';
        const phaseProgress = (progress - 0.2) / 0.8;
        const easedPhase = easeInOut(phaseProgress);

        const currentPos = new Vector3().copy(intermediatePosition.current!);
        currentPos.lerp(targetPosition.current, easedPhase);
        camera.position.lerp(currentPos, 0.3);

        camera.lookAt(currentLookAt);
      }
    } else {
      camera.position.lerp(targetPosition.current, 0.05);
      camera.lookAt(targetLookAt.current);
    }
  });

  const getStarById = (constellation: Constellation, starId: string): Star | undefined => {
    return constellation.stars.find(star => star.id === starId);
  };

  return (
    <>
      {/* Фоновые звезды с анимацией */}
      {useMemo(() => (
        <points ref={backgroundStarsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={backgroundStars.length}
              array={backgroundStarsPositionsRef.current}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={backgroundStars.length}
              array={new Float32Array(backgroundStars.map(star => star.size))}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            sizeAttenuation={true}
            transparent
            opacity={0.6}
            color="#ffffff"
            alphaTest={0.5}
          />
        </points>
      ), [backgroundStars])}

      {/* Все созвездия */}

      {constellations.map((item) => {
        const constellation = {
          ...item,
          stars: item.stars.map(star => ({ ...star,
            position: getStarWorldPosition(
              star.position,
              item.cameraLookAt,
            )
          })),
        };
        const isActive = constellation.id === selectedConstellation.id;
        const opacity = isActive ? 1 : 1;
        const lineOpacity = isActive ? 0.25 : 0.05;

        return (
          <group key={constellation.id}>
            {/* Линии созвездия */}
            {useMemo(() => {
              if (!constellation.connections || constellation.connections.length === 0) {
                return null;
              }

              return constellation.connections.map((connection, index) => {
                const star1 = getStarById(constellation, connection.star1Id);
                const star2 = getStarById(constellation, connection.star2Id);

                if (!star1 || !star2) {
                  console.warn(`Connection ${index} references non-existent stars`);
                  return null;
                }

                const start = new Vector3(...star1.position);
                const end = new Vector3(...star2.position);

                const geometry = new BufferGeometry();
                geometry.setAttribute(
                  'position',
                  new Float32BufferAttribute(
                    [start.x, start.y, start.z, end.x, end.y, end.z],
                    3
                  )
                );

                return (
                  <line
                    key={`line-${connection.star1Id}-${connection.star2Id}-${index}`}
                    geometry={geometry}
                  >
                    <lineBasicMaterial
                      color={isActive ? "#FFFFFF" : "#FFFFFF"}
                      transparent
                      opacity={lineOpacity}
                      linewidth={connection.width || 1}
                    />
                  </line>
                );
              }).filter(Boolean);
            }, [constellation.connections, constellation.stars, isActive, lineOpacity])}

            {/* Звезды созвездия */}
            {constellation.stars.map((star) =>  (
              <StarComponent
                key={star.id}
                star={star}
                onClick={() => onStarClick(star)}
                isActive={isActive}
                opacity={star.name ? opacity : 1}
                isClickable={!!star.name}
              />
            ))}
          </group>
        );
      })}
    </>
  );
}