// functions
function getReviews(wine, rvw) {
  if (wine === null) {
    $.get("reviews", function (data) {
      for (var i = 0; i < data.data.length; i += 1) {
        rvw.push(data.data[i]);
      }
      drawLogPriceReviews(reviews);
    });
  } else {
    $.get("reviews/" + wine, function (data) {
      // probably ought to do something cleverer here
      // do things with data.data
    });
  }
}

function getWeather(wth) {
  $.get("weather", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      wth.push(data.data[i]);
    }
  });
}

function getPrices(wine, prc) {
  if (wine === null) {
    $.get("prices", function (data) {
      for (var i = 0; i < data.data.length; i += 1) {
        prc.push(data.data[i]);
      }
    });
  } else {
    $.get("prices/" + wine, function (data) {
      // probably ought to do something cleverer here
      // do things with data.data
    });
  }
}

function getMarket(mkt) {
  $.get("market", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      mkt.push(data.data[i]);
    }
  });
}

// nasty nasty global variables
var reviews = [];
var weather = [];
var prices = [];
var market = [];

// set global variables with a horrible nasty nasty callback function
$(document).ready(function () {
  getMarket(market);
  getWeather(weather);
  getReviews(null, reviews);
  getPrices(null, prices);
});
