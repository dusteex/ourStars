import { Constellation } from '../types';
import './ConstellationSelector.css';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Или любые другие иконки

interface ConstellationSelectorProps {
  constellations: Constellation[];
  selectedConstellation: Constellation;
  onSelect: (constellation: Constellation) => void;
}

export default function ConstellationSelector({
  constellations,
  selectedConstellation,
  onSelect,
}: ConstellationSelectorProps) {
  const currentIndex = constellations.findIndex(
    (c) => c.id === selectedConstellation.id
  );

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelect(constellations[currentIndex - 1]);
    } else {
      onSelect(constellations[constellations.length - 1]); // Зацикливание
    }
  };

  const handleNext = () => {
    if (currentIndex < constellations.length - 1) {
      onSelect(constellations[currentIndex + 1]);
    } else {
      onSelect(constellations[0]); // Зацикливание
    }
  };

  return (
    <div className="constellation-selector">
      <button
        className="nav-button prev-button"
        onClick={handlePrevious}
        aria-label="Предыдущее созвездие"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="constellation-info">
        <h2 className="constellation-name">{selectedConstellation.name}</h2>
      </div>

      <button
        className="nav-button next-button"
        onClick={handleNext}
        aria-label="Следующее созвездие"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
}