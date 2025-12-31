import { useState } from 'react';
import { Constellation } from '../types';
import './ConstellationSelector.css';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import {motion} from 'framer-motion'

interface ConstellationSelectorProps {
  constellations: Constellation[];
  selectedConstellation: Constellation;
  onSelect: (constellation: Constellation) => void;
}

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export default function ConstellationSelector({
  constellations,
  selectedConstellation,
  onSelect,
}: ConstellationSelectorProps) {
  const [showMonthModal, setShowMonthModal] = useState(false);

  const currentIndex = constellations.findIndex(
    (c) => c.id === selectedConstellation.id
  );

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSelect(constellations[currentIndex - 1]);
    } else {
      onSelect(constellations[constellations.length - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < constellations.length - 1) {
      onSelect(constellations[currentIndex + 1]);
    } else {
      onSelect(constellations[0]);
    }
  };

  const handleMonthSelect = (name: string) => {
    // Находим созвездия, которые лучше всего видны в выбранном месяце
    const visibleInMonth = constellations.find(c => c.name === name);
    onSelect(visibleInMonth)
    setShowMonthModal(false);
  };

  return (
    <>
      <div className="constellation-selector">
        <button
          className="nav-button prev-button"
          onClick={handlePrevious}
          aria-label="Предыдущее созвездие"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="constellation-info">
          <button
            className="constellation-name-button"
            onClick={() => setShowMonthModal(true)}
            aria-label="Выбрать созвездие по месяцу"
          >
            <Calendar className="constellation-calendar" size={16} />
            <h2 className="constellation-name">
              {selectedConstellation.name}</h2>
          </button>
        </div>

        <button
          className="nav-button next-button"
          onClick={handleNext}
          aria-label="Следующее созвездие"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Модальное окно выбора месяца */}
      <AnimatePresence>
        {showMonthModal && (
          <motion.div
            exit={{
              opacity: 0
            }}
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
          className="modal-overlay" onClick={() => setShowMonthModal(false)}>
            <motion.div
              exit={{
              y: 40
            }}
            initial={{
              y: 40
            }}
            animate={{
              y: 0
            }}
            className="month-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Выберите месяц</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowMonthModal(false)}
                  aria-label="Закрыть"
                >
                  &times;
                </button>
              </div>

              <div className="month-grid">
                {MONTHS.map((month, index) => {
                  const visibleCount = constellations.filter(c =>
                    c.visibleMonths?.includes(index + 1)
                  ).length;

                  return (
                    <button
                      key={month}
                      className={`month-button ${
                        month === selectedConstellation.name ? 'current-month' : ''
                      }`}
                      onClick={() => handleMonthSelect(month)}
                      title={`${visibleCount} созвездий видно в ${month}`}
                    >
                      <span className="month-name">{month}</span>
                      {visibleCount > 0 && (
                        <span className="constellation-count">{visibleCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}