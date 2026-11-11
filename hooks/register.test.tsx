import { expect, test } from 'claude-code/testing'

const BANDA = {
  plugin: 'barra-consumo',
  component: 'AbovePrompt',
  requestId: 'above-prompt',
  props: { hasSurvey: false, view: {} },
} as const

test('la barra muestra lo usado y lo que queda', async ($, on) => {
  on('session.usage', () => ({
    value: {
      startedAt: 0,
      context: {},
      rateLimits: [{ kind: 'five_hour', percentUsed: 40 }],
      cost: { usd: 1.5 },
    },
  }))
  on('clock.now', () => ({ value: 0 }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  for (const surface of ['terminal', 'desktop', 'vscode', 'mobile'] as const) {
    const ui = await $.ui.mount({ ...BANDA, surface })

    expect((await ui.find({ type: 'Text', text: /40% usado · queda 60%/ }))?.text).toContain('5 horas')
    expect((await ui.find({ type: 'Text', text: /\$1\.50/ }))?.text).toBe('Esta sesión: $1.50')
    await ui.unmount()
  }
})
