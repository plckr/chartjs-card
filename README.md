# chartjs-card
Chart.js card for Home Assistant

## [Chart.js documentation](https://www.chartjs.org/docs/2.9.3/)
### **IMPORTANT** This card uses chart.js 2.9.3, when looking for the documentation, view the right version

![](./card.png)

## Instalation through HACS
This card isn't in HACS, but you can add it manually through `Custom repositories`

To do that just follow these steps: **HACS -> Frontend -> 3 dots (upper right corner) -> Custom repositories -> (Paste this github page url)**

## Config
| Name           | Type     | Default     | Description |
| -------------- | -------- | ----------- |------------ |
| chart          | string   |             | chart type  |
| data           |          |             | just like chart.js documentation, accepts Templates for all fields |
| options        |          |             | just like chart.js documentation |
| entitiy_row    | boolean  | false       | if is entity row or not |
| custom_options | object   |             | TODO |

[Chart.js documentation](https://www.chartjs.org/docs/2.9.3/)
**IMPORTANT** This card uses chart.js 2.9.3, when looking for the documentation, view the right version

### example 1
![](./img/example1.jpg)
```yaml
type: 'custom:chartjs-card'
chart: bar # Supports: ['line', 'radar', 'bar', 'horizontalBar', 'pie', 'doughnut', 'polarArea', 'bubble', 'scatter']
custom_options:
  showLegend: false
data: # everything inside represent the data to the chart like Chart.js docs
  datasets:
    - backgroundColor: var(--accent-color)
      borderWidth: 1
      data: '${states["sensor.energy_last_12_months"].attributes.data}' # ["650", "630", .... ]
      label: Eletricidade
  labels: '${states["sensor.energy_last_12_months"].attributes.labels}' # ["july", "august", .... ]
entity_row: false
options: # Same applies here like data above
  title:
    display: true
    text: Consumo energético (últimos 12 meses)
  scales:
    yAxes:
      - ticks:
          beginAtZero: true
```

### example 2
![](./img/example2.jpg)
```yaml
chart: doughnut
data:
  datasets:
    - data:
        - '${states["sensor.energy_daily_fridge"].state}'
        - '${states["sensor.energy_daily_dishwasher"].state}'
        - '${states["sensor.energy_daily_washing_machine"].state}'
        - '${states["sensor.energy_daily_drying_machine"].state}'
      backgroundColor:
        - '#32a852'
        - '#3271a8'
        - '#9044db'
        - '#dbbd44'
  labels:
    - Frigorifico
    - Máq. lavar loiça
    - Máq. lavar roupa
    - Máq. secar roupa
options:
  legend:
    position: left
  title:
    display: true
    text: Consumo energético (hoje)
type: 'custom:chartjs-card'

```