import { useEffect, useState } from 'react';
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


function App() {

  const [selectedConstellation, setSelectedConstellation] = useState<Constellation>(constellations[0]);
  const [previousConstellation, setPreviousConstellation] = useState<Constellation | null>(null);
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isZoomingToStar, setIsZoomingToStar] = useState(false);
  const [targetStar, setTargetStar] = useState<Star | null>(null);

  const handleConstellationChange = (constellation: Constellation) => {
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
      console.log(constellation.stars.map(star => star.name).filter(item => !!item))
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
    const normalizedStar = {
      ...star,
      position: getStarWorldPosition(
        star.position,
        selectedConstellation.cameraLookAt,
      )
    }

    handleStarClick(normalizedStar)
  }

  return (
    <div className="app">
      <AuthGate>
        <Canvas
          camera={{ position: selectedConstellation.cameraPosition, fov: 70 }}
          gl={{ antialias: true }}
        >
          <ConstellationScene
            constellations={constellations}
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
          constellations={constellations}
          selectedConstellation={selectedConstellation}
          onSelect={handleConstellationChange}
        />

        <StarList
          onStarClick={handleStarListItemClick}
          selectedStarId="null"
          stars={selectedConstellation.stars.filter(star => !!star.name)}
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

