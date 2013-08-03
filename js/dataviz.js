/* Built in d3 http://d3js.org/

Bar chart based on DRY Bar Chart http://bl.ocks.org/mbostock/5977197 
Tooltip based on http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
Also some ideas come from https://github.com/erhardt/Attention-Plotter
*/


//Prepare canvas siza
var margin = {top: 20, right: 20, bottom: 30, left: 60},
    width = 1900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatComma = d3.format(",");
var barwidth = 2; //width of the bars
var baseyears = 470;
var widthyears = 5;

//Sets xScale
var xValue = function(d) { return d.fecha; }, // data -> value, this is not working
    //xScale = d3.scale.ordinal().rangeRoundBands([0, width], .0), // value -> display
	xScale = d3.scale.linear(), // value -> display
    xMap = function(d) { return xScale(xValue(d)); }, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

//Sets yScale
var yValue = function(d) { return d.saldocalculado; }, // data -> value
    yScale = d3.scale.linear()
	.range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d)); }, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(formatComma);

//Adds the div that is used for the tooltip
var div = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);	

//Sets Canvas
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Adds Background image with envelopes
var imgs = svg.selectAll("image").data([0]);
                imgs.enter()
                .append("svg:image")
                .attr("xlink:href", "img/leyenda-1.png")
                .attr("x", "60")
                .attr("y", "60")
                .attr("width", "250")
                .attr("height", "301");

