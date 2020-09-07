/* 
Format of dataObject
{
  recoveredTotalWA: undefined,
  recoveredTotalVIC: undefined,
  vicData: undefined,
  waData: undefined,
  otherStates: undefined,
}


*/

let rawCSVData,
  rejectedStates,
  csvSplitByMonth = [];

const minMonthPos = 5;
const maxMonthPos = 7;
const states = ["ACT", "VIC"];
const scrapeStates = ["vicData", "waData"];
const calendarMonths = [
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
let latestCSVUrl =
  "https://raw.githubusercontent.com/M3IT/COVID-19_Data/master/Data/COVID_AU_state_daily_change.csv";

/* 
Fetch the latest csv data from the Github page
and parse the CSV using the Papa Parse library. 
Convert to an array and  save it to rawCSVData.

Once saved, continue with extracting and filtering.
*/

const csvData = Papa.parse(latestCSVUrl, {
  header: true,
  download: true,
  complete: function (results) {
    rawCSVData = results.data;
    console.log(rawCSVData);
    createCSVObject();
    extractRecovered();
  },
});

/* 
Create the base object so filtered data can be stored. Function extracts the date string from the csv parsing and comparing to calendarMonths. 
This then creates the csvSplitByMonth object which is filled with filtered data. Get Vic and WA data extracted at the same time calling extractMonthly method. 
*/

function createCSVObject(results) {
  for (let index = 0; index < calendarMonths.length; index++) {
    csvSplitByMonth[index] = {
      [calendarMonths[index]]: {
        vicData: extractMonthly("VIC", index),
        waData: extractMonthly("WA", index),
        recoveredTotalWA: undefined,
        recoveredTotalVIC: undefined,

        otherStates: rejectedStates,
      },
    };
  }
  /*  for (months in calendarMonths) {
    csvSplitByMonth[months] = {
      [calendarMonths[months]]: {
        recoveredTotalWA: undefined,
        recoveredTotalVIC: undefined,
        vicData: extractMonthly("VIC", months),
        waData: undefined,
        otherStates: undefined,
      },
    };
  } */
  console.log(csvSplitByMonth);
}

/* 
Create the base object so filtered data can be stored. Function extracts the date string from the csv parsing and comparing to calendarMonths. 
This then creates the csvSplitByMonth object which is used to display data.
*/
function extractMonthly(state, month) {
  let _monthCheck;

  //due to array indexing adjust to match months
  month = month == 0 ? (month = 1) : (month += 1);

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

*/
function extractRecovered() {
  scrapeStates.map((state) => {
    for (let index = 1; index < calendarMonths.length; index++) {
      let monthTotal = csvSplitByMonth[index][calendarMonths[index]][state]
        .map((day) => {
          let _recoveredTotal = parseInt(day.recovered);
          console.log("num", num);
          return _recoveredTotal;
        })
        .reduce((accum, recovered) => {
          return accum + recovered;
        });
      console.log("tots:", monthTotal);
      csvSplitByMonth[index][
        calendarMonths[index]
      ].recoveredTotalVIC = monthTotal;
      console.log(
        (csvSplitByMonth[index][
          calendarMonths[index]
        ].recoveredTotalVIC = monthTotal)
      );
    }
  });
}

/* 
Split data by month so its easier to filter.  Can also save on processing time 
by reducing filtering the data multiple times . 
*/
function convertToDate(unixTimestamp) {
  const milliseconds = unixTimestamp * 1000; // use in next step

  const dateObject = new Date(milliseconds);

  const humanDateFormat = dateObject.toLocaleString(); //2019-12-9 10:30:15

  /* dateObject.toLocaleString("en-US", { weekday: "long" }); // Monday
  dateObject.toLocaleString("en-US", { month: "long" }); // December
  dateObject.toLocaleString("en-US", { day: "numeric" }); // 9
  dateObject.toLocaleString("en-US", { year: "numeric" }); // 2019
  dateObject.toLocaleString("en-US", { hour: "numeric" }); // 10 AM
  dateObject.toLocaleString("en-US", { minute: "numeric" }); // 30
  dateObject.toLocaleString("en-US", { second: "numeric" }); // 15
  dateObject.toLocaleString("en-US", { timeZoneName: "short" }); // 12/9/2019, 10:30:15 AM CST */
  return humanDateFormat;
}

/* Begin filtering by 
month */

function findMaxMonth(results) {
  console.log(results);
  // let csvStateSplit = results.map((x) => x);
  // console.log(csvStateSplit);
}

/* Start creating chart */

var ctx = document.getElementById("myChart").getContext("2d");
var myChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
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
