# barra-consumo

Mod para Claude Code que muestra, encima del cuadro de texto, una barra con cuánto llevas gastado y cuánto te queda de cada límite de uso de Claude (5 horas y 7 días), cuándo se reinicia cada uno y el coste estimado de la sesión.

```
5 horas █████████░░░░░░░░░░░ 45% usado · queda 55% · se reinicia en 2 h 13 min
7 días  ████░░░░░░░░░░░░░░░░ 20% usado · queda 80% · se reinicia en 4 d 6 h
Esta sesión: $1.50
```

La barra es verde por debajo del 70 %, amarilla hasta el 90 % y roja a partir de ahí. Los datos se actualizan tras cada respuesta. Funciona solo en Claude Code, no en el chat normal de Claude.

## Instalación

**App de escritorio (pestaña Code):** pulsa **+** junto al cuadro de texto → **Plugins** → **Add marketplace** → escribe `alefex99/barra-consumo` → **Add plugin**.

**Terminal:**

```
/plugin install barra-consumo --marketplace alefex99/barra-consumo
```