d3.tsv("data/data.tsv", type, function(error, data) {//reads the tsv file
  xScale.domain(data.map(xValue)); 
  yScale.domain(d3.extent(data, function(d) { return d.entradas; })).nice();

	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

	//Donations horizontal lines
	svg.append('line')
            .attr('y1', yScale(60000))
            .attr('y2', yScale(60000))
            .attr('x1', 0)
            .attr('x2', 594*barwidth) //TODO it should refered to the date. May 2007, and not to a row in the file!
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
            .attr('x1', 594*barwidth)
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
            .attr('x2', 594*barwidth)
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
            .attr('x1', 594*barwidth)
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

	//TODO years. Lines with years at the bottom.
	svg.append('line')
            .attr('y1', baseyears)
            .attr('y2', baseyears)
            .attr('x1', 0*barwidth)
            .attr('x2', 19*barwidth)//TODO it should refered to the date. May 2007, and not to a row in the file!
	    .attr("class", "years")
	.on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            div.html("1991" )  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY) - 50 + "px");
	    yearrect.append('rect')
		.attr("x", 0*barwidth)
		.attr("width", 19*barwidth)
    		.attr("y", 0)
      		.attr("height", height);
			    
            })
	.on("mouseout", function(d) {       
		svg.select('.yearbar')   
			.style("opacity", 0);  
		div.transition()        
		       	.duration(500)      
		        .style("opacity", 0);
		});
	svg.append('line')
            .attr('y1', baseyears+widthyears)
            .attr('y2', baseyears+widthyears)
            .attr('x1', 19*barwidth)
            .attr('x2', 46*barwidth)
	    .attr("class", "years");
	svg.append('line')
            .attr('y1', baseyears)
            .attr('y2', baseyears)
            .attr('x1', 46*barwidth)
            .attr('x2', 85*barwidth)
	    .attr("class", "years");
	svg.append('line')
            .attr('y1', baseyears+widthyears)
            .attr('y2', baseyears+widthyears)
            .attr('x1', 85*barwidth)
            .attr('x2', 126*barwidth)
	    .attr("class", "years");
	svg.append('line')
            .attr('y1', baseyears)
            .attr('y2', baseyears)
            .attr('x1', 126*barwidth)
            .attr('x2', 175*barwidth)
	    .attr("class", "years");
	svg.append('line')
            .attr('y1', baseyears+widthyears)
            .attr('y2', baseyears+widthyears)
            .attr('x1', 175*barwidth)
            .attr('x2', 224*barwidth)
	    .attr("class", "years");
	svg.append('line')
            .attr('y1', baseyears)
            .attr('y2', baseyears)
            .attr('x1', 224*barwidth)
            .attr('x2', 248*barwidth)
	    .attr("class", "years");
	svg.append('line')
            .attr('y1', baseyears+widthyears)
            .attr('y2', baseyears+widthyears)
            .attr('x1', 248*barwidth)
            .attr('x2', 270*barwidth)
	    .attr("class", "years");

	svg.append('line')
            .attr('y1', baseyears)
            .attr('y2', baseyears)
            .attr('x1', 270*barwidth)
            .attr('x2', 292*barwidth)
	    .attr("class", "years");
	svg.append('line')
            .attr('y1', baseyears+widthyears)
            .attr('y2', baseyears+widthyears)
            .attr('x1', 292*barwidth)
            .attr('x2', 312*barwidth)
	    .attr("class", "years");

	svg.append('line')
            .attr('y1', baseyears)
            .attr('y2', baseyears)
            .attr('x1', 224*barwidth)
            .attr('x2', 248*barwidth)
	    .attr("class", "years");
	svg.append('line')
            .attr('y1', baseyears+widthyears)
            .attr('y2', baseyears+widthyears)
            .attr('x1', 248*barwidth)
            .attr('x2', 270*barwidth)
	    .attr("class", "years");

	//Y axis
  	svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Euros");
	

	//Legend TODO add loop to iterate through names
	/*var vip = [["Mariano Rajoy","marianorajoy"], ["Pedro Arriola","pedroarriola"], ["Francisco Álvarez Cascos","cascos"]];

	var index;
	for (index = 0; index < vip.length; ++index) {
		svg.append("g")
    		.append("text")
			.attr("y", index*18)
			.attr("x",300)
			.attr("dy", ".71em")
			//.attr('class','active')
			//.attr("class",vip[index][1])
			.text(vip[index][0])
			.on('click',function(d,index) { //when click on name
				d3.select(this).attr('class','active'); //turns text grey an adds class .active
		      	//d3.select('svg .active').attr('class',''); //turns .active text back to full opacity, removes .active	
				d3.selectAll('svg .'+ vip[index][1]).attr('class','bar highlighted '+ vip[index][1]); //adds class "highlighted" to all .marianorajoy bars
				//d3.selectAll('svg .highlighted').attr('class','bar ' + a[index][1]);

          	});
	}*/

	  svg.append("g")
		.append("text")
		  .attr("y", 6)
		  .attr("x",300)
		  .attr("dy", ".71em")
		  .text("Mariano Rajoy")
		.on('click',function(d) { 
		      	d3.selectAll('svg .marianorajoy').transition().duration(0).attr("class","bar marianorajoy highlighted"); //adds class "highlighted" to al .marianorajoy bars
				d3.select(this).transition().duration(0).attr("class","active"); //turns text grey an adds class .active
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class",""); //turns .active text back to full opacity, removes .active	
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar marianorajoy");
		      	});

	  svg.append("g")
		.append("text")
		  .attr("y", 25)
		  .attr("x",300)
		  .attr("dy", ".71em")
		  .text("Pedro Arriola")
		.on('click',function(d) { 
		      	d3.selectAll('svg .pedroarriola').transition().duration(0).attr("class","bar pedroarriola highlighted");
				d3.select(this).transition().duration(0).attr("class","active");
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class","");
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar pedroarriola");
		      	});

	  svg.append("g")
		.append("text")
		  .attr("y", 44)
		  .attr("x",300)
		  .attr("dy", ".71em")
		  .text("Francisco Álvarez Cascos")
		.on('click',function(d) { 
		      	d3.selectAll('svg .cascos').transition().duration(0).attr("class","bar cascos highlighted");
				d3.select(this).transition().duration(0).attr("class","active");
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class","");
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar cascos");
		      	});

	  svg.append("g")
		.append("text")
		  .attr("y", 63)
		  .attr("x",300)
		  .attr("dy", ".71em")
		  .text("Javier Arenas")
		.on('click',function(d) { 
		      	d3.selectAll('svg .arenas').transition().duration(0).attr("class","bar arenas highlighted");
				d3.select(this).transition().duration(0).attr("class","active");
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class","");
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar arenas");
		      	});

	  svg.append("g")
		.append("text")
		  .attr("y", 82)
		  .attr("x",300)
		  .attr("dy", ".71em")
		  .text("Angel Piñeiro")
		.on('click',function(d) { 
		      	d3.selectAll('svg .pineiro').transition().duration(0).attr("class","bar pineiro highlighted");
				d3.select(this).transition().duration(0).attr("class","active");
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class","");
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar pineiro");
		      	});

	  svg.append("g")
		.append("text")
		  .attr("y", 6)
		  .attr("x",460)
		  .attr("dy", ".71em")
		  .text("Juan Manuel Villar Mir")
		.on('click',function(d) { 
		      	d3.selectAll('svg .villarmir').transition().duration(0).attr("class","bar villarmir highlighted");
				d3.select(this).transition().duration(0).attr("class","active");
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class","");
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar villarmir");
		      	});

	  svg.append("g")
		.append("text")
		  .attr("y", 25)
		  .attr("x",460)
		  .attr("dy", ".71em")
		  .text("Jaime Ignacio de Burgo")
		.on('click',function(d) { 
		      	d3.selectAll('svg .deburgo').transition().duration(0).attr("class","bar deburgo highlighted");
				d3.select(this).transition().duration(0).attr("class","active");
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class","");
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar deburgo");
		      	});

	  svg.append("g")
		.append("text")
		  .attr("y", 44)
		  .attr("x",460)
		  .attr("dy", ".71em")
		  .text("Jaime Mayor Oreja")
		.on('click',function(d) { 
		      	d3.selectAll('svg .oreja').transition().duration(0).attr("class","bar oreja highlighted");
				d3.select(this).transition().duration(0).attr("class","active");
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class","");
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar oreja");
		      	});

	  svg.append("g")
		.append("text")
		  .attr("y", 63)
		  .attr("x",460)
		  .attr("dy", ".71em")
		  .text("Rodrigo Rato")
		.on('click',function(d) { 
		      	d3.selectAll('svg .rato').transition().duration(0).attr("class","bar rato highlighted");
				d3.select(this).transition().duration(0).attr("class","active");
		      	d3.select('svg .active').transition().duration(0).attr('opacity',1).attr("class","");
				d3.selectAll('svg .highlighted').transition().duration(0).attr("class","bar rato");
		      	});

	//The Bars
  	svg.selectAll(".bar")
      .data(data)
    	.enter().append("rect")
    	.attr("fill", function(d) { return d.entradas < 0 ? "#800000" : "#0055D4"; })
		// .attr("class",function(d) { return d.persona == "Mariano Rajoy" ? "bar pedroarriola" : "bar"; })
     	// .attr("title", function(d) { return d.persona;  })
	.attr("class", 
		function(d) { //TODO iterate through array
			var perso = d.persona;
			if ( perso == "Francisco Álvarez Cascos") { 
				 return "bar cascos";
			} else if ( perso == "Mariano Rajoy") { 
				return "bar marianorajoy";
			} else if (  perso == "Pedro Arriola") { 
				return "bar pedroarriola";
			} else if (  perso == "Javier Arenas") { 
				return "bar arenas";
			} else if (  perso == "Angel Piñeiro") { 
				return "bar pineiro";
			} else if ( perso == "Juan Manuel Villar Mir") { 
				return "bar villarmir";
			} else if (  perso == "Jaime Ignacio de Burgo") { 
				return "bar deburgo";
			} else if (  perso == "Jaime Mayor Oreja") { 
				return "bar oreja";
			} else if (  perso == "Rodrigo Rato") { 
				return "bar rato";
			} else { 
				return "bar";
		}
	} 
	) //The tooltips
      .attr("x", function(d, i) { return i * barwidth; })
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
