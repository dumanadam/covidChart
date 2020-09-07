// variables for storage and filtering
let rawCSVData,
  rejectedStates,
  chartjsdata = [];
let csvSplitByMonth = [];

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
    //console.log(csvSplitByMonth[0].vicRecoveredChartData);
    console.log("chart", chartjsdata);
    createChart();
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

  //loop through each requested state
  states.map((state) => {
    //begin looping through the months
    for (let index = 1; index < calendarMonths.length; index++) {
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
      //split each state into its own array
      if (index <= calendarMonths.length + 1 && state == "VIC") {
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
  // save to the reference Object
  csvSplitByMonth[0] = yearlyTotals;
}

/* Begin filtering by 
month */

function print(results) {
  console.log("asdasd", chartjsdata[0]);
  return chartjsdata[0];
}

/* Start creating chart */
function createChart() {
  let _months = calendarMonths.splice(1);
  console.log(_months);
  console.log("chartjsdata", chartjsdata);
  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: _months,
      datasets: [
        {
          label: "# of REcoveries",
          data: print(),
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}
