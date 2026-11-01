import React from 'react';

export const ThreatBadge = ({ level = 'LOW', score = null, size = 'sm' }) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const styles = {
    CRITICAL: {
      bg: 'bg-red-950/70 border-red-500/80 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]',
      dot: 'bg-red-400 animate-ping'
    },
    HIGH: {
      bg: 'bg-orange-950/60 border-orange-500/70 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]',
      dot: 'bg-orange-400'
    },
    MEDIUM: {
      bg: 'bg-amber-950/50 border-amber-500/60 text-amber-300',
      dot: 'bg-amber-400'
    },
    LOW: {
      bg: 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300',
      dot: 'bg-emerald-400'
    }
  };

  const style = styles[normLevel] || styles.LOW;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-xs font-semibold' : 'px-2 py-0.5 text-[11px] font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded border ${style.bg} ${sizeClasses} uppercase tracking-wider font-mono`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{normLevel}</span>
      {score !== null && <span className="opacity-75 font-normal">({score})</span>}
    </span>
  );
};
