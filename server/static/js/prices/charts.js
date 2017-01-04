/**
 * adapted from: nvd3.org/examples/line.html
 */
function drawEconomyAndPriceData(market) {
  nv.addGraph(function() {
    var chart = nv.models.linePlusBarChart()
      .showLegend(true)
      .color(d3.scale.category10().range())
      .margin({top: 0, right: 50, bottom: 50, left: 100});

    chart.xAxis
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d));
      });

    chart.x2Axis
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d));
      });

    chart.yScale(d3.scale.log().base(Math.E));

    chart.y1Axis
      .axisLabel('MSCI World Change (%)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { return d3.format('.0f')(d) + '%' });

    chart.y2Axis
      .axisLabel('Wine Price (£)')
      .tickFormat(function(d) { return '£' + d3.format('.0f')(d) });

    // get data
    var data = [];
    var groups = ['Bordeaux', 'Burgundy', 'Southern Rhone', 'Northern Rhone'];
    for (var i = 0; i < groups.length; i += 1) {
      data.push({
        // capitalise first letter
        key: groups[i],
        values: []
      });

      for (var j = 0; j < market.length; j += 1) {
        if (groups[i] === market[j].region) {
          var d = d3.time.format('%Y-%m-%d').parse(market[j].date);
          data[i].values.push({
            x: d,
            y: market[j].price,
          })
        }
      }
    }

    data.push({
      key: "Market Change (%)",
      values: [],
      bar: true
    });

    for (var j = 0; j < market.length; j += 1) {
      var d = d3.time.format('%Y-%m-%d').parse(market[j].date);
      data[4].values.push({
        x: d,
        y: market[j].market_data.change,
      })
    }



    // construct plot
    d3.select('#economy svg')
      .datum(data)
      .transition().duration(100)
      .call(chart);

    return chart;
  });
}

/**
 * adapted from: nvd3.org/examples/line.html
 */
function drawPrecipitationByRegion(market) {
  nv.addGraph(function() {
    var chart = nv.models.lineWithFocusChart()
      .useInteractiveGuideline(true)
      .showLegend(true)
      .showYAxis(true)
      .showXAxis(true)
      .color(d3.scale.category10().range())
      .margin({top: 0, right: 50, bottom: 50, left: 100});

    chart.xAxis
      .axisLabel('Date')
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d));
      });

    chart.yAxis
      .axisLabel('Precipitation (mm)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { return d3.format('.02f')(d) });

    chart.x2Axis
      .axisLabel('Date')
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d));
      });

    // get data
    var data = [];
    var groups = ['bordeaux', 'burgundy', 'rhone'];
    for (var i = 0; i < groups.length; i += 1) {
      var grp = groups[i].charAt(0).toUpperCase() + groups[i].slice(1);
      data.push({
        // capitalise first letter
        key: grp,
        values: []
      });

      for (var j = 0; j < market.length; j += 1) {
        if (groups[i] === market[j].region) {
          var d = new Date(market[j].year, market[j].month, 1);
          data[i].values.push({
            x: d,
            y: market[j].price,
            y2: market_data.change,
            region: grp
          })
        }
      }
    }

    // construct plot
    d3.select('#economy svg')
      .datum(data)
      .transition().duration(100)
      .call(chart);

    return chart;
  });
}

var reviewDataCallbacks = [];
var weatherDataCallbacks = [];
var priceDataCallbacks = [];
var marketDataCallbacks = [ drawEconomyAndPriceData ];
