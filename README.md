# chartjs-card

[![](https://img.shields.io/github/v/release/ricreis394/chartjs-card.svg?style=flat)](https://github.com/ricreis394/chartjs-card/releases/latest)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A Chart.js card for Home Assistant that allows you to create highly customizable graphs with templating support.

![](./img/example1.png)

## Installation

### HACS (recommended)

This card is not in the default HACS repository, but you can add it as a custom repository:

1. Open HACS in Home Assistant
2. Go to **Frontend**
3. Click the three dots in the upper right corner
4. Select **Custom repositories**
5. Paste this repository URL and select **Lovelace** as the category

## Configuration

| Name               | Type    | Required | Default | Description                                                                                                                                        |
| ------------------ | ------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`             | string  | **Yes**  |         | Must be `custom:chartjs-card`                                                                                                                      |
| `chart`            | string  | **Yes**  |         | Chart type (`bar`, `line`, `doughnut`, `pie`, etc.)                                                                                                |
| `data`             | object  | **Yes**  |         | Chart data configuration. Follows [Chart.js data structure](https://www.chartjs.org/docs/4.5.1/general/data-structures.html). Supports templating. |
| `options`          | object  | No       |         | Chart options. Follows [Chart.js options](https://www.chartjs.org/docs/4.5.1/configuration/).                                                      |
| `entity_row`       | boolean | No       | `false` | Render as an entity row instead of a standalone card.                                                                                              |
| `custom_options`   | object  | No       |         | Card-specific options (see below).                                                                                                                 |
| `register_plugins` | array   | No       |         | List of additional plugins to register (see [Plugins](#plugins)).                                                                                  |

For full Chart.js configuration options, see the [Chart.js 4.5.1 documentation](https://www.chartjs.org/docs/4.5.1/configuration/).

### Custom Options

| Name         | Type    | Default | Description                    |
| ------------ | ------- | ------- | ------------------------------ |
| `showLegend` | boolean | `true`  | Show or hide the chart legend. |

## Templating

Values wrapped in `${...}` are evaluated as JavaScript expressions. This allows dynamic data binding.

### Available variables

| Variable | Description                                   |
| -------- | --------------------------------------------- |
| `hass`   | The Home Assistant object                     |
| `states` | Shortcut to `hass.states` (all entity states) |
| `user`   | Shortcut to `hass.user` (current user info)   |

### Accessing entity states

```js
${states["sensor.example"].state}
```

### Accessing entity attributes

```js
${states["sensor.example"].attributes.data}
```

### Parsing arrays

Convert a string to an array (useful when you have Array data as string):

```js
${'[12, 14, 2, 4]'}
```

Arrays can also be used directly:

```js
${[12, 14, 2, 4]}
```

## Plugins

The following Chart.js plugins are bundled and can be enabled:

| Plugin       | Documentation                                                                          |
| ------------ | -------------------------------------------------------------------------------------- |
| `zoom`       | [chartjs-plugin-zoom](https://www.chartjs.org/chartjs-plugin-zoom/latest/)             |
| `annotation` | [chartjs-plugin-annotation](https://www.chartjs.org/chartjs-plugin-annotation/latest/) |

To use a plugin, register it in your card configuration:

```yaml
register_plugins:
  - zoom
  - annotation
```

## Examples

### Bar chart with dynamic data

![](./img/example1.png)

```yaml
type: custom:chartjs-card
chart: bar
data:
  datasets:
    - backgroundColor: ${states["sensor.chartjs_energy_last_30_days"].attributes.colors}
      borderWidth: 1
      data: ${states["sensor.chartjs_energy_last_30_days"].attributes.data}
      label: Eletricidade
  labels: ${states["sensor.chartjs_energy_last_30_days"].attributes.labels}
custom_options:
  showLegend: false
options:
  plugins:
    title:
      display: true
      text: Consumo energético (últimos 30 dias)
entity_row: false
```

### Stacked bar chart with multiple datasets

![](./img/example2.png)

```yaml
type: custom:chartjs-card
chart: bar
custom_options:
  showLegend: false
data:
  datasets:
    - backgroundColor: '#2fabe0'
      borderWidth: 1
      data:
        - 10
        - 11
        - 10
        - 9
        - 9.6
        - 9
        - 11
      label: Lavar roupa
    - backgroundColor: '#fcba03'
      borderWidth: 1
      data:
        - 2
        - 3
        - 5
        - 2
        - 3
        - 3
        - 5
      label: Frigorífico
    - backgroundColor: '#c8ed11'
      borderWidth: 1
      data:
        - 5
        - 6
        - 5
        - 7
        - 3
        - 4
        - 5
      label: Placa
  labels:
    - >-
      ${new Date(new Date().setDate(new
      Date().getDate()-6)).toLocaleString("pt-PT", {weekday: "short"})}
    - >-
      ${new Date(new Date().setDate(new
      Date().getDate()-5)).toLocaleString("pt-PT", {weekday: "short"})}
    - >-
      ${new Date(new Date().setDate(new
      Date().getDate()-4)).toLocaleString("pt-PT", {weekday: "short"})}
    - >-
      ${new Date(new Date().setDate(new
      Date().getDate()-3)).toLocaleString("pt-PT", {weekday: "short"})}
    - >-
      ${new Date(new Date().setDate(new
      Date().getDate()-2)).toLocaleString("pt-PT", {weekday: "short"})}
    - >-
      ${new Date(new Date().setDate(new
      Date().getDate()-1)).toLocaleString("pt-PT", {weekday: "short"})}
    - '${new Date().toLocaleString("pt-PT", {weekday: "short"})}'
entity_row: false
options:
  scales:
    x:
      scaleLabel:
        display: true
        fontStyle: initial
        labelString: Dias
    'y':
      scaleLabel:
        display: true
        fontStyle: initial
        labelString: Horas
      ticks:
        beginAtZero: true
  plugins:
    title:
      display: true
      text: |
        Consumo por semana
```

### Doughnut chart with entity data

![](./img/example3.png)

```yaml
type: custom:chartjs-card
chart: doughnut
custom_options:
  showLegend: true
data:
  datasets:
    - backgroundColor:
        - '#32a852'
        - '#3271a8'
        - '#9044db'
        - '#dbbd44'
        - '#6533ab'
        - '#364534'
        - '#db330d'
      borderColor: var(--paper-card-background-color)
      borderWidth: 1
      data:
        - ${states["sensor.energy_daily_placa"].state}
        - ${states["sensor.energy_daily_fridge"].state}
        - ${states["sensor.energy_daily_oven"].state}
        - ${states["sensor.energy_daily_microwave"].state}
        - ${states["sensor.energy_daily_dishwasher"].state}
        - ${states["sensor.energy_daily_washing_machine"].state}
        - ${states["sensor.energy_daily_drying_machine"].state}
      hoverBorderColor: var(--paper-card-background-color)
  labels:
    - Placa
    - Frigorifico
    - Forno
    - Micro-ondas
    - Máq. lavar loiça
    - Máq. lavar roupa
    - Máq. secar roupa
options:
  plugins:
    legend:
      position: left
    title:
      display: true
      text: Consumo energético (hoje)
```
