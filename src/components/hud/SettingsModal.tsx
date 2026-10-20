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
  Pipette,
  AlertTriangle,
  Volume2,
  Clock,
  Tag,
  Download,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react';
import { useTrafficStore } from '../../store/useTrafficStore';
import { useAirportStore } from '../../store/useAirportStore';
import { useAlertLogStore } from '../../store/useAlertLogStore';
import { exportSessionCsv, exportSessionJson } from '../../utils/sessionExport';
import {
  useRadarSettingsStore,
  DeclutterLevel,
  GuiTheme,
  ThemeAccentColors,
  TrailLengthMode,
  TagDisplayMode,
  DEFAULT_COLORS_MODERN,
  DEFAULT_COLORS_CLASSIC,
} from '../../store/useRadarSettingsStore';
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

  // New modules settings & stores
  const stcaEnabled = useRadarSettingsStore((state) => state.stcaEnabled);
  const setStcaEnabled = useRadarSettingsStore((state) => state.setStcaEnabled);
  const stcaAudioEnabled = useRadarSettingsStore((state) => state.stcaAudioEnabled);
  const setStcaAudioEnabled = useRadarSettingsStore((state) => state.setStcaAudioEnabled);
  const trailLengthMode = useRadarSettingsStore((state) => state.trailLengthMode);
  const setTrailLengthMode = useRadarSettingsStore((state) => state.setTrailLengthMode);
  const tagDisplayMode = useRadarSettingsStore((state) => state.tagDisplayMode);
  const setTagDisplayMode = useRadarSettingsStore((state) => state.setTagDisplayMode);
  const autoDeconflictTags = useRadarSettingsStore((state) => state.autoDeconflictTags);
  const setAutoDeconflictTags = useRadarSettingsStore((state) => state.setAutoDeconflictTags);

  const aircraftList = useTrafficStore((state) => state.aircraftList);
  const alertEntries = useAlertLogStore((state) => state.entries);
  const currentAirport = useAirportStore((state) => state.currentAirport);

  const customColors = useRadarSettingsStore((state) => state.customColors);
  const setThemeAccentColor = useRadarSettingsStore((state) => state.setThemeAccentColor);
  const resetThemeAccentColors = useRadarSettingsStore((state) => state.resetThemeAccentColors);
  const setThemePreset = useRadarSettingsStore((state) => state.setThemePreset);

  const activeColors = guiTheme === 'classic' ? customColors.classic : customColors.modern;

  const PRESETS: { label: string; colors: ThemeAccentColors }[] = [
    {
      label: t.presetDefault,
      colors: guiTheme === 'classic' ? DEFAULT_COLORS_CLASSIC : DEFAULT_COLORS_MODERN,
    },
    {
      label: t.presetPhosphor,
      colors: {
        primary: '#39ff14',
        secondary: '#00dd55',
        amber: '#ffcc00',
        muted: '#85baa0',
      },
    },
    {
      label: t.presetAmber,
      colors: {
        primary: '#ffb000',
        secondary: '#ffd060',
        amber: '#ff7700',
        muted: '#c7b48b',
      },
    },
    {
      label: t.presetMarine,
      colors: {
        primary: '#00d4ff',
        secondary: '#38bdf8',
        amber: '#f59e0b',
        muted: '#94a3b8',
      },
    },
    {
      label: t.presetHighContrast,
      colors: {
        primary: '#22c55e',
        secondary: '#38bdf8',
        amber: '#fbbf24',
        muted: '#cbd5e1',
      },
    },
  ];

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

          {/* Personnalisation des Couleurs d'Accent */}
          <div className="space-y-3 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="flex items-center justify-between border-b border-radar-border/60 pb-2">
              <div className="flex items-center gap-2 font-bold text-radar-cyan">
                <Pipette className="w-4 h-4 text-radar-cyan" />
                <span>{t.accentColorsTitle}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-radar-cyan font-mono bg-radar-panel px-2 py-0.5 rounded border border-radar-cyan/30 font-bold">
                  {guiTheme === 'classic' ? 'Thème Classique' : 'Thème Moderne'}
                </span>
                <button
                  onClick={() => resetThemeAccentColors(guiTheme)}
                  className="px-2 py-0.5 rounded bg-radar-panel border border-radar-border hover:border-radar-amber text-radar-muted hover:text-radar-amber transition-colors text-[10px] font-bold flex items-center gap-1"
                  title={t.resetColorsBtn}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-radar-muted leading-relaxed">
              {t.accentColorsDesc} ({t.activeThemeEditing}{' '}
              <strong className="text-radar-green">
                {guiTheme === 'classic' ? t.themeClassic : t.themeModern}
              </strong>).
            </p>

            {/* Quick Palettes / Presets */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-radar-muted uppercase tracking-wider">
                {t.accentPresets}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setThemePreset(guiTheme, p.colors)}
                    className="p-1.5 rounded bg-radar-panel border border-radar-border hover:border-radar-cyan transition-colors flex flex-col items-center gap-1 text-[9.5px] font-bold"
                  >
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.colors.primary }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.colors.secondary }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.colors.amber }} />
                    </div>
                    <span className="truncate w-full text-center text-radar-muted hover:text-white">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Interactive Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Primary Green */}
              <div className="bg-radar-panel p-2 rounded border border-radar-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">{t.accentPrimary}</div>
                  <div className="text-[9px] text-radar-muted font-mono">{activeColors.primary}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="color"
                    value={activeColors.primary}
                    onChange={(e) => setThemeAccentColor(guiTheme, 'primary', e.target.value)}
                    className="w-7 h-7 rounded border border-radar-border cursor-pointer bg-transparent p-0"
                  />
                </div>
              </div>

              {/* Secondary Cyan */}
              <div className="bg-radar-panel p-2 rounded border border-radar-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">{t.accentSecondary}</div>
                  <div className="text-[9px] text-radar-muted font-mono">{activeColors.secondary}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="color"
                    value={activeColors.secondary}
                    onChange={(e) => setThemeAccentColor(guiTheme, 'secondary', e.target.value)}
                    className="w-7 h-7 rounded border border-radar-border cursor-pointer bg-transparent p-0"
                  />
                </div>
              </div>

              {/* Amber / Vario */}
              <div className="bg-radar-panel p-2 rounded border border-radar-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">{t.accentAmber}</div>
                  <div className="text-[9px] text-radar-muted font-mono">{activeColors.amber}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="color"
                    value={activeColors.amber}
                    onChange={(e) => setThemeAccentColor(guiTheme, 'amber', e.target.value)}
                    className="w-7 h-7 rounded border border-radar-border cursor-pointer bg-transparent p-0"
                  />
                </div>
              </div>

              {/* Muted Text / High Readability */}
              <div className="bg-radar-panel p-2 rounded border border-radar-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">{t.accentMuted}</div>
                  <div className="text-[9px] text-radar-muted font-mono">{activeColors.muted}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <input
                    type="color"
                    value={activeColors.muted}
                    onChange={(e) => setThemeAccentColor(guiTheme, 'muted', e.target.value)}
                    className="w-7 h-7 rounded border border-radar-border cursor-pointer bg-transparent p-0"
                  />
                </div>
              </div>
            </div>

            {/* Real-time live preview strip */}
            <div className="p-2.5 bg-radar-panel rounded border border-radar-border flex items-center justify-between text-[10px] font-mono">
              <span className="text-radar-muted uppercase font-bold">Aperçu :</span>
              <span className="font-extrabold text-radar-green">AFR123</span>
              <span className="font-bold text-radar-cyan">FL350</span>
              <span className="font-bold text-radar-amber">↑ 1800 FPM</span>
              <span className="text-radar-muted font-bold">ALT BARO (260 KT)</span>
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

          {/* MODULE 4.2 : Détection de Conflit (STCA) */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="font-bold text-radar-amber mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-radar-amber" />
              <span>STCA &amp; ALERTES DE PROXIMITÉ (ICAO)</span>
            </div>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-radar-muted text-xs">
                Activer l'analyse de conflit en temps réel (&lt; 5 NM / &lt; 1000 FT)
              </span>
              <input
                type="checkbox"
                checked={stcaEnabled}
                onChange={(e) => setStcaEnabled(e.target.checked)}
                className="accent-radar-amber cursor-pointer w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-radar-muted text-xs flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-radar-cyan" />
                Bip sonore discret d'avertissement ATC
              </span>
              <input
                type="checkbox"
                checked={stcaAudioEnabled}
                onChange={(e) => setStcaAudioEnabled(e.target.checked)}
                disabled={!stcaEnabled}
                className="accent-radar-cyan cursor-pointer w-4 h-4"
              />
            </label>
          </div>

          {/* MODULE 4.3 : Traînées d'Historique Radar */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="font-bold text-radar-cyan mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-radar-cyan" />
              <span>TRAÎNÉES D'HISTORIQUE &amp; RÉMANENCE PHOSPHORE</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {(
                [
                  { id: 'off', label: 'OFF' },
                  { id: '1min', label: '1 MIN' },
                  { id: '3min', label: '3 MIN' },
                  { id: 'all', label: 'TOUT' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setTrailLengthMode(m.id)}
                  className={`py-1.5 rounded text-[10px] font-bold border transition-colors ${
                    trailLengthMode === m.id
                      ? 'bg-radar-cyan text-radar-bg border-radar-cyan font-black'
                      : 'bg-radar-panel text-radar-muted border-radar-border hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-radar-muted opacity-80">
              Affiche les positions radar récentes sous forme de pastilles dégressives s'estompant avec le temps.
            </div>
          </div>

          {/* MODULE 4.4 : Personnalisation des Étiquettes Radar (Tags) */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="font-bold text-radar-green mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-radar-green" />
              <span>ÉTIQUETTES RADAR (TAGS) &amp; DÉCLUTTER</span>
            </div>

            {/* Mode d'affichage */}
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'compact', label: 'COMPACT' },
                  { id: 'standard', label: 'STANDARD' },
                  { id: 'extended', label: 'ÉTENDU' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTagDisplayMode(mode.id)}
                  className={`py-1.5 rounded text-[10px] font-bold border transition-colors ${
                    tagDisplayMode === mode.id
                      ? 'bg-radar-green text-radar-bg border-radar-green font-black'
                      : 'bg-radar-panel text-radar-muted border-radar-border hover:text-white'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Anti-chevauchement */}
            <label className="flex items-center justify-between cursor-pointer pt-1">
              <span className="text-radar-muted text-xs">
                Lignes de rappel intelligentes (anti-chevauchement auto)
              </span>
              <input
                type="checkbox"
                checked={autoDeconflictTags}
                onChange={(e) => setAutoDeconflictTags(e.target.checked)}
                className="accent-radar-green cursor-pointer w-4 h-4"
              />
            </label>
          </div>

          {/* MODULE 4.5 : Exportation des Données de Session */}
          <div className="space-y-2 bg-radar-surface/60 p-3 rounded border border-radar-border">
            <div className="font-bold text-radar-cyan mb-2 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-radar-cyan" />
              <span>EXPORTATION DE SESSION &amp; DONNÉES RADAR</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportSessionCsv(aircraftList, alertEntries)}
                className="py-1.5 px-3 rounded bg-radar-panel border border-radar-border hover:border-radar-cyan text-radar-cyan font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>EXPORTER EN CSV</span>
              </button>
              <button
                type="button"
                onClick={() => exportSessionJson(aircraftList, alertEntries, currentAirport?.icao)}
                className="py-1.5 px-3 rounded bg-radar-panel border border-radar-border hover:border-radar-green text-radar-green font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileJson className="w-4 h-4" />
                <span>EXPORTER EN JSON</span>
              </button>
            </div>
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
