import React, { useRef, useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { Download, Upload, Trash2, Calendar } from 'lucide-react';

export const BackupView: React.FC = () => {
  const { 
    notes, bookmarks, ideas, projects, tasks, reminders, vaultItems,
    importBackupData, clearAllLocalData, logActivity 
  } = useTechMemory();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const handleExport = () => {
    const dataObj = {
      notes,
      bookmarks,
      ideas,
      projects,
      tasks,
      reminders,
      vault: vaultItems,
      app: 'TechMemory',
      version: '2.5',
      exportedAt: new Date().toISOString()
    };

    const str = JSON.stringify(dataObj, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `techmemory_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logActivity('Exportou backup de dados localmente');
    showNotification('Backup exportado com sucesso!');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingImportFile(file);
    setShowImportConfirm(true);
    e.target.value = '';
  };

  const executeImport = async () => {
    if (!pendingImportFile) return;
    try {
      const text = await pendingImportFile.text();
      const parsed = JSON.parse(text);

      if (parsed.app !== 'TechMemory') {
        setErrorMsg('Este arquivo não parece ser um backup válido do TechMemory.');
        setTimeout(() => setErrorMsg(null), 4000);
        return;
      }

      await importBackupData(parsed);
      logActivity('Importou backup de dados de arquivo JSON');
      showNotification('Backup importado com sucesso!');
      setShowImportConfirm(false);
      setPendingImportFile(null);
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      setErrorMsg('Erro ao processar arquivo JSON de backup.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleWipe = () => {
    setShowWipeConfirm(true);
  };

  const executeWipe = () => {
    clearAllLocalData();
    logActivity('Resetou toda a base de dados local');
    showNotification('Base de dados limpa com sucesso!');
    setShowWipeConfirm(false);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-cyan-500/15 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            💾 Portabilidade de Dados
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Gerencie cópias de segurança e restaure informações rapidamente</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/30 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-lg text-xs font-semibold animate-bounce">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/40 text-red-500 border border-red-505/20 px-4 py-2.5 rounded-lg text-xs font-semibold animate-pulse">
          ⚠️ {errorMsg}
        </div>
      )}

      {showImportConfirm && (
        <div className="bg-blue-950/45 border border-blue-500/30 rounded-xl p-5 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-blue-400">
            <Upload className="w-5 h-5" />
            <h4 className="font-bold text-sm">Confirmar Importação de Backup</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Atenção: Importar o arquivo para <strong>{pendingImportFile?.name}</strong> irá mesclar ou redefinir seus dados locais com as informações do backup. Deseja prosseguir com a restauração?
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => {
                setShowImportConfirm(false);
                setPendingImportFile(null);
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={executeImport}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-505 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-blue-500/10"
            >
              Confirmar e Restaurar
            </button>
          </div>
        </div>
      )}

      {showWipeConfirm && (
        <div className="bg-red-950/45 border border-red-500/30 rounded-xl p-5 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-red-500">
            <Trash2 className="w-4.5 h-4.5" />
            <h4 className="font-bold text-sm">⚠️ LIMPEZA TOTAL DA BASE LOCAL ⚠️</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Deseja mesmo apagar <strong>todos</strong> os seus dados locais salvos neste navegador? Isso removerá permanentemente notas, ideias, marcas de favoritos, checklists, credenciais e históricos. <strong>Esta ação é irreversível!</strong>
          </p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowWipeConfirm(false)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={executeWipe}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-lg shadow-red-500/10"
            >
              Sim, Apagar Tudo
            </button>
          </div>
        </div>
      )}

      {/* Grid boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Export */}
        <div 
          onClick={handleExport}
          className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl hover:border-cyan-500/30 cursor-pointer active:scale-98 transition-all flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm group"
        >
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 group-hover:scale-105 transition-transform">
            <Download className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Exportar Backup</h3>
            <p className="text-[10.5px] text-slate-400 mt-1">Baixar arquivo compactado JSON com todas as suas anotações</p>
          </div>
        </div>

        {/* Import */}
        <div 
          onClick={handleImportClick}
          className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl hover:border-blue-500/30 cursor-pointer active:scale-98 transition-all flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm group"
        >
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 group-hover:scale-105 transition-transform">
            <Upload className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Importar Backup</h3>
            <p className="text-[10.5px] text-slate-400 mt-1">Fazer upload de um arquivo JSON anteriormente exportado</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            className="hidden" 
          />
        </div>

        {/* Clear */}
        <div 
          onClick={handleWipe}
          className="bg-slate-900 border border-slate-800/80 p-5 rounded-xl hover:border-red-500/30 cursor-pointer active:scale-98 transition-all flex flex-col items-center justify-center text-center space-y-3.5 shadow-sm group"
        >
          <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 group-hover:scale-105 transition-transform">
            <Trash2 className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Limpar Base Local</h3>
            <p className="text-[10.5px] text-slate-400 mt-1">Apaga todo o cache local armazenado. Use com prudência!</p>
          </div>
        </div>

      </div>

      <div className="bg-slate-900 border border-slate-850 p-5 rounded-xl mt-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono">ℹ️ Como Funciona o Armazenamento?</h4>
        <ul className="text-xs text-slate-400 leading-relaxed space-y-2 list-disc list-inside">
          <li><strong>Modo Local-First:</strong> Mesmo sem internet ou sem conta conectada, os seus dados são salvos localmente e instantaneamente no navegador usando <code className="bg-black/35 px-1 py-0.5 rounded font-mono text-[11px] text-cyan-400">localStorage</code>.</li>
          <li><strong>Cloud Sincronizado:</strong> Ao efetuar login utilizando o painel lateral com o Firebase, os seus dados locais e os dados armazenados no banco Cloud Firestore são sincronizados bidirecionalmente em tempo real.</li>
          <li><strong>Backup Físico Recomendado:</strong> É uma boa prática fazer backups locais periodicamente (via arquivo JSON acima) para garantir que você não perca informações em caso de formatação do navegador.</li>
        </ul>
      </div>
    </div>
  );
};
