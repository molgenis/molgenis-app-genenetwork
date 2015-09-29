// http://bl.ocks.org/lgrammel/1935509#index.html

function streamLayers(data) {
    var n = data.length;
    var m = data[0].length;
    return d3.range(n).map(function(j) {
        var a = [], i;
        for (i = 0; i < m; i++) a[i] = data[j][i];
        return a.map(function(d, i) { return { x: i, y: Math.max(0, d) };});
    });
}

function smoothen(data, factor) {

    var smooth = []
    for (var i = 0; i < data.length; i++) {
        smooth[i] = []
        var s = Smooth(data[i]);
        for (var k = 0; k < data[0].length*factor; k++) {
            smooth[i].push(s(k/factor))
        }
//        console.log(data[i])
    }
    return smooth
}

function streamgraphChart() {
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 960,
    height = 500,
    transitionDuration = 1000,
    color = function() { return d3.interpolateRgb("#aad", "#556")(Math.random()); };

    var streamgraph =  d3.layout.stack().offset("wiggle");

    function chart(selection) {
        selection.each(function(data) {

            // Compute the streamgraph.
            data = streamgraph(data);

            var mx = data[0].length - 1, // assumes that all layers have same # of samples & that there is at least one layer
            my = d3.max(data, function(d) {
                return d3.max(d, function(d) {
                    return d.y0 + d.y;
                });
            });

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");

            // Update the outer dimensions.
            svg .attr("width", width)
                .attr("height", height);

            // Update the inner dimensions.
            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // Update the streamgraph
            var availableWidth = width - margin.left - margin.right,
            availableHeight = height - margin.top - margin.bottom;

            var area = d3.svg.area()
                .x(function(d) { return d.x * availableWidth / mx; })
                .y0(function(d) { return availableHeight - d.y0 * availableHeight / my; })
                .y1(function(d) { return availableHeight - (d.y + d.y0) * availableHeight / my; });

            var path = g.selectAll("path").data(data);

            path.enter().append("path");
            path.exit().remove();
            path.style("fill", color).transition().duration(transitionDuration).attr("d", area);
        });
    }

    chart.color = function(_) {
        if (!arguments.length) return color;
        color = _;
        return chart;
    };

    chart.transitionDuration = function(_) {
        if (!arguments.length) return transitionDuration;
        transitionDuration = _;
        return chart;
    };

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    return chart;
}
