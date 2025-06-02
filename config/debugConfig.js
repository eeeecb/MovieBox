// config/debugConfig.js
/**
 * Configuração centralizada para logs de debug
 * 
 * Para habilitar logs detalhados, altere ENABLE_DEBUG_LOGS para true
 * Para desabilitar (recomendado para produção), mantenha false
 */

export const DEBUG_CONFIG = {
  // Controle geral de logs de debug
  ENABLE_DEBUG_LOGS: false,
  
  // Controles específicos por módulo (só funcionam se ENABLE_DEBUG_LOGS for true)
  AUTH_LOGS: true,           // Logs de autenticação (login, logout, registro)
  FIRESTORE_LOGS: true,      // Logs do Firestore (favoritos, dados do usuário)
  THEME_LOGS: true,          // Logs do sistema de temas
  NAVIGATION_LOGS: true,     // Logs de navegação
  FIREBASE_LOGS: true,       // Logs de inicialização do Firebase
};

/**
 * Função helper para logging condicional
 * @param {string} module - Nome do módulo (AUTH, FIRESTORE, etc.)
 * @param {string} message - Mensagem a ser logada
 * @param {any} data - Dados adicionais (opcional)
 */
export const debugLog = (module, message, data = null) => {
  if (!DEBUG_CONFIG.ENABLE_DEBUG_LOGS) return;
  
  const moduleKey = `${module.toUpperCase()}_LOGS`;
  if (!DEBUG_CONFIG[moduleKey]) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `🔍 [${module.toUpperCase()}]`;
  
  if (data !== null) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

/**
 * Função para logs de erro (sempre mostrados, independente da configuração)
 * @param {string} module - Nome do módulo
 * @param {string} message - Mensagem de erro
 * @param {any} error - Objeto de erro
 */
export const errorLog = (module, message, error = null) => {
  const timestamp = new Date().toISOString();
  const prefix = `❌ [${module.toUpperCase()}]`;
  
  if (error) {
    console.error(`${prefix} ${message}`, error);
  } else {
    console.error(`${prefix} ${message}`);
  }
};

/**
 * Função para logs de sucesso importantes
 * @param {string} module - Nome do módulo
 * @param {string} message - Mensagem de sucesso
 */
export const successLog = (module, message) => {
  if (!DEBUG_CONFIG.ENABLE_DEBUG_LOGS) return;
  
  const prefix = `✅ [${module.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
};

/**
 * Função para logs de warning
 * @param {string} module - Nome do módulo
 * @param {string} message - Mensagem de warning
 */
export const warnLog = (module, message) => {
  const prefix = `⚠️ [${module.toUpperCase()}]`;
  console.warn(`${prefix} ${message}`);
};