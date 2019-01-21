
    function draw(error, data) {
    "use strict";
     //http://bl.ocks.org/hopelessoptimism/b8ef4734abad1c644221 
    // important: First argument it expects is error
    if (error) throw error;
      
    /*
    D3.js setup code
    */

    var margin = 10,
        width = 600	 - margin,
        height = 500 - margin;
		var padding = 50;

    // https://github.com/mbostock/d3/wiki/Time-Formatting
    //var format = d3.time.format("%Y-%m-%d");
    
    // create a projection properly scaled for SF
    var projection = d3.geo.mercator()
                          .center([-55, 5])
                          .scale(800)
                          .translate([width / 2, height / 30])
						  ;
    
    // create a path to draw the neighborhoods
    var path = d3.geo.path().projection(projection);
					 
					 
					 
					 


//
var svg = d3.select("body").insert("svg:svg", "h2")
    .attr("width", width)
    .attr("height", height);

var states = svg.append("svg:g")
    .attr("id", "states");

var circles = svg.append("svg:g")
    .attr("id", "circles");

var cells = svg.append("svg:g")
    .attr("id", "cells");

d3.select("input[type=checkbox]").on("change", function() {
  cells.classed("voronoi", this.checked);
});					 
//					 
					 
					 
					 
					 
					 

    // create and append the map of SF neighborhoods
    var map = d3.select('#map').selectAll('path')
                 .data(data[0].features)
                 .enter()
                 .append('svg:path')
                 .attr('d', path)
                 .style('fill', '#d6d6d6')
                 .style('stroke', 'white')
                 .style('stroke-width', 1);
				 
    var text = d3.select('#map').selectAll('text')
	             .data(data[0].features)
	             .enter()
	             .append("text")
				 .attr("x",function (d) {return path.centroid(d)[0];})
 				 .attr("y",function (d) {return path.centroid(d)[1];})
				 .attr("text-anchor","middle")
				 .style("font-size", "10px")
				 .style("font-family", "helvetica, arial, sans-serif")
				 .style("fill", "#004669")
				 .style("font-weight", "bold")
				 .text(function(d){return d.properties.sigla;});

				 
				 
    // normalize neighborhood names
    map.datum(function(d) {
      var normalized = d.iata;
						

      d.iata = normalized;
      return d;
    });
	
	
	
	
	
	

    // add the neighborhood name as its class
    map.attr('class', function(d) {
                    return d.iata;
					
                 });

      // find the min/max of listing per neighborhood
      var listings_extent = d3.extent(d3.values(data[1]));

      // append a bubble to each neighborhood
      var bubbles = d3.select('#map').append("g")
             .attr("class", "bubble")
             .selectAll("circle")
             .data(data[4])
             .enter()
             .append("circle")
             .attr('class', 'airbnb')
			 
			 
			 ;

      // add the listing data to each neighborhood datum
      bubbles.datum(function(d) {
        d.count2 = data[1][d.iata];
        return d;
      });
	  
    bubbles.attr('class', function(d) {
                    return d.iata;
					
                 });	  

	  

      // scale each bubble with a sqrt scale
      var radius = d3.scale.pow().exponent(0.5)
                     .domain(listings_extent)
                     .range([3, 20]);

      // transform each bubbles' attributes according to the data 
      bubbles
         .attr("cx", function (d) { return projection([d["longitude"],d["latitude"]])[0];})
         .attr("cy", function(d)  {  return projection([d["longitude"],d["latitude"]])[1];})
         .attr("r", function(d) { return radius(d.count2); });
	//	  .attr("r", function(d) { return radius(data[1][d.iata]); });
     	  
		

        
        // initialize the Mission as the default neighborhood
        var field = "FLIGHTS";

       // maximum reviews
        var max_y = d3.max(data[2], function(d) {
            var max = 0;

            d3.values(d).forEach(function(i) {
              if (+i && (+i > max)) {
                max = +i;
              }
            });

            return max;
        });

        // Create y-axis scale mapping price -> pixels
        var measure_scale = d3.scale.linear()
            .range([height, 100])
            .domain([0, max_y])
			;

        // Create D3 axis object from measure_scale for the y-axis
        var measure_axis = d3.svg.axis()
            .scale(measure_scale)
            .orient("right");

        // Append SVG to page corresponding to the D3 y-axis
        d3.select('#chart').append('g')
              .attr('class', 'y axis')
              .attr("transform", "translate(" + width + " , -15)")
              .call(measure_axis);

        // add label to y-axis	
        d3.select(".y.axis")
              .append("text")
              .attr('class', 'label')
              .text("Daily")
              .attr("transform", "translate(45,110) rotate(90)");

        // create a function to draw the timeseries for each neighborhood
        var drawChart = function(field) {
          // remove the previous chart
          d3.select('#chart').select('.x.axis').remove();
          d3.select('#chart').select('path').remove();

          // update the title
          d3.select('#heading')
            .text(field);

          // remove missing values
          var neigh_data = data[2].filter(function(d) {
            return d[field];
          });

          // get min/max dates
          var time_extent = d3.extent(neigh_data, function(d){
            return d['timestamp'];
			 ;
          });
		  
          // Create x-axis scale mapping dates -> pixels
          var time_scale = d3.scale.ordinal()
			// .range([0, width - margin])
			.rangeRoundBands([0, width - margin])
              .rangeBands([0, width - margin])
		   // .rangePoints([0, width - margin])
           // .range([0, width - margin])
		   // .rangeBands([0, width], .1)
			  .domain(time_extent)
			  ;

			  
          // Create D3 axis object from time_scale for the x-axis
          var time_axis = d3.svg.axis()
              .scale(time_scale)
		   // .ticks(10)
           // .tickFormat(d3.format(""))
		   // .tickFormat(d3.time.format("%b '%y"))
		   ;			  
			  
          // Append SVG to page corresponding to the D3 x-axis
          d3.select('#chart').append('g')
              .attr('class', 'x axis')
              .attr('transform', "translate(" + margin + ',' + (height - 15) + ")")
              .call(time_axis)
          .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

          // define the values to map for x and y position of the line
          var line = d3.svg.line()
                       .x(function(d) { return time_scale(d['timestamp']); })
                       .y(function(d) { return measure_scale(+d[field]); });
					   
					 
					   
					   ;

          // append a SVG path that corresponds to the line chart
          d3.select('#chart').append("path")
            .datum(neigh_data)
            .attr("class", "line")
            .attr("d", line)
            .attr('transform', 'translate(' + margin + ', -15)');
        };

        drawChart(field);

        // create a callback for the neighborhood hover
        var mover = function(d) {
          var neigh = d.iata;
          d3.select('#map path.' + neigh).style('fill', '#9999ff');

          drawChart(neigh);
        };

        // create a callback for the neighborhood hover
        var mout = function(d) {
          var neigh = d.iata;
          d3.select('path.' + neigh).style('fill', '#8e8e8e');
        }

        // attach events to neighborhoods in map
        map.on("mouseover", mover);
        map.on("mouseout", mout);

        // attach events to bubbles on map
        bubbles.on('mouseover', mover);
        bubbles.on('mouseout', mout);
		
		
		
		
		
		
		
		
		//https://stackoverflow.com/questions/34103077/d3-js-ordinal-scale
		//http://plnkr.co/edit/Yw1KRR6B8nIju7zz1kqt?p=preview
		
		
		
		
		
		
		
		
    }
 
