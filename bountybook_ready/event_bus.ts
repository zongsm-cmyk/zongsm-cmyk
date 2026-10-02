export class EventBus<T extends Record<string, unknown[]>> {
  private listeners: Map<keyof T, Set<(...args: any[]) => void>> = new Map();

  on<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as (...args: any[]) => void);
  }

  off<K extends keyof T>(event: K, handler: (...args: T[K]) => void): void {
    const set = this.listeners.get(event);
    if (!set) return;
    set.delete(handler as (...args: any[]) => void);
    if (set.size === 0) this.listeners.delete(event);
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of [...set]) handler(...args);
  }
}
