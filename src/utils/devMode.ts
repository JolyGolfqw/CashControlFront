// Утилиты для режима разработки в браузере

export const isDevMode = () => {
  // Проверяем, есть ли параметр ?dev=true в URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasDevParam = urlParams.get('dev') === 'true';
  
  // Автоматически включаем dev режим если нет Telegram
  const hasTelegram = typeof window !== 'undefined' && window.Telegram?.WebApp;
  
  // Dev режим если: явно указан ?dev=true ИЛИ нет Telegram
  return hasDevParam || !hasTelegram;
};

export const getDevToken = () => {
  // Для дебага можно указать токен в localStorage
  const devToken = localStorage.getItem('dev_token');
  if (devToken) {
    return devToken;
  }
  
  // Или используем дефолтный токен (нужно будет получить реальный через API)
  return null;
};

// Мок для Telegram WebApp в режиме разработки
export const createMockTelegramWebApp = () => {
  return {
    ready: () => console.log('[DEV] Telegram WebApp ready'),
    expand: () => console.log('[DEV] Telegram WebApp expand'),
    initData: '',
    initDataUnsafe: {
      user: {
        id: 123456789,
        first_name: 'Dev',
        last_name: 'User',
        username: 'dev_user',
      },
    },
    version: '7.0',
    platform: 'web',
    colorScheme: 'light',
    themeParams: {},
    isExpanded: true,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    headerColor: '#ffffff',
    backgroundColor: '#ffffff',
    BackButton: {
      isVisible: false,
      onClick: () => {},
      show: () => {},
      hide: () => {},
    },
    MainButton: {
      text: '',
      color: '',
      textColor: '',
      isVisible: false,
      isActive: false,
      isProgressVisible: false,
      onClick: () => {},
      offClick: () => {},
      show: () => {},
      hide: () => {},
      enable: () => {},
      disable: () => {},
      showProgress: () => {},
      hideProgress: () => {},
      setText: () => {},
    },
    HapticFeedback: {
      impactOccurred: () => {},
      notificationOccurred: () => {},
      selectionChanged: () => {},
    },
  };
};

