draw_area_charts();
draw_bar_chart();
draw_kconly_bar_chart();
draw_prediction_chart();

function draw_area_charts() {

  var margin = {top: 10, right: 0, bottom: 20, left: 41},
      width = 300 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%m/%y").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.category20();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.months,3)
      .tickSize(4, 1)
      .tickFormat(d3.time.format("%-m/%y"));

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(6)
      .tickSize(4, 1);

  var area = d3.svg.area()
      .interpolate("cardinal")
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y(d.value); });

  var line = d3.svg.line()
      .interpolate("cardinal")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

  function make_x_axis() {        
      return d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(20)
  }

  function make_y_axis() {        
      return d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(6)
  }

  d3.csv("https://dl.dropboxusercontent.com/u/40727734/proj3-netindex-speeds-dl-only%20-%20Sheet1.csv", function(data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });

    var cities = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.date, value: +d[name]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      d3.min(cities, function(c) { return 0; }),
      d3.max(cities, function(c) { return 120; })
    ]);

    cities.forEach(function(city) {

      var leftChart = (city.name === "Atlanta" || city.name === "Charlotte" || city.name === "Salt Lake City");
      var bottomChart = (city.name === "Salt Lake City" || city.name === "Portland" || city.name === "San Jose");

      var svg = d3.select(".area-charts").append("svg")
          .attr("class", "graph")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")         
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize(-height, 0)
                .tickFormat("")
            )
          .selectAll(".tick")
            .data(x.ticks(4), function(d) { return d; })
          .exit()
            .classed("minor", true);

      svg.append("g")         
          .attr("class", "grid")
          .call(make_y_axis()
              .tickSize(-width, 0)
              .tickFormat("")
          )
        .selectAll(".tick")
          .data(y.ticks(6), function(d) { return d; })
        .exit()
          .classed("minor", true);

      svg.append("text")
          .attr("transform", "translate(5,10)")
          .attr("x", 3)
          .attr("dy", ".5em")
          .text(city.name);

      if(leftChart) {
        svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -40)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Internet Speed (Mbps)");
      }

      if(bottomChart) {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
      }

      svg.append("path")
          .attr("class", "area")
          .attr("d", area(city.values));

      svg.append("path")
          .attr("class", "line")
          .attr("d", line(city.values));

      var startVal = city.values[0];
      var endVal = city.values[city.values.length-1];

      svg.append("text")
          .attr("transform", "translate(" + x(startVal.date) + "," + (y(startVal.value) - 10) + ")")
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(startVal.value);

      svg.append("text")
          .attr("transform", "translate(" + (x(endVal.date) - 35) + "," + (y(endVal.value) - 10) + ")")
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(endVal.value);

      if(city.name === "Kansas City") {
        d3.select( d3.selectAll(".area-charts svg path.line")[0].pop() )
          .classed("important", true);
      };

    });
  });

}

function draw_bar_chart() {
  var margin = {top: 15, right: 10, bottom: 30, left: 90},
      width = 800 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var format = d3.format("%");

  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.ordinal().rangeRoundBands([0, height], .1);

  var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("top")
                    .tickSize(-height)
                    .tickFormat(d3.format("%")),
      yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .tickSize(0);

  d3.csv("https://dl.dropboxusercontent.com/u/40727734/proj3-netindex-speeds-increase%20-%20Sheet1.csv", function(data) {

    var svg = d3.select(".bar-chart").append("svg")
        .attr("class", "graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) { d.value = +d.value; });
    data.sort(function(a, b) { return b.value - a.value; });

    x.domain([0, d3.max(data, function(d) { return d.value; })]);
    y.domain(data.map(function(d) { return d.city; }));

    var bar = svg.selectAll("g.bar")
        .data(data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + y(d.city) + ")"; });

    bar.append("rect")
        .attr("width", function(d) { return x(d.value); })
        .attr("height", y.rangeBand());

    bar.append("text")
        .attr("class", "value")
        .attr("x", function(d) { return x(d.value); })
        .attr("y", y.rangeBand() / 2)
        .attr("dx", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) { return format(d.value); });

    var firstBar = d3.select("g.bar")
        .classed("first-bar", true);

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
  });
}

