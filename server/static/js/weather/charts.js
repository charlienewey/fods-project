/**
 * adapted from: nvd3.org/examples/line.html
 */
function drawWeatherPriceByRegion(weather) {
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
      .axisLabel('Relative Humidity (%)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { d3.format('.2f')(d) });

    chart.x2Axis
      .axisLabel('Date')
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d));
      });

    // get data
    var data = [];
    var groups = ['bordeaux', 'burgundy', 'rhone'];
    for (var i = 0; i < groups.length; i += 1) {
      data.push({
        // capitalise first letter
        key: groups[i].charAt(0).toUpperCase() + groups[i].slice(1),
        values: []
      });

      for (var j = 0; j < weather.length; j += 1) {
        if (groups[i] === weather[j].region) {
          var d = new Date(weather[j].year, weather[j].month, 1);
          data[i].values.push({
            x: d,
            y: weather[j].humidity,
            vintage: weather[j].precipitation
          })
        }
      }
    }

    // construct plot
    d3.select('#humidity svg')
      .datum(data)
      .transition().duration(100)
      .call(chart);

    return chart;
  });
}

var reviewDataCallbacks = [];
var priceDataCallbacks = [];
var weatherDataCallbacks = [ drawWeatherPriceByRegion ];
