# 💰 DespesasApp - Aplicativo de Gestão de Despesas

Um aplicativo React Native completo para controle pessoal de finanças com recursos avançados de análise, simulação e alocação orçamentária.

## ✨ Features Implementadas

### 📊 Gestão de Despesas
- ✅ **Cadastro de Despesas** - Adicionar, editar e deletar despesas com categorias
- ✅ **11 Categorias** - Alimentação, Transporte, Saúde, Educação, Lazer, Moradia, Vestuário, Assinaturas, Outros, **Investimentos**, **Reserva de Emergência**
- ✅ **Histórico Mensal** - Visualizar gastos por mês com navegação intuitiva
- ✅ **Filtros Avançados** - Buscar por categoria, intervalo de datas, valor
- ✅ **Templates de Despesas** - Reutilizar despesas frequentes com um clique

### 💼 Alocação Orçamentária (50/30/20)
- ✅ **Alocação 50/30/20** - Divisão inteligente: 50% Essencial, 30% Desejos, 20% Poupar
- ✅ **Acompanhamento Visual** - Barras de progresso com status (OK/AVISO/EXCEDIDO)
- ✅ **Breakdown de Subcategorias** - Ver discriminação de Investimentos vs Reserva de Emergência
- ✅ **Recomendações Personalizadas** - Dicas baseadas no padrão de gastos

### 📈 Simulação de Poupança
- ✅ **Calculadora de Simulação** - Quanto tempo para atingir uma meta de poupança?
- ✅ **Juros Simples e Compostos** - Dois modos de cálculo de rentabilidade
- ✅ **Parâmetros Configuráveis**:
  - Valor-alvo (ex: R$ 50.000)
  - Mensalidade a poupar (ex: R$ 1.000)
  - Taxa de juros (ex: 1% a.m.)
- ✅ **Formatação Inteligente** - Resultados em anos e meses (ex: "2a 3m")
- ✅ **Tabela de Progressão** - Visualizar mês a mês a evolução

### 🎯 Dashboard & Insights
- ✅ **Resumo do Mês** - Gasto total, média diária, previsão
- ✅ **Tendências** - Comparação com meses anteriores
- ✅ **Top Categorias** - Ranking dos maiores gastos
- ✅ **Score de Economia** - Pontuação de 0-100 baseada em desempenho

### 🛡️ Segurança & Confiabilidade
- ✅ **Validação Robusta** - Todos os inputs validados
- ✅ **SQLite Local** - Dados armazenados localmente no dispositivo
- ✅ **Error Handling** - Tratamento completo de erros
- ✅ **Sem Dependências Externas de Pagamento** - Totalmente gratuito

---

## 🏗️ Arquitetura Técnica

### Stack
- **Frontend:** React Native (Expo)
- **State Management:** Context API + Custom Hooks
- **Database:** SQLite (Expo SQLite)
- **Navigation:** React Navigation (Tabs + Stack)

### Principais Arquivos

```
src/
├── screens/
│   ├── HomeScreen.js                  - Lista de despesas
│   ├── AddExpenseScreen.js            - Formulário de despesa
│   ├── MonthlySummaryScreen.js        - Resumo mensal
│   ├── ByCategoryScreen.js            - Gastos por categoria
│   ├── BudgetAllocationScreen.js      - Alocação 50/30/20
│   ├── SimulacaoScreen.js             - Simulador de poupança
│   └── ...
├── components/
│   ├── ExpenseItem.js
│   ├── CategoryCard.js
│   ├── SimulacaoResultado.js          - Card de resultado
│   ├── TabelaProgressao.js            - Tabela de progressão
│   └── ...
├── database/
│   ├── database.js                    - Core SQLite
│   ├── allocation.js                  - Cálculos de alocação
│   └── ...
├── utils/
│   ├── constants.js                   - Categorias e constantes
│   ├── validators.js                  - Validação de dados
│   ├── errorHandler.js                - Tratamento de erros
│   ├── parseUtils.js                  - Parse de valores (moeda)
│   ├── simulacaoCalculos.js           - Cálculos de simulação
│   ├── useSimulacao.js                - Hook de simulação
│   └── ...
└── context/
    └── ExpensasContext.js             - Context principal
```

---

## 🚀 Como Usar

