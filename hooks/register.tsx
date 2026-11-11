import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Consumo, Limite } from '../types'

const consumo = atom({ plugin: 'barra-consumo', key: 'consumo' } as const, null, {
  shape: 'consumo-1',
})

const ANCHO = 20

const NOMBRES: Record<string, string> = {
  five_hour: '5 horas',
  seven_day: '7 días',
  spend_limit: 'Gasto',
}

const barra = (usado: number): string => {
  const llenos = Math.round((Math.min(100, Math.max(0, usado)) / 100) * ANCHO)

  return '█'.repeat(llenos) + '░'.repeat(ANCHO - llenos)
}

const color = (usado: number): string =>
  usado >= 90 ? 'error' : usado >= 70 ? 'warning' : 'success'

const redondear = (valor: number): number => Math.round(valor * 10) / 10

const reinicio = (resetsAt: string | undefined, ahora: number): string => {
  const momento = resetsAt === undefined ? NaN : Date.parse(resetsAt)

  if (Number.isNaN(momento)) {
    return ''
  }

  const minutos = Math.max(0, Math.ceil((momento - ahora) / 60_000))
  const dias = Math.floor(minutos / 1440)
  const horas = Math.floor((minutos % 1440) / 60)
  const resto = minutos % 60

  if (dias > 0) {
    return ` · se reinicia en ${dias} d ${horas} h`
  }

  return horas > 0
    ? ` · se reinicia en ${horas} h ${resto} min`
    : ` · se reinicia en ${resto} min`
}

const leer = (limites: readonly Limite[], usd: number | undefined): Consumo => ({
  limites: limites.map(({ kind, percentUsed, resetsAt }) => ({
    kind,
    percentUsed,
    ...(resetsAt === undefined ? {} : { resetsAt }),
  })),
  usd: usd ?? null,
})

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const uso = await $.session.usage()
    await update($, consumo, () => leer(uso.rateLimits, uso.cost?.usd))

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await update($, consumo, () => leer(e.rateLimits, e.cost?.usd))

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const datos = await read($, consumo)

    if (e.props.hasSurvey || datos === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const ahora = await $.clock.now()
    const coste = datos.usd === null ? null : `Esta sesión: $${datos.usd.toFixed(2)}`

    return (
      <Box flexDirection="column">
        {datos.limites.length === 0 && (
          <Text dimColor>Límites de uso: aún sin datos (llegan con la próxima respuesta)</Text>
        )}
        {datos.limites.map(limite => (
          <Text>
            <Text>{(NOMBRES[limite.kind] ?? limite.kind).padEnd(8)}</Text>
            <Text color={color(limite.percentUsed)}>{barra(limite.percentUsed)}</Text>
            <Text>
              {' '}
              {redondear(limite.percentUsed)}% usado · queda{' '}
              {redondear(Math.max(0, 100 - limite.percentUsed))}%
            </Text>
            <Text dimColor>{reinicio(limite.resetsAt, ahora)}</Text>
          </Text>
        ))}
        {coste !== null && <Text dimColor>{coste}</Text>}
      </Box>
    )
  })
}
