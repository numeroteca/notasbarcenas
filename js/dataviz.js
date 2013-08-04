/* Built in d3 http://d3js.org/

Bar chart based on DRY Bar Chart http://bl.ocks.org/mbostock/5977197 
Tooltip based on http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
Also some ideas come from https://github.com/erhardt/Attention-Plotter
*/



var barwidth = 2; //width of the bars
var baseyears = 470;
var widthyears = 5;

//Prepare canvas size
var margin = {top: 20, right: 20, bottom: 150, left: 60},
    width = /*data.length*/ 676*barwidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var formatComma = d3.format(",");


//Sets xScale
/*var xValue = function(d) { return d.fecha; }, // data -> value, this is not working
    xScale = d3.scale.ordinal().rangeRoundBands([0, width], .0), // value -> display
    xScale = d3.scale.linear(), // value -> display
    xMap = function(d) { return xScale(xValue(d)); }, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");*/

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
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Adds Background image with envelopes in and out
svg.append("image")
	.attr("xlink:href", "img/leyenda-1.png")
	.attr("x", "40")
	.attr("y", "60")
	.attr("width", "250")
	.attr("height", "301");

svg.append("text").attr("class","active").attr("y",height).attr("x",50).text("Selecciona una persona");

var vip = ["","Mariano Rajoy","Pedro Arriola","Francisco Álvarez Cascos","Javier Arenas","Angel Piñeiro","Juan Manuel Villar Mir","Jaime Ignacio de Burgo","Jaime Mayor Oreja","Rodrigo Rato","Juan Cotino","Ángel Acebes","José Luis Sánchez"];
	svg.selectAll("text")
		.data(vip)
	.enter().append("text")
		.attr("y", function(d, i) { return i * 11 + height; })
		.attr("x",50)
		.attr("dy", ".71em")
		.attr("class","inactive")
		.text(String)
		.on('click',function(d) { //when click on name
			var personflat = d.replace(/\s+/g, ''); //removes spaces from person name
				if (d3.select(this).attr('class')==='inactive'){
				//first time
				d3.selectAll('svg .bar').attr("opacity",1)
				d3.selectAll('svg .bar').transition().duration(500).attr("opacity",.15); //dims all bars 
			      	d3.selectAll('svg .'+personflat).transition().duration(2500).attr("class","bar highlighted "+personflat); //adds class "highlighted" to al .marianorajoy bars
				d3.select(this).transition().duration(0).attr("class","active"); //adds class .active to button

				//second time
				} else if (d3.select(this).attr('class')==='active'){
				      	d3.select(this).attr("class","inactive"); //removes .active class
					d3.selectAll("svg .highlighted."+  personflat).attr("class","bar "+  personflat);
					d3.selectAll('svg .bar').transition().duration(500).attr("opacity",1);
				}
          		});

d3.tsv("data/data.tsv", type, function(error, data) {//reads the tsv file
  //xScale.domain(data.map(xValue)); 
  yScale.domain(d3.extent(data, function(d) { return d.entradas; })).nice();

	/* X axis 
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
 		.call(xAxis);*/

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
	/*svg.append('line')
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
	    .attr("class", "years")
	*/

	//The Bars
  	svg.selectAll(".bar")
	      	.data(data)
	    	.enter().append("rect")
	    	.attr("fill", function(d) { return d.entradas < 0 ? "#C00000" : "#0055D4"; })
		// .attr("class",function(d) { return d.persona == "Mariano Rajoy" ? "bar pedroarriola" : "bar"; })
     		// .attr("title", function(d) { return d.persona;  })
		.attr("class", 
		function(d) { //TODO iterate through array
			var perso = d.persona;
			if ( perso == "Francisco Álvarez Cascos") { 
				 return "bar FranciscoÁlvarezCascos";
			} else if ( perso == "Mariano Rajoy") { 
				return "bar MarianoRajoy";
			} else if (  perso == "Pedro Arriola") { 
				return "bar PedroArriola";
			} else if (  perso == "Javier Arenas") { 
				return "bar JavierArenas";
			} else if (  perso == "Angel Piñeiro") { 
				return "bar AngelPiñeiro";
			} else if ( perso == "Juan Manuel Villar Mir") { 
				return "bar JuanManuelVillarMir";
			} else if (  perso == "Jaime Ignacio de Burgo") { 
				return "bar JaimeIgnaciodeBurgo";
			} else if (  perso == "Jaime Mayor Oreja") { 
				return "bar JaimeMayorOreja";
			} else if (  perso == "Rodrigo Rato") { 
				return "bar RodrigoRato";
			} else if (  perso == "Ángel Acebes") { 
				return "bar ÁngelAcebes";
			} else if (  perso == "Juan Cotino") { 
				return "bar JuanCotino";
			} else if (  perso == "José Luis Sánchez") { 
				return "bar JoséLuisSánchez";
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