### Instalação
```bash
# Clonar repositório
git clone <repo-url>
cd DespesasApp

# Instalar dependências
npm install

# Executar no Expo
npm start
```

### Funcionalidades Principais

#### 1. Adicionar Despesa
1. Clique no ícone "+" na tela principal
2. Preencha descrição, valor, categoria e data
3. Selecione uma das 11 categorias disponíveis
4. Salve a despesa

#### 2. Visualizar Alocação 50/30/20
1. Abra a aba "Alocação"
2. Veja a divisão do seu gasto:
   - 💰 Essencial: Moradia, alimentação, transporte, etc (50%)
   - 🎉 Desejos: Lazer, assinaturas, vestuário (30%)
   - 🏦 Poupar: **Investimentos** e **Reserva de Emergência** (20%)
3. Veja o breakdown de subcategorias no card "Poupar"

#### 3. Usar Simulador de Poupança
1. Abra a aba "Simulador" (📊)
2. Digite os parâmetros:
   - Quanto você quer juntar? (ex: R$ 50.000)
   - Quanto pode guardar por mês? (ex: R$ 1.000)
   - Taxa de juros? (ex: 1%)
   - Tipo de juros: Simples ou Composto
3. Veja o resultado: "Em 2a 3m você atinge seu objetivo"
4. Consulte a tabela de progressão mês a mês

---

## 📊 Estrutura de Dados

### Categorias de Despesa
```
ESSENCIAL (50%):
├─ Alimentação 🍔
├─ Transporte 🚗
├─ Saúde ❤️
├─ Educação 📚
├─ Moradia 🏠
└─ Outros 💰

DESEJOS (30%):
├─ Lazer 🎮
├─ Vestuário 👕
└─ Assinaturas 📱

POUPAR (20%):
├─ Investimentos 💼 (NOVO)
└─ Reserva de Emergência 🚨 (NOVO)
```

### Tabela de Despesas
```sql
CREATE TABLE despesas (
  id INTEGER PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  categoria TEXT NOT NULL,
  data TEXT NOT NULL,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  tipo_gasto TEXT NOT NULL,  -- essencial, desejo, poupar
  recorrencia TEXT DEFAULT 'unica'
);
```

---

## 🎨 Interface

### Telas Principais
- **Home** - Lista de despesas do mês
- **Cadastro** - Formulário para adicionar despesa
- **Resumo** - Gastos totais e resumo do mês
- **Categorias** - Breakdown por categoria
- **Alocação** - Visualização 50/30/20
- **Simulador** - Calculadora de poupança

### Paleta de Cores
- Primária: #6C5CE7 (roxo)
- Sucesso: #2ED573 (verde)
- Aviso: #FFB84D (laranja)
- Erro: #FF4757 (vermelho)

---

## 🔐 Segurança

- ✅ **Validação de Entrada** - Todos os campos validados
- ✅ **SQL Parameterizado** - Proteção contra SQL injection
- ✅ **Dados Locais** - Nenhum envio de dados para servidores externos
- ✅ **Tratamento de Erros** - Erros não expõem detalhes sensíveis

---

## 📋 Requisitos

- Node.js 16+
- npm ou yarn
- Expo CLI
- iOS 12+ ou Android 6.0+

---

## 🚧 Futuras Melhorias

### Planejado (Não implementado)
- Integração com Open Banking (Nubank, Itaú, Bradesco)
- Backup automático na nuvem
- Autenticação biométrica
- Dashboard web
- Relatórios por email
- Gamificação (badges, desafios)

---

## 📝 Histórico de Versões

### v1.0.0 (2026-03-11) - VERSÃO FINAL
✅ Todas as features principais implementadas e testadas
- Gestão de despesas completa
- Alocação 50/30/20 com breakdown
- Simulador de poupança
- Novas categorias (Investimentos e Reserva)
- Validação e erro handling

---

## 📄 Licença

Este projeto é de código aberto e gratuito.

---

## Gerar apk no windows

- cd android
- .\gradlew.bat assembleRelease
- caso de erro verifique se existe arquivo local.properties na pasta android com o caminho do sdk
- local do apk: \android\app\build\outputs\apk\release

---

**Última Atualização:** 2026-03-11  
**Status:** ✅ PRODUÇÃO-READY (v1.0.0)  
**Desenvolvedor:** Roger

