function getReviews(callback) {
  var rvw = [];
  $.get("/data/reviews", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      rvw.push(data.data[i]);
    }
    callback(rvw);
  });
}

function getWeather(callback) {
  var wth = [];
  $.get("/data/weather", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      wth.push(data.data[i]);
    }
    callback(wth);
  });
}

function getPrices(callback) {
  var prc = [];
  $.get("/data/prices", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      prc.push(data.data[i]);
    }
    callback(prc);
  });
}

function getMarkets(callback) {
  var mkt = [];
  $.get("/data/msci-and-prices", function (data) {
    for (var i = 0; i < data.data.length; i += 1) {
      mkt.push(data.data[i]);
    }
    callback(mkt);
  });
}
