import React from 'react';
import {
  X,
  Sliders,
  Key,
  Eye,
  ShieldAlert,
  Shield,
  Navigation,
  MapPin,
  Route,
  RotateCcw,
  Radar,
  Languages,
  Palette,
  Check,
} from 'lucide-react';
import { useRadarSettingsStore, DeclutterLevel, GuiTheme } from '../../store/useRadarSettingsStore';
import { TRANSLATIONS } from '../../utils/i18n';
import { CountryFlag } from '../common/CountryFlag';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const language = useRadarSettingsStore((state) => state.language);
  const setLanguage = useRadarSettingsStore((state) => state.setLanguage);
  const guiTheme = useRadarSettingsStore((state) => state.guiTheme);
  const setGuiTheme = useRadarSettingsStore((state) => state.setGuiTheme);
  const t = TRANSLATIONS[language];

  const rapidApiKey = useRadarSettingsStore((state) => state.rapidApiKey);
  const setRapidApiKey = useRadarSettingsStore((state) => state.setRapidApiKey);

  const detectionRangeNm = useRadarSettingsStore((state) => state.detectionRangeNm);
  const setDetectionRangeNm = useRadarSettingsStore((state) => state.setDetectionRangeNm);

  const declutterLevel = useRadarSettingsStore((state) => state.declutterLevel);
  const setDeclutterLevel = useRadarSettingsStore((state) => state.setDeclutterLevel);

  const rangeRingDistances = useRadarSettingsStore(
    (state) => state.rangeRingDistances
  );
  const toggleRangeRingDistance = useRadarSettingsStore(
    (state) => state.toggleRangeRingDistance
  );

  const showExtendedCenterlines = useRadarSettingsStore(
    (state) => state.showExtendedCenterlines
  );
  const setShowExtendedCenterlines = useRadarSettingsStore(
    (state) => state.setShowExtendedCenterlines
  );

  const showIlsFeather = useRadarSettingsStore((state) => state.showIlsFeather);
  const setShowIlsFeather = useRadarSettingsStore(
    (state) => state.setShowIlsFeather
  );

  const openAipApiKey = useRadarSettingsStore((state) => state.openAipApiKey);
  const setOpenAipApiKey = useRadarSettingsStore((state) => state.setOpenAipApiKey);

  const showAirspaces = useRadarSettingsStore((state) => state.showAirspaces);
  const setShowAirspaces = useRadarSettingsStore((state) => state.setShowAirspaces);
  const showNavaids = useRadarSettingsStore((state) => state.showNavaids);
  const setShowNavaids = useRadarSettingsStore((state) => state.setShowNavaids);
  const showWaypoints = useRadarSettingsStore((state) => state.showWaypoints);
  const setShowWaypoints = useRadarSettingsStore((state) => state.setShowWaypoints);
  const showStars = useRadarSettingsStore((state) => state.showStars);
  const setShowStars = useRadarSettingsStore((state) => state.setShowStars);
  const resetAllTagOffsets = useRadarSettingsStore((state) => state.resetAllTagOffsets);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[600] flex items-center justify-center p-4 select-none">
      <div className="bg-radar-panel border border-radar-cyan/60 rounded-sm w-full max-w-lg shadow-2xl font-mono text-radar-green overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-radar-surface px-4 py-3 border-b border-radar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-radar-cyan" />
            <span className="font-extrabold text-radar-cyan tracking-wider">
              {t.settingsTitle}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-radar-muted hover:text-radar-alert transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Langue de l'interface */}
          <div className="flex items-center justify-between bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="flex items-center gap-2 font-bold text-radar-cyan">
              <Languages className="w-4 h-4" />
              <span>{t.languageSelect}</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1 rounded font-bold text-xs border transition-colors flex items-center gap-1.5 ${
                  language === 'fr'
                    ? 'bg-radar-green text-radar-bg border-radar-green font-extrabold shadow-radar-green'
                    : 'bg-radar-panel text-radar-muted border-radar-border'
                }`}
              >
                <CountryFlag code="FR" className="w-4 h-2.5 rounded-sm" />
                <span>Français</span>
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded font-bold text-xs border transition-colors flex items-center gap-1.5 ${
                  language === 'en'
                    ? 'bg-radar-cyan text-radar-bg border-radar-cyan font-extrabold shadow-radar-cyan'
                    : 'bg-radar-panel text-radar-muted border-radar-border'
                }`}
              >
                <CountryFlag code="GB" className="w-4 h-2.5 rounded-sm" />
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Style & Thème de l'interface (Moderne vs Vintage Brut) */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-radar-cyan">
                <Palette className="w-4 h-4" />
                <span>{t.themeSelect}</span>
              </div>
              <span className="text-[10px] text-radar-muted uppercase font-bold">
                {guiTheme === 'classic' ? t.themeClassic : t.themeModern}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Option 1: Moderne (par défaut) */}
              <button
                onClick={() => setGuiTheme('modern')}
                className={`p-2.5 rounded border text-left flex flex-col gap-1 transition-all ${
                  guiTheme === 'modern'
                    ? 'border-radar-green bg-radar-green/15 text-radar-green font-bold shadow-radar-green'
                    : 'border-radar-border bg-radar-panel text-radar-muted hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{t.themeModern}</span>
                  {guiTheme === 'modern' && <Check className="w-3.5 h-3.5 text-radar-green shrink-0" />}
                </div>
                <div className="text-[10px] text-radar-muted leading-tight">
                  {t.themeModernDesc}
                </div>
              </button>

              {/* Option 2: Brut / Carré / Vintage (non-défaut) */}
              <button
                onClick={() => setGuiTheme('classic')}
                className={`p-2.5 rounded border text-left flex flex-col gap-1 transition-all ${
                  guiTheme === 'classic'
                    ? 'border-radar-cyan bg-radar-cyan/20 text-radar-cyan font-bold shadow-none'
                    : 'border-radar-border bg-radar-panel text-radar-muted hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{t.themeClassic}</span>
                  {guiTheme === 'classic' && <Check className="w-3.5 h-3.5 text-radar-cyan shrink-0" />}
                </div>
                <div className="text-[10px] text-radar-muted leading-tight">
                  {t.themeClassicDesc}
                </div>
              </button>
            </div>
          </div>

          {/* Portée de détection maximale */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="flex items-center gap-2 font-bold text-radar-cyan">
              <Radar className="w-4 h-4" />
              <span>{t.detectionRange}</span>
            </div>
            <div className="flex gap-1.5">
              {[30, 50, 75, 100, 150].map((r) => (
                <button
                  key={r}
                  onClick={() => setDetectionRangeNm(r)}
                  className={`flex-1 py-1 rounded font-bold text-xs border transition-colors ${
                    detectionRangeNm === r
                      ? 'bg-radar-cyan text-radar-bg border-radar-cyan font-extrabold shadow-radar-cyan'
                      : 'bg-radar-panel text-radar-muted border-radar-border hover:text-radar-cyan'
                  }`}
                >
                  {r} NM
                </button>
              ))}
            </div>
          </div>

          {/* Niveau de Déclutter / Désencombrement */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="font-bold text-radar-cyan">Mode de Désencombrement (Declutter)</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['normal', 'clean', 'minimal'] as DeclutterLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDeclutterLevel(lvl)}
                  className={`py-1 rounded font-bold text-xs border transition-colors text-center ${
                    declutterLevel === lvl
                      ? 'bg-radar-green text-radar-bg border-radar-green font-extrabold'
                      : 'bg-radar-panel text-radar-muted border-radar-border hover:text-radar-green'
                  }`}
                >
                  {lvl === 'normal' ? 'Normal' : lvl === 'clean' ? 'Épuré' : 'Minimal'}
                </button>
              ))}
            </div>
          </div>

          {/* Clé API ADSBexchange */}
          <div className="space-y-1.5 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="flex items-center gap-1.5 font-bold text-radar-cyan">
              <Key className="w-3.5 h-3.5" />
              <span>{t.apiKeyLabel}</span>
            </div>
            <p className="text-[10px] text-radar-muted">{t.apiKeyHint}</p>
            <input
              type="password"
              value={rapidApiKey}
              onChange={(e) => setRapidApiKey(e.target.value)}
              placeholder="Paste RapidAPI Key here..."
              className="w-full bg-radar-panel border border-radar-border rounded px-2.5 py-1.5 text-radar-green font-mono focus:border-radar-cyan focus:outline-none"
            />
          </div>

          {/* Clé API OpenAIP (Cartes aéronautiques) */}
          <div className="space-y-1.5 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="flex items-center gap-1.5 font-bold text-radar-cyan">
              <Key className="w-3.5 h-3.5" />
              <span>{t.openAipApiKeyLabel}</span>
            </div>
            <p className="text-[10px] text-radar-muted">{t.openAipApiKeyHint}</p>
            <input
              type="password"
              value={openAipApiKey}
              onChange={(e) => setOpenAipApiKey(e.target.value)}
              placeholder="Paste OpenAIP API Key here (optional)..."
              className="w-full bg-radar-panel border border-radar-border rounded px-2.5 py-1.5 text-radar-green font-mono focus:border-radar-cyan focus:outline-none"
            />
          </div>

          {/* Calques d'information aéronautique */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="font-bold text-radar-cyan mb-2">Calques de Navigation Aéronautique</div>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-1.5 text-radar-muted">
                <Shield className="w-3.5 h-3.5 text-radar-cyan" />
                {t.airspacesTooltip}
              </span>
              <input
                type="checkbox"
                checked={showAirspaces}
                onChange={(e) => setShowAirspaces(e.target.checked)}
                className="accent-radar-cyan cursor-pointer w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-1.5 text-radar-muted">
                <Navigation className="w-3.5 h-3.5 text-radar-cyan" />
                {t.navaidsTooltip}
              </span>
              <input
                type="checkbox"
                checked={showNavaids}
                onChange={(e) => setShowNavaids(e.target.checked)}
                className="accent-radar-cyan cursor-pointer w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-1.5 text-radar-muted">
                <MapPin className="w-3.5 h-3.5 text-radar-green" />
                {t.waypointsTooltip}
              </span>
              <input
                type="checkbox"
                checked={showWaypoints}
                onChange={(e) => setShowWaypoints(e.target.checked)}
                className="accent-radar-green cursor-pointer w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center gap-1.5 text-radar-muted">
                <Route className="w-3.5 h-3.5 text-radar-green" />
                {t.starsTooltip}
              </span>
              <input
                type="checkbox"
                checked={showStars}
                onChange={(e) => setShowStars(e.target.checked)}
                className="accent-radar-green cursor-pointer w-4 h-4"
              />
            </label>
          </div>

          {/* Éléments vectoriels du scope */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="font-bold text-radar-cyan mb-2">{t.vectorDisplay}</div>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-radar-muted">{t.centerlinesOpt}</span>
              <input
                type="checkbox"
                checked={showExtendedCenterlines}
                onChange={(e) => setShowExtendedCenterlines(e.target.checked)}
                className="accent-radar-green cursor-pointer w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-radar-muted">{t.ilsFeatherOpt}</span>
              <input
                type="checkbox"
                checked={showIlsFeather}
                onChange={(e) => setShowIlsFeather(e.target.checked)}
                className="accent-radar-cyan cursor-pointer w-4 h-4"
              />
            </label>
          </div>

          {/* Réinitialisation de la position des étiquettes déplacées */}
          <button
            onClick={resetAllTagOffsets}
            className="w-full py-1.5 rounded bg-radar-surface border border-radar-border hover:border-radar-green text-radar-muted hover:text-radar-green transition-colors font-bold flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetTagPositions}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-radar-border bg-radar-surface flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-radar-green text-radar-bg font-extrabold shadow-radar-green hover:bg-radar-green-dim transition-colors"
          >
            {t.doneBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
