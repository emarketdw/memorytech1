import React, { useState, useEffect } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { generateId } from '../utils/helpers';
import { 
  Plus, Trash2, Shield, Eye, EyeOff, Copy, Check, Lock, Unlock, 
  Settings, KeyRound, FileText, Lightbulb, Folder, CheckSquare, Bell, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import { VaultItem } from '../types';

export const VaultView: React.FC = () => {
  const { 
    vaultItems, saveVaultItem, deleteVaultItem,
    notes, ideas, projects, tasks, reminders,
    securityPin, lockedItemIds, lockedModules, saveSecuritySettings
  } = useTechMemory();

  const [activeTab, setActiveTab] = useState<'items' | 'security'>('items');
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Modal Vault Item Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Senha' | 'Cartão' | 'Documento' | 'Chave'>('Senha');
  const [content, setContent] = useState('');

  // Security Settings Form State
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [pin, setPin] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Collapsible sub-sections for individual items in security tab
  const [openSection, setOpenSection] = useState<'none' | 'notes' | 'ideas' | 'projects' | 'tasks'>('none');

  useEffect(() => {
    setSelectedModules(lockedModules || []);
    setSelectedItems(lockedItemIds || []);
    setPin(securityPin || '');
  }, [lockedModules, lockedItemIds, securityPin]);

  const handleOpenModal = () => {
    setTitle('');
    setType('Senha');
    setContent('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const payload = {
      id: generateId(),
      title: title.trim(),
      type,
      content: content.trim()
    };

    setIsModalOpen(false);
    try {
      await saveVaultItem(payload);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleModuleLock = (moduleName: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleName) 
        ? prev.filter(m => m !== moduleName) 
        : [...prev, moduleName]
    );
  };

  const toggleItemLock = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(i => i !== itemId) 
        : [...prev, itemId]
    );
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length > 0 && pin.length !== 4) {
      alert('O PIN de segurança deve ter exatamente 4 dígitos.');
      return;
    }
    
    // If they locked something, they MUST set a PIN!
    if ((selectedModules.length > 0 || selectedItems.length > 0) && !pin) {
      alert('Por favor, defina um PIN de 4 dígitos para proteger os itens selecionados.');
      return;
    }

    try {
      await saveSecuritySettings(pin, selectedItems, selectedModules);
      setToastMessage('Configurações de segurança salvas no Firebase com sucesso!');
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as configurações de segurança.');
    }
  };

  const toggleSection = (section: 'notes' | 'ideas' | 'projects' | 'tasks') => {
    setOpenSection(prev => prev === section ? 'none' : section);
  };

  return (
    <div className="space-y-6">
      {/* Title Header with Tabs */}
      <div className="border-b border-cyan-500/15 pb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              🔒 Cofre & Central de Segurança
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Proteja seus segredos e bloqueie módulos ou itens individuais com um PIN de segurança</p>
          </div>
          
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${activeTab === 'items' ? 'bg-cyan-950 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              🔑 Meus Segredos
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${activeTab === 'security' ? 'bg-cyan-950 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              ⚙️ Opções de Bloqueio (PIN)
            </button>
          </div>
        </div>
      </div>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {activeTab === 'items' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400 font-mono">
              CREDENCIAIS SALVAS: {vaultItems.length}
            </div>
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 font-semibold rounded-full text-xs text-white transition-all duration-200 active:scale-95 cursor-pointer border border-blue-500/20"
            >
              <Plus className="w-3.5 h-3.5" /> Novo Item
            </button>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-xs text-slate-300">
              <p className="font-bold">🖥️ Segurança Local-Cloud Inteligente</p>
              <p className="text-slate-400 mt-0.5 font-mono">As credenciais são mascaradas por segurança visual e criptografadas localmente.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {vaultItems.length > 0 ? (
              vaultItems.map(item => {
                const isRevealed = revealedIds.includes(item.id);
                const isCopied = copiedId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800/80 rounded-xl p-4.5 hover:border-violet-500/20 transition-all duration-200 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-violet-400">🔑</span>
                        <h4 className="text-sm font-bold text-slate-100 truncate">{item.title}</h4>
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.2 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-mono">
                          {item.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                        <span className="text-slate-200 break-all select-all selection:bg-slate-800">
                          {isRevealed ? item.content : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => toggleReveal(item.id)}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isRevealed ? "Mascarar" : "Revelar"}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopy(item.id, item.content)}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isCopied ? 'text-emerald-400 bg-emerald-950/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Copiar credencial"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 bg-red-955/50 border border-red-550/30 rounded-lg p-1 animate-in fade-in duration-200">
                        <span className="text-[10px] text-red-500 font-bold px-1 select-none">Remover?</span>
                        <button
                          onClick={() => {
                            deleteVaultItem(item.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-1.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 rounded-lg border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all flex-shrink-0 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs font-sans">
                Cofre vazio. Nenhum item confidencial adicionado ainda.
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveSecurity} className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Informative Banner */}
          <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-300">
            <Lock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-slate-200">Como funciona o bloqueio?</p>
              <p className="text-slate-400 mt-0.5">
                Escolha o que deseja proteger marcando as opções abaixo. Ao tentar abrir ou expandir qualquer um dos itens travados, 
                o sistema exigirá a digitação imediata da sua senha PIN de 4 dígitos para revelar o conteúdo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Box 1: Select What to Protect */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  🛡️ 1. O que você deseja proteger?
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Selecione módulos inteiros ou expanda para selecionar itens específicos</p>
              </div>

              {/* Modules Locking Box */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Módulos Completos</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { key: 'notes', label: '📄 Notas/Anotações', desc: 'Todo o módulo de anotações' },
                    { key: 'ideas', label: '💡 Ideias & Estudos', desc: 'Sua base de ideias de aula' },
                    { key: 'projects', label: '📁 Projetos', desc: 'Mapeador de projetos' },
                    { key: 'tasks', label: '📋 Tarefas', desc: 'Lista de tarefas e afazeres' },
                    { key: 'reminders', label: '🕒 Lembretes', desc: 'Módulo de lembretes e alarmes' },
                  ].map(mod => {
                    const isChecked = selectedModules.includes(mod.key);
                    return (
                      <label 
                        key={mod.key} 
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${isChecked ? 'bg-cyan-955/20 border-cyan-500/30 text-cyan-400' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-300'}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleModuleLock(mod.key)}
                          className="mt-0.5 rounded text-cyan-500 cursor-pointer accent-cyan-400"
                        />
                        <div className="text-left">
                          <p className="text-[11px] font-bold">{mod.label}</p>
                          <p className="text-[9px] text-slate-500">{mod.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Individual Items Locking Box */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Itens Individuais por Módulo</span>
                
                {/* Collapsible Groups */}
                <div className="space-y-2">
                  
                  {/* Notes Group */}
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/10">
                    <button
                      type="button"
                      onClick={() => toggleSection('notes')}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:bg-slate-850/40"
                    >
                      <span className="flex items-center gap-1.5 font-sans">📄 Notas Individuais ({notes.length})</span>
                      {openSection === 'notes' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openSection === 'notes' && (
                      <div className="p-3 border-t border-slate-800 space-y-1.5 max-h-56 overflow-y-auto">
                        {notes.length > 0 ? (
                          notes.map(n => (
                            <label key={n.id} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer hover:text-white py-0.5">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(n.id)}
                                onChange={() => toggleItemLock(n.id)}
                                className="rounded text-cyan-500 accent-cyan-400"
                              />
                              <span className="truncate">{n.title}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 font-mono">Nenhuma nota salva para bloquear.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ideas Group */}
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/10">
                    <button
                      type="button"
                      onClick={() => toggleSection('ideas')}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:bg-slate-850/40"
                    >
                      <span className="flex items-center gap-1.5 font-sans">💡 Ideias Individuais ({ideas.length})</span>
                      {openSection === 'ideas' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openSection === 'ideas' && (
                      <div className="p-3 border-t border-slate-800 space-y-1.5 max-h-56 overflow-y-auto">
                        {ideas.length > 0 ? (
                          ideas.map(i => (
                            <label key={i.id} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer hover:text-white py-0.5">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(i.id)}
                                onChange={() => toggleItemLock(i.id)}
                                className="rounded text-cyan-500 accent-cyan-400"
                              />
                              <span className="truncate">{i.title}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 font-mono">Nenhuma ideia salva para bloquear.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Projects Group */}
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/10">
                    <button
                      type="button"
                      onClick={() => toggleSection('projects')}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:bg-slate-850/40"
                    >
                      <span className="flex items-center gap-1.5 font-sans">📁 Projetos Individuais ({projects.length})</span>
                      {openSection === 'projects' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openSection === 'projects' && (
                      <div className="p-3 border-t border-slate-800 space-y-1.5 max-h-56 overflow-y-auto">
                        {projects.length > 0 ? (
                          projects.map(p => (
                            <label key={p.id} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer hover:text-white py-0.5">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(p.id)}
                                onChange={() => toggleItemLock(p.id)}
                                className="rounded text-cyan-500 accent-cyan-400"
                              />
                              <span className="truncate">{p.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 font-mono">Nenhum projeto salvo para bloquear.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tasks Group */}
                  <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/10">
                    <button
                      type="button"
                      onClick={() => toggleSection('tasks')}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-slate-300 hover:bg-slate-850/40"
                    >
                      <span className="flex items-center gap-1.5 font-sans">📋 Tarefas Individuais ({tasks.length})</span>
                      {openSection === 'tasks' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openSection === 'tasks' && (
                      <div className="p-3 border-t border-slate-800 space-y-1.5 max-h-56 overflow-y-auto">
                        {tasks.length > 0 ? (
                          tasks.map(t => (
                            <label key={t.id} className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer hover:text-white py-0.5">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(t.id)}
                                onChange={() => toggleItemLock(t.id)}
                                className="rounded text-cyan-500 accent-cyan-400"
                              />
                              <span className="truncate">{t.title}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-500 font-mono">Nenhuma tarefa salva para bloquear.</p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Box 2: PIN password form */}
            <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                    🔑 2. Definir / Alterar PIN (Senha)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Insira uma senha de 4 dígitos numéricos para trancar seus itens.</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">
                      PIN DE SEGURANÇA (4 DÍGITOS)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      pattern="[0-9]*"
                      required={selectedModules.length > 0 || selectedItems.length > 0}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 5824"
                      className="w-full tracking-[1.2em] text-center font-mono font-bold text-base px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-yellow-400 focus:outline-none focus:border-cyan-500/50"
                    />
                    <p className="text-[9px] text-slate-500 font-mono text-left">Utilize apenas números de 0 a 9</p>
                  </div>

                  <div className="pt-2">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">Status da Senha Atual:</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {securityPin ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-[11px] font-bold text-emerald-400">PIN CONFIGURADO NO FIREBASE</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          <span className="text-[11px] font-bold text-yellow-400">NENHUM PIN CONFIGURADO AINDA</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action save setting yellow aesthetic shadows */}
              <div className="pt-6 border-t border-slate-800 mt-6 text-right">
                <button
                  type="submit"
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-350 shadow-[0_0_15px_rgba(56,189,248,0.22)] hover:shadow-[0_0_22px_rgba(56,189,248,0.38)] text-slate-950 font-bold rounded-lg text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Shield className="w-4 h-4" /> Salvar Configurações de Segurança
                </button>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* Vault entry modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <header className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                🔑 Adicionar ao Cofre
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base font-mono cursor-pointer">×</button>
            </header>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Título do Item</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Senha de acesso GitHub"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Tipo de Registro</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="Senha">Senha</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Documento">Documento</option>
                  <option value="Chave">Chave</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Conteúdo Secreto</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder="Cole a senha, PIN, ou token aqui..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2 text-right">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-transparent text-slate-400 hover:text-white border border-slate-800 rounded-full text-xs font-semibold hover:border-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-full border border-blue-500/10 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
