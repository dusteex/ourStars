import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import ConstellationScene from './components/ConstellationScene';
import StarModal from './components/StarModal';
import ConstellationSelector from './components/ConstellationSelector';
import { Star, Constellation } from './types';
import { constellations } from './data/mockData';
import './App.css';
import AuthGate from './components/AuthGate/AuthGate';
import { AnimatePresence } from 'framer-motion';
import MonthSelector from './components/StarList/MonthSelector';
import StarList from './components/StarList/StarList';
import { getStarWorldPosition } from './utils/getStarWorldPosition';

const normalizeStars = (stars: Star[]) => stars
            .filter(star => !!star.name)
            .sort((a, b) => {
              // Преобразуем строки дат в объекты Date для сравнения
              const dateA = new Date(a.date.split('.').reverse().join('-'));
              const dateB = new Date(b.date.split('.').reverse().join('-'));
              return dateA - dateB; // для сортировки по убыванию
            })

function App() {
    const normalizedConstellations = useMemo(() => {
    return constellations.map(constellation => ({
      ...constellation,
      stars: constellation.stars.map(star => ({
        ...star,
        position: getStarWorldPosition(
          star.position,
          constellation.cameraLookAt,
        ),
        constellationId: constellation.id,
      }))
    }))
  }, [constellations])

  console.log(normalizedConstellations)


  const [selectedConstellation, setSelectedConstellation] = useState<Constellation>(normalizedConstellations[0]);
  const [previousConstellation, setPreviousConstellation] = useState<Constellation | null>(null);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isZoomingToStar, setIsZoomingToStar] = useState(false);
  const [targetStar, setTargetStar] = useState<Star | null>(null);

  const handleConstellationChange = (constellation: Constellation, cb?: () => void) => {
    if (isTransitioning || constellation.id === selectedConstellation.id) return;
    setPreviousConstellation(selectedConstellation);
    setIsTransitioning(true);
    setSelectedConstellation(constellation);
    setSelectedStar(null);
    setIsZoomingToStar(false);
    setTargetStar(null);
    // Время перехода синхронизировано с анимацией
    setTimeout(() => {
      setIsTransitioning(false);
      setPreviousConstellation(null);
      cb?.()
    }, 1300);
  };

  const handleStarClick = (star: Star) => {
    setTargetStar(star);
    setIsZoomingToStar(true);
    // Открываем модальное окно после завершения зума
    setTimeout(() => {
      setSelectedStar(star);
    }, 1200);
  };

  const handleCloseModal = () => {
    setSelectedStar(null);
    setIsZoomingToStar(false);
    setTargetStar(null);
    // Камера вернется автоматически через ConstellationScene
  };

  const handleStarListItemClick = (star: Star) => {
    if(star.constellationId !== selectedConstellation.id) {
      const targetConstellation = normalizedConstellations.find(({id}) => id === star.constellationId)
      handleConstellationChange(targetConstellation, () => handleStarClick(star))
    } else {
      handleStarClick(star)
    }
  }


  return (
    <div className="app">
      <AuthGate>
        <Canvas
          camera={{ position: selectedConstellation.cameraPosition, fov: 70 }}
          gl={{ antialias: true }}
        >
          <ConstellationScene
            constellations={normalizedConstellations}
            selectedConstellation={selectedConstellation}
            previousConstellation={previousConstellation}
            onStarClick={handleStarClick}
            isTransitioning={isTransitioning}
            isZoomingToStar={isZoomingToStar}
            targetStar={targetStar}
          />
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <fog attach="fog" args={['#000011', 30, 60]} />
        </Canvas>

        <ConstellationSelector
          constellations={normalizedConstellations}
          selectedConstellation={selectedConstellation}
          onSelect={handleConstellationChange}
        />

        <StarList
          onStarClick={handleStarListItemClick}
          selectedStarId="null"
          constellationStars={normalizeStars(selectedConstellation.stars)}
          allStars={normalizeStars(normalizedConstellations.reduce((acc, item) => [...acc, ...item.stars],[] as Star[]))}
        />

        <AnimatePresence>
          {selectedStar && (
            <StarModal star={selectedStar} onClose={handleCloseModal} />
          )}
        </AnimatePresence>
      </AuthGate>
    </div>
  );
}

export default App;

