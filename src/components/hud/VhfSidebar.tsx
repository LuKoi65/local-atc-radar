import React, { useState, useMemo, useRef } from 'react';
import {
  Radio,
  Search,
  Volume2,
  Copy,
  Check,
  ShieldAlert,
  Headphones,
  Signal,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { useAirportStore } from '../../store/useAirportStore';
import { useFrequencyStore } from '../../store/useFrequencyStore';
import { AtcFrequency } from '../../data/frequencies/southWestFrequencies';

export const VhfSidebar: React.FC = () => {
  const vhfSidebarOpen = useRadarSettingsStore((state) => state.vhfSidebarOpen);
  const setVhfSidebarOpen = useRadarSettingsStore((state) => state.setVhfSidebarOpen);
  const vhfSidebarWidth = useRadarSettingsStore((state) => state.vhfSidebarWidth);
  const setVhfSidebarWidth = useRadarSettingsStore((state) => state.setVhfSidebarWidth);
  const flightsSidebarOpen = useRadarSettingsStore((state) => state.flightsSidebarOpen);
  const flightsSidebarWidth = useRadarSettingsStore((state) => state.flightsSidebarWidth);
  const currentAirport = useAirportStore((state) => state.currentAirport);

  // Frequency store (with localStorage persistence)
  const frequencies = useFrequencyStore((state) => state.frequencies);
  const addFrequency = useFrequencyStore((state) => state.addFrequency);
  const updateFrequency = useFrequencyStore((state) => state.updateFrequency);
  const deleteFrequency = useFrequencyStore((state) => state.deleteFrequency);
  const resetToDefaults = useFrequencyStore((state) => state.resetToDefaults);
  const importFrequencies = useFrequencyStore((state) => state.importFrequencies);

  const [activeTab, setActiveTab] = useState<'current' | 'all' | 'centers' | 'emergency'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Adding / Editing Frequencies
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formMhz, setFormMhz] = useState('');
  const [formStationName, setFormStationName] = useState('');
  const [formStationIcao, setFormStationIcao] = useState('');
  const [formService, setFormService] = useState('TWR');
  const [formServiceName, setFormServiceName] = useState('');
  const [formCallsign, setFormCallsign] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize handler for right edge dragging
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = vhfSidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.max(320, Math.min(700, startWidth + delta));
      setVhfSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Open form for a brand new frequency
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormMhz('');
    setFormStationName(currentAirport.name || currentAirport.city);
    setFormStationIcao(currentAirport.icao || '');
    setFormService('TWR');
    setFormServiceName('Tour de Contrôle');
    setFormCallsign(`${currentAirport.city} Tour`);
    setFormDescription('Espacement 8.33 kHz');
    setIsFormOpen(true);
  };

  // Open form for editing an existing frequency
  const handleOpenEdit = (freq: AtcFrequency) => {
    setEditingId(freq.id);
    setFormMhz(freq.mhz);
    setFormStationName(freq.stationName);
    setFormStationIcao(freq.stationIcao || '');
    setFormService(freq.service);
    setFormServiceName(freq.serviceName);
    setFormCallsign(freq.callsign);
    setFormDescription(freq.description);
    setIsFormOpen(true);
  };

  // Save frequency (Add or Update)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMhz.trim() || !formStationName.trim()) return;

    if (editingId) {
      updateFrequency(editingId, {
        mhz: formMhz.trim(),
        stationName: formStationName.trim(),
        stationIcao: formStationIcao.trim().toUpperCase() || undefined,
        service: formService.trim().toUpperCase(),
        serviceName: formServiceName.trim() || formService.trim(),
        callsign: formCallsign.trim(),
        description: formDescription.trim(),
      });
    } else {
      addFrequency({
        mhz: formMhz.trim(),
        stationName: formStationName.trim(),
        stationIcao: formStationIcao.trim().toUpperCase() || undefined,
        service: formService.trim().toUpperCase(),
        serviceName: formServiceName.trim() || formService.trim(),
        callsign: formCallsign.trim(),
        description: formDescription.trim(),
      });
    }

    setIsFormOpen(false);
    setEditingId(null);
  };

  // Delete frequency with confirm
  const handleDelete = (freq: AtcFrequency) => {
    if (window.confirm(`Supprimer définitivement la fréquence ${freq.mhz} MHz (${freq.callsign}) ?`)) {
      deleteFrequency(freq.id);
    }
  };

  // Export frequencies to JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(frequencies, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `frequences_vhf_atc_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import frequencies from JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && json.length > 0) {
          importFrequencies(json);
          alert(`${json.length} fréquences importées avec succès !`);
        } else {
          alert('Le fichier JSON ne contient pas de liste valide de fréquences.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filter frequencies
  const filteredFrequencies = useMemo(() => {
    let list = frequencies;

    if (activeTab === 'current') {
      list = list.filter((f) => f.stationIcao === currentAirport.icao);
    } else if (activeTab === 'centers') {
      list = list.filter((f) => f.service === 'ACC' || f.service === 'SIV' || f.service === 'MIL');
    } else if (activeTab === 'emergency') {
      list = list.filter((f) => f.service === 'EMG' || f.mhz === '121.500');
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
  }, [frequencies, activeTab, searchTerm, currentAirport.icao]);

  const handleCopy = (freq: AtcFrequency) => {
    navigator.clipboard.writeText(`${freq.mhz}`);
    setCopiedId(freq.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // When collapsed: show discreet left tab with unified width and styling
  if (!vhfSidebarOpen) {
    const airportFreqCount = frequencies.filter((f) => f.stationIcao === currentAirport.icao).length;
    return (
      <button
        onClick={() => setVhfSidebarOpen(true)}
        style={{ left: flightsSidebarOpen ? `${flightsSidebarWidth}px` : '0px' }}
        className="absolute top-14 w-9 bg-radar-panel border-r border-y border-radar-border hover:border-radar-cyan py-3.5 px-1 rounded-r-md shadow-2xl z-[460] flex flex-col items-center justify-center gap-2 text-radar-cyan hover:text-white transition-all duration-150"
        title="Ouvrir le panneau des Fréquences Radio VHF"
      >
        <Radio className="w-4 h-4 text-radar-cyan" />
        <span className="[writing-mode:vertical-lr] text-[10px] font-bold tracking-widest uppercase text-radar-cyan">
          VHF ({currentAirport.icao})
        </span>
        {airportFreqCount > 0 && (
          <span className="bg-radar-cyan/20 text-radar-cyan text-[9px] px-1 py-0.5 rounded font-mono font-bold border border-radar-cyan/40 min-w-[20px] text-center">
            {airportFreqCount}
          </span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-radar-cyan" />
      </button>
    );
  }

  return (
    <aside
      style={{ width: `${vhfSidebarWidth}px` }}
      className={`absolute left-0 top-0 ${
        flightsSidebarOpen ? 'bottom-[50%] border-b border-radar-border' : 'bottom-0'
      } bg-radar-panel/95 backdrop-blur-md border-r border-radar-border shadow-2xl z-[450] flex flex-col font-mono text-radar-green select-none`}
    >
      {/* Draggable Right Resize Handle */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-radar-cyan/30 active:bg-radar-cyan/50 transition-colors z-[500] group flex items-center justify-center"
        title="Glisser vers la gauche ou la droite pour redimensionner"
      >
        <div className="w-1 h-12 bg-radar-border group-hover:bg-radar-cyan group-active:bg-radar-cyan rounded-full transition-colors" />
      </div>

      {/* Header */}
      <div className="bg-radar-surface/90 border-b border-radar-border p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-radar-cyan animate-pulse" />
            <span className="font-bold text-radar-cyan text-xs tracking-wider">
              FRÉQUENCES VHF
            </span>
            <span className="bg-[#14222e] px-1.5 py-0.5 rounded text-[10px] border border-radar-cyan/40 text-radar-green font-bold">
              {currentAirport.icao}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Bouton Ajouter Fréquence */}
            <button
              onClick={handleOpenAdd}
              className="px-2 py-0.5 rounded bg-radar-green text-radar-bg font-extrabold text-[11px] flex items-center gap-1 hover:bg-radar-green-dim transition-colors shadow-radar-green"
              title="Ajouter manuellement une nouvelle fréquence"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>

            {/* Close sidebar */}
            <button
              onClick={() => setVhfSidebarOpen(false)}
              className="text-radar-muted hover:text-radar-cyan transition-colors p-1"
              title="Masquer le panneau VHF"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-1 bg-radar-panel p-0.5 rounded border border-radar-border text-[10px]">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-1 rounded font-bold transition-colors truncate px-1 text-center ${
              activeTab === 'current'
                ? 'bg-radar-green text-radar-bg shadow-radar-green font-extrabold'
                : 'text-radar-muted hover:text-radar-green'
            }`}
            title={`Fréquences de ${currentAirport.icao}`}
          >
            {currentAirport.icao}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-1 rounded font-bold transition-colors truncate px-1 text-center ${
              activeTab === 'all'
                ? 'bg-radar-cyan text-radar-bg shadow-radar-cyan font-extrabold'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
            title="Tous les aérodromes du Sud-Ouest"
          >
            Tous ({frequencies.length})
          </button>
          <button
            onClick={() => setActiveTab('centers')}
            className={`py-1 rounded font-bold transition-colors truncate px-1 text-center ${
              activeTab === 'centers'
                ? 'bg-radar-cyan text-radar-bg shadow-radar-cyan font-extrabold'
                : 'text-radar-muted hover:text-radar-cyan'
            }`}
            title="Centres Régionaux En-Route et SIV"
          >
            Centres
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`py-1 rounded font-bold transition-colors truncate px-1 text-center ${
              activeTab === 'emergency'
                ? 'bg-radar-alert text-white font-extrabold'
                : 'text-radar-alert hover:bg-radar-alert/20'
            }`}
            title="Fréquence Internationale d'Urgence 121.500"
          >
            121.5
          </button>
        </div>
      </div>

      {/* Search Input & Action Tools */}
      <div className="p-2 border-b border-radar-border bg-radar-surface/50 flex gap-2 items-center">
        <div className="relative flex-1 flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-radar-muted pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer MHz, terrain, indicatif..."
            className="w-full h-8 bg-radar-panel border border-radar-border rounded pl-8 pr-7 text-xs text-radar-green placeholder-radar-muted focus:border-radar-cyan focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-radar-muted hover:text-radar-alert p-1"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tools Menu (Export / Import / Reset) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportJson}
            className="p-1 rounded bg-radar-panel border border-radar-border text-radar-muted hover:text-radar-cyan transition-colors"
            title="Exporter vos fréquences au format JSON (Sauvegarde)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded bg-radar-panel border border-radar-border text-radar-muted hover:text-radar-cyan transition-colors"
            title="Importer un fichier JSON de fréquences"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          <button
            onClick={() => {
              if (window.confirm('Réinitialiser toutes les fréquences aux valeurs par défaut d\'origine ?')) {
                resetToDefaults();
              }
            }}
            className="p-1 rounded bg-radar-panel border border-radar-border text-radar-muted hover:text-radar-amber transition-colors"
            title="Réinitialiser aux fréquences d'usine"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inline Form (Edit / Add) */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveForm}
          className="p-3 bg-[#0d161f] border-b-2 border-radar-cyan space-y-2 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between font-bold text-radar-cyan border-b border-radar-border/60 pb-1">
            <span>{editingId ? '✏️ MODIFIER LA FRÉQUENCE' : '➕ NOUVELLE FRÉQUENCE VHF'}</span>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-radar-muted hover:text-radar-alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-radar-muted block">FRÉQUENCE (MHz) *</label>
              <input
                type="text"
                required
                value={formMhz}
                onChange={(e) => setFormMhz(e.target.value)}
                placeholder="ex: 120.550 ou 118.405"
                className="w-full bg-[#131f2b] border border-radar-border rounded px-2 py-1 text-radar-green font-bold focus:border-radar-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-radar-muted block">SERVICE (TWR, APP, SOL...)</label>
              <input
                type="text"
                required
                value={formService}
                onChange={(e) => setFormService(e.target.value)}
                placeholder="ex: TWR, APP, SOL, SIV..."
                className="w-full bg-[#131f2b] border border-radar-border rounded px-2 py-1 text-radar-cyan font-bold focus:border-radar-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-radar-muted block">AÉRODROME / STATION *</label>
              <input
                type="text"
                required
                value={formStationName}
                onChange={(e) => setFormStationName(e.target.value)}
                placeholder="ex: Tarbes-Lourdes-Pyrénées"
                className="w-full bg-[#131f2b] border border-radar-border rounded px-2 py-1 text-radar-green focus:border-radar-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-radar-muted block">CODE OACI (optionnel)</label>
              <input
                type="text"
                value={formStationIcao}
                onChange={(e) => setFormStationIcao(e.target.value)}
                placeholder="ex: LFBT, LFBP..."
                className="w-full bg-[#131f2b] border border-radar-border rounded px-2 py-1 text-radar-green focus:border-radar-cyan focus:outline-none uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-radar-muted block">INDICATIF D'APPEL RADIO</label>
              <input
                type="text"
                value={formCallsign}
                onChange={(e) => setFormCallsign(e.target.value)}
                placeholder="ex: Tarbes Tour, Pyrénées Approche"
                className="w-full bg-[#131f2b] border border-radar-border rounded px-2 py-1 text-radar-cyan focus:border-radar-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-radar-muted block">NOM DU SERVICE</label>
              <input
                type="text"
                value={formServiceName}
                onChange={(e) => setFormServiceName(e.target.value)}
                placeholder="ex: Tour de Contrôle, Info..."
                className="w-full bg-[#131f2b] border border-radar-border rounded px-2 py-1 text-radar-green focus:border-radar-cyan focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-radar-muted block">DESCRIPTION / REMARQUES</label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="ex: Espacement 8.33 kHz, Piste 02/20, Horaires..."
              className="w-full bg-[#131f2b] border border-radar-border rounded px-2 py-1 text-radar-muted focus:border-radar-cyan focus:outline-none text-[11px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3 py-1 rounded bg-[#162330] border border-radar-border text-radar-muted hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded bg-radar-green text-radar-bg font-extrabold flex items-center gap-1 shadow-radar-green hover:bg-radar-green-dim"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      )}

      {/* Frequencies List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
        {filteredFrequencies.length === 0 ? (
          <div className="p-8 text-center text-radar-muted text-xs space-y-2">
            <p>Aucune fréquence trouvée.</p>
            <button
              onClick={handleOpenAdd}
              className="px-3 py-1 rounded bg-radar-surface border border-radar-cyan text-radar-cyan font-bold hover:bg-radar-panel text-xs"
            >
              + Ajouter une fréquence
            </button>
          </div>
        ) : (
          filteredFrequencies.map((freq) => {
            const isCopied = copiedId === freq.id;
            const isEmergency = freq.service === 'EMG' || freq.mhz === '121.500';

            let badgeColor = 'bg-[#152431] text-radar-cyan border-radar-cyan/40';
            if (freq.service === 'TWR') badgeColor = 'bg-radar-green/20 text-radar-green border-radar-green/50';
            if (freq.service === 'APP') badgeColor = 'bg-radar-cyan/20 text-radar-cyan border-radar-cyan/50';
            if (freq.service === 'GND' || freq.service === 'SOL') badgeColor = 'bg-[#1b2b3a] text-radar-green border-radar-border';
            if (isEmergency) badgeColor = 'bg-radar-alert/20 text-radar-alert border-radar-alert/60';

            return (
              <div
                key={freq.id}
                className={`p-2.5 rounded border transition-colors flex items-center justify-between gap-2 group ${
                  isEmergency
                    ? 'bg-radar-alert/10 border-radar-alert/50'
                    : 'bg-radar-surface/80 border-radar-border hover:border-radar-cyan/60'
                }`}
              >
                {/* Station Info */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {freq.stationIcao && (
                      <span className="font-extrabold text-radar-green bg-radar-panel px-1.5 py-0.2 rounded text-[10px] border border-radar-border">
                        {freq.stationIcao}
                      </span>
                    )}
                    <span className="font-bold text-white text-xs truncate">
                      {freq.stationName}
                    </span>
                    <span className={`px-1 rounded text-[9px] font-bold border ${badgeColor}`}>
                      {freq.service}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-radar-cyan font-bold flex items-center gap-1 truncate">
                      <Volume2 className="w-3 h-3 shrink-0" />
                      "{freq.callsign}"
                    </span>
                    {freq.serviceName && (
                      <span className="text-radar-muted text-[10px] truncate">
                        • {freq.serviceName}
                      </span>
                    )}
                  </div>

                  {freq.description && (
                    <div className="text-[10px] text-radar-muted truncate">
                      {freq.description}
                    </div>
                  )}
                </div>

                {/* Right: Big Frequency Badge & Action Icons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(freq)}
                    className={`px-2 py-1 rounded font-mono font-black text-xs tracking-wider border flex items-center gap-1 transition-all ${
                      isCopied
                        ? 'bg-radar-green text-radar-bg border-radar-green'
                        : isEmergency
                        ? 'bg-radar-alert text-white border-radar-alert animate-pulse'
                        : 'bg-radar-panel text-radar-green border-radar-cyan hover:border-radar-green'
                    }`}
                    title="Cliquer pour copier la fréquence"
                  >
                    <span>{freq.mhz}</span>
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 opacity-60" />}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(freq)}
                    className="p-1 rounded bg-radar-panel border border-radar-border text-radar-muted hover:text-radar-green transition-colors"
                    title="Modifier cette fréquence"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(freq)}
                    className="p-1 rounded bg-radar-panel border border-radar-border text-radar-muted hover:text-radar-alert transition-colors"
                    title="Supprimer cette fréquence"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Future VHF Dongle Audio Hook */}
                  <button
                    onClick={() => alert(`Connecteur Clé Dongle VHF (RTL-SDR) en préparation sur ${freq.mhz} MHz.`)}
                    className="p-1 rounded bg-radar-panel border border-radar-border hover:border-radar-cyan text-radar-muted hover:text-radar-cyan transition-colors"
                    title="Écouter le flux audio (Dongle VHF)"
                  >
                    <Headphones className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2 border-t border-radar-border bg-radar-surface/90 flex items-center justify-between text-[10px] text-radar-muted">
        <div className="flex items-center gap-1">
          <Signal className="w-3 h-3 text-radar-cyan" />
          <span>Sauvegarde locale automatique • Ham Ready</span>
        </div>
        <span className="font-bold text-radar-green">VHF AIR</span>
      </div>
    </aside>
  );
};
