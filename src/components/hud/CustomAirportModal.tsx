import React, { useState } from 'react';
import { X, Plus, MapPin } from 'lucide-react';
import { useAirportStore } from '../../store/useAirportStore';
import { useRadarSettingsStore } from '../../store/useRadarSettingsStore';
import { createCustomAirport } from '../../data/airports/presets';
import { TRANSLATIONS } from '../../utils/i18n';

interface CustomAirportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomAirportModal: React.FC<CustomAirportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const language = useRadarSettingsStore((state) => state.language);
  const t = TRANSLATIONS[language];

  const addAirport = useAirportStore((state) => state.addAirport);

  const [icao, setIcao] = useState('');
  const [name, setName] = useState('');
  const [lat, setLat] = useState('48.7233');
  const [lon, setLon] = useState('2.3794');
  const [rwy1, setRwy1] = useState('06');
  const [hdg1, setHdg1] = useState('57');
  const [rwy2, setRwy2] = useState('24');
  const [lengthM, setLengthM] = useState('3650');
  const [elevationFt, setElevationFt] = useState('291');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!icao.trim()) return;

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const hdgNum = parseInt(hdg1, 10);
    const lenNum = parseInt(lengthM, 10) || 3000;
    const elevNum = parseInt(elevationFt, 10) || 0;

    if (isNaN(latNum) || isNaN(lonNum) || isNaN(hdgNum)) {
      alert(language === 'fr' ? 'Veuillez saisir des coordonnées et caps valides' : 'Please enter valid coordinates and headings');
      return;
    }

    const newApt = createCustomAirport(
      icao,
      name,
      latNum,
      lonNum,
      rwy1 || '01',
      hdgNum,
      rwy2 || '19',
      lenNum,
      elevNum
    );

    addAirport(newApt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[600] flex items-center justify-center p-4 select-none">
      <div className="bg-radar-panel border border-radar-cyan/60 rounded-sm w-full max-w-md shadow-2xl font-mono text-radar-green overflow-hidden">
        {/* Modal Header */}
        <div className="bg-radar-surface px-4 py-3 border-b border-radar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-radar-cyan" />
            <span className="font-extrabold text-radar-cyan tracking-wider">
              {t.customAptTitle}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-radar-muted hover:text-radar-alert transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-radar-muted mb-1 font-bold">
                {t.icaoCode}
              </label>
              <input
                type="text"
                value={icao}
                onChange={(e) => setIcao(e.target.value.toUpperCase())}
                placeholder="LFPO"
                required
                maxLength={4}
                className="w-full bg-radar-surface border border-radar-border rounded px-2.5 py-1.5 text-radar-green font-bold focus:border-radar-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-radar-muted mb-1 font-bold">
                {t.aptName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Paris Orly"
                className="w-full bg-radar-surface border border-radar-border rounded px-2.5 py-1.5 text-radar-green focus:border-radar-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-radar-muted mb-1 font-bold">
                {t.arpLat}
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="48.7233"
                required
                className="w-full bg-radar-surface border border-radar-border rounded px-2.5 py-1.5 text-radar-green focus:border-radar-cyan focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-radar-muted mb-1 font-bold">
                {t.arpLon}
              </label>
              <input
                type="text"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="2.3794"
                required
                className="w-full bg-radar-surface border border-radar-border rounded px-2.5 py-1.5 text-radar-green focus:border-radar-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-radar-border pt-3">
            <span className="text-radar-cyan font-bold block mb-2">
              {t.rwySpec}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-radar-muted mb-1 text-[10px]">
                  {t.rwy1Id}
                </label>
                <input
                  type="text"
                  value={rwy1}
                  onChange={(e) => setRwy1(e.target.value)}
                  placeholder="06"
                  className="w-full bg-radar-surface border border-radar-border rounded px-2 py-1 text-radar-green font-bold focus:border-radar-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-radar-muted mb-1 text-[10px]">
                  {t.heading1}
                </label>
                <input
                  type="number"
                  value={hdg1}
                  onChange={(e) => setHdg1(e.target.value)}
                  placeholder="57"
                  className="w-full bg-radar-surface border border-radar-border rounded px-2 py-1 text-radar-green focus:border-radar-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-radar-muted mb-1 text-[10px]">
                  {t.rwy2Id}
                </label>
                <input
                  type="text"
                  value={rwy2}
                  onChange={(e) => setRwy2(e.target.value)}
                  placeholder="24"
                  className="w-full bg-radar-surface border border-radar-border rounded px-2 py-1 text-radar-green focus:border-radar-cyan focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <label className="block text-radar-muted mb-1 text-[10px]">
                  {t.rwyLengthM}
                </label>
                <input
                  type="number"
                  value={lengthM}
                  onChange={(e) => setLengthM(e.target.value)}
                  placeholder="3000"
                  className="w-full bg-radar-surface border border-radar-border rounded px-2 py-1 text-radar-green focus:border-radar-cyan focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-radar-muted mb-1 text-[10px]">
                  {t.elevationFt}
                </label>
                <input
                  type="number"
                  value={elevationFt}
                  onChange={(e) => setElevationFt(e.target.value)}
                  placeholder="300"
                  className="w-full bg-radar-surface border border-radar-border rounded px-2 py-1 text-radar-green focus:border-radar-cyan focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-radar-surface border border-radar-border text-radar-muted hover:text-radar-green transition-colors font-bold"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-radar-green text-radar-bg font-extrabold flex items-center gap-1 shadow-radar-green hover:bg-radar-green-dim transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.createAptBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
