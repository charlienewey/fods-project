// functions
function getReviews(rvw) {
  $.get("/data/reviews", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      rvw.push(data.data[i]);
    }
    drawLogPriceReviews(reviews);
  });
}

function getWeather(wth) {
  $.get("/data/weather", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      wth.push(data.data[i]);
    }
  });
}

function getPrices(prc) {
  $.get("/data/prices", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      prc.push(data.data[i]);
    }
    drawPriceByRegion(prc);
  });
}

// nasty nasty global variables
var reviews = [];
var weather = [];
var prices = [];

// set global variables with a horrible nasty nasty callback function
$(document).ready(function () {
  getWeather(weather);
  getReviews(reviews);
  getPrices(prices);
});
