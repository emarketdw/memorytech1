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

## 🚀 Quick Start

### ⚡ Uso Rápido (Sem Firebase)

```bash
# 1. Clonar o repositório
git clone https://github.com/emarketdw/memorytech1.git
cd memorytech1

# 2. Abrir no navegador (sem servidor necessário)
# Windows
start techmemory.html

# Mac
open techmemory.html

# Linux
xdg-open techmemory.html
```

✅ **Pronto!** Tudo funciona 100% offline no navegador. Dados salvos localmente.

---

### ☁️ Com Firebase (Opcional - Sincronização em Nuvem)

**Se você quer sincronizar entre dispositivos**, veja [SETUP.md](SETUP.md) para configuração completa do Firebase.

**Nota**: Firebase é completamente opcional. O app funciona perfeitamente sem ele!

## 📂 Estrutura do Projeto

```
.
├── techmemory.html                   # 🔥 APP PRINCIPAL (abra isto no navegador!)
├── README.md                         # Este arquivo
├── SETUP.md                          # Setup Firebase (opcional)
├── SECURITY.md                       # Guia de segurança
├── DEPLOY_NETLIFY.md                 # Deploy Netlify
├── LICENSE.md                        # Licença MIT
├── .gitignore                        # Proteção de credenciais
├── netlify.toml                      # Config Netlify
├── _redirects                        # Redirecionamentos
├── vercel.json                       # Config Vercel
├── .htaccess                         # Config Apache
├── firebase-config-template.js       # Template Firebase (se precisar)
└── brainvault_backup_2026-06-03.json # Backup de exemplo
```

## 🗄️ Armazenamento de Dados

### Local (IndexedDB) - Padrão

Todos os dados são salvos **automaticamente** no navegador:

```javascript
{
  id: "id_unico",
  title: "Título",
  content: "Conteúdo",
  date: "2026-06-02T10:00:00Z",
  category: "categoria",
  tags: ["tag1", "tag2"]
}
```

**Coleções automaticamente criadas:**
- `notes` → Anotações
- `bookmarks` → Favoritos
- `ideas` → Ideias
- `projects` → Projetos
- `tasks` → Tarefas
- `reminders` → Lembretes
- `vault` → Cofre pessoal
- `activity` → Log de atividades

### Cloud (Firebase) - Opcional

Se quiser sincronizar entre dispositivos, configure Firebase em [SETUP.md](SETUP.md).

## 🔒 Segurança

### Dados Locais (IndexedDB)

✅ **Seguro:**
- Isolados por navegador e domínio
- Ninguém consegue acessar remotamente
- Não são enviados para servidor algum
- Você é o único proprietário

⚠️ **Considerações:**
- Qualquer pessoa com acesso ao seu computador pode ver
- Se reinstalar o sistema operacional, dados são perdidos
- Recomenda-se fazer backup regular (Backup → Exportar)

### Se Usar Firebase

- ❌ **Nunca** compartilhe `firebase-config.js`
- ❌ **Nunca** use regras abertas em produção
- ✅ Configure autenticação adequada
- ✅ Use HTTPS sempre
- ✅ Faça backups regularmente

Para detalhes completos, veja [SECURITY.md](SECURITY.md)

## 💾 Backup e Dados

### Exportar Dados (Backup Local)

1. Abra o app → Clique em **"💾 Backup"**
2. Clique em **"📤 Exportar"**
3. Um arquivo `techmemory-backup-YYYYMMDD.json` será baixado
4. Guarde em local seguro (nuvem, pendrive, etc)

### Importar Dados (Restaurar Backup)

1. Abra o app → Clique em **"💾 Backup"**
2. Clique em **"📥 Importar"**
3. Selecione um arquivo JSON de backup
4. Dados serão restaurados automaticamente

### Sincronizar com Firebase (Opcional)

Se configurou Firebase, acesse:
1. **Configuração Firebase** → **Sincronizar**
2. Dados da nuvem serão puxados para o navegador

## 🚀 Desenvolvimento & Contribuições

### Para Adicionar Funcionalidades

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Faça as alterações
4. Commit: `git commit -m 'feat: nova funcionalidade'`
5. Push: `git push origin feature/nova-funcionalidade`
6. Abra um Pull Request

### Ideias para Melhorias

- [ ] Autenticação de usuários
- [ ] Compartilhamento de notas
- [ ] Colaboração em tempo real
- [ ] App mobile nativo
- [ ] Integração com Obsidian/Notion
- [ ] IA para sugestões

## 🆘 Troubleshooting

### Dados não são salvos

- [ ] Verifique se o navegador permite armazenamento local (IndexedDB)
- [ ] Tente em modo normal (não em navegação privada)
- [ ] Limpe cache: Ctrl+Shift+Delete
- [ ] Tente em outro navegador
- [ ] Abra DevTools (F12) → Console e procure por erros

### App está lento

- [ ] Reduza número de registros
- [ ] Limpe histórico de atividades em Backup
- [ ] Feche abas desnecessárias
- [ ] Reinicie o navegador

### Perdi meus dados

- [ ] Você tem um backup? Vá em Backup → Importar
- [ ] Verifique se os dados ainda estão em outra aba/navegador
- [ ] Restaure versão anterior do sistema (se backup automático estava ativo)

### Problemas com Firebase

- Para dúvidas sobre Firebase, veja [SETUP.md](SETUP.md) ou [SECURITY.md](SECURITY.md)

## Licença

Este projeto está licenciado sob a **MIT License** - veja [LICENSE.md](LICENSE.md) para detalhes.

## Autor

👤 **emarketdw**

- GitHub: [@emarketdw](https://github.com/emarketdw)
- Repositório: [memorytech1](https://github.com/emarketdw/memorytech1)

## Suporte

Encontrou um bug? Tem uma sugestão? Abra uma [Issue](https://github.com/emarketdw/memorytech1/issues) no GitHub.

---

## 📖 Documentação Adicional

- 📚 [SETUP.md](SETUP.md) - Setup com Firebase e deploy
- 🔒 [SECURITY.md](SECURITY.md) - Guia completo de segurança
- 🌐 [DEPLOY_NETLIFY.md](DEPLOY_NETLIFY.md) - Deploy no Netlify

---

## ℹ️ Modo Offline vs Firebase

| Recurso | Offline | + Firebase |
|---------|---------|-----------|
| **Funcionalidades** | 100% | 100% |
| **Velocidade** | ⚡ Rápido | ⚡ Rápido |
| **Sincronização** | ❌ Não | ✅ Sim |
| **Múltiplos dispositivos** | ❌ Não | ✅ Sim |
| **Custo** | 🆓 Grátis | 🆓 Gratuito* |
| **Backup automático** | ❌ Não | ✅ Sim |
| **Acesso remoto** | ❌ Não | ✅ Sim |

*Firebase oferece plano gratuito generoso (50k leituras/dia aprox)

---

**Criado com ❤️ para desenvolvedores**

Última atualização: Junho de 2026
