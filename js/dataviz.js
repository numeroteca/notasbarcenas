/* Built in d3 http://d3js.org/

Bar chart based on DRY Bar Chart http://bl.ocks.org/mbostock/5977197 
Tooltip based on http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
Also some ideas come from https://github.com/erhardt/Attention-Plotter
*/

var barwidth = 2; //width of the bars
var baseyears = 470;
var widthyears = 5;

//Prepare canvas size
var margin = {top: 10, right: 20, bottom: 20, left: 60},
    width = /*data.length*/ 676*barwidth - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var formatComma = d3.format(",");

//Sets yScale
var yValue = function(d) { return d.saldocalculado; }, // data -> value
    yScale = d3.scale.linear()
	.range([height, 0]), // fuction that converts the data values into display values: value -> display
    //yMap = function(d) { return yScale(yValue(d)); }, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(formatComma);

//Adds the div that is used for the tooltip
var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);	

//Sets Canvas
var svg = d3.select('#vis').append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Sets xScale
// define the x scale (horizontal)
var mindate = new Date(1990,3,1),
    maxdate = new Date(2008,11,31);
var xScale = d3.time.scale()
    //.domain([mindate, maxdate])    // values between for month of january
    .range([0, width]);   // map these the the chart width = total width minus padding at both sides

//var parseDate = d3.time.format("%m-%d-%Y").parse;
var parseDate = d3.time.format("%d-%m-%Y").parse;


// define the x axis
var xAxis = d3.svg.axis()
    .orient("bottom")
    .scale(xScale)
    .ticks(d3.time.years, 1);

// draw x axis with labels and move to the bottom of the chart area
svg.append("g")
    .attr("class", "xaxis")   // give it a class so it can be used to select only xaxis labels  below
    .attr("transform", "translate(0," + (height) + ")")
    .call(xAxis);


//Adds Background image with envelopes in and out
svg.append("image")
	.attr("xlink:href", "img/leyenda-1.png")
	.attr("x", "40")
	.attr("y", "60")
	.attr("width", "250")
	.attr("height", "301");


d3.tsv("data/viplist.tsv", function(error, data) {//reads the data.tsv file
	
	//Creates Legend for notime graph
	var legendnotime = d3.select("#legendnotime").attr("class", "legend");

	legendnotime.append("h5").style("font-weight","bold").text("Selecciona una persona"); //legend title

	legendnotime.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class","inactive btn btn-default btn-mini")
		.text(function(d) { return d.people; })
		.on('click',function(d) { //when click on name
			var personflat = d.people.replace(/\s+/g, ''); //removes spaces from person name
				if (d3.select(this).attr('class')==='inactive btn btn-default btn-mini'){
				//first time
				d3.selectAll('svg .barnotime').attr("opacity",1)
				d3.selectAll('svg .barnotime').transition().duration(500).attr("opacity",.15); //dims all bars 
			      	d3.selectAll('svg .barnotime.'+personflat).transition().duration(2500).attr("class","barnotime highlighted "+personflat); //adds class "highlighted" and person related class to the bar
				d3.select(this).transition().duration(0).attr("class","btn-danger btn btn-default btn-mini"); //adds class .active to button

				//second time
				} else if (d3.select(this).attr('class')==='btn-danger btn btn-default btn-mini'){
				      	d3.select(this).attr("class","inactive btn btn-default btn-mini"); //removes .active class
					d3.selectAll("svg .highlighted."+  personflat).attr("class","barnotime "+  personflat);
					d3.selectAll('svg .barnotime').transition().duration(500).attr("opacity",1);
				}
	  		});

	//Creates Legend for time graph
	var legend = d3.select("#legend").attr("class", "legend");

	legend.append("h5").style("font-weight","bold").text("Selecciona una persona"); //legend title
	legend.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class","inactive btn btn-default btn-mini")
		.text(function(d) { return d.people; })
		.on('click',function(d) { //when click on name
			var personflat = d.people.replace(/\s+/g, ''); //removes spaces from person name
				if (d3.select(this).attr('class')==='inactive btn btn-default btn-mini'){
					//first time
					d3.selectAll('svg .bar').attr("opacity",1)
					d3.selectAll('svg .bar').transition().duration(500).attr("opacity",.05); //dims all bars 
					    	d3.selectAll('svg .bar.'+personflat).transition().duration(2500).attr("class","bar highlighted "+personflat); //adds class "highlighted" and person related class to the bar
					d3.select(this).transition().duration(0).attr("class","btn-danger btn btn-default btn-mini"); //adds class .active to button

				//second time
				} else if (d3.select(this).attr('class')==='btn-danger btn btn-default btn-mini'){
				  d3.select(this).attr("class","inactive btn btn-default btn-mini"); //removes .active class
					d3.selectAll("svg .highlighted."+  personflat).attr("class","bar "+  personflat);
					d3.selectAll('svg .bar').transition().duration(500).attr("opacity",.15);
				}
	  		});
});

