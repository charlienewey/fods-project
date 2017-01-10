function drawTastingNotesWordCloud(words) {
  var width = 700,
      height = 500;

  var fill = d3.scale.category20();

  var regions = ["Bordeaux", "Burgundy", "Northern Rhone", "Southern Rhone"];
  var top_words = {};
  for (var i = 0; i < regions.length; i += 1) {
    var region_element = regions[i].replace(" ", "_").toLowerCase();
    top_words[regions[i]] = [];
    $("#region-list").append(
      "<li id=\"" + region_element + "\"><a>" + regions[i] + "</a></li>"
    );

    $("#" + region_element).click({region: regions[i]}, function (e) {
      var reg = e.data.region;
      d3.select("#wordcloud svg").selectAll("*").remove();
      render_region(reg);
    });
  }

  for (var i = 0; i < words.length; i += 1) {
    var region = words[i].region;
    for (var j = 0; j < words[i].counts.length; j += 1) {
      var d = words[i].counts[j];
      top_words[region].push({text: d.word, size: 16 + (d.count * 2)});
    }
  }

  for (var i = 0; i < regions.length; i += 1) {
    var region = regions[i];
    top_words[region] = top_words[region].sort(
        function(a, b) {
          return d3.descending(a.size, b.size);
        })
    .slice(0, 70);
  }

  function render_region(reg) {
    $("#region_header").text(reg);

    var layout = d3.layout.cloud()
      .size([width, height])
      .words(top_words[reg])
      .padding(5)
      .rotate(function() { return (Math.random() * 6) * 15; })
      .font("Arima Madurai")
      .fontSize(function(d) { return d.size; });

    function draw() {
      d3.select("#wordcloud svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(top_words[reg])
        .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Arima Madurai")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
      .text(function(d) { return d.text; });
    }

    layout.on("end", draw);
    layout.start();
  }

  render_region(regions[1]);
}

getWordCounts(drawTastingNotesWordCloud);
