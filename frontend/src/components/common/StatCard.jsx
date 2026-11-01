import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'cyan', // 'cyan', 'red', 'amber', 'emerald', 'blue'
  badge = null,
  onClick = null
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-cyan-900/60 hover:border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.06)]',
      iconBg: 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/30',
      value: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]',
      glow: 'from-cyan-500/10'
    },
    red: {
      border: 'border-red-900/70 hover:border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.12)]',
      iconBg: 'bg-red-950/90 text-red-400 border border-red-500/50 animate-pulse',
      value: 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
      glow: 'from-red-500/15'
    },
    amber: {
      border: 'border-amber-900/60 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.06)]',
      iconBg: 'bg-amber-950/80 text-amber-400 border border-amber-500/40',
      value: 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]',
      glow: 'from-amber-500/10'
    },
    emerald: {
      border: 'border-emerald-900/60 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.06)]',
      iconBg: 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40',
      value: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]',
      glow: 'from-emerald-500/10'
    },
    blue: {
      border: 'border-blue-900/60 hover:border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.06)]',
      iconBg: 'bg-blue-950/80 text-blue-400 border border-blue-500/40',
      value: 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]',
      glow: 'from-blue-500/10'
    }
  };

  const style = variantStyles[variant] || variantStyles.cyan;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0c1424] to-[#070e1c] border p-4 transition-all duration-200 ${style.border} ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${style.glow} to-transparent opacity-50 pointer-events-none rounded-bl-full`} />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-medium">
              {title}
            </span>
            {badge && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          <div className={`text-2xl font-black font-mono mt-1 ${style.value}`}>
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-lg ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtext && (
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <span className="text-slate-500">•</span>
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};
