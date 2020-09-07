# 2020 Grad Covid Tracker

> Annexa grad Tracker

> Display latest Covid Recoveries

[![Build Status](http://img.shields.io/travis/badges/badgerbadgerbadger.svg?style=flat-square)](https://travis-ci.org/badges/badgerbadgerbadger) [![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)
**_Overlay states_**
[![Talha](https://i.imgur.com/UvsMEQi.png)](https://i.imgur.com/UvsMEQi.png)

[![OPTIONAL OVERLAY](https://i.imgur.com/WbKSoZv.png)]()

## Table of Contents

- [Information](#information)
- [Settings](#settings)
- [Installation](#installation)
- [Features](#features)
- [License](#license)

---

## Information

Libraries used :

- Papa Parse for CSV parsing > https://www.papaparse.com/
- Chartjs for charting > https://www.chartjs.org/
- Bootstrap
- Jquery

Written in as much vanilla JS as possible.
Pulls the latest Covid data in CSV format
Formats into an object which is used in chartjs

---

## Settings (Optional)

To change any settings at the top of annexa.js are options to change colours, text and the source URL.

```javascript
//********************************* SETTINGS START********************************** */

//Update URL as required
let latestCSVUrl =
  "https://raw.githubusercontent.com/M3IT/COVID-19_Data/master/Data/COVID_AU_state_daily_change.csv";

// Text for Chart Title
const headerTitle = "2020 Grad Covid Tracker";
const labelText = "Monthly Recovered";
const footer = "Talha Sezgin - MIT license";
const footer2 = " Datasource >> " + latestCSVUrl;

//set colours for chart [low, med, high]
let chartjsBarColours = [
  "rgba(0, 255, 21, 0.39)",
  "rgba(214, 198, 41, 0.39)",
  "rgba(223, 32, 56, 0.39)",
];

//Set the ranges for  low med high colours
let medColour = 499;
let highColour = 1500;

// Month used for current CSV format to extract date. Adjustment only needed if CSV format changes
const minMonthPos = 5;
const maxMonthPos = 7;

//States to be charted
const states = ["VIC", "WA"];

//********************************* SETTINGS END********************************** */
```

---

## Installation

- All the `code` required to get going is in the repository
- copy + paste index.html, annexa,js and the assets folder
  or
- clone
- Open in your browser of choice (tested in FF)

---

## Features

- Button to overlay state over another
- Listbox dynamically shows recovered and raw data

---

## License

[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

- **[MIT license](http://opensource.org/licenses/mit-license.php)**
