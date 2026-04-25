# BenchKit

BenchKit is a single GitHub Pages-ready static lab toolkit with two browser apps:

- `platemaster/` for well plate design and export
- `hydrogel/` for dual-syringe hydrogel batch calculation

## Repo Structure

```text
/
|-- index.html
|-- css/
|   `-- style.css
|-- js/
|   `-- main.js
|-- platemaster/
|   |-- index.html
|   |-- style.css
|   `-- app.js
|-- hydrogel/
|   |-- index.html
|   |-- style.css
|   `-- script.js
`-- README.md
```

## Included Features

### PlateMaster

- 6, 12, 24, 48, 96, and 384-well formats
- Group x time point x biological replicate x technical replicate layout logic
- Optional reserved control column
- PNG, CSV, and TXT export
- Clear overflow warning when the requested layout exceeds plate capacity

### Hydrogel Calculator

- Real-time GelMA, fibrinogen, and thrombin stock calculations
- Separate Syringe A and Syringe B recipe tables
- Top-up error handling when requested components exceed total volume
- PNG export of recipe cards
- Copy-summary and reset-to-defaults actions

## External Dependencies

The repo is plain HTML, CSS, and vanilla JavaScript. The only runtime dependencies are:

- Google Fonts
- `html2canvas` from CDN for PNG export

## Deploy

1. Push this repo to GitHub.
2. Open `Settings -> Pages`.
3. Publish from the main branch root.
