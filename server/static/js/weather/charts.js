/**
 * adapted from: nvd3.org/examples/line.html
 */
function drawHumidityByRegion(weather, prices, region) {
  var data = [];

  // humidity series
  data.push({
    key: 'Humidity (%)',
    values: [],
    type: 'line',
    yAxis: 1
  });

  for (var j = 0; j < weather.length; j += 1) {
    if (region.toLowerCase() === weather[j].region.toLowerCase()) {
      var d = new Date(weather[j].year, weather[j].month, 1);
      data[data.length - 1].values.push({
        x: d,
        y: weather[j].humidity
      })
    }
  }

  // pricing series
  data.push({
    key: 'Price (£)',
    values: [],
    type: 'line',
    yAxis: 2
  });

  for (var j = 0; j < prices.length; j += 1) {
    if (region.toLowerCase() === prices[j].region.toLowerCase()) {
      var d = d3.time.format.iso.parse(prices[j].date);
      data[data.length - 1].values.push({
        x: d,
        y: prices[j].price
      })
    }
  }

  nv.addGraph(function() {
    var chart = nv.models.multiChart()
      .margin({top: 0, right: 50, bottom: 50, left: 100})
      .color(d3.scale.category10().range());

    chart.xAxis.tickFormat(d3.format(',f'));
    chart.yAxis1.tickFormat(d3.format(',.1f'));
    chart.yAxis2.tickFormat(d3.format(',.1f'));

    chart.xAxis
      .axisLabel('Date')
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d));
      });

    chart.yAxis1
      .axisLabel('Relative Humidity (%)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { return d3.format('.02f')(d) });

    chart.yAxis2
      .axisLabel('Wine Price (£)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { return '£' + d3.format('.02f')(d) });


    d3.select('#humidity svg')
      .datum(data)
      .transition().duration(500).call(chart);

    return chart;
  });
}

/**
 * adapted from: nvd3.org/examples/line.html
 */
function drawPrecipitationByRegion(weather, prices, region) {
  var data = [];

  // humidity series
  data.push({
    key: 'Precipitation (mm)',
    values: [],
    type: 'line',
    yAxis: 1
  });

  for (var j = 0; j < weather.length; j += 1) {
    if (region.toLowerCase() === weather[j].region.toLowerCase()) {
      var d = new Date(weather[j].year, weather[j].month, 1);
      data[data.length - 1].values.push({
        x: d,
        y: weather[j].precipitation
      })
    }
  }

  // pricing series
  data.push({
    key: 'Price (£)',
    values: [],
    type: 'line',
    yAxis: 2
  });

  for (var j = 0; j < prices.length; j += 1) {
    if (region.toLowerCase() === prices[j].region.toLowerCase()) {
      var d = d3.time.format.iso.parse(prices[j].date);
      data[data.length - 1].values.push({
        x: d,
        y: prices[j].price
      })
    }
  }

  nv.addGraph(function() {
    var chart = nv.models.multiChart()
      .margin({top: 0, right: 50, bottom: 50, left: 100})
      .color(d3.scale.category10().range());

    chart.xAxis.tickFormat(d3.format(',f'));
    chart.yAxis1.tickFormat(d3.format(',.1f'));
    chart.yAxis2.tickFormat(d3.format(',.1f'));

    chart.xAxis
      .axisLabel('Date')
      .tickFormat(function(d) {
        return d3.time.format('%Y-%m')(new Date(d));
      });

    chart.yAxis1
      .axisLabel('Precipitation (mm)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { return d3.format('.02f')(d) });

    chart.yAxis2
      .axisLabel('Wine Price (£)')
      .axisLabelDistance(3)
      .tickFormat(function(d) { return '£' + d3.format('.02f')(d) });

    d3.select('#precipitation svg')
      .datum(data)
      .transition().duration(500).call(chart);

    return chart;
  });
}

function drawCharts(region) {
  getWeather(function (weather) {
    getMarkets(function (prices) {
      drawPrecipitationByRegion(weather, prices, region);
      drawHumidityByRegion(weather, prices, region);
    });
  })
}

// this gets run on page load
drawCharts('Bordeaux');

// make the buttons work
var regions = ['Bordeaux', 'Burgundy'];
function changeChartRegion(region) {
  for (var i = 0; i < regions.length; i += 1) {
    var elem = $('#' + regions[i].toLowerCase());
    if (regions[i].toLowerCase() === region.toLowerCase()) {
      elem.addClass('active');
    } else {
      elem.removeClass('active');
    }
  }

  drawCharts(region);

  $('.region_name').each(function (ind, elem) {
    elem.innerHTML = '(' + region + ')';
  });
}

$('#bordeaux').click(function (e) {
  changeChartRegion('Bordeaux');
});

$('#burgundy').click(function (e) {
  changeChartRegion('Burgundy');
});
