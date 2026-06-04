import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Key, HelpCircle } from 'lucide-react';

interface PinLockScreenProps {
  title: string;
  description?: string;
  onUnlock: (pin: string) => boolean;
  onCancel?: () => void;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  title,
  description = 'Este item está protegido por segurança. Digite o PIN de 4 dígitos para acessá-lo.',
  onUnlock,
  onCancel
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    setError(false);
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Take only the last typed char
    setPin(newPin);

    // If typed a digit, move to next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit if all 4 digits are completed
    const currentCompletedPin = newPin.join('');
    if (currentCompletedPin.length === 4) {
      setTimeout(() => {
        const success = onUnlock(currentCompletedPin);
        if (!success) {
          setError(true);
          setPin(['', '', '', '']);
          inputRefs[0].current?.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      // Move focus back on delete
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const joined = pin.join('');
    if (joined.length < 4) return;
    const success = onUnlock(joined);
    if (!success) {
      setError(true);
      setPin(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-sm mx-auto text-center font-sans">
      <div className="w-16 h-16 bg-slate-900 border border-slate-850 rounded-2xl flex items-center justify-center text-yellow-400 mb-5 shadow-lg shadow-yellow-500/5 animate-bounce">
        <Key className="w-7 h-7" />
      </div>

      <h3 className="text-base font-extrabold text-white tracking-tight uppercase font-mono flex items-center justify-center gap-1.5">
        🔒 {title}
      </h3>
      <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
        {description}
      </p>

      <form onSubmit={handleManualSubmit} className="mt-6 space-y-5 w-full">
        <div className="flex justify-center gap-3.5">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-12 h-14 bg-slate-950 border text-center text-xl font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 text-white ${
                error
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-slate-800 focus:border-cyan-500/60'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-[11px] text-red-400 font-semibold font-mono animate-pulse flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> PIN incorreto. Tente novamente!
          </p>
        )}

        <div className="flex justify-center gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 bg-transparent border border-slate-800 hover:border-slate-700 hover:text-white rounded-full text-xs text-slate-400 cursor-pointer"
            >
              Voltar
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-full text-xs text-white font-semibold cursor-pointer border border-blue-500/10 active:scale-95 duration-200"
          >
            Destravar
          </button>
        </div>
      </form>
    </div>
  );
};