//Switch between graphs with and without time scales
d3.selectAll(".btn-group .btn").on('click', function() {//when click //
	if (d3.select(this).attr('id')==='contiempo'){/// si es el de con tiempo
		if (d3.select(this).attr('class')==='btn btn-small active'){ // si est'a activo
			//no hacer nada
		} else {						//si estaba desactivado
			d3.select(this).attr("class","btn btn-small active"); //adds class .active to button
			d3.selectAll("svg .bar").style("display","block");	
			//d3.selectAll("svg .xaxis").style("display","block");
			d3.selectAll("svg .x.axis").style("display","block");
			d3.select("#legend").style("display","block");
			d3.select("#legendnotime").style("display","none");
			d3.selectAll("svg .barnotime").style("display","none");
			d3.select("#sintiempo").attr("class","btn btn-small");
			
			
		}
	} else {
		if (d3.select(this).attr('class')==='btn active'){ // si est'a activo
			return;						//no hacer nada
		} else {
			d3.select("#contiempo").attr("class","btn btn-small");
			d3.select(this).attr("class","btn btn-small active"); //adds class .active to button
			d3.selectAll("svg .barnotime").style("display","block");
			d3.select("#legend").style("display","none");
			d3.select("#legendnotime").style("display","block");
			d3.selectAll("svg .bar").style("display","none");
			d3.selectAll("svg .xaxis").style("display","none");
			d3.selectAll("svg .x.axis").style("display","none");
		}
	}
});


