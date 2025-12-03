// src/modules/auth/pages/AuthPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { 
  Shield, 
  AlertCircle, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  RefreshCw,
  Clock,
  Key,
  Sparkles,
  BookOpen,
  GraduationCap,
  Brain,
  Zap
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [showConfirmPassphrase, setShowConfirmPassphrase] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [hoverEffects, setHoverEffects] = useState<Array<{x: number, y: number, id: number}>>([]);
  const [floatingIcons, setFloatingIcons] = useState<Array<{
    id: number;
    icon: React.ReactNode;
    x: number;
    y: number;
    size: number;
    delay: number;
  }>>([]);
  
  const login = useAuthStore((state) => state.login);
  const { passphraseHash } = useAuthStore();

  // Создаем плавающие иконки
  useEffect(() => {
    const icons = [
      { icon: <BookOpen className="w-full h-full text-blue-400/20" />, size: 32 },
      { icon: <GraduationCap className="w-full h-full text-purple-400/20" />, size: 40 },
      { icon: <Brain className="w-full h-full text-green-400/20" />, size: 36 },
      { icon: <Zap className="w-full h-full text-yellow-400/20" />, size: 28 },
      { icon: <Shield className="w-full h-full text-indigo-400/20" />, size: 34 },
    ];

    const newFloatingIcons = icons.map((icon, index) => ({
      id: index,
      icon: icon.icon,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: icon.size,
      delay: Math.random() * 2,
    }));

    setFloatingIcons(newFloatingIcons);
  }, []);

  // Эффекты при наведении
  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoverEffects.length > 10) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newEffect = {
      x,
      y,
      id: Date.now(),
    };
    
    setHoverEffects(prev => [...prev, newEffect]);
    
    setTimeout(() => {
      setHoverEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
    }, 1000);
  };

  // Проверка первого входа
  useEffect(() => {
    const initialized = localStorage.getItem('tutor_initialized') === 'true';
    setIsFirstTime(!initialized && !passphraseHash);
    
    // Get last login time
    const last = localStorage.getItem('last_login');
    if (last) {
      try {
        const date = new Date(last);
        setLastLogin(date.toLocaleDateString('ru-RU', { 
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        }));
      } catch {
        // Игнорируем ошибки парсинга даты
      }
    }
  }, [passphraseHash]);

  const checkCapsLock = (e: React.KeyboardEvent) => {
    const capsLock = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockOn(capsLock);
  };

  const checkPasswordStrength = (password: string) => {
    if (!password) return { score: 0, strength: 'weak' as const, suggestions: [] };
    
    const checks = {
      length: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    const suggestions: string[] = [];
    if (!checks.length) suggestions.push('Минимум 8 символов');
    if (!checks.hasUpperCase) suggestions.push('Добавьте заглавные буквы');
    if (!checks.hasLowerCase) suggestions.push('Добавьте строчные буквы');
    if (!checks.hasNumbers) suggestions.push('Добавьте цифры');
    if (!checks.hasSpecial) suggestions.push('Добавьте специальные символы');

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 2) strength = 'medium';

    return { score, strength, suggestions };
  };

  const generatePassphrase = () => {
    const words = [
      'репетитор', 'математика', 'физика', 'ученик', 'занятие',
      'знание', 'умный', 'обучение', 'развитие', 'успех',
      'формат', 'курс', 'урок', 'практика', 'теория'
    ];
    
    const randomWords = [...Array(3)]
      .map(() => words[Math.floor(Math.random() * words.length)])
      .join('-');
      
    const number = Math.floor(Math.random() * 90) + 10;
    const phrase = `${randomWords}-${number}`;
    setPassphrase(phrase);
    setConfirmPassphrase(phrase);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isFirstTime) {
        if (passphrase.length < 6) {
          setError('Фраза должна быть не менее 6 символов');
          return;
        }
        
        if (passphrase !== confirmPassphrase) {
          setError('Фразы не совпадают');
          return;
        }
      }

      const success = await login(passphrase);
      
      if (success) {
        // Сохраняем время входа
        const storage = rememberSession ? localStorage : sessionStorage;
        storage.setItem('last_login', new Date().toISOString());
        
        // Навигация через window.location для полного сброса состояния
        setTimeout(() => {
          window.location.href = '/app';
        }, 300);
      } else {
        setError(isFirstTime ? 'Ошибка при создании фразы' : 'Неверная кодовая фраза');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = () => {
    if (resetConfirmation === 'СБРОСИТЬ ДАННЫЕ') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const strength = checkPasswordStrength(passphrase);

  // Анимационные варианты - исправленные типы
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { type: "spring" as const, stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-linear-to-br from-blue-50/50 via-violet-50/30 to-emerald-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
      onMouseMove={handleMouseMove}
    >
      {/* Анимированный фон с градиентами */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Плавные градиентные волны */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent"></div>
        
        {/* Плавающие иконки */}
        {floatingIcons.map((icon) => (
          <motion.div
            key={icon.id}
            className="absolute"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              width: `${icon.size}px`,
              height: `${icon.size}px`,
            }}
            animate={{
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
              rotate: [0, Math.random() * 10 - 5, 0],
            }}
            transition={{
              duration: 10 + icon.delay,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut"
            }}
          >
            {icon.icon}
          </motion.div>
        ))}
        
        {/* Эффекты при наведении */}
        <AnimatePresence>
          {hoverEffects.map((effect) => (
            <motion.div
              key={effect.id}
              className="absolute w-64 h-64 rounded-full pointer-events-none"
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          ))}
        </AnimatePresence>
        
        {/* Анимированные частицы */}
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-300/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Основное содержимое */}
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center">
          <motion.div
            className="mx-auto w-24 h-24 bg-linear-to-br from-primary-400 via-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-primary-200/50 relative"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse" as const,
            }}
          >
            <Lock className="w-12 h-12 text-white" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </motion.div>
          <motion.h2 
            className="text-4xl font-bold bg-linear-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Tutor Cockpit
          </motion.h2>
          <motion.p 
            className="mt-3 text-lg text-gray-600"
            variants={itemVariants}
          >
            {isFirstTime ? '🚀 Начните свою преподавательскую эволюцию' : '🎯 Ваша панель управления репетитора'}
          </motion.p>
          {lastLogin && !isFirstTime && (
            <motion.div 
              className="mt-3 text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-full py-2 px-4 inline-block"
              variants={itemVariants}
            >
              <Clock className="w-4 h-4 inline-block mr-2" />
              <span>Последний вход: <span className="font-semibold">{lastLogin}</span></span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <motion.div 
        className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        variants={containerVariants}
      >
        <motion.div 
          className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/20 relative overflow-hidden"
          variants={itemVariants}
        >
          {/* Декоративные элементы формы */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-linear-to-br from-primary-100/30 to-violet-100/30 rounded-full blur-xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-linear-to-tr from-emerald-100/30 to-blue-100/30 rounded-full blur-xl"></div>
          
          <motion.form 
            className="space-y-7 relative z-10"
            onSubmit={handleSubmit}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  <span>{isFirstTime ? 'Придумайте кодовую фразу' : 'Введите кодовую фразу'}</span>
                </div>
              </label>
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring" as const, stiffness: 400 }}
              >
                <input
                  id="passphrase"
                  name="passphrase"
                  type={showPassphrase ? "text" : "password"}
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  onKeyUp={checkCapsLock}
                  className="w-full px-5 py-4 pl-12 pr-11 border-2 border-gray-200/60 bg-white/50 rounded-xl focus:ring-3 focus:ring-primary-400/30 focus:border-primary-400 transition-all duration-300 group-hover:border-primary-300/60 shadow-sm"
                  placeholder={isFirstTime ? "Минимум 6 символов" : "Ваша секретная фраза..."}
                  autoComplete="off"
                  minLength={6}
                  autoFocus
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                <motion.button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  tabIndex={-1}
                >
                  {showPassphrase ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </motion.div>
              
              {isFirstTime && passphrase && (
                <motion.div 
                  className="mt-4 space-y-3 bg-linear-to-r from-gray-50/50 to-white/50 rounded-xl p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Надежность пароля:</span>
                    <span className={`
                      font-bold px-3 py-1 rounded-full text-xs
                      ${strength.strength === 'strong' ? 'bg-green-100 text-green-700' : 
                        strength.strength === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                    `}>
                      {strength.strength === 'strong' ? '💪 Надежный' : 
                       strength.strength === 'medium' ? '👌 Средний' : '⚠️ Слабый'}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200/50 rounded-full overflow-hidden">
                    <motion.div 
                      className={`
                        h-full rounded-full transition-all duration-500
                        ${strength.strength === 'strong' ? 'bg-linear-to-r from-green-400 to-green-500' : 
                          strength.strength === 'medium' ? 'bg-linear-to-r from-yellow-400 to-yellow-500' : 
                          'bg-linear-to-r from-red-400 to-red-500'}
                      `}
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength.score / 5) * 100}%` }}
                      transition={{ duration: 0.8, type: "spring" as const }}
                    />
                  </div>
                </motion.div>
              )}
              
              {isFirstTime && (
                <motion.div className="mt-3">
                  <motion.button
                    type="button"
                    onClick={generatePassphrase}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2 transition-colors group"
                    whileHover={{ x: 3 }}
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span>✨ Сгенерировать надежную фразу</span>
                  </motion.button>
                </motion.div>
              )}
            </motion.div>

            <AnimatePresence>
              {isFirstTime && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="confirmPassphrase" className="block text-sm font-medium text-gray-700 mb-3">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary-500" />
                      <span>Подтвердите фразу</span>
                    </div>
                  </label>
                  <motion.div 
                    className="relative group"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring" as const, stiffness: 400 }}
                  >
                    <input
                      id="confirmPassphrase"
                      name="confirmPassphrase"
                      type={showConfirmPassphrase ? "text" : "password"}
                      required
                      value={confirmPassphrase}
                      onChange={(e) => setConfirmPassphrase(e.target.value)}
                      className="w-full px-5 py-4 pl-12 pr-11 border-2 border-gray-200/60 bg-white/50 rounded-xl focus:ring-3 focus:ring-primary-400/30 focus:border-primary-400 transition-all duration-300 group-hover:border-primary-300/60 shadow-sm"
                      placeholder="Повторите вашу фразу..."
                      autoComplete="off"
                      minLength={6}
                    />
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    <motion.button
                      type="button"
                      onClick={() => setShowConfirmPassphrase(!showConfirmPassphrase)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      tabIndex={-1}
                    >
                      {showConfirmPassphrase ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isFirstTime && (
              <motion.div>
                <div className="flex items-center p-3 bg-linear-to-r from-gray-50/50 to-white/50 rounded-xl">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded-lg transition-colors"
                  />
                  <label htmlFor="remember" className="ml-3 block text-sm text-gray-700">
                    <span className="font-medium">Запомнить меня</span>
                    <span className="text-gray-500 text-xs block mt-0.5">Оставаться в системе на этом устройстве</span>
                  </label>
                </div>
              </motion.div>
            )}

            {capsLockOn && (
              <motion.div 
                className="rounded-xl bg-amber-50/80 border border-amber-200 p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex items-center gap-3 text-amber-800">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">⚠️ Включен Caps Lock</p>
                    <p className="text-xs mt-0.5 text-amber-700/70">Проверьте регистр ввода</p>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                className="rounded-xl bg-red-50/80 border border-red-200 p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center gap-3 text-red-800">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{error}</p>
                    <p className="text-xs mt-0.5 text-red-700/70">
                      {isFirstTime ? 'Попробуйте другую фразу' : 'Проверьте правильность ввода'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-linear-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-400/40 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 group relative overflow-hidden"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                {/* Эффект свечения */}
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    <span>{isFirstTime ? 'Создаём безопасный доступ...' : 'Входим...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isFirstTime ? '🚀 Начать работу' : 'Войти в кабинет'}</span>
                    <motion.div 
                      className="ml-3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      ➔
                    </motion.div>
                  </>
                )}
              </motion.button>
              
              <p className="mt-4 text-center text-sm text-gray-500/80">
                <AlertCircle className="w-4 h-4 inline-block mr-2" />
                {isFirstTime 
                  ? 'Фраза шифруется и хранится только на вашем устройстве'
                  : 'Все данные защищены локальным шифрованием'}
              </p>
            </motion.div>
          </motion.form>
          
          {!isFirstTime && (
            <div className="mt-8 text-center">
              <motion.button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors inline-flex items-center gap-2 group"
                whileHover={{ scale: 1.05 }}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="group-hover:underline">Забыли фразу? Сбросить данные</span>
              </motion.button>
            </div>
          )}
          
          <motion.div 
            className="mt-10 pt-8 border-t border-gray-200/40"
            variants={containerVariants}
          >
            <div className="grid grid-cols-1 gap-4 text-sm">
              {[
                { text: '🔒 Локальное хранение данных', color: 'green' },
                { text: '⚡ Быстрый и безопасный вход', color: 'blue' },
                { text: '📱 Доступно на всех устройствах', color: 'purple' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-gray-600"
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                >
                  <div className={`w-2 h-2 rounded-full ${item.color === 'green' ? 'bg-green-400' : item.color === 'blue' ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Модалка сброса данных */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowResetConfirm(false);
              setResetConfirmation('');
            }}
          >
            <motion.div
              className="bg-linear-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Декоративные элементы модалки */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-linear-to-br from-red-100/50 to-pink-100/50 rounded-full blur-xl"></div>
              
              <div className="text-center mb-8 relative z-10">
                <motion.div
                  className="w-20 h-20 bg-linear-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <AlertTriangle className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  ⚠️ Сброс всех данных
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Это действие удалит <span className="font-bold text-red-600">всех учеников</span>, 
                  занятия, финансовые данные и материалы.
                  <br />
                  <span className="text-lg font-bold mt-2 inline-block">
                    Действие необратимо!
                  </span>
                </p>
              </div>
              
              <div className="space-y-6 relative z-10">
                <div className="bg-linear-to-r from-amber-50/80 to-yellow-50/80 border-2 border-amber-200/50 rounded-xl p-5">
                  <p className="text-sm text-amber-800 font-medium mb-3">
                    Для подтверждения введите:
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-amber-300">
                    <code className="font-mono font-bold text-lg text-amber-700 tracking-wider">
                      СБРОСИТЬ ДАННЫЕ
                    </code>
                  </div>
                  <input
                    type="text"
                    value={resetConfirmation}
                    onChange={(e) => setResetConfirmation(e.target.value)}
                    className="w-full mt-4 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all"
                    placeholder="Введите текст выше"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-4">
                  <motion.button
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetConfirmation('');
                    }}
                    className="flex-1 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    onClick={handleResetData}
                    disabled={resetConfirmation !== 'СБРОСИТЬ ДАННЫЕ'}
                    className="flex-1 py-3.5 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg relative overflow-hidden"
                    whileHover={{ scale: resetConfirmation === 'СБРОСИТЬ ДАННЫЕ' ? 1.02 : 1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative z-10">Сбросить всё</div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Футер с информацией */}
      <motion.div 
        className="mt-12 text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-gray-500/70">
          © {new Date().getFullYear()} Tutor Cockpit • Личный кабинет репетитора
        </p>
        <p className="text-xs text-gray-400/60 mt-2">
          Вся информация хранится локально и защищена шифрованием
        </p>
      </motion.div>
    </div>
  );
};