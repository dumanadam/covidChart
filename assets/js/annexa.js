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

// variables for storage and filtering
let rawCSVData,
  rejectedStates,
  chartjsdata = [];
let csvSplitByMonth = [];
let showOverlay = false;

//Reference months, [0] left empty to line up with calender month equivalent Jan == 1
const calendarMonths = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
];

document.getElementById("header-title").innerHTML = headerTitle;
document.getElementById("footer").innerHTML = footer;
document.getElementById("footer2").innerHTML = footer2;

/* 
Fetch the latest csv data from the Github page
and parse the CSV using the Papa Parse library. 
Convert to an array and  save it to rawCSVData.

Once saved, continue with extracting and filtering.
*/

Papa.parse(latestCSVUrl, {
  header: true,
  download: true,
  complete: function (results) {
    rawCSVData = results.data;
    createCSVObject();
    displaySubHeader();
    extractRecovered();
    chartjsdata.push(csvSplitByMonth[0].vicRecoveredChartData); //add the recovered totals so they dont need to be calculated again for display
    chartjsdata.push(csvSplitByMonth[0].WARecoveredChartData);
    displayCharts();

    fillList();
    console.log(csvSplitByMonth);
  },
});

/* 
Create the base object so filtered data can be stored. Function extracts the date string from the csv parsing and comparing it to calendarMonths array. 
This then creates the csvSplitByMonth object which is filled with filtered data.extractyMonthly is called to split object into months\state\days\recovered. 
*/

function createCSVObject(results) {
  csvSplitByMonth[0] = { recovered: undefined };
  for (let index = 1; index <= calendarMonths.length; index++) {
    csvSplitByMonth[index] = {
      [calendarMonths[index]]: {
        VIC: {
          raw: extractMonthly("VIC", index),
          recovered: undefined,
        },
        WA: {
          raw: extractMonthly("WA", index),
          recovered: undefined,
        },
        otherStates: rejectedStates,
      },
    };
  }
}

/* 
As createCSVObject creates the template reference object, this method is called to go through each month 
(passed as variable from createCSVObject) and compare it to each entry. If the month and state match,
then it is filtered into _monthcheck and returned to the reference object to be saved.
*/

function extractMonthly(state, month) {
  let _monthCheck;

  _monthCheck = rawCSVData.filter((day) => {
    if (
      parseInt(day.date.slice(minMonthPos, maxMonthPos)) == parseInt(month) &&
      day.state_abbrev == state
    ) {
      return day;
    }
  });

  return _monthCheck;
}

/* 
Once each day has been filtered into the correct month and state in the reference object, this method is called 
to loop through the [states] and then loop through the months in the CSV. Recovered totals are filtered, reduced and sent back to the refernce object
*/
function extractRecovered() {
  let vicRecoveredChartData = [];
  let WARecoveredChartData = [];
  let yearlytotals;
  let monthTotal;
  let accum = 0;

  states.map((state) => {
    //loop through each requested state
    for (let index = 1; index < calendarMonths.length; index++) {
      //begin looping through the months
      monthTotal = csvSplitByMonth[index][calendarMonths[index]][state].raw
        .map((day) => {
          // Go through each day and store recovered
          let _recoveredTotal = parseInt(day.recovered);
          return _recoveredTotal;
        })
        .reduce((accum, recovered) => {
          //Total the recovered
          return accum + recovered;
        });

      csvSplitByMonth[index][calendarMonths[index]][
        state
      ].recovered = monthTotal; //Write the months total to the object
      if (index <= calendarMonths.length + 1 && state == "VIC") {
        vicRecoveredChartData.push(monthTotal); //split each state into its own array
      } else {
        WARecoveredChartData.push(monthTotal);
      }
      yearlyTotals = {
        vicRecoveredChartData,
        WARecoveredChartData,
      };
    }
  });
  csvSplitByMonth[0] = yearlyTotals; // save to the reference Object
}

/* Goes through the states array and charts the data for each state to the display */

