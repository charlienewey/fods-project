Date.prototype.getFullYear = function () {
  return this.getYear() + 1900;
}


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
      .margin({top: 0, right: 0, bottom: 50, left: 100});

    // format axes
    chart.xScale(d3.scale.log().base(Math.E));
    chart.xAxis.tickFormat(d3.format('.02f'))
      .axisLabel('Price (log-scale)');

    chart.yAxis.tickFormat(d3.format('.02f'))
      .axisLabel('Average Review Score');

    // Configure how the tooltip looks.
    chart.tooltip.contentGenerator(function(key) {
      return '<b>Producer:</b> ' + key.point.producer + '<br />'+
             '<b>Vintage:</b> ' + key.point.vintage + '<br />' +
             '<b>Average Price:</b> £' + key.point.x + '<br />' +
             '<b>Average Review Score:</b> ' + key.point.y + '<br />';
    });

    // get data
    var data = [];
    var groups = ['Bordeaux', 'Burgundy', 'Northern Rhone', 'Southern Rhone'];
    for (var i = 0; i < groups.length; i += 1) {
      // put data into array...
      data.push({
        key: groups[i],
        values: []
      });

      // extract fields
      for (var j = 0; j < reviews.length; j += 1) {
        if (reviews[j].region === groups[i]) {
          var x = parseFloat(reviews[j].price);
          var y = parseFloat(reviews[j].rating);
          if (! isNaN(x) && ! isNaN(y)) {
            data[i].values.push({
              x: x, y: y,
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
      .margin({top: 0, right: 0, bottom: 50, left: 100});

    chart.xAxis
      .axisLabel('Time (ms)')
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d))
      });

    chart.yAxis
      .axisLabel('Voltage (v)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { return '£' + d3.format('.02f')(d) });

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