d3.tsv("data/data.tsv", type, function(error, data) {//reads the data.tsv file
	data.forEach(function(d) {
    d.date = parseDate(d.date);
  });
  xScale.domain(d3.extent(data, function(d) { return d.date; }));
  yScale.domain(d3.extent(data, function(d) { return d.entradas; })).nice();

	//X axis 
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	//Y axis
	svg.append("g")
		.attr("class", "y axis")
		    	.call(yAxis).attr("font-size","12")
		  	.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.attr("font-size","10")
		.text("Euros");


	//Donations horizontal lines
	svg.append('line')
      .attr('y1', yScale(60000))
      .attr('y2', yScale(60000))
      .attr('x1', 0)
      .attr('x2', function(d) { return xScale(parseDate('07-06-2007')); }) //BOE http://www.boe.es/diario_boe/txt.php?id=BOE-A-2007-13022
	    .attr("class", "donaciones")
	    .on("mouseover", function(d) {      
          div.transition()        
              .duration(200)      
              .style("opacity", .9);      
          div.html("Limite Donaciones 60.000€" )  
              .style("left", (d3.event.pageX) + "px")     
              .style("top", (d3.event.pageY) - 60 + "px");    
          })                  
      .on("mouseout", function(d) {       
          div.transition()        
              .duration(500)      
              .style("opacity", 0);   
      });
 	svg.append('line')
    .attr('y1', yScale(100000))
    .attr('y2', yScale(100000))
    .attr('x1', function(d) { return xScale(parseDate('07-06-2007')); })
    .attr('x2', 647*barwidth)
    .attr("class", "donaciones")
    .on("mouseover", function(d) {      
          div.transition()        
              .duration(200)      
              .style("opacity", .9);      
          div.html("Limite Donaciones 100.000€" )  
              .style("left", (d3.event.pageX) + "px")     
              .style("top", (d3.event.pageY) - 60 + "px");    
          })                  
      .on("mouseout", function(d) {       
          div.transition()        
              .duration(500)      
              .style("opacity", 0);   
      });
	svg.append('line')
    .attr('y1', yScale(-60000))
    .attr('y2', yScale(-60000))
    .attr('x1', 0)
    .attr('x2', function(d) { return xScale(parseDate('07-06-2007')); })
    .attr("class", "donaciones")
    .on("mouseover", function(d) {      
          div.transition()        
              .duration(200)      
              .style("opacity", .9);      
          div.html("Limite Donaciones 60.000€" )  
              .style("left", (d3.event.pageX) + "px")     
              .style("top", (d3.event.pageY) +20 + "px");    
          })                  
      .on("mouseout", function(d) {       
          div.transition()        
              .duration(500)      
              .style("opacity", 0);   
      });
 	svg.append('line')
          .attr('y1', yScale(-100000))
          .attr('y2', yScale(-100000))
          .attr('x1', function(d) { return xScale(parseDate('07-06-2007')); })
          .attr('x2', 647*barwidth)
    .attr("class", "donaciones")
                     	    .on("mouseover", function(d) {      
          div.transition()        
              .duration(200)      
              .style("opacity", .9);      
          div.html("Limite Donaciones 100.000€" )  
              .style("left", (d3.event.pageX) + "px")     
              .style("top", (d3.event.pageY) +20 + "px");    
          })                  
	.on("mouseout", function(d) {       
	    div.transition()        
	        .duration(500)      
	        .style("opacity", 0);   
	});

	//The Bars with time scale
	svg.selectAll(".bar")
      	.data(data)
    	.enter().append("rect")
    	.attr("fill", function(d) { return d.entradas < 0 ? "#C00000" : "#0055D4"; })
	.attr("opacity",.4)
	.attr("class", 
		function(d) { //TODO iterate through array
			return d.persona.replace(/\s+/g, '')+" bar"; //sets the name of the person without spaces as class for the bar
		}) 
	//The tooltips
      //.attr("x", function(d, i) { return i * barwidth; })
      .attr("x", function(d) { return xScale(d.date); })
      .attr("width", 3)
      .attr("y", function(d) { return yScale(Math.max(0, d.entradas)); })
      .attr("height", function(d) { return Math.abs(yScale(d.entradas) - yScale(0)); })
		.on("mouseover", function(d) {      
		    div.transition()        
			.duration(200)      
			.style("opacity", .9);      
		    div.html(d.fecha + "<br/><strong/>"  + d.persona + "</strong/><br/>"  + formatComma(d.entradas) + "€ <br/>'"  + d.descripcion + "'" )  
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 128) + "px");    
		    })                  
		.on("mouseout", function(d) {       
		    div.transition()        
			.duration(500)      
			.style("opacity", 0);   
		});
		

	//The Bars with no time scale
	svg.selectAll(".barnotime")
      	.data(data)
    	.enter().append("rect")
    	.attr("fill", function(d) { return d.entradas < 0 ? "#C00000" : "#0055D4"; })
	.attr("class", 
		function(d) { //TODO iterate through array
			return d.persona.replace(/\s+/g, '')+" barnotime"; //sets the name of the person without spaces as class for the bar
		}) 
	//The tooltips
      .attr("x", function(d, i) { return i * barwidth; })
      //.attr("x", function(d) { return xScale(d.date); })
      .attr("width", 3)
      .attr("y", function(d) { return yScale(Math.max(0, d.entradas)); })
      .attr("height", function(d) { return Math.abs(yScale(d.entradas) - yScale(0)); })
		.on("mouseover", function(d) {      
		    div.transition()        
			.duration(200)      
			.style("opacity", .9);      
		    div.html(d.fecha + "<br/><strong/>"  + d.persona + "</strong/><br/>"  + formatComma(d.entradas) + "€ <br/>'"  + d.descripcion + "'" )  
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 128) + "px");    
		    })                  
		.on("mouseout", function(d) {       
		    div.transition()        
			.duration(500)      
			.style("opacity", 0);   
		});
});


function type(d) {
  d.entradas = +d.entradas;
  d.saldo = +d.saldo;
  return d;
}
