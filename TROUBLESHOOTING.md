# 🔧 Troubleshooting - App Mostrando Versão Antiga (Cache do Metro)

## ❌ Problema

O app continua mostrando a versão da Fase 1, mesmo depois de modificar código (Fase 2).

**Causa:** Metro Bundler está usando versão cacheada do código.

---

## ✅ Solução Passo a Passo

### **Opção 1: Reset Rápido (Recomendado)**

```bash
# Terminal no diretório do projeto
cd C:\Projetos\DespesasApp

# Parar o app se estiver rodando (Ctrl+C)

# Limpar cache e reiniciar
npm start -- --reset-cache

# Quando aparecer o menu:
# Pressione 'a' para Android
# Ou 'i' para iOS
```

**Tempo esperado:** 2-3 minutos

---

### **Opção 2: Limpeza Completa**

Se Opção 1 não funcionar:

```bash
# 1. Parar o app (Ctrl+C)

# 2. Executar script batch (Windows)
limpar-cache.bat

# Ou manualmente:
# 3. Deletar diretórios de cache
del /s /q .metroCache
del /s /q node_modules

# 4. Limpar cache npm
npm cache clean --force

# 5. Reinstalar
npm install

# 6. Reiniciar
npm start -- --reset-cache
# Pressione 'a' para Android
```

**Tempo esperado:** 5-10 minutos (instala dependências novamente)

---

### **Opção 3: Limpar Dados do App (Banco de Dados)**

Se há erro de schema de banco de dados (ex: "no such column"):

```bash
# 1. Parar o Metro (Ctrl+C)

# 2. Limpar dados do app via Settings
# Abra as Configurações do Android
# Vá para: Aplicativos → Aplicativos → DespesasApp → Armazenamento e cache
# Pressione "Limpar dados" ou "Clear Data"

# 3. Abrir o app novamente
# O banco será recriado com schema completo
```

**OU via adb:**

```bash
# 1. Parar o Metro (Ctrl+C)

# 2. Usar adb para limpar dados
adb shell pm clear com.despesasapp

# 3. Reinstalar app
npm run android -- --reset-cache
```

---

### **Opção 4: Limpar Cache do Android (Última Opção)**

Se ainda não funcionar:

```bash
# 1. Parar o Metro (Ctrl+C)

# 2. Limpar cache do app no Android
# Abra as Configurações do Android
# Vá para: Aplicativos → DespesasApp → Limpeza de dados

# 3. Desinstalá-lo (opcional)
adb uninstall com.despesasapp

# 4. Rebuildá-lo
npm run android -- --reset-cache
```

---

## 🔍 Verificando se Funcionou

Após executar a limpeza:

1. **Procurar por novas features:**
   - Tente acessar dados de Busca/Dashboard
   - Verifique se a aba "💳 Alocação" aparece

2. **Verificar logs:**
   ```
   Abra DevTools (React Native)
   Vejo novos imports? (allocation.js, BudgetAllocationScreen.js, etc)
   ```

3. **Verificar BD:**
   - Abra o app
   - Vá para a aba Alocação
   - Deveria funcionar sem erros de "no such column"

---

## 📝 Checklist

- [ ] Parei o app (Ctrl+C)
- [ ] Executei `npm start -- --reset-cache`
- [ ] Pressionei 'a' para Android
- [ ] Aguardei 2-3 minutos (rebuild)
- [ ] Verifiquei se novas features aparecem

---

## 💡 Dicas

1. **Não delete `package.json` ou `package-lock.json`** - Esses devem estar sempre presentes

2. **Se estiver com espaço em disco baixo:**
   - Use Opção 1 (reset rápido)
   - Opção 2 consome mais espaço temporariamente

3. **Se o problema persistir:**
   - Tente uninstalar e reinstalar o app no Android
   - Ou criar novo device Android Virtual

4. **Para problemas de schema (Opção 3):**
   - Use quando receber erros como "no such column: tipo_gasto"
   - Limpar dados recria o banco do zero

---

## 🎯 Resumo Rápido

```
Problema:     App mostra versão antiga / erros de banco
Causa:        Cache do Metro Bundler / schema desatualizado
Solução:      npm start -- --reset-cache
Tempo:        2-3 minutos
Resultado:    App com Fase 4 pronto ✅
```

---

**Dúvidas?** O script `limpar-cache.bat` faz tudo automaticamente se preferir!
