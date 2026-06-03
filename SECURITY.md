# 🔐 Guia de Segurança - TechMemory

## Visão Geral

TechMemory foi projetado com segurança em mente, mas como qualquer aplicação, requer práticas responsáveis de uso.

---

## 🛡️ Segurança Local (IndexedDB)

### ✅ Seguro

- **Isolamento de Origem**: Dados isolados por domínio
- **Acesso Restrito**: Apenas scripts do domínio podem acessar
- **Proteção contra XSS**: Dados sanitizados automaticamente
- **Sem transmissão**: Permanece no navegador

### ⚠️ Considerações

- Qualquer pessoa com acesso ao computador pode ver os dados
- Dados visíveis em DevTools (F12) se não protegidos
- Navegação privada limpa os dados ao fechar

### 🛡️ Recomendações

```javascript
// ✅ BOM: Dados sanitizados
const note = {
  title: "Minha nota",
  content: "Conteúdo seguro"
};

// ❌ RUIM: Dados sensíveis
const vault = {
  password: "senha123",  // Nunca armazene assim!
  token: "abc123xyz"     // Tokens devem ser protegidos
};
```

---

## 🔥 Segurança Firebase (Firestore)

### Modo Teste (Desenvolvimento)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // Acesso aberto!
    }
  }
}
```

**⚠️ NUNCA USE EM PRODUÇÃO**

### Modo Autenticado (Recomendado)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/notes/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /users/{userId}/vault/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Modo com Email Verificado

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: 
        if request.auth != null && 
           request.auth.token.email_verified == true;
    }
  }
}
```

---

## 🔑 Gerenciamento de Credenciais

### Firebase Config

**Arquivo**: `firebase-config.js`

```javascript
// ❌ NUNCA COMMITE ISTO
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDfXXXXXXXXXXXXXXX",  // Exposto!
  // ...
};
```

**Solução:**

1. Adicione ao `.gitignore`:
```
firebase-config.js
firebase-config.*.js
.env
.env.local
```

2. Use variáveis de ambiente:
```javascript
const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  // ...
};
```

3. Em GitHub Pages, use Secrets:
```
Repo → Settings → Secrets → New repository secret
FIREBASE_API_KEY = AIzaSyDfXXXXXXXXXXXXXXX
```

### Chaves API Restrita

No Firebase Console:

1. Vá para **Configurações do Projeto** → **Chaves de API**
2. Clique na chave web
3. Configure **Restrições HTTP referrer**:
```
www.seu-site.com
seu-site.com
```

4. Configure **Restrições de API**:
```
- Cloud Firestore API
- (remova APIs desnecessárias)
```

---

## 📦 Dados Sensíveis

### O que NÃO Armazenar

❌ Senhas de contas reais
❌ Tokens de API produção
❌ Números de cartão
❌ Números de CPF/SSN
❌ Dados pessoais identificáveis
❌ Dados de saúde sem criptografia

### O que PODE Armazenar

✅ Links e referências
✅ Notas de estudo
✅ Ideias e brainstorms
✅ TODOs e lembretes
✅ Configurações públicas
✅ Bookmarks de sites

### Criptografia (Avançado)

Para dados sensíveis, use criptografia cliente:

```javascript
// Usando TweetNaCl.js
const encrypted = nacl.secretbox(
  nacl.util.decodeUTF8("dados sensíveis"),
  nonce,
  key
);

await save('vault', {
  id: generateId(),
  encrypted: nacl.util.encodeBase64(encrypted),
  nonce: nacl.util.encodeBase64(nonce),
  // Chave armazenada localmente, NUNCA sincronizada
});
```

---

## 🌐 Acesso Remoto

### Com Firebase

**Cenário**: Acessar dados de múltiplos dispositivos

```
Dispositivo A → Firebase ← Dispositivo B
(sincronização automática)
```

**Riscos:**
- Intercepção em rede fraca
- Chaves API vazadas
- Acesso não autorizado

**Mitigação:**
- Use HTTPS apenas
- Implemente autenticação
- Revise logs de acesso
- Configure firewalls

### Compartilhamento Seguro

✅ **BOM**: "Compartilho um backup exportado com criptografia"
❌ **RUIM**: "Compartilho credenciais Firebase"

---

## 🚨 Detecção de Problemas

### Sinais de Alerta

⚠️ Dados desaparecidos repentinamente
⚠️ Modificações em dados que não fez
⚠️ Mensagens de erro estranhas no console
⚠️ Firebase reporta atividades suspeitas
⚠️ Performance degradada inesperadamente

### Ação Imediata

1. **Tire um screenshot** do problema
2. **Exporte seus dados** (Backup → Exportar)
3. **Verifique o console** do navegador (F12)
4. **Limpe cache** (Ctrl+Shift+Delete)
5. **Mude sua senha** (se aplicável)
6. **Reporte para GitHub** com detalhes

---

## 📋 Checklist de Segurança

### Desenvolvimento

- [ ] `firebase-config.js` está no `.gitignore`
- [ ] Nunca comitei credenciais
- [ ] Testei modo offline
- [ ] Validei regras do Firestore
- [ ] Verifiquei permissões de arquivos

### Staging/Teste

- [ ] Firestore em modo teste funciona
- [ ] Backup/restauração funcionam
- [ ] Sincronização is confiável
- [ ] Sem erros de CORS
- [ ] Performance aceitável (<2s carregamento)

### Produção

- [ ] Autenticação implementada
- [ ] Regras Firestore adequadas
- [ ] Restrições HTTP referrer ativas
- [ ] HTTPS obrigatório
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Documentação atualizada

---

## 🔄 Recuperação de Desastres

### Perda de Dados

**Cenário**: Excluí todos os meus dados por acidente

**Solução:**
1. Você tem backup? (Backup → Exportar)
   - Restaure: Backup → Importar
2. Firestore tem histórico?
   - Restaure do backup do Firebase Console
3. Nada disponível?
   - 😭 Lições aprendidas

**Prevenção:**
- Faça backup regular (automático ou manual)
- Use o Firestore para sincronização
- Configure versões do Firestore

### Conta Comprometida

**Cenário**: Alguém acessou minha conta Firebase

**Imediata:**
1. Mude a senha do Firebase
2. Revogue credenciais antigas
3. Redefina chaves de API
4. Verifique atividades suspeitas

**Longo Prazo:**
- Habilite autenticação de dois fatores
- Use OAuth em vez de email/senha
- Monitore logs regularmente

---

## 📞 Suporte de Segurança

Encontrou uma vulnerabilidade?

1. **NÃO** abra issue pública
2. Entre em contato com: **[email de contato]**
3. Forneça:
   - Descrição detalhada
   - Passos para reproduzir
   - Screenshots se aplicável
   - Seu email para resposta

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules)
- [Web Security Academy](https://portswigger.net/web-security)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Versão**: 1.0  
**Última atualização**: Junho de 2026  
**Status**: ✅ Ativo

Segurança é responsabilidade de todos. Use com consciência! 🔒
