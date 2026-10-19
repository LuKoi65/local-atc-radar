/**
 * ICAO 24-bit Aircraft Address to Country & Flag Decoder
 * Decodes hex allocation blocks specified in ICAO Annex 10 (Volume III, Chapter 9).
 */

interface HexRange {
  start: number;
  end: number;
  country: string;
  flag: string;
  code: string;
}

const ICAO_RANGES: HexRange[] = [
  // Afrique du Nord & Moyen-Orient
  { start: 0x020000, end: 0x027fff, country: 'Maroc', flag: '🇲🇦', code: 'MA' },
  { start: 0x0a0000, end: 0x0a7fff, country: 'Algérie', flag: '🇩🇿', code: 'DZ' },
  { start: 0x028000, end: 0x02ffff, country: 'Tunisie', flag: '🇹🇳', code: 'TN' },
  { start: 0x010000, end: 0x017fff, country: 'Égypte', flag: '🇪🇬', code: 'EG' },
  { start: 0x018000, end: 0x01ffff, country: 'Libye', flag: '🇱🇾', code: 'LY' },
  { start: 0x008000, end: 0x00ffff, country: 'Afrique du Sud', flag: '🇿🇦', code: 'ZA' },
  { start: 0x038000, end: 0x038fff, country: "Côte d'Ivoire", flag: '🇨🇮', code: 'CI' },
  { start: 0x068000, end: 0x068fff, country: 'Sénégal', flag: '🇸🇳', code: 'SN' },
  { start: 0x034000, end: 0x034fff, country: 'Cameroun', flag: '🇨🇲', code: 'CM' },
  { start: 0x062000, end: 0x062fff, country: 'Nigéria', flag: '🇳🇬', code: 'NG' },
  { start: 0x048000, end: 0x048fff, country: 'Kenya', flag: '🇰🇪', code: 'KE' },
  { start: 0x054000, end: 0x054fff, country: 'Mali', flag: '🇲🇱', code: 'ML' },
  { start: 0x058000, end: 0x058fff, country: 'Mauritanie', flag: '🇲🇷', code: 'MR' },
  { start: 0x05a000, end: 0x05afff, country: 'Maurice', flag: '🇲🇺', code: 'MU' },
  { start: 0x050000, end: 0x050fff, country: 'Madagascar', flag: '🇲🇬', code: 'MG' },
  { start: 0x03e000, end: 0x03efff, country: 'Gabon', flag: '🇬🇦', code: 'GA' },
  { start: 0x078000, end: 0x078fff, country: 'Tchad', flag: '🇹🇩', code: 'TD' },
  { start: 0x07a000, end: 0x07afff, country: 'Togo', flag: '🇹🇬', code: 'TG' },
  { start: 0x088000, end: 0x088fff, country: 'Cap-Vert', flag: '🇨🇻', code: 'CV' },

  // Europe de l'Ouest & Sud
  { start: 0x380000, end: 0x3affff, country: 'France', flag: '🇫🇷', code: 'FR' },
  { start: 0x340000, end: 0x37ffff, country: 'Espagne', flag: '🇪🇸', code: 'ES' },
  { start: 0x300000, end: 0x33ffff, country: 'Italie', flag: '🇮🇹', code: 'IT' },
  { start: 0x490000, end: 0x497fff, country: 'Portugal', flag: '🇵🇹', code: 'PT' },
  { start: 0x400000, end: 0x43ffff, country: 'Royaume-Uni', flag: '🇬🇧', code: 'GB' },
  { start: 0x4c8000, end: 0x4cffff, country: 'Irlande', flag: '🇮🇪', code: 'IE' },
  { start: 0x3c0000, end: 0x3fffff, country: 'Allemagne', flag: '🇩🇪', code: 'DE' },
  { start: 0x448000, end: 0x44ffff, country: 'Belgique', flag: '🇧🇪', code: 'BE' },
  { start: 0x480000, end: 0x487fff, country: 'Pays-Bas', flag: '🇳🇱', code: 'NL' },
  { start: 0x4d0000, end: 0x4d1fff, country: 'Luxembourg', flag: '🇱🇺', code: 'LU' },
  { start: 0x4a8000, end: 0x4affff, country: 'Suisse', flag: '🇨🇭', code: 'CH' },
  { start: 0x440000, end: 0x447fff, country: 'Autriche', flag: '🇦🇹', code: 'AT' },
  { start: 0x3b0000, end: 0x3bffff, country: 'Monaco', flag: '🇲🇨', code: 'MC' },
  { start: 0x4d4000, end: 0x4d4fff, country: 'Malte', flag: '🇲🇹', code: 'MT' },
  { start: 0x4d2000, end: 0x4d3fff, country: 'Islande', flag: '🇮🇸', code: 'IS' },
  { start: 0x500000, end: 0x5003ff, country: 'Saint-Marin', flag: '🇸🇲', code: 'SM' },

  // Europe du Nord & Scandinavie
  { start: 0x478000, end: 0x47ffff, country: 'Norvège', flag: '🇳🇴', code: 'NO' },
  { start: 0x4a0000, end: 0x4a7fff, country: 'Suède', flag: '🇸🇪', code: 'SE' },
  { start: 0x458000, end: 0x45ffff, country: 'Danemark', flag: '🇩🇰', code: 'DK' },
  { start: 0x460000, end: 0x467fff, country: 'Finlande', flag: '🇫🇮', code: 'FI' },

  // Europe Centrale & Orientale
  { start: 0x488000, end: 0x48ffff, country: 'Pologne', flag: '🇵🇱', code: 'PL' },
  { start: 0x540000, end: 0x54ffff, country: 'Rép. Tchèque', flag: '🇨🇿', code: 'CZ' },
  { start: 0x505c00, end: 0x505fff, country: 'Slovaquie', flag: '🇸🇰', code: 'SK' },
  { start: 0x530000, end: 0x537fff, country: 'Slovaquie', flag: '🇸🇰', code: 'SK' },
  { start: 0x470000, end: 0x477fff, country: 'Hongrie', flag: '🇭🇺', code: 'HU' },
  { start: 0x498000, end: 0x49ffff, country: 'Roumanie', flag: '🇷🇴', code: 'RO' },
  { start: 0x450000, end: 0x457fff, country: 'Bulgarie', flag: '🇧🇬', code: 'BG' },
  { start: 0x468000, end: 0x46ffff, country: 'Grèce', flag: '🇬🇷', code: 'GR' },
  { start: 0x4b8000, end: 0x4bffff, country: 'Chypre', flag: '🇨🇾', code: 'CY' },
  { start: 0x4b0000, end: 0x4b7fff, country: 'Turquie', flag: '🇹🇷', code: 'TR' },
  { start: 0x4c0000, end: 0x4c7fff, country: 'Serbie', flag: '🇷🇸', code: 'RS' },
  { start: 0x501c00, end: 0x501fff, country: 'Croatie', flag: '🇭🇷', code: 'HR' },
  { start: 0x510000, end: 0x517fff, country: 'Croatie', flag: '🇭🇷', code: 'HR' },
  { start: 0x506c00, end: 0x506fff, country: 'Slovénie', flag: '🇸🇮', code: 'SI' },
  { start: 0x538000, end: 0x53ffff, country: 'Slovénie', flag: '🇸🇮', code: 'SI' },
  { start: 0x518000, end: 0x51ffff, country: 'Estonie', flag: '🇪🇪', code: 'EE' },
  { start: 0x502c00, end: 0x502fff, country: 'Lettonie', flag: '🇱🇻', code: 'LV' },
  { start: 0x520000, end: 0x527fff, country: 'Lettonie', flag: '🇱🇻', code: 'LV' },
  { start: 0x503c00, end: 0x503fff, country: 'Lituanie', flag: '🇱🇹', code: 'LT' },
  { start: 0x528000, end: 0x52ffff, country: 'Lituanie', flag: '🇱🇹', code: 'LT' },
  { start: 0x508000, end: 0x50ffff, country: 'Ukraine', flag: '🇺🇦', code: 'UA' },
  { start: 0x140000, end: 0x15ffff, country: 'Russie', flag: '🇷🇺', code: 'RU' },

  // Moyen-Orient
  { start: 0x730000, end: 0x737fff, country: 'Israël', flag: '🇮🇱', code: 'IL' },
  { start: 0x738000, end: 0x73ffff, country: 'Jordanie', flag: '🇯🇴', code: 'JO' },
  { start: 0x740000, end: 0x747fff, country: 'Liban', flag: '🇱🇧', code: 'LB' },
  { start: 0x720000, end: 0x727fff, country: 'Irak', flag: '🇮🇶', code: 'IQ' },
  { start: 0x728000, end: 0x72ffff, country: 'Iran', flag: '🇮🇷', code: 'IR' },
  { start: 0x790000, end: 0x797fff, country: 'Arabie Saoudite', flag: '🇸🇦', code: 'SA' },
  { start: 0x896000, end: 0x896fff, country: 'Émirats Arabes Unis', flag: '🇦🇪', code: 'AE' },
  { start: 0x898000, end: 0x898fff, country: 'Qatar', flag: '🇶🇦', code: 'QA' },
  { start: 0x894000, end: 0x894fff, country: 'Bahreïn', flag: '🇧🇭', code: 'BH' },
  { start: 0x706000, end: 0x706fff, country: 'Koweït', flag: '🇰🇼', code: 'KW' },
  { start: 0x70c000, end: 0x70cfff, country: 'Oman', flag: '🇴🇲', code: 'OM' },

  // Asie & Océanie
  { start: 0x780000, end: 0x78ffff, country: 'Chine', flag: '🇨🇳', code: 'CN' },
  { start: 0x840000, end: 0x87ffff, country: 'Japon', flag: '🇯🇵', code: 'JP' },
  { start: 0x710000, end: 0x717fff, country: 'Corée du Sud', flag: '🇰🇷', code: 'KR' },
  { start: 0x800000, end: 0x80ffff, country: 'Inde', flag: '🇮🇳', code: 'IN' },
  { start: 0x768000, end: 0x76ffff, country: 'Singapour', flag: '🇸🇬', code: 'SG' },
  { start: 0x748000, end: 0x74ffff, country: 'Malaisie', flag: '🇲🇾', code: 'MY' },
  { start: 0x880000, end: 0x887fff, country: 'Thaïlande', flag: '🇹🇭', code: 'TH' },
  { start: 0x760000, end: 0x767fff, country: 'Philippines', flag: '🇵🇭', code: 'PH' },
  { start: 0x7a0000, end: 0x7a7fff, country: 'Indonésie', flag: '🇮🇩', code: 'ID' },
  { start: 0x7c0000, end: 0x7cffff, country: 'Australie', flag: '🇦🇺', code: 'AU' },
  { start: 0xc80000, end: 0xc87fff, country: 'Nouvelle-Zélande', flag: '🇳🇿', code: 'NZ' },

  // Amériques
  { start: 0xa00000, end: 0xafffff, country: 'États-Unis', flag: '🇺🇸', code: 'US' },
  { start: 0xc00000, end: 0xc3ffff, country: 'Canada', flag: '🇨🇦', code: 'CA' },
  { start: 0x0d0000, end: 0x0d7fff, country: 'Mexique', flag: '🇲🇽', code: 'MX' },
  { start: 0xe40000, end: 0xe4ffff, country: 'Brésil', flag: '🇧🇷', code: 'BR' },
  { start: 0xe00000, end: 0xe3ffff, country: 'Argentine', flag: '🇦🇷', code: 'AR' },
  { start: 0xe80000, end: 0xe8ffff, country: 'Chili', flag: '🇨🇱', code: 'CL' },
  { start: 0x0b2000, end: 0x0b2fff, country: 'Colombie', flag: '🇨🇴', code: 'CO' },
  { start: 0x0e0000, end: 0x0e3fff, country: 'Venezuela', flag: '🇻🇪', code: 'VE' },
  { start: 0x0d8000, end: 0x0d8fff, country: 'Pérou', flag: '🇵🇪', code: 'PE' },
  { start: 0x0b6000, end: 0x0b6fff, country: 'Cuba', flag: '🇨🇺', code: 'CU' },
  { start: 0x0b8000, end: 0x0b8fff, country: 'Rép. Dominicaine', flag: '🇩🇴', code: 'DO' },
  { start: 0x0ca000, end: 0x0cafff, country: 'Panama', flag: '🇵🇦', code: 'PA' },
  { start: 0x0b4000, end: 0x0b4fff, country: 'Costa Rica', flag: '🇨🇷', code: 'CR' },
];

export function decodeIcaoCountry(hex: string): { country: string; flag: string; code: string } {
  const cleanHex = hex.trim().replace(/^~/, '');
  const val = parseInt(cleanHex, 16);
  if (isNaN(val)) {
    return { country: 'Inconnu', flag: '🌐', code: 'XX' };
  }

  for (const range of ICAO_RANGES) {
    if (val >= range.start && val <= range.end) {
      return { country: range.country, flag: range.flag, code: range.code };
    }
  }

  return { country: 'International', flag: '🌐', code: 'INT' };
}
