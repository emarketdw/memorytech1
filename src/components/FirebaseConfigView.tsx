import React, { useState } from 'react';
import { useTechMemory } from '../context/TechMemoryContext';
import { signInWithGoogle, logoutUser } from '../firebase';
import { Flame, LogIn, LogOut, CheckCircle, Wifi, WifiOff, CloudLightning, Copy, Check } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

export const FirebaseConfigView: React.FC = () => {
  const { user, online, syncing, manualSyncCloud } = useTechMemory();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      showNotification('🔥 Conectado à conta Google com sucesso!');
    } catch (e) {
      showNotification('Erro ao realizar autenticação popup.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showNotification('Desconectado com sucesso.');
      setShowLogoutConfirm(false);
    } catch (e) {
      showNotification('Erro ao sair.');
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const codeString = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Apenas em desenvolvimento!
    }
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-cyan-500/15 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            🔥 Sincronização em Nuvem (Firebase)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Vincule sua conta para salvar suas referências em qualquer lugar</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-4 py-2 rounded-lg text-xs font-semibold animate-bounce">
          {successMsg}
        </div>
      )}

      {/* Cloud Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
            📡 Estado da Sincronização
          </h3>

          <div className="divide-y divide-slate-800/60 text-xs">
            {/* Internet Status */}
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-400">Status da Rede:</span>
              <span className={`inline-flex items-center gap-1 font-mono font-semibold ${online ? 'text-emerald-400' : 'text-amber-400'}`}>
                {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                {online ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* Firebase configuration state */}
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-400">Banco de Dados Cloud:</span>
              <span className="text-emerald-400 font-mono font-semibold inline-flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> CONFIGURADO
              </span>
            </div>

            {/* Sync activity status */}
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-400">Status do Sync:</span>
              <span className={`font-mono font-semibold ${syncing ? 'text-blue-400 animate-pulse' : 'text-slate-300'}`}>
                {syncing ? 'Sincronizando...' : 'Em harmonia com a nuvem'}
              </span>
            </div>
          </div>

          {user && online && (
            <button
              onClick={() => manualSyncCloud().then(() => showNotification('Sincronização completa!'))}
              disabled={syncing}
              className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-lg text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-all duration-200"
            >
              🔄 Sincronizar Tudo Manualmente
            </button>
          )}
        </div>

        {/* User Session Handler Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
              👤 Sessão de Usuário
            </h3>
            
            {user ? (
              <div className="flex items-center gap-3.5 mt-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || ''} className="w-12 h-12 rounded-full border border-slate-700 pointer-events-none" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-cyan-950 flex items-center justify-center text-sm font-bold text-cyan-400 border border-cyan-800">
                    {user.displayName?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">{user.displayName || 'Usuário TechMemory'}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{user.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-3">
                Conecte-se com sua conta Google para enviar suas anotações para o Firestore e garantir que os dados fiquem salvos mesmo trocando de dispositivo.
              </p>
            )}
          </div>

          <div className="pt-4">
            {user ? (
              showLogoutConfirm ? (
                <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-3 space-y-2 animate-in fade-in duration-200">
                  <p className="text-[11px] text-red-400 font-semibold leading-relaxed">
                    Deseja realmente desconectar de sua conta? Seus dados locais permanecerão salvos offline.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-705 text-slate-300 border border-slate-700/40 rounded text-xs font-semibold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 bg-red-605 hover:bg-red-500 text-white rounded text-xs font-semibold transition-all cursor-pointer"
                    >
                      Sim, Sair
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-500/10 animate-in duration-200"
                >
                  <LogOut className="w-4 h-4" /> Desconectar Conta Google
                </button>
              )
            ) : (
              <button
                onClick={handleLogin}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500/10"
              >
                <LogIn className="w-4 h-4" /> Conectar via Google Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Manual steps configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-850">
          ⚙️ Detalhes da Infraestrutura Cloud (Firebase Config)
        </h3>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">PROJECT ID:</span>
            <span className="text-slate-200 select-all">{firebaseConfig.projectId}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">DATABASE ID:</span>
            <span className="text-slate-200 select-all">{firebaseConfig.firestoreDatabaseId}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block text-[10px]">API KEY (FIREBASE CLIENT):</span>
            <span className="text-slate-200 break-all select-all font-sans">{firebaseConfig.apiKey}</span>
          </div>
        </div>
      </div>

      {/* Firebase manual steps instructions from user's template */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
          📖 Tutorial de Configuração Geral do Database
        </h3>

        <div className="space-y-4 text-xs font-sans">
          
          <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-850 space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono text-cyan-500">PASSO 1 — Criar projeto no painel do Firebase</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-450 leading-relaxed font-sans pl-1">
              <li>Acesse <strong className="text-slate-350">console.firebase.google.com</strong> com uma conta Google ativa.</li>
              <li>Clique em <strong className="text-slate-350">"Criar um projeto"</strong> ou selecione o sandbox.</li>
              <li>Atribua o nome de projeto desejado (ex: <code className="bg-slate-900 px-1 py-0.2 rounded text-[11px]">techmemory-workspace</code>).</li>
              <li>Prossiga até finalizar a criação sem custos ativando o Spark tier.</li>
            </ol>
          </div>

          <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-850 space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono text-cyan-500">PASSO 2 — Criar Banco Firestore</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-450 leading-relaxed font-sans pl-1">
              <li>No menu principal esquerdo, clique em <strong className="text-slate-350">"Firestore Database"</strong>.</li>
              <li>Selecione <strong className="text-slate-350">"Criar banco de dados"</strong>.</li>
              <li>Para fins de testes, opte pelo <strong className="text-slate-350">"Iniciar no modo de teste"</strong> (regras temporárias abertas).</li>
              <li>Posicione os servidores na região mais adequada (ex: <code className="bg-slate-900 px-1 py-0.2 rounded text-[11px]">southamerica-east1</code>).</li>
              <li>Aguarde a ativação.</li>
            </ol>
          </div>

          <div className="p-3.5 bg-slate-950/50 rounded-lg border border-slate-850 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] font-mono text-cyan-500">PASSO 3 — Regras de Segurança (Modo Aberto)</h4>
              <button 
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold px-2 py-1 rounded cursor-pointer duration-200"
              >
                {copiedCode ? <Check className="w-3" /> : <Copy className="w-3" />}
                {copiedCode ? 'Copiado!' : 'Copiar regra'}
              </button>
            </div>
            <pre className="p-2.5 bg-black/45 rounded-lg border border-slate-850 font-mono text-[10.5px] text-cyan-400 overflow-x-auto whitespace-pre">
              {codeString}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
