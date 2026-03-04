export const CATEGORIAS = [
  { label: 'Alimentação', value: 'alimentacao', icon: '🍔', cor: '#FF6B6B' },
  { label: 'Transporte', value: 'transporte', icon: '🚗', cor: '#4ECDC4' },
  { label: 'Saúde', value: 'saude', icon: '❤️', cor: '#FF8B94' },
  { label: 'Educação', value: 'educacao', icon: '📚', cor: '#A8E6CF' },
  { label: 'Lazer', value: 'lazer', icon: '🎮', cor: '#FFD93D' },
  { label: 'Moradia', value: 'moradia', icon: '🏠', cor: '#6C5CE7' },
  { label: 'Vestuário', value: 'vestuario', icon: '👕', cor: '#FD79A8' },
  { label: 'Assinaturas', value: 'assinaturas', icon: '📱', cor: '#00B894' },
  { label: 'Outros', value: 'outros', icon: '💰', cor: '#B2BEC3' },
];

export const RECORRENCIAS = [
  { label: 'Única', value: 'unica' },
  { label: 'Diária', value: 'diaria' },
  { label: 'Semanal', value: 'semanal' },
  { label: 'Mensal', value: 'mensal' },
  { label: 'Anual', value: 'anual' },
];

export const FORMAS_PAGAMENTO = [
  { label: 'Débito', value: 'debito', icon: '💳', cor: '#0984E3' },
  { label: 'Crédito', value: 'credito', icon: '💳', cor: '#6C5CE7' },
  { label: 'Pix', value: 'pix', icon: '⚡', cor: '#00B894' },
];

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const getCategoriaInfo = (value) =>
  CATEGORIAS.find((c) => c.value === value) || CATEGORIAS[CATEGORIAS.length - 1];

export const getFormaPagamentoInfo = (value) =>
  FORMAS_PAGAMENTO.find((f) => f.value === value) || FORMAS_PAGAMENTO[0];

export const formatarMoeda = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
