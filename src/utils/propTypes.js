import PropTypes from 'prop-types';

/**
 * PropTypes para o Context de Despesas
 */
export const ExpensasContextPropTypes = {
  mesSelecionado: PropTypes.number.isRequired,
  anoSelecionado: PropTypes.number.isRequired,
  despesas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      descricao: PropTypes.string.isRequired,
      valor: PropTypes.number.isRequired,
      categoria: PropTypes.string.isRequired,
      recorrencia: PropTypes.string.isRequired,
      forma_pagamento: PropTypes.string.isRequired,
      data: PropTypes.string.isRequired,
      mes: PropTypes.number.isRequired,
      ano: PropTypes.number.isRequired,
    })
  ).isRequired,
  porCategoria: PropTypes.arrayOf(
    PropTypes.shape({
      categoria: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
      quantidade: PropTypes.number.isRequired,
    })
  ).isRequired,
  porFormaPagamento: PropTypes.arrayOf(
    PropTypes.shape({
      forma_pagamento: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
      quantidade: PropTypes.number.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  totalMes: PropTypes.number.isRequired,
  carregarDados: PropTypes.func.isRequired,
  adicionarDespesa: PropTypes.func.isRequired,
  removerDespesa: PropTypes.func.isRequired,
  trocarMes: PropTypes.func.isRequired,
};

/**
 * PropTypes para componentes de Despesa
 */
export const DespesaPropTypes = PropTypes.shape({
  id: PropTypes.number.isRequired,
  descricao: PropTypes.string.isRequired,
  valor: PropTypes.number.isRequired,
  categoria: PropTypes.string.isRequired,
  recorrencia: PropTypes.string,
  forma_pagamento: PropTypes.string,
  data: PropTypes.string.isRequired,
  mes: PropTypes.number,
  ano: PropTypes.number,
});

/**
 * PropTypes para navigation
 */
export const NavigationPropTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};

/**
 * PropTypes para Screen Components
 */
export const ScreenPropTypes = {
  ...NavigationPropTypes,
};

/**
 * PropTypes comuns
 */
export const CommonPropTypes = {
  children: PropTypes.node,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
};
