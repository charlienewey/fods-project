function drawLogPriceReviews(reviews) {
  // draw scatter plot
  // adapted from: nvd3.org/examples/scatter.html
  nv.addGraph(function() {
    var chart = nv.models.scatterChart()
      .showDistX(true)  // marginal distribution on x axis
      .color(d3.scale.category10().range())
      .pointRange([25, 25]);

    // format axes
    chart.xAxis.tickFormat(d3.format('.02f'));
    chart.xScale(d3.scale.log().base(Math.E));
    chart.xAxis.axisLabel('Price (log-scale)');

    chart.yAxis.tickFormat(d3.format('.02f'));
    chart.yAxis.axisLabel('Average Review Score');

    // Configure how the tooltip looks.
    chart.tooltip.contentGenerator(function(key) {
      return '<b>Producer:</b> ' + key.point.producer + '<br />'+
             '<b>Vintage:</b> ' + key.point.vintage + '<br />' +
             '<b>Average Price:</b> £' + key.point.x + '<br />' +
             '<b>Average Review Score:</b> ' + key.point.y + '<br />';
    });

    // get data, construct plot
    var data = getLogPriceReviewData(reviews);
    d3.select('#review svg')
      .datum(data)
      .transition().duration(100)
      .call(chart);

    return chart;
  });
};

// query pricing and review information from API
function getLogPriceReviewData(reviews) {
  var data = [];

  // get groups
  var groups = ['Bordeaux', 'Burgundy', 'Northern Rhone', 'Southern Rhone'];

  // put data into array...
  for (var i = 0; i < groups.length; i += 1) {
    data.push({
      key: groups[i],
      values: []
    });

    for (var j = 0; j < reviews.length; j += 1) {
      if (reviews[j].region === groups[i]) {
        var x = parseFloat(reviews[j].price);
        var y = parseFloat(reviews[j].rating);
        if (! isNaN(x) && ! isNaN(y)) {
          data[i].values.push({
            x: x,
            y: y,
            producer: reviews[j].name,
            vintage: reviews[j].year
          })
        }
      }
    }
  }

  return data;
}
