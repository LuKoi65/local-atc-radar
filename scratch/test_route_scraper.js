async function getRoute(flight) {
  const clean = flight.trim().toUpperCase();
  try {
    const res = await fetch(`https://www.flightaware.com/live/flight/${clean}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Strategy 1: trackpollBootstrap JSON
    const bootstrapMatch = html.match(/var\s+trackpollBootstrap\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
    if (bootstrapMatch) {
      try {
        const data = JSON.parse(bootstrapMatch[1]);
        const flights = Object.values(data.flights || {});
        if (flights.length > 0) {
          const f = flights[0];
          const orig = f.origin || {};
          const dest = f.destination || {};
          
          const origCity = (orig.friendlyLocation || orig.friendlyName || '').split(',')[0].trim();
          const destCity = (dest.friendlyLocation || dest.friendlyName || '').split(',')[0].trim();

          if (origCity || destCity || orig.iata || dest.iata) {
            return {
              flight: clean,
              originIata: orig.iata || orig.altIdent || '',
              originIcao: orig.icao || '',
              originCity: origCity || orig.iata || '',
              destIata: dest.iata || dest.altIdent || '',
              destIcao: dest.icao || '',
              destCity: destCity || dest.iata || '',
            };
          }
        }
      } catch (e) {}
    }

    // Strategy 2: ad targeting regex
    const destIata = html.match(/setTargeting\(['"]destination_IATA['"],\s*['"]([^'"]+)['"]\)/)?.[1] || '';
    const destIcao = html.match(/setTargeting\(['"]destination['"],\s*['"]([^'"]+)['"]\)/)?.[1] || '';
    const origIata = html.match(/setTargeting\(['"]origin_IATA['"],\s*['"]([^'"]+)['"]\)/)?.[1] || '';
    const origIcao = html.match(/setTargeting\(['"]origin['"],\s*['"]([^'"]+)['"]\)/)?.[1] || '';

    if (origIata || destIata || origIcao || destIcao) {
      return {
        flight: clean,
        originIata,
        originIcao,
        originCity: origIata || origIcao,
        destIata,
        destIcao,
        destCity: destIata || destIcao,
      };
    }
  } catch (err) {
    console.error('Error fetching route:', err.message);
  }
  return null;
}

async function run() {
  const tests = ['AFR6124', 'RAM740X', 'RYR4574'];
  for (const t of tests) {
    const res = await getRoute(t);
    console.log(t, '=>', res);
  }
}
run();