function draw_kconly_bar_chart() {

  var margin = {top: 15, right: 10, bottom: 30, left: 90},
      width = 800 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var format = d3.format("%");

  var x = d3.scale.linear().range([0, width]),
      y = d3.scale.ordinal().rangeRoundBands([0, height], .1);

  var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("top")
                    .tickSize(-height)
                    .tickFormat(d3.format("%")),
      yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .tickSize(0);

  var color = d3.scale.category10().range(["#3369E8", "#EEB211", "#009925"]);


  d3.csv("https://dl.dropboxusercontent.com/u/40727734/proj3-netindex-speeds-increase-kconly%20-%20Sheet1.csv", function(data) {

    var svg = d3.select(".kconly-bar-chart").append("svg")
        .attr("class", "graph")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function(d) { d.value = +d.value; });

    x.domain([0, d3.max(data, function(d) { return d.value; })]);
    y.domain(data.map(function(d) { return d.months; }));

    var bar = svg.selectAll("g.bar")
        .data(data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + y(d.months) + ")"; });

    bar.append("rect")
        .attr("width", function(d) { return x(d.value); })
        .attr("height", y.rangeBand())
        .style("fill", function(d) { return color(d.value); });

    bar.append("text")
        .attr("class", "value")
        .attr("x", function(d) { return x(d.value); })
        .attr("y", y.rangeBand() / 2)
        .attr("dx", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) { return format(d.value); });

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
  });

}

function draw_prediction_chart() {

  var margin = {top: 10, right: 5, bottom: 20, left: 41},
      width = 300 - margin.left - margin.right,
      height = 150 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%m/%y").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.category20();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.time.months, 2)
      .tickSize(4, 1)
      .tickFormat(d3.time.format("%-m/%y"));

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      // .ticks(6)
      .tickSize(4, 1);

  var area = d3.svg.area()
      .interpolate("cardinal")
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y(d.value); });

  var line = d3.svg.line()
      .interpolate("cardinal")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

  function make_x_axis() {        
      return d3.svg.axis()
          .scale(x)
          .orient("bottom")
  }

  function make_y_axis() {        
      return d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(6)
  }

  d3.csv("https://dl.dropboxusercontent.com/u/40727734/proj3-netindex-speeds-dl-increase-allcities%20-%20Sheet1.csv", function(data) {
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

    data.forEach(function(d) {
      d.date = parseDate(d.date);
    });

    var cities = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.date, value: +d[name]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      d3.min(cities, function(c) { return 0; }),
      d3.max(cities, function(c) { return 350; })
    ]);

    cities.forEach(function(city) {

      var leftChart = (city.name === "Atlanta" || city.name === "Charlotte" || city.name === "San Antonio" || city.name === "Portland");
      var bottomChart = (city.name === "Portland" || city.name === "San Jose");

      var svg = d3.select(".prediction-chart").append("svg")
          .attr("class", "graph")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("g")         
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_axis()
                .tickSize(-height, 0)
                .tickFormat("")
            )
          .selectAll(".tick")
            .data(x.ticks(0), function(d) { return d; })
          .exit()
            .classed("minor", true);

      svg.append("g")         
          .attr("class", "grid")
          .call(make_y_axis()
              .tickSize(-width, 0)
              .tickFormat("")
          );

      svg.append("text")
            .attr("transform", "translate(5,10)")
            .attr("x", 3)
            .attr("dy", ".5em")
            .text(city.name);
        // .selectAll(".tick")
        //   .data(y.ticks(6), function(d) { return d; })
        // .exit()
        //   .classed("minor", true);

      if(leftChart) {
        svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -40)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Internet Speed (Mbps)");
      }

      if(bottomChart) {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
      }

      svg.append("path")
          .attr("class", "area")
          .attr("d", area(city.values));

      svg.append("path")
          .attr("class", "line")
          .attr("d", line(city.values));

      var formatDate = d3.time.format("%b-%y");

      var points = svg.selectAll(".point")
                        .data(city.values)
                      .enter().append("svg:circle")
                         .attr("class", "monthVal")
                         .attr("cx", function(d, i) { return x(d.date) })
                         .attr("cy", function(d, i) { return y(d.value) })
                         .attr("r", function(d, i) { return 3 });

      var startVal = city.values[0];
      var threeMonthVal = city.values[1];
      var sixMonthVal = city.values[2];
      var endVal = city.values[city.values.length-1];

      svg.append("text")
          .attr("transform", "translate(" + x(startVal.date) + "," + (y(startVal.value) - 10) + ")")
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(startVal.value);

      svg.append("text")
          .attr("transform", "translate(" + (x(threeMonthVal.date) - 10) + "," + (y(threeMonthVal.value) - 20) + ")")
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(threeMonthVal.value);

      svg.append("text")
          .attr("transform", "translate(" + (x(sixMonthVal.date) - 10) + "," + (y(sixMonthVal.value) - 20) + ")")
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(sixMonthVal.value);

      svg.append("text")
          .attr("transform", "translate(" + (x(endVal.date) - 30) + "," + (y(endVal.value) + 20) + ")")
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(endVal.value);

    });
  });

}