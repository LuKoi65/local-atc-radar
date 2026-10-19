async function test() {
  const res = await fetch(`https://www.flightaware.com/live/flight/AFR6124`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });
  const html = await res.text();

  // Pattern 1: targeting
  const destIcao = html.match(/setTargeting\(['"]destination['"],\s*['"]([^'"]+)['"]\)/)?.[1];
  const destIata = html.match(/setTargeting\(['"]destination_IATA['"],\s*['"]([^'"]+)['"]\)/)?.[1];
  const origIcao = html.match(/setTargeting\(['"]origin['"],\s*['"]([^'"]+)['"]\)/)?.[1];
  const origIata = html.match(/setTargeting\(['"]origin_IATA['"],\s*['"]([^'"]+)['"]\)/)?.[1];

  console.log('Targeting Route:', { origIcao, origIata, destIcao, destIata });

  // Pattern 2: trackpollBootstrap JSON
  const bootstrapMatch = html.match(/var\s+trackpollBootstrap\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (bootstrapMatch) {
    try {
      const data = JSON.parse(bootstrapMatch[1]);
      const flights = Object.values(data.flights || {});
      if (flights.length > 0) {
        const f = flights[0];
        console.log('Bootstrap origin:', f.origin);
        console.log('Bootstrap destination:', f.destination);
      }
    } catch (e) {
      console.log('JSON parse error:', e.message);
    }
  }
}
test();
