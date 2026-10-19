export interface FlightRoute {
  flight: string;
  originIata?: string;
  originIcao?: string;
  originCity: string;
  destIata?: string;
  destIcao?: string;
  destCity: string;
  formattedRoute: string;
}

class RouteService {
  private cache: Map<string, FlightRoute | null> = new Map();
  private pending: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getCachedRoute(flight: string): FlightRoute | null | undefined {
    const clean = flight.trim().replace(/\s+/g, '').toUpperCase();
    return this.cache.get(clean);
  }

  public async fetchRoute(flight: string): Promise<FlightRoute | null> {
    const clean = flight.trim().replace(/\s+/g, '').toUpperCase();
    if (!clean || clean.length < 3) return null;

    if (this.cache.has(clean)) {
      return this.cache.get(clean) || null;
    }

    if (this.pending.has(clean)) {
      return null;
    }

    this.pending.add(clean);
    try {
      const res = await fetch(`/api/traffic/route?flight=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data: FlightRoute = await res.json();
        this.cache.set(clean, data);
        this.notify();
        return data;
      } else {
        this.cache.set(clean, null);
      }
    } catch (err) {
      this.cache.set(clean, null);
    } finally {
      this.pending.delete(clean);
    }

    return null;
  }

  public async requestBatch(flights: string[]): Promise<void> {
    const toFetch = flights
      .map((f) => f.trim().replace(/\s+/g, '').toUpperCase())
      .filter((f) => f && f.length >= 3 && !this.cache.has(f) && !this.pending.has(f))
      .slice(0, 10);

    if (toFetch.length === 0) return;

    toFetch.forEach((f) => this.pending.add(f));

    try {
      const res = await fetch(`/api/traffic/route?flights=${encodeURIComponent(toFetch.join(','))}`);
      if (res.ok) {
        const results: Record<string, FlightRoute> = await res.json();
        toFetch.forEach((f) => {
          this.cache.set(f, results[f] || null);
        });
        this.notify();
      }
    } catch (err) {
      // Graceful
    } finally {
      toFetch.forEach((f) => this.pending.delete(f));
    }
  }
}

export const routeService = new RouteService();
