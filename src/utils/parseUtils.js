/**
 * Utilitários para parsing de entrada de moeda e percentual
 * Suporta formatos brasileiros (vírgula como separador decimal)
 */

/**
 * Parse moeda brasileira para número
 * Suporta: "1.234,56" -> 1234.56
 *          "1234,56" -> 1234.56
 *          "1234.56" -> 1234.56
 *          "0,01" -> 0.01
 */
export const parseMonetario = (texto) => {
  if (!texto || typeof texto !== 'string') return 0;
  
  // Remove tudo que não é dígito, vírgula ou ponto
  let cleaned = texto.trim().replace(/[^\d.,]/g, '');
  
  if (!cleaned) return 0;
  
  // Lógica: Se há vírgula, ela é sempre o separador decimal (padrão brasileiro)
  if (cleaned.includes(',')) {
    // Remove todos os pontos (são separadores de milhar) e substitui vírgula por ponto
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }
  
  // Se só há pontos, a lógica é:
  // - Se há múltiplos pontos, todos menos o último são separadores de milhar
  // - Se há um ponto, pode ser separador decimal se tiver 2 dígitos após
  const pontos = (cleaned.match(/\./g) || []).length;
  
  if (pontos === 0) {
    // Sem separadores: "1234" ou "0"
    return parseFloat(cleaned) || 0;
  } else if (pontos === 1) {
    // Um ponto: pode ser "1.234" (milhar) ou "1.23" (decimal)
    const ultimoPonto = cleaned.lastIndexOf('.');
    const apos = cleaned.substring(ultimoPonto + 1);
    
    if (apos.length === 2 && parseInt(apos) < 100) {
      // Parece decimal: "1.23" ou "1.05"
      return parseFloat(cleaned) || 0;
    } else {
      // Parece milhar: "1.234" ou "1.000"
      return parseFloat(cleaned.replace(/\./g, '')) || 0;
    }
  } else {
    // Múltiplos pontos: todos são separadores de milhar exceto possivelmente o último
    const ultimoPonto = cleaned.lastIndexOf('.');
    const apos = cleaned.substring(ultimoPonto + 1);
    
    if (apos.length === 2) {
      // Último ponto pode ser decimal
      const semUltimoPonto = cleaned.substring(0, ultimoPonto).replace(/\./g, '');
      return parseFloat(semUltimoPonto + '.' + apos) || 0;
    } else {
      // Todos são separadores de milhar
      return parseFloat(cleaned.replace(/\./g, '')) || 0;
    }
  }
};

/**
 * Parse percentual
 * Suporta: "0.5" -> 0.5
 *          "0,5" -> 0.5
 *          "1" -> 1
 *          "0.001" -> 0.001
 */
export const parseTaxa = (texto) => {
  if (!texto || typeof texto !== 'string') return 0;
  
  // Remove tudo que não é dígito, vírgula ou ponto
  let cleaned = texto.trim().replace(/[^\d.,]/g, '');
  
  if (!cleaned) return 0;
  
  // Substitui vírgula por ponto (normaliza para padrão universal)
  const normalized = cleaned.replace(',', '.');
  
  return parseFloat(normalized) || 0;
};
