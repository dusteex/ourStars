// components/StarList/StarList.tsx
import { motion, AnimatePresence } from 'framer-motion';
import './StarList.css';

interface Star {
  id: string;
  name: string;
  date: string
}

interface StarListProps {
  stars: Star[];
  selectedStarId?: string;
  onStarClick: (star: Star) => void;
  className?: string;
}

export default function StarList({
  stars,
  selectedStarId,
  onStarClick,
  className = ''
}: StarListProps) {
  const handleStarClick = (star: Star) => {
    onStarClick(star);
  };

  return (
    <motion.div
      className={`star-list-container ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="star-list-header">
        <h3 className="star-list-title">Моменты</h3>
      </div>

      <div className="star-list-scrollable">
          {stars.map((star, index) => (
            <motion.button
              key={star.id}
              className={`star-list-item ${selectedStarId === star.id ? 'selected' : ''}`}
              onClick={() => handleStarClick(star)}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                 duration: 0.2,
                 delay: 0.3 * index,
                 ease: "backInOut"
               }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="star-list-name">{star.name}&nbsp;
              </div>
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

      </div>
    </motion.div>
  );
}