// remember to set callbacks for the page by setting;
// * marketDataCallbacks
// * reviewDataCallbacks
// * weatherDataCallbacks
// * priceDataCallbacks

// functions
function getReviews(rvw) {
  if (reviewDataCallbacks.length > 0) {
    $.get("/data/reviews", function (data) {
      for (var i = 0; i < data.data.length; i += 1) {
        rvw.push(data.data[i]);
      }
      for (var i = 0; i < reviewDataCallbacks.length; i += 1) {
        reviewDataCallbacks[i](rvw);
      }
    });
  }
}

function getWeather(wth) {
  if (weatherDataCallbacks.length > 0) {
    $.get("/data/weather", function (data) {
      for (var i = 0; i < data.data.length; i += 1) {
        wth.push(data.data[i]);
      }
      for (var i = 0; i < weatherDataCallbacks.length; i += 1) {
        weatherDataCallbacks[i](wth);
      }
    });
  }
}

function getPrices(prc) {
  if (priceDataCallbacks.length > 0) {
    $.get("/data/prices", function (data) {
      for (var i = 0; i < data.data.length; i += 1) {
        prc.push(data.data[i]);
      }
      for (var i = 0; i < priceDataCallbacks.length; i += 1) {
        priceDataCallbacks[i](prc);
      }
    });
  }
}

function getMarkets(mkt) {
  if (marketDataCallbacks.length > 0) {
    $.get("/data/msci-and-prices", function (data) {
      for (var i = 0; i < data.data.length; i += 1) {
        mkt.push(data.data[i]);
      }
      for (var i = 0; i < marketDataCallbacks.length; i += 1) {
        marketDataCallbacks[i](mkt);
      }
    });
  }
}

// nasty nasty global variables
var reviews = [];
var weather = [];
var prices = [];
var markets = [];

// set global variables with a horrible nasty nasty callback function
$(document).ready(function () {
  getWeather(weather);
  getReviews(reviews);
  getPrices(prices);
  getMarkets(markets);
});
