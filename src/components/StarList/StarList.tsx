// components/StarList/StarList.tsx
import { motion, AnimatePresence } from 'framer-motion';
import './StarList.css';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Star {
  id: string;
  name: string;
  date: string
}

interface StarListProps {
  constellationStars: Star[];
  allStars: Star[];
  selectedStarId?: string;
  onStarClick: (star: Star) => void;
  className?: string;
}

export default function StarList({
  constellationStars,
  allStars,
  selectedStarId,
  onStarClick,
  className = ''
}: StarListProps) {
  const handleStarClick = (star: Star) => {
    onStarClick(star);
    if(expanded) {
      setExpanded(false)
    }
  };

  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [containerHeight, setContainerHeight] = useState('25%');

  const stars = activeTab === 0 ? constellationStars : allStars;

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    setContainerHeight(expanded ? '100%' : '25%');
  }, [expanded]);

  return (
    <motion.div
      className={`star-list-container ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{
        opacity: 1,
        y: 0,
        height: containerHeight
      }}
      transition={{
        duration: 0.5,
        height: { duration: 0.3, ease: "easeInOut" }
      }}
    >
      <div className="star-list-header">
        <div className="star-list-tabs">
          <h3
            className={`star-list-title ${activeTab === 0 ? "tab--active" : ""}`}
            onClick={() => setActiveTab(0)}
          >
            Моменты месяца
          </h3>
          <h3
            className={`star-list-title ${activeTab === 1 ? "tab--active" : ""}`}
            onClick={() => setActiveTab(1)}
          >
            Все моменты
          </h3>
        </div>
        <button
          className="expand-button"
          onClick={toggleExpanded}
          aria-label={expanded ? "Свернуть список" : "Развернуть список"}
        >
          {expanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </button>
      </div>

      <motion.div
        className="star-list-scrollable"
        initial={false}
        animate={{ height: expanded ? "calc(100% - 60px)" : "calc(100% - 60px)" }}
        transition={{ duration: 0.3 }}
      >
        {stars.map((star, index) => (
          <motion.button
            key={star.id}
            className={`star-list-item ${selectedStarId === star.id ? 'selected' : ''}`}
            onClick={() => handleStarClick(star)}
            transition={{
              duration: 0.2,
              ease: "backInOut"
            }}
            whileHover={{ scale: 1.02, x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="star-list-name">{star.name}&nbsp;</div>
            <div className="star-list-date">
              {star.date}
            </div>
          </motion.button>
        ))}

        {stars.length === 0 && (
          <motion.div
            className="star-list-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="empty-icon">✨</div>
            <p>Пока что это созвездие пустует</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}