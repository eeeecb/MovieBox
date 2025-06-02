export const DEBUG_CONFIG = {
  ENABLE_DEBUG_LOGS: true,
  AUTH_LOGS: true,
  FIRESTORE_LOGS: true,
  THEME_LOGS: true,
  NAVIGATION_LOGS: true,
  FIREBASE_LOGS: true,
};

export const debugLog = (module, message, data = null) => {
  if (!DEBUG_CONFIG.ENABLE_DEBUG_LOGS) return;
  
  const moduleKey = `${module.toUpperCase()}_LOGS`;
  if (!DEBUG_CONFIG[moduleKey]) return;
  
  const prefix = `🔍 [${module.toUpperCase()}]`;
  
  if (data !== null) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

export const errorLog = (module, message, error = null) => {
  const prefix = `❌ [${module.toUpperCase()}]`;
  
  if (error) {
    console.error(`${prefix} ${message}`, error);
  } else {
    console.error(`${prefix} ${message}`);
  }
};

export const successLog = (module, message) => {
  if (!DEBUG_CONFIG.ENABLE_DEBUG_LOGS) return;
  
  const prefix = `✅ [${module.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
};

export const warnLog = (module, message) => {
  const prefix = `⚠️ [${module.toUpperCase()}]`;
  console.warn(`${prefix} ${message}`);
};