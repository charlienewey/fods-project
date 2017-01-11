var width = 960,
  height = 500,
  padding = 1.5, // separation between same-color nodes
  clusterPadding = 6, // separation between different-color nodes
  maxRadius = 40;
minRadius = 20;



d3.csv("static/js/overview/my.csv", function(data) {
  m = d3.max(data, function(d){return d.group});
  color = d3.scale.category10()
  .domain(d3.range(m));
  clusters = new Array(m);
  dataset = data.map(function(d) {
  var r = parseInt(d.radius);

    var dta = {
      cluster: d.group,//group
      name: d.label,//label
      radius: r,//radius
      x: Math.cos(d.group / m * 2 * Math.PI) * 100 + width / 2 + Math.random(),
      y: Math.sin(d.group / m * 2 * Math.PI) * 100 + height / 2 + Math.random()
    };
    if (!clusters[d.group] || (d.radius > clusters[d.group].radius)) clusters[d.group] = dta;
    return dta;
  });
  makeGraph(dataset);
});

function makeGraph(nodes) {
  var force = d3.layout.force()
    .nodes(nodes)
    // .size([width, height])
    .gravity(.02)
    .charge(0)
    .on("tick", tick)
    .start();

  var svg = d3.select("#overview").append("svg");
    // .attr("width", width)
    // .attr("height", height);

  var node = svg.selectAll("circle")
    .data(nodes)
    .enter().append("g").call(force.drag);
  node.append("circle")
    .style("fill", '#2ADF8A')
    .attr("r", function(d) {
      return d.radius
    })
  node.append("text")
    .text(function(d) {
      return d.name;
    })
    .attr("dx", -10)
    .attr("dy", ".35em")
    .text(function(d) {
      return d.name
    })
    .style("stroke", "none");






  function tick(e) {
    node.each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.5))
      //.attr("transform", functon(d) {});
      .attr("transform", function(d) {
        var k = "translate(" + d.x + "," + d.y + ")";
        return k;
      })

  }

  function cluster(alpha) {
    return function(d) {
      var cluster = clusters[d.cluster];
      if (cluster === d) return;
      var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
      if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    };
  }

  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
      var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  }
}