function displayCharts(state, overlay) {
  let colours = [];
  let lineState = 1;
  let lineDataset = {
    label: labelText,
    data: chartjsdata[lineState],
    backgroundColor: colours,
    fill: false,
    borderColor: "white",
    borderWidth: 2,
    hoverBorderWidth: 4,
    hoverBorderColor: "#FFF",
    pointBorderColor: "red",
    type: "line",
  };

  states.map((state) => {
    let currentState = states.findIndex((states) => states === state); //avoid hard coding states
    let ctx = document.getElementById(state.toLowerCase()).getContext("2d"); //match state array to html id
    let _months = calendarMonths.slice(1);

    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 14;
    Chart.defaults.global.defaultFontColor = "white";

    chartjsdata[currentState].map((dayRecVal) => {
      //go through each months data and push a colour according to the colour in settings
      if (dayRecVal < medColour) {
        colours.push(chartjsBarColours[0]);
      } else if (dayRecVal >= medColour && dayRecVal <= highColour) {
        colours.push(chartjsBarColours[1]);
      } else {
        colours.push(chartjsBarColours[2]);
      }
    });

    //create dataset
    let _datatsets = [
      {
        label: labelText,
        data: chartjsdata[currentState], //dynamically get data for each state
        backgroundColor: colours,
        borderColor: "white",
        borderWidth: 1,
        hoverBorderWidth: 4,
        hoverBorderColor: "#FFF",
      },
    ];

    if (state == "VIC" && overlay == true) {
      //if overlay is selected, push onto the dataset array
      _datatsets.push(lineDataset);
    } else if (overlay == true) {
      lineDataset = {
        ...lineDataset,
        data: chartjsdata[0],
      };
      _datatsets.push(lineDataset);
    }

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: _months,
        datasets: _datatsets,
      },
      options: {
        title: {
          display: true,
          text: getTime(state),
          fontSize: 18,
        },
        legend: {
          // position: "right",
          display: false,

          labels: {
            fontColor: "#000",
          },
          layout: {},
        },
      },
    });
  });
}

/*
This function creates the sub header pulling the first and last date
*/

function displaySubHeader() {
  let lastMonth = csvSplitByMonth.length - 2;

  const earliestDataDate =
    csvSplitByMonth[1][calendarMonths[1]][states[0]].raw[0].date;

  console.log("sdsdsdsd", earliestDataDate);

  let lastDay =
    csvSplitByMonth[lastMonth][calendarMonths[lastMonth]][states[0]].raw
      .length - 1;
  const latestDataDate =
    csvSplitByMonth[lastMonth][calendarMonths[lastMonth]][states[0]].raw[
      lastDay
    ].date;
  setTimeout(function () {
    document.getElementById("header-subtitle").innerHTML =
      "Data : " + earliestDataDate + " to " + latestDataDate;
    document.getElementById("header-subtitle").className = " text-light";
  }, 750);
}

/*
Fills the months for the select listbox
*/

function fillList() {
  const listBox = document.querySelector("#months-list");
  for (let index = 1; index <= calendarMonths.length; index++) {
    let newOption = new Option(calendarMonths[index], calendarMonths[index]);
    listBox.appendChild(newOption);
  }
}

/*
Function gets called to set the time for the chart title
*/
function getTime(state) {
  state = state == "VIC" ? "Melbourne" : "Perth"; //set the timezone dynamically
  let requestedTimezone = "Australia/" + state;

  let requestedTime = new Date().toLocaleString("en-US", {
    timeZone: requestedTimezone,
  });

  return state + " Recovered @ " + requestedTime; //return text + time
}

/*
Handle displaying the raw data and selectboxes
*/

const overlayButton = document.querySelector("#overlay-selection");
const selectElement = document.querySelector("#months-list");

overlayButton.addEventListener("click", (event) => {
  showOverlay = !showOverlay;

  console.log("sdsd", event.srcElement);

  document.getElementById("overlay-selection").innerHTML = showOverlay
    ? "Remove Overlay"
    : "Show State Overlay";
  if (showOverlay) {
    displayCharts("VIC", true);
  } else {
    displayCharts("VIC", false);
  }
});

selectElement.addEventListener("change", (event) => {
  let monthIndex = csvSplitByMonth.findIndex((index) => {
    return Object.keys(index) == event.target.value;
  });

  const selectBoxV = document.querySelector("#raw-list-v");
  const selectBoxW = document.querySelector("#raw-list-w");
  $("#raw-list-v").empty();
  $("#raw-list-w").empty();

  document.getElementById("vic-recovered-text").innerHTML =
    "Total recovered in Vic : " +
    csvSplitByMonth[0].vicRecoveredChartData[monthIndex - 1];
  document.getElementById("wa-recovered-text").innerHTML =
    "Total recovered in WA : " +
    csvSplitByMonth[0].WARecoveredChartData[monthIndex - 1];
  for (state in states) {
    for (
      let index = 1;
      index <=
      csvSplitByMonth[monthIndex][calendarMonths[monthIndex]][states[state]].raw
        .length;
      index++
    ) {
      let newOption = new Option(
        JSON.stringify(
          csvSplitByMonth[monthIndex][calendarMonths[monthIndex]][states[state]]
            .raw[index]
        ),
        index
      );
      if (state == 0) {
        selectBoxV.appendChild(newOption);
      } else {
        selectBoxW.appendChild(newOption);
      }
    }
  }
});
