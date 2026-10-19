import React, { useState, useMemo } from 'react';
import {
  X,
  Radio,
  Search,
  Volume2,
  Copy,
  Check,
  ShieldAlert,
  Headphones,
  Signal,
  TowerControl,
} from 'lucide-react';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useAirportStore } from '../../store/useAirportStore';
import { SOUTH_WEST_FREQUENCIES, AtcFrequency } from '../../data/frequencies/southWestFrequencies';

export const FrequencyModal: React.FC = () => {
  const isFrequencyModalOpen = useRadarSettingsStore((state) => state.isFrequencyModalOpen);
  const setIsFrequencyModalOpen = useRadarSettingsStore((state) => state.setIsFrequencyModalOpen);
  const currentAirport = useAirportStore((state) => state.currentAirport);

  const [activeTab, setActiveTab] = useState<'current' | 'all' | 'centers' | 'emergency'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter frequencies
  const filteredFrequencies = useMemo(() => {
    let list = SOUTH_WEST_FREQUENCIES;

    if (activeTab === 'current') {
      list = list.filter((f) => f.stationIcao === currentAirport.icao);
    } else if (activeTab === 'centers') {
      list = list.filter((f) => f.service === 'ACC' || f.service === 'SIV');
    } else if (activeTab === 'emergency') {
      list = list.filter((f) => f.service === 'EMG');
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (f) =>
          f.mhz.includes(term) ||
          f.callsign.toLowerCase().includes(term) ||
          f.serviceName.toLowerCase().includes(term) ||
          f.stationName.toLowerCase().includes(term) ||
          (f.stationIcao && f.stationIcao.toLowerCase().includes(term))
      );
    }

    return list;
  }, [activeTab, searchTerm, currentAirport.icao]);

  const handleCopy = (freq: AtcFrequency) => {
    navigator.clipboard.writeText(`${freq.mhz}`);
    setCopiedId(freq.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isFrequencyModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1200] flex items-center justify-center p-4 select-none">
      <div
        style={{ backgroundColor: '#0c141c' }}
        className="border-2 border-radar-cyan/60 rounded-md w-full max-w-2xl shadow-2xl font-mono text-radar-green flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#121e29] px-4 py-3 border-b border-radar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-radar-cyan animate-pulse" />
            <div>
              <h2 className="font-extrabold text-radar-cyan tracking-wider text-sm flex items-center gap-2">
                FRÉQUENCES RADIO VHF ATC • SUD-OUEST
              </h2>
              <p className="text-[10px] text-radar-muted">
                Données officielles SIA / AirMate • Prêt pour intégration récepteur / clé dongle SDR
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFrequencyModalOpen(false)}
            className="text-radar-muted hover:text-radar-alert transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-3 bg-[#0f1922] border-b border-radar-border space-y-2">
          {/* Tabs */}
          <div className="grid grid-cols-4 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('current')}
              className={`py-1.5 px-2 rounded font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'current'
                  ? 'bg-radar-green text-radar-bg font-extrabold shadow-radar-green'
                  : 'bg-[#152330] text-radar-muted hover:text-radar-green'
              }`}
            >
              <TowerControl className="w-3.5 h-3.5" />
              <span>{currentAirport.icao} Actif</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`py-1.5 px-2 rounded font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-radar-cyan text-radar-bg font-extrabold shadow-radar-cyan'
                  : 'bg-[#152330] text-radar-muted hover:text-radar-cyan'
              }`}
            >
              <span>Aérodromes (Tous)</span>
            </button>

            <button
              onClick={() => setActiveTab('centers')}
              className={`py-1.5 px-2 rounded font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'centers'
                  ? 'bg-radar-cyan text-radar-bg font-extrabold shadow-radar-cyan'
                  : 'bg-[#152330] text-radar-muted hover:text-radar-cyan'
              }`}
            >
              <span>Centres & SIV</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className={`py-1.5 px-2 rounded font-bold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'emergency'
                  ? 'bg-radar-alert text-white font-extrabold shadow-lg shadow-radar-alert/40'
                  : 'bg-[#152330] text-radar-alert hover:bg-radar-alert/20'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Urgence 121.5</span>
            </button>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-radar-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher fréquence (ex: 120.550), aérodrome, indicatif d'appel (ex: Pyrénées)..."
              className="w-full bg-[#13202c] border border-radar-border rounded pl-8 pr-3 py-1.5 text-xs text-radar-green placeholder-radar-muted focus:border-radar-cyan focus:outline-none"
            />
          </div>
        </div>

        {/* Frequencies List */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {filteredFrequencies.length === 0 ? (
            <div className="p-8 text-center text-radar-muted text-xs">
              Aucune fréquence ne correspond à la recherche.
            </div>
          ) : (
            filteredFrequencies.map((freq) => {
              const isCopied = copiedId === freq.id;
              const isEmergency = freq.service === 'EMG';

              let badgeColor = 'bg-[#172735] text-radar-cyan border-radar-cyan/40';
              if (freq.service === 'TWR') badgeColor = 'bg-radar-green/20 text-radar-green border-radar-green/50';
              if (freq.service === 'APP') badgeColor = 'bg-radar-cyan/20 text-radar-cyan border-radar-cyan/50';
              if (freq.service === 'EMG') badgeColor = 'bg-radar-alert/20 text-radar-alert border-radar-alert/60';

              return (
                <div
                  key={freq.id}
                  className={`p-3 rounded border transition-colors flex items-center justify-between gap-3 ${
                    isEmergency
                      ? 'bg-radar-alert/10 border-radar-alert/50'
                      : 'bg-[#121d28] border-radar-border hover:border-radar-cyan/60'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {freq.stationIcao && (
                        <span className="font-extrabold text-radar-green bg-[#162533] px-1.5 py-0.5 rounded text-[11px] border border-radar-border">
                          {freq.stationIcao}
                        </span>
                      )}
                      <span className="font-bold text-white text-xs truncate">
                        {freq.stationName}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                        {freq.service}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-radar-cyan font-bold flex items-center gap-1">
                        <Volume2 className="w-3.5 h-3.5" />
                        "{freq.callsign}"
                      </span>
                      <span className="text-radar-muted">•</span>
                      <span className="text-radar-muted text-[11px] truncate">
                        {freq.serviceName}
                      </span>
                    </div>

                    <div className="text-[10px] text-radar-muted">
                      {freq.description}
                    </div>
                  </div>

                  {/* Right: Big Frequency Badge & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(freq)}
                      className={`px-3 py-1.5 rounded font-mono font-black text-sm tracking-wider border flex items-center gap-1.5 transition-all ${
                        isCopied
                          ? 'bg-radar-green text-radar-bg border-radar-green'
                          : isEmergency
                          ? 'bg-radar-alert text-white border-radar-alert animate-pulse'
                          : 'bg-[#182837] text-radar-green border-radar-cyan hover:border-radar-green hover:shadow-radar-green'
                      }`}
                      title="Cliquer pour copier la fréquence"
                    >
                      <span>{freq.mhz}</span>
                      <span className="text-[10px] font-normal opacity-80">MHz</span>
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 opacity-60" />}
                    </button>

                    {/* Future VHF Dongle Connect Button */}
                    <button
                      onClick={() => alert(`Intégration Clé Dongle VHF (RTL-SDR / WebRTC) en cours de préparation sur ${freq.mhz} MHz.`)}
                      className="p-2 rounded bg-[#162533] border border-radar-border hover:border-radar-cyan text-radar-muted hover:text-radar-cyan transition-colors"
                      title="Écouter le flux audio (Dongle VHF)"
                    >
                      <Headphones className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-[#101a24] border-t border-radar-border flex items-center justify-between text-[11px] text-radar-muted">
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-radar-cyan" />
            <span>
              Connecteur récepteur VHF : <strong>Prêt pour port USB RTL-SDR / WebRadio</strong>
            </span>
          </div>
          <button
            onClick={() => setIsFrequencyModalOpen(false)}
            className="px-4 py-1 rounded bg-radar-green text-radar-bg font-extrabold hover:bg-radar-green-dim transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
