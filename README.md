# TechMemory 🧠💾

Um sistema completo de gerenciamento de memória técnica com suporte offline e sincronização em nuvem via Firebase.

## Sobre

TechMemory é uma aplicação web moderna que permite gerenciar:

- **📝 Anotações** - Organize suas anotações por categorias
- **🔖 Bookmarks** - Salve sites e referências importantes
- **💡 Ideias** - Capture e priorize ideias de projetos
- **📁 Projetos** - Acompanhe o status de seus projetos
- **✅ Tarefas** - Organize tarefas com prioridades
- **⏰ Lembretes** - Receba notificações importantes
- **🔒 Cofre Pessoal** - Armazene informações sensíveis
- **📈 Estatísticas** - Visualize seu progresso
- **☁️ Sincronização** - Dados sincronizados com Firebase (opcional)

## Recursos Principais

✅ **100% Offline** - Funciona completamente sem internet via IndexedDB
✅ **Sincronização em Nuvem** - Opção de usar Firebase como banco de dados
✅ **Multiplataforma** - Web, Mobile, Tablet (responsivo)
✅ **Modo Escuro/Claro** - Tema adaptável
✅ **Backup Local** - Exporte/importe dados em JSON
✅ **Sem Dependências** - Vanilla JavaScript puro (rápido e leve)
✅ **PWA Ready** - Instale como app nativo

## Começar

### Opção 1: Modo Offline (Sem Firebase)

1. Abra `techmemory.html` no navegador
2. Comece a usar imediatamente
3. Dados são salvos automaticamente no armazenamento local

```bash
# Clonar o repositório
git clone https://github.com/emarketdw/memorytech1.git
cd memorytech1

# Abrir no navegador (sem servidor necessário)
# No Windows: start techmemory.html
# No Mac: open techmemory.html
# No Linux: xdg-open techmemory.html
```

### Opção 2: Com Firebase (Sincronização em Nuvem)

#### Passo 1: Criar Projeto Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Clique em **"Criar um projeto"**
3. Escolha um nome (ex: `techmemory`)
4. Clique em **"Criar projeto"**

#### Passo 2: Adicionar App Web

1. No painel do projeto, clique no ícone **`</> Web`**
2. Dê um apelido ao app (ex: `techmemory-web`)
3. Clique em **"Registrar app"**
4. Copie o objeto `firebaseConfig`

#### Passo 3: Configurar Credenciais

1. Copie o arquivo `firebase-config-template.js` para `firebase-config.js`:
```bash
cp firebase-config-template.js firebase-config.js
```

2. Abra `firebase-config.js` e preencha com suas credenciais:
```javascript
const FIREBASE_CONFIG = {
  apiKey: "AIzaSy_SEU_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def"
};
```

3. **NÃO COMMITE** `firebase-config.js` (já está no `.gitignore`)

#### Passo 4: Ativar Firestore Database

1. No Firebase Console, acesse **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de teste"**
4. Selecione região: `southamerica-east1` (Brasil)
5. Clique em **"Ativar"**

#### Passo 5: Configurar Regras de Segurança (Desenvolvimento)

No Firestore → Regras, substitua por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE**: Essas regras são apenas para desenvolvimento. Para produção, implemente autenticação adequada.

#### Passo 6: Abrir no Navegador

```bash
# Adicionar firebase-config.js ao HTML (se necessário)
# Na interface do TechMemory, na aba "Configuração Firebase":
# 1. Copie os valores do firebase-config.js
# 2. Preencha os campos
# 3. Clique em "Salvar & Conectar"
```

## Estrutura do Projeto

```
.
├── README.md                          # Este arquivo (instruções)
├── LICENSE.md                         # Licença MIT
├── .gitignore                         # Arquivos ignorados no Git
├── techmemory.html                    # Aplicação principal (100% completa)
├── firebase-config-template.js        # Template de configuração Firebase
├── brainvault_backup_2026-06-03.json  # Exemplo de backup
└── SECURITY.md                        # Guia de segurança (opcional)
```

## Estrutura de Dados Firebase

O TechMemory cria automaticamente estas coleções no Firestore:

```
techmemory/
├── notes/           → Anotações
├── bookmarks/       → Sites favoritos
├── ideas/           → Ideias e conceitos
├── projects/        → Projetos em andamento
├── tasks/           → Tarefas e TODO lists
├── reminders/       → Lembretes com datas
├── vault/           → Cofre pessoal (senhas, tokens)
└── activity/        → Log de atividades
```

Cada item possui estrutura similar:

```javascript
{
  id: "string_unica",
  title: "Título",
  content: "Conteúdo",
  date: "2026-06-02T10:00:00.000Z",
  category: "categoria",
  tags: ["tag1", "tag2"],
  // ... campos específicos
}
```

## Guia de Segurança

### ✅ Seguro

- ✅ Firebase em modo teste para desenvolvimento
- ✅ Dados criptografados em trânsito (HTTPS)
- ✅ Não armazenar senhas em produção
- ✅ Usar variáveis de ambiente para credenciais

### ❌ Não Seguro para Produção

- ❌ Expor `firebase-config.js` publicamente
- ❌ Usar regras de Firestore `allow read, write: if true`
- ❌ Armazenar senhas reais no Cofre
- ❌ Ignorar validação de dados

## Backup e Exportação

### Exportar Dados

1. Vá para **Backup** na interface
2. Clique em **Exportar**
3. Um arquivo JSON será baixado

### Importar Dados

1. Vá para **Backup**
2. Clique em **Importar**
3. Selecione um arquivo JSON

### Sincronizar com Firebase

1. Vá para **Configuração Firebase**
2. Clique em **Sincronizar** para puxar dados da nuvem

## Desenvolvimento

### Melhorias Futuras

- [ ] Autenticação de usuários (Google Sign-In)
- [ ] Compartilhamento de notas
- [ ] Colaboração em tempo real
- [ ] Aplicativo mobile nativo
- [ ] Integração com Obsidian/Notion
- [ ] IA para sugestões
- [ ] Versionamento de histórico
- [ ] API REST pública

### Contribuir

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: nova feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## Troubleshooting

### Firebase não está sincronizando

- [ ] Verifique se as credenciais estão corretas em `firebase-config.js`
- [ ] Confirme que o Firestore Database está ativo
- [ ] Teste a conexão na aba de configuração
- [ ] Verifique as regras de segurança

### Dados não são salvos

- [ ] Abra o DevTools (F12) e procure por erros
- [ ] Verifique se o navegador tem suporte a IndexedDB
- [ ] Limpe o cache do navegador
- [ ] Tente em modo incógnito

### Lentidão

- [ ] Reduza a quantidade de dados no Firestore
- [ ] Use filtros para pesquisar
- [ ] Limpe o histórico de atividades
- [ ] Atualize para a versão mais recente

## Licença

Este projeto está licenciado sob a **MIT License** - veja [LICENSE.md](LICENSE.md) para detalhes.

## Autor

👤 **emarketdw**

- GitHub: [@emarketdw](https://github.com/emarketdw)
- Repositório: [memorytech1](https://github.com/emarketdw/memorytech1)

## Suporte

Encontrou um bug? Tem uma sugestão? Abra uma [Issue](https://github.com/emarketdw/memorytech1/issues) no GitHub.

---

**Criado com ❤️ por desenvolvedores, para desenvolvedores**

Última atualização: Junho de 2026
