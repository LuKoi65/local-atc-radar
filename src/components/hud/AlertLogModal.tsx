import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Trash2,
  Download,
  FileSpreadsheet,
  FileJson,
  ShieldAlert,
  Radio,
  Clock,
  Plane,
} from 'lucide-react';
import { useAlertLogStore, AlertLogEntry } from '../../store/useAlertLogStore';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { exportSessionCsv, exportSessionJson } from '../../utils/sessionExport';

interface AlertLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertLogModal: React.FC<AlertLogModalProps> = ({ isOpen, onClose }) => {
  const [filterType, setFilterType] = useState<'all' | 'stca' | 'squawk'>('all');

  const entries = useAlertLogStore((state) => state.entries);
  const clearLog = useAlertLogStore((state) => state.clearLog);
  const markAllRead = useAlertLogStore((state) => state.markAllRead);

  const aircraftList = useTrafficStore((state) => state.aircraftList);
  const selectAircraft = useTrafficStore((state) => state.selectAircraft);
  const currentAirport = useAirportStore((state) => state.currentAirport);

  const mutedConflictIds = useRadarSettingsStore((state) => state.mutedConflictIds);
  const clearMutedConflicts = useRadarSettingsStore((state) => state.clearMutedConflicts);

  React.useEffect(() => {
    if (isOpen) {
      markAllRead();
    }
  }, [isOpen, markAllRead]);

  if (!isOpen) return null;

  const filteredEntries = entries.filter((e) => {
    if (filterType === 'stca') return e.type.startsWith('STCA');
    if (filterType === 'squawk') return e.type.startsWith('SQUAWK');
    return true;
  });

  const stcaCount = entries.filter((e) => e.type.startsWith('STCA')).length;
  const squawkCount = entries.filter((e) => e.type.startsWith('SQUAWK')).length;

  const handleSelectAircraft = (hex?: string) => {
    if (hex) {
      selectAircraft(hex);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-radar-panel border border-radar-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-radar-text font-mono">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-radar-border bg-radar-surface">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-radar-amber" />
            <h2 className="text-sm font-bold tracking-wider text-radar-green uppercase">
              JOURNAL DES ALERTES & ÉVÉNEMENTS ATC
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-radar-muted hover:text-white hover:bg-radar-panel transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-radar-panel border-b border-radar-border/60 flex flex-wrap items-center justify-between gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                filterType === 'all'
                  ? 'bg-radar-cyan text-radar-bg font-extrabold shadow-sm'
                  : 'bg-radar-surface text-radar-muted hover:text-white'
              }`}
            >
              TOUTES ({entries.length})
            </button>
            <button
              onClick={() => setFilterType('stca')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                filterType === 'stca'
                  ? 'bg-radar-amber text-radar-bg font-extrabold shadow-sm'
                  : 'bg-radar-surface text-radar-muted hover:text-white'
              }`}
            >
              STCA CONFLITS ({stcaCount})
            </button>
            <button
              onClick={() => setFilterType('squawk')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                filterType === 'squawk'
                  ? 'bg-red-500 text-white font-extrabold shadow-sm'
                  : 'bg-radar-surface text-radar-muted hover:text-white'
              }`}
            >
              TRANSPONDEUR ({squawkCount})
            </button>
          </div>

          {/* Export & Clear Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportSessionCsv(aircraftList, entries)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-radar-surface border border-radar-border text-[10px] font-bold text-radar-cyan hover:border-radar-cyan transition-colors"
              title="Exporter le trafic et les alertes au format CSV pour Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => exportSessionJson(aircraftList, entries, currentAirport?.icao)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-radar-surface border border-radar-border text-[10px] font-bold text-radar-green hover:border-radar-green transition-colors"
              title="Exporter les données brutes de la session en JSON"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            {entries.length > 0 && (
              <button
                onClick={clearLog}
                className="flex items-center gap-1 px-2 py-1 rounded bg-radar-surface border border-red-500/40 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-colors ml-1"
                title="Effacer tout l'historique des alertes de cette session"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>EFFACER</span>
              </button>
            )}
          </div>
        </div>

        {/* Muted Conflicts Banner */}
        {mutedConflictIds.length > 0 && (
          <div className="mx-3 mt-2 px-3 py-1.5 bg-amber-950/40 border border-amber-600/50 rounded flex items-center justify-between text-[11px] text-amber-200">
            <span className="flex items-center gap-2 font-mono">
              <span className="text-amber-400 font-bold">⚠️</span>
              <span>{mutedConflictIds.length} alerte(s) de conflit STCA désactivée(s) manuellement</span>
            </span>
            <button
              onClick={clearMutedConflicts}
              className="px-2.5 py-0.5 bg-amber-500/20 hover:bg-amber-500/40 rounded text-amber-300 font-bold border border-amber-500/50 transition-colors cursor-pointer"
              title="Réactiver toutes les alertes masquées"
            >
              RÉACTIVER LES ALERTES
            </button>
          </div>
        )}

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[55vh]">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-radar-muted space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto opacity-40 text-radar-green" />
              <div className="text-xs font-bold text-radar-green/80">
                AUCUNE ALERTE ENREGISTRÉE DANS CETTE SESSION
              </div>
              <div className="text-[10px] opacity-60">
                Les pertes de séparation STCA et alertes transpondeur apparaîtront ici automatiquement.
              </div>
            </div>
          ) : (
            filteredEntries.map((log) => {
              const isWarning = log.severity === 'warning';
              const isSquawk = log.type.startsWith('SQUAWK');
              const dateStr = new Date(log.timestamp).toLocaleTimeString();

              return (
                <div
                  key={log.id}
                  className={`p-2.5 rounded border transition-colors ${
                    isWarning
                      ? 'bg-red-950/20 border-red-500/40 text-red-200'
                      : 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] border-b border-white/10 pb-1 mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          isWarning ? 'bg-red-500 text-black' : 'bg-amber-400 text-black'
                        }`}
                      >
                        {isSquawk ? 'TRANSPONDEUR' : log.type === 'STCA_WARNING' ? 'STCA ALERTE' : 'PROXIMITÉ'}
                      </span>
                      <span>{log.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-70 text-[9.5px]">
                      <Clock className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="text-[10.5px] opacity-90 leading-relaxed font-sans font-medium">
                    {log.details}
                  </div>

                  {/* Quick Target Select Buttons */}
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-white/5 text-[9.5px]">
                    <span className="opacity-60">Cible(s) :</span>
                    <button
                      onClick={() => handleSelectAircraft(log.hex1)}
                      className="px-1.5 py-0.5 rounded bg-radar-surface border border-radar-border text-radar-cyan font-mono font-bold hover:border-radar-cyan"
                    >
                      ✈ {log.callsign1}
                    </button>
                    {log.callsign2 && log.hex2 && (
                      <button
                        onClick={() => handleSelectAircraft(log.hex2)}
                        className="px-1.5 py-0.5 rounded bg-radar-surface border border-radar-border text-radar-cyan font-mono font-bold hover:border-radar-cyan"
                      >
                        ✈ {log.callsign2}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-radar-surface border-t border-radar-border flex items-center justify-between text-[10px] text-radar-muted">
          <span>STCA : Norme ICAO &lt; 5 NM / &lt; 1000 FT</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-radar-panel border border-radar-border text-radar-text hover:text-white transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
