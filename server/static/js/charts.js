// draw scatter plot
nv.addGraph(function() {
  var chart = nv.models.scatterChart()
    .showDistX(true)  // marginal distribution on x axis
    .showDistY(true)  // marginal distribution on y axis
    .transitionDuration(350)
    .color(d3.scale.category10().range());

  // tooltip text/html
  chart.tooltipContent(function(key) {
    return key;
  });

  // axis float format settings
  chart.xAxis.tickFormat(d3.format('.02f'));
  chart.yAxis.tickFormat(d3.format('.02f'));

  // we want to show shapes other than circles
  chart.scatter.onlyCircles(false);

  var data = randomData(4,40);
  d3.select('#chart svg')
    .datum(data)
    .call(chart);

  nv.utils.windowResize(chart.update);

  return chart;
});

// query pricing and review information from API

// test data generator
function randomData(groups, points) {
  var data = [],
  shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
  random = d3.random.normal();

  for (i = 0; i < groups; i++) {
    data.push({
      key: 'Group ' + i,
      values: []
    });

    for (j = 0; j < points; j++) {
      data[i].values.push({
        x: random(),
        y: random(),
        size: Math.random(),
        shape: (Math.random() > 0.95) ? shapes[j % 6] : "circle"
      });
    }
  }
  return data;
}
