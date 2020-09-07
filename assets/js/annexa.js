// Text for Chart Title
let recoveryText = "Victorian Recoveries as of: ";

// variables for storage and filtering
let rawCSVData,
  rejectedStates,
  chartjsdata = [];
let csvSplitByMonth = [];

//set colours for chart [low, med, high]
let chartjsBarColours = [
  "rgba(0, 255, 21, 0.39)",
  "rgba(214, 198, 41, 0.39)",
  "rgba(223, 32, 56, 0.39)",
];
let medColour = 499;
let highColour = 1500;

// Month used for current CSV format to extract date. Adjust if CSV changes
const minMonthPos = 5;
const maxMonthPos = 7;

//States to be charted
const states = ["VIC", "WA"];

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

//Update URL as required
let latestCSVUrl =
  "https://raw.githubusercontent.com/M3IT/COVID-19_Data/master/Data/COVID_AU_state_daily_change.csv";

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
    //console.log(rawCSVData);
    createCSVObject();
    extractRecovered();

    chartjsdata.push(csvSplitByMonth[0].vicRecoveredChartData);
    chartjsdata.push(csvSplitByMonth[0].WARecoveredChartData);
    //console.log(csvSplitByMonth[0].vicRecoveredChartData);
    //  console.log("chart", chartjsdata);
    // createChart();
    displayCharts();
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
          let _recoveredTotal = parseInt(day.recovered);
          return _recoveredTotal;
        })
        .reduce((accum, recovered) => {
          return accum + recovered;
        });

      csvSplitByMonth[index][calendarMonths[index]][
        state
      ].recovered = monthTotal;
      if (index <= calendarMonths.length + 1 && state == "VIC") {
        //split each state into its own array
        vicRecoveredChartData.push(monthTotal);
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

/* Begin filtering by 
month */

function displayCharts(state) {
  let colours = [];

  states.map((state) => {
    let currentState = states.findIndex((states) => states === state); //avoid hard coding states
    recoveryText += " <local time in Victoria>";
    console.log(state);
    var ctx = document.getElementById(state.toLowerCase()).getContext("2d");
    console.log(ctx);
    let _months = calendarMonths.slice(1);
    console.log(
      "asdasdasd>>>",
      states.findIndex((states) => states === state)
    );

    chartjsdata[currentState].map((dayRecVal) => {
      if (dayRecVal < medColour) {
        colours.push(chartjsBarColours[0]);
      } else if (dayRecVal >= medColour && dayRecVal <= highColour) {
        colours.push(chartjsBarColours[1]);
      } else {
        colours.push(chartjsBarColours[2]);
      }
    });
    Chart.defaults.global.defaultFontFamily = "Lato";
    Chart.defaults.global.defaultFontSize = 14;
    Chart.defaults.global.defaultFontColor = "Red";
    let vicChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: _months,
        datasets: [
          {
            label: recoveryText,
            data: chartjsdata[currentState],
            backgroundColor: colours,
            borderColor: colours,
            borderWidth: 2,
            hoverBorderWidth: 4,
            hoverBorderColor: "#000",
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: state + " Recovered",
          fontSize: 18,
        },
        legend: {
          // position: "right",
          labels: {
            fontColor: "#000",
          },
          layout: {
            padding: {
              right: 500,
              left: 0,
              top: 0,
              bottom: 0,
            },
          },
        },
      },
    });
  });
}
