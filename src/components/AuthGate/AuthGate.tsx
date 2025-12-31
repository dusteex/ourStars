// components/AuthGate/AuthGate.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AuthGate.css';
import { ANSWER } from '../../data/mockData';

interface AuthGateProps {
  children: React.ReactNode;
}

// Конфигурация авторизации
const AUTH_CONFIG = {
  question: "Какое моё любимое блюдо?",
  correctAnswer: ANSWER,
  storageKey: 'isAuthenticated'
};

export const getIsAuthorized = () => localStorage.getItem(AUTH_CONFIG.storageKey) === "true"

export default function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_CONFIG.storageKey);
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Сохраняем авторизацию
  const saveAuth = () => {
    localStorage.setItem(AUTH_CONFIG.storageKey, 'true');
    setIsAuthenticated(true);
  };

  // Проверяем ответ
  const checkAnswer = (answer: string): boolean => {
    // Убираем пробелы и приводим к нижнему регистру для сравнения
    const normalizedAnswer = answer.trim().toLowerCase();
    const normalizedCorrect = AUTH_CONFIG.correctAnswer.toLowerCase();

    return normalizedAnswer === normalizedCorrect;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userAnswer.trim()) {
      setError('Пожалуйста, введите ответ');
      return;
    }

    const isCorrect = checkAnswer(userAnswer);

    if (isCorrect) {
      saveAuth();
    } else {
      setError('Неправильный ответ. Попробуйте еще раз!');
    }
  };

  // Показываем лоадер пока проверяем localStorage
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Если не авторизован - показываем форму
  return (
    <>
      {isAuthenticated && children}
      <AnimatePresence>
        {!isAuthenticated && (
        <motion.div
           exit={{
            y: '100%',
            transition: {
                  delay: 0.3,
                  duration: 0.7,
                  ease: "easeInOut"
            }}}
          className="auth-container">
        <motion.div
          initial={{
            y: '10%'
          }}
          animate={{
            y: 0
          }}
          exit={{
            y: '-20%',
            transition: {
              duration: 0.3,
            }
          }}
          className="auth-card"
        >
          <div className="auth-header">
            <h2>Подтвердите, что вы — Соня</h2>
            <p className="auth-subtitle">Ответьте на вопрос для доступа</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-question">
              <label htmlFor="answer" className="question-label">
                {AUTH_CONFIG.question}
              </label>
              <input
                id="answer"
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Введите ваш ответ..."
                className="answer-input"
                autoFocus
              />
            </div>

            {error && (
              <motion.div
                className="auth-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ❌ {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="auth-submit-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!userAnswer.trim()}
            >
              Войти
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
        )}
    </AnimatePresence>
    </>

  );
}