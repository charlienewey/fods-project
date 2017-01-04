/*
 * log-price/review scatter plot
 * adapted from: nvd3.org/examples/scatter.html
 */
function drawLogPriceReviews(reviews) {
  nv.addGraph(function() {
    var chart = nv.models.scatterChart()
      .showDistX(true)  // marginal distribution on x axis
      .color(d3.scale.category10().range())
      .pointRange([25, 25])
      .margin({top: 0, right: 50, bottom: 50, left: 100});

    // format axes
    chart.xAxis.tickFormat(d3.format('.0f'))
      .axisLabel('Price (log-scale)')
      .tickFormat(function(d) { return Math.round(Math.exp(d)) });

    chart.yAxis.tickFormat(d3.format('.0f'))
      .axisLabel('Average Review Score');

    // configure how the tooltip looks
    chart.tooltip.contentGenerator(function(key) {
      return '<b>Producer:</b> ' + key.point.producer + '<br />'+
             '<b>Vintage:</b> ' + key.point.vintage + '<br />' +
             '<b>Average Price:</b> £' + Math.round(Math.exp(key.point.x)) + '<br />' +
             '<b>Average Review Score:</b> ' + key.point.y + '<br />';
    });

    // get data
    var data = [];
    var groups = ['Bordeaux', 'Burgundy', 'Northern Rhone', 'Southern Rhone'];
    var regressions = [  // [y-intercept, slope]
      [81.9289, 2.0717],  // Bordeaux
      [82.8734, 1.9528],  // Burgundy
      [82.2085, 2.4090],  // Northern Rhone
      [76.6135, 3.9853]   // Southern Rhone
    ]
    for (var i = 0; i < groups.length; i += 1) {
      // put data into array...
      data.push({
        key: groups[i],
        values: [],
        intercept: regressions[i][0],
        slope: regressions[i][1]
      });

      // disable half of the series, otherwise it gets confusing
      if (i % 2 > 0) {
        data[i].disabled = true;
      }

      // extract fields
      for (var j = 0; j < reviews.length; j += 1) {
        if (reviews[j].region === groups[i]) {
          var x = parseFloat(reviews[j].price);
          var y = parseFloat(reviews[j].rating);
          if (! isNaN(x) && ! isNaN(y)) {
            data[i].values.push({
              x: Math.log(x),
              y: y,
              producer: reviews[j].name,
              vintage: reviews[j].year
            })
          }
        }
      }
    }

    // construct plot
    d3.select('#review svg')
      .datum(data)
      .transition().duration(100)
      .call(chart);

    return chart;
  });
};


/**
 * price time-series, with lines for each region
 * adapted from: nvd3.org/examples/line.html
 */
function drawPriceByRegion(prices) {
  nv.addGraph(function() {
    var chart = nv.models.lineChart()
      .useInteractiveGuideline(true)
      .showLegend(true)
      .showYAxis(true)
      .showXAxis(true)
      .color(d3.scale.category10().range())
      .margin({top: 0, right: 50, bottom: 50, left: 100});

    chart.xAxis
      .axisLabel('Date')
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d))
      });

    chart.yAxis
      .axisLabel('Price per Bottle (£)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { return '£' + d3.format('.02f')(d) });
    chart.yScale(d3.scale.log().base(Math.E));

    // get data
    var data = [];
    var groups = ['Bordeaux', 'Burgundy', 'Northern Rhone', 'Southern Rhone'];
    for (var i = 0; i < groups.length; i += 1) {
      data.push({
        key: groups[i],
        values: []
      });

      for (var j = 0; j < prices.length; j += 1) {
        if (groups[i] === prices[j].region) {
          var d = Date.parse(prices[j].date);
          data[i].values.push({
            x: d,
            y: parseFloat(prices[j].price) / 6, // price per case
            region: prices[j].region,
            vintage: prices[j].vintage
          })
        }
      }
    }

    // construct plot
    d3.select('#prices svg')
      .datum(data)
      .transition().duration(100)
      .call(chart);

    return chart;
  });
}

var reviewDataCallbacks = [ drawLogPriceReviews ];
var priceDataCallbacks = [ drawPriceByRegion ];
var weatherDataCallbacks = [];
var marketDataCallbacks = [];
