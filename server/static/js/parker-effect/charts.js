var width = 750,
    height = 700;

function makeChart(data) {
  nv.addGraph(function() {
    var chart = nv.models.discreteBarChart()
      //.size([width, height])
      .color(d3.scale.category20().range())
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .margin({top: 50, right: 50, bottom: 50, left: 50})
      .showValues(true)
      .forceY([-30, 50])
      .staggerLabels(true);

    d3.select('#parker svg')
      .attr("width", width)
      .attr("height", height)
      .datum(data)
      .call(chart);

    return chart;
  });
}

d3.csv("static/js/parker-effect/parker.csv", function(data) {
  console.log(data);

  var dt = [{
    key: "Wine",
    values: []
  }];

  for (var i = 0; i < data.length; i += 1) {
    dt[0].values.push({
      label: data[i].name + " (" + data[i].vintage + ")",
      value: data[i].price_change
    });
  }

  makeChart(dt);
});
