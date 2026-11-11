export type Limite = { kind: string; percentUsed: number; resetsAt?: string }

export type Consumo = { limites: Limite[]; usd: number | null }

declare module 'claude-code' {
  interface PluginState {
    'barra-consumo': { consumo: Consumo | null }
  }
}
