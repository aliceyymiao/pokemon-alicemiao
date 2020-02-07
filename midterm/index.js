'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  let type1 = ["Bug", "Dark", "Electric", "Fairy", "Fighting", "Fire", "Ghost", "Grass", "Ground", "Ice",
              "Normal", "Poison", "Psychic", "Steel", "Water"];

  let colors = {

    "Bug": "#4E79A7",

    "Dark": "#A0CBE8",

    "Electric": "#F28E2B",

    "Fairy": "#FFBE7D",

    "Fighting": "#59A14F",

    "Fire": "#8CD17D",

    "Ghost": "#B6992D",

    "Grass": "#499894",

    "Ground": "#86BCB6",

    "Ice": "#FABFD2",

    "Normal": "#E15759",

    "Poison": "#FF9D9A",

    "Psychic": "#79706E",

    "Steel": "#BAB0AC",

    "Water": "#D37295"

  };

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 1000)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable

    // plot data as points and add tooltip functionality
    plotData(data);

    // add interactions
    filters();
  }

  // make title and axes labels
  function makeLabels() {

    svgContainer.append('text')
      .attr('x', 550)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(165, 250)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');

  }

  function filters() {
    const generations = ['(All)','1','2','3','4','5','6']

    const legendary = ['(All)', 'False', 'True']
    
    let filter1 = d3.select('.content')
        .append('select')
        .attr('id', 'legendary-dropdown')
        .selectAll('option')    
        .data(legendary)
        .enter()
            .append('option')
            .attr('value', function(d) {
                 return d 
            })
            .html(function(d) { 
                return d 
            });
      d3.select("#legendary-dropdown").on('change', function() {
          changePlot(data);
      });
    
    let filter2 = d3.select('.content2')
        .append('select') 
        .attr('id', 'generation-dropdown')
        .selectAll('option')
        .data(generations)
        .enter()
              .append('option')
              .html(function(d) { return d })
              .attr('value', function(d) { return d });

      d3.select("#generation-dropdown").on('change', function() {
          changePlot(data);
      });
  }
  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(data) {
    d3.select('svg').remove();

    svgContainer = d3.select('body')
    .append('svg')
    .attr('width', 1000)
    .attr('height', 500);
    // get arrays of fertility rate data and life Expectancy data
    let special_defense_data = data.map((row) => parseFloat(row["Sp. Def"]));
    let total_data = data.map((row) => parseFloat(row["Total"]));

    // find data limits
    let axesLimits = findMinMax(special_defense_data, total_data);

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([axesLimits.xMin - 13, axesLimits.xMax + 10]) // give domain buffer room
      .range([200, 950]);

    // function to scale y
    let yScale = d3.scaleLinear()
    .domain([axesLimits.yMax + 20, axesLimits.yMin-81]) // give domain buffer
    .range([50, 450]);

    // draw axes and return scaling + mapping functions
    drawAxes(xScale, yScale);
    const xMap = function(d) { return xScale(+d["Sp. Def"]) }
    const yMap = function(d) { return yScale(+d["Total"]) } 
    let legend = svgContainer.selectAll('.rect')
                  .attr('class', 'legend')
                  .data(type1)
                  .enter().append("rect")
                  .attr('x', 50)
                  .attr('y', function(d, i) { return (40 + i*30);})
                  .attr('width', 20)
                  .attr('height', 20)
                  .attr('fill', function(d, i) {return colors[type1[i]];});
    svgContainer.selectAll('.text')
      .attr('class', 'legend')
      .data(type1)
      .enter().append("text")
      .attr('x', 75)
      .attr('y', function(d, i) { return (55 + i*30);})
      .text(function(d) { return d; })
      .attr('fill', function(d, i) {return colors[type1[i]];});
      
    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // append data to SVG and plot as points
    const circles = svgContainer.selectAll('.circle')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 10)
        .attr('fill', function(d) {return colors[d["Type 1"]];})
        .attr('stroke', "#4286f4")
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(d["Name"]+ "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
        
    // draw title and axes labels
    makeLabels();
  }

  function changePlot(data) {
    let changed;
    let legendary = d3.select("#legendary-dropdown").property('value');
    let generation = d3.select("#generation-dropdown").property('value');
    if (legendary == '(All)') {
      changed = data;
    } else {
      changed = data.filter(function(d) {return d["Legendary"] == legendary;});
    }
    if (generation == '(All)') {
      changed = changed;
    } else {
      changed = changed.filter(function(d) {return d["Generation"] == generation;});
    }
    plotData(changed);
  }

  // draw the axes and ticks
  function drawAxes(scaleX, scaleY) {

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(scaleX);

    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);


    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(scaleY);

    svgContainer.append('g')
      .attr('transform', 'translate(200, 0)')
      .call(yAxis);
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

})();