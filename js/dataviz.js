/* Built in d3 http://d3js.org/

Bar chart based on DRY Bar Chart http://bl.ocks.org/mbostock/5977197 
Tooltip based on http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
Also some ideas come from https://github.com/erhardt/Attention-Plotter
*/

var barwidth = 2, //width of the bars
 widthyears = 5,
 electionsgeneral = 435,
 electionsmunicipal = 415,
 electionslineheight = 15;

//Prepare canvas size
var margin = {top: 10, right: 20, bottom: 30, left: 65},
    width = 676*barwidth - margin.left - margin.right,
    height = 490 - margin.top - margin.bottom;

var formatComma = d3.format(",");

//Sets yScale
var yValue = function(d) { return d.SaldoCalculado; }, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // fuction that converts the data values into display values: value -> display
    yScaleB = d3.scale.linear().range([height, 0]),
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(formatComma);
    yAxisB = d3.svg.axis().scale(yScaleB).orient("left").tickFormat(formatComma);

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
    maxdate = new Date(2009,1,1);
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
var background = svg.append('g').attr('id','backgroundimage');
background.append("image")
	.attr("xlink:href", "img/leyenda-1.png")
	.attr("x", "0")
	.attr("y", "50")
	.attr("width", "250")
	.attr("height", "301");

//set elections lines
var elections = svg.append('g').attr('class','elections electionschart').attr('id','electionsgraph');

//sets saldos dots
var saldosdots = svg.append('g').attr('class','saldosdots');

//sets entradas circulos
var entradascirculos = svg.append('g').attr('id','circuloschart');

//Bars time scale
var barstimescale = svg.append('g').attr('id','barstimescale');

//Bars time scale
var barstimescalewithsaldo = svg.append('g').attr('id','barstimescalewithsaldo');

//Bars no time scale
var barsnotimescale = svg.append('g').attr('id','barsnotimescale');

//set Donations line
var donationslines = barstimescale.append('g').attr('class','donationslines');
var donationslinesnotime = barsnotimescale.append('g').attr('class','donationslinesnotime');

//Saldo Line Chart
var lineFunction = d3.svg.line()
	.interpolate("linear")
 	.x(function(d) { return xScale(d.date); })	
	.y(function(d) { return yScaleB(d.SaldoCalculado);}); 
var saldopath = barstimescalewithsaldo.append('g').attr('id','saldocalculado').attr('class','saldocalculado');

//Line Chart2
var lineFunction2 = d3.svg.line()
	.interpolate("linear")
	.x(function(d,i) { return i*barwidth; })
	.y(function(d) { return yScale(d.SaldoAnotado);}); 

d3.tsv("data/viplist.tsv", function(error, data) {//reads the viplist.tsv file
	//Creates Legend for notime graph
	var legendnotime = d3.select("#legendnotime").attr("class", "legend");
	legendnotime.append("h5").style("font-weight","bold").text("Selecciona una persona"); //legend title
	legendnotime.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs " + d.tipo;})
		.text(function(d) { return d.people; })
		.on('click',function(d) { //when click on name
			var personflat = d.people.replace(/\s+/g, '').replace(/\.+/g, ''), //removes spaces and . from person name
			    tipodonante = d.tipo,
			    confirmado = d.confirmado;
				if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs donante' || d3.select(this).attr('class')==='inactive btn btn-default btn-xs beneficiario' || d3.select(this).attr('class')==='inactive btn btn-default btn-xs donabenef'){
				//first time
				d3.selectAll('svg .barnotime').attr("opacity",1)
				d3.selectAll('svg .barnotime').transition().duration(500).attr("opacity",.15); //dims all bars 
			      	d3.selectAll('svg .barnotime.'+personflat).transition().duration(2500).attr("class","barnotime highlighted "+personflat); //adds class "highlighted" and person related class to the bar
				d3.select(this).transition().duration(0).attr("class","btn-warning btn btn-default btn-xs"); //adds class .active to button
				//second time
				} else if (d3.select(this).attr('class')==='btn-warning btn btn-default btn-xs'){
				      	d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs " + d.tipo;}); //removes .active class
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
		.attr("class", function(d) { return "inactive btn btn-default btn-xs " + d.tipo;})
		.text(function(d) { return d.people; })
		.on('click',function(d) { //when click on name
			var personflat = d.people.replace(/\s+/g, '').replace(/\.+/g, ''), //removes spaces and . from person name
			    tipodonante = d.tipo,
			    confirmado = d.confirmado;
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs donante' 
				|| d3.select(this).attr('class')==='inactive btn btn-default btn-xs beneficiario' 		
				|| d3.select(this).attr('class')==='inactive btn btn-default btn-xs donabenef'){
				//first time
				d3.selectAll('svg .bar').attr("opacity",1)
				d3.selectAll('svg .bar').transition().duration(500).attr("opacity",.05); //dims all bars
				d3.selectAll('svg .bar.'+personflat).transition().duration(2500).attr("class","bar highlighted "+personflat); //adds class "highlighted" and person related class to the bar
				d3.select(this).transition().duration(0).attr("class","btn-warning btn btn-default btn-xs"); //adds class .active to button
			//second time
			} else if (d3.select(this).attr('class')==='btn-warning btn btn-default btn-xs'){
				d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs " + d.tipo;}); //removes .active class
				d3.selectAll("svg .highlighted."+ personflat).attr("class","bar "+ personflat);
				d3.selectAll('svg .bar').transition().duration(500).attr("opacity",.4);
			}
		});

	//Creates Legend for time graph Circles
	var legend = d3.select("#legendcirculos").attr("class", "legend");
	legend.append("h5").style("font-weight","bold").text("Selecciona una persona"); //legend title
	legend.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs " + d.tipo;})
		.text(function(d) { return d.people; })
		.on('click',function(d) { //when click on name
			var personflat = d.people.replace(/\s+/g, '').replace(/\.+/g, ''), //removes spaces and . from person name
			    tipodonante = d.tipo,
			    confirmado = d.confirmado;
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs donante' || d3.select(this).attr('class')==='inactive btn btn-default btn-xs beneficiario' || d3.select(this).attr('class')==='inactive btn btn-default btn-xs donabenef'){
				//first time
					d3.selectAll('svg .circulos').attr("opacity",1)
					d3.selectAll('svg .circulos').transition().duration(500).attr("opacity",.1); //dims all bars 
					d3.selectAll('svg .circulos.'+personflat).transition().duration(2500).attr("class","circulos selected "+personflat + " " + confirmado); 
					d3.select(this).transition().duration(0).attr("class","btn-warning btn btn-default btn-xs"); //adds class .active to button
				//second time
				} else if (d3.select(this).attr('class')==='btn-warning btn btn-default btn-xs'){
					d3.select(this).attr("class", "inactive btn btn-default btn-xs " + tipodonante); //removes .active class
					d3.selectAll("svg .selected."+  personflat).attr("class","circulos "+  personflat + " " +confirmado);
					d3.selectAll('svg .circulos').transition().duration(500).attr("opacity",.9);
				}
	  		});
});

//Switch between graphs with and without time scales
d3.selectAll(".btn-group .btn").on('click', function() {//when click //
	if (d3.select(this).attr('id')==='contiempo'){ // with time
		if (d3.select(this).attr('class')==='btn btn-lg btn-danger'){ // si activo
			//no hacer nada
		} else {						//si estaba desactivado
			d3.select(this).attr("class","btn btn-lg btn-danger"); //adds class .active to button
			d3.select("#sintiempo").attr("class","btn btn-lg");
			d3.select("#circulos").attr("class","btn btn-lg");
			d3.select("#contiemposaldo").attr("class","btn btn-lg");
			d3.select("#backgroundimage").style("display","block");
			d3.selectAll("#barstimescale").style("display","block");
			d3.selectAll("svg .x.axis").style("display","block");
			d3.selectAll("svg .y.axis").style("display","block");
			d3.selectAll("svg .donationslines").style("display","block");
			d3.select("#legend").style("display","block");
			d3.select("#electionsgraph").style("display","block");
			d3.select("#barstimescalewithsaldo").style("display","none");
			d3.select("#circuloschart").style("display","none");
			d3.select("#legendnotime").style("display","none");
			d3.select("#legendcirculos").style("display","none");
			d3.select("#barsnotimescale").style("display","none");

		}
	} else if (d3.select(this).attr('id')==='circulos'){ //bars + circles with time 
		if (d3.select(this).attr('class')==='btn btn-lg btn-danger'){ // si activo
			//no hacer nada
		} else {						//si estaba desactivado
			d3.select(this).attr("class","btn btn-lg btn-danger"); //adds class .active to button
			d3.select("#sintiempo").attr("class","btn btn-lg");
			d3.select("#contiempo").attr("class","btn btn-lg");
			d3.select("#contiemposaldo").attr("class","btn btn-lg");
			d3.select("#circuloschart").style("display","block");
			d3.select("#backgroundimage").style("display","block");
			d3.selectAll("svg .x.axis").style("display","block");
			d3.selectAll("svg .y.axis").style("display","none");
			d3.select("#legendcirculos").style("display","block");
			d3.select("#legend").style("display","none");
			d3.select("#electionsgraph").style("display","block");
			d3.select("#legendnotime").style("display","none");
			d3.selectAll("#barstimescale").style("display","none");
			d3.selectAll("#barsnotimescale").style("display","none");
			d3.select("#barstimescalewithsaldo").style("display","none");
		}
	} else if (d3.select(this).attr('id')==='contiemposaldo'){ //bars + saldo line
		if (d3.select(this).attr('class')==='btn btn-lg btn-danger'){ // si activo
			//no hacer nada
		} else {						//si estaba desactivado
			d3.select(this).attr("class","btn btn-lg btn-danger"); 
			d3.select("#sintiempo").attr("class","btn btn-lg");
			d3.select("#contiempo").attr("class","btn btn-lg");
			d3.select("#circulos").attr("class","btn btn-lg");
			d3.select("#barstimescalewithsaldo").style("display","block");
			d3.select("#backgroundimage").style("display","none");
			d3.selectAll("svg .x.axis").style("display","block");
			d3.select("#electionsgraph").style("display","block");
			d3.selectAll("svg .y.axis").style("display","none");
			d3.select("#circuloschart").style("display","none");
			d3.select("#legendcirculos").style("display","none");
			d3.select("#legend").style("display","block");
			d3.select("#legendcirculos").style("display","none");
			d3.select("#legendnotime").style("display","none");
			d3.selectAll("#barstimescale").style("display","none");
			d3.selectAll("#barsnotimescale").style("display","none");
		}
	} else {
		if (d3.select(this).attr('class')==='btn  btn-lg btn-danger'){ // without time
			return;						//no hacer nada
		} else {
			d3.select(this).attr("class","btn  btn-lg btn-danger");  
			d3.select("#contiempo").attr("class","btn btn-lg");
			d3.select("#circulos").attr("class","btn btn-lg");
			d3.select("#contiemposaldo").attr("class","btn btn-lg");
			d3.select("#backgroundimage").style("display","block");
			d3.select("#legendnotime").style("display","block");
			d3.selectAll("#barsnotimescale").style("display","block");
			d3.selectAll("svg .y.axis").style("display","block");
			d3.select("#legend").style("display","none");
			d3.selectAll("svg .xaxis").style("display","none");
			d3.selectAll("svg .x.axis").style("display","none");
			d3.select("#electionsgraph").style("display","none");
			d3.select("#circuloschart").style("display","none");
			d3.selectAll("#barstimescale").style("display","none");
			d3.selectAll("#barsnotimescale").style("display","block");
			d3.select("#legendcirculos").style("display","none");
			d3.select("#barstimescalewithsaldo").style("display","none");
		}
	}
});

//Enters data.tsv and starts the graph-----------------------------------------
d3.tsv("data/data.tsv", type, function(error, data) {//reads the data.tsv file
	data.forEach(function(d) {
    d.date = parseDate(d.date);
  });
	//Sets scales
  xScale.domain(d3.extent(data, function(d) { return d.date; })); //sets xScale depending on dates values
  yScale.domain(d3.extent(data, function(d) { return d.entradas; })).nice(); //sets yScale depending on entradas values
  yScaleB.domain([-300000, 1000000]).nice(); 

	//Sets X axis 
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	//Sets Y axis
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

	//Sets Y axis B
	barstimescalewithsaldo.append("g")
		.attr("class", "y axisb")
		    	.call(yAxisB).attr("font-size","12")
		  	.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.attr("font-size","10")
		.text("Euros");

	//Donations horizontal lines time. TODO: iterate through values
	donationslines.append('line')
		.attr('y1', yScale(60000))
		.attr('y2', yScale(60000))
		.attr('x1', 0)
		.attr('x2', function(d) { return xScale(parseDate('06-07-2007')); }) //6 julio 2007. BOE http://www.boe.es/diario_boe/txt.php?id=BOE-A-2007-13022
		.attr("class", "donaciones")
		.on("mouseover", function(d) {      
		  div.transition()        
		      .duration(200)      
		      .style("opacity", .9);      
		  div.html("Límite Donaciones 60.000€" )  
		      .style("left", (d3.event.pageX) + "px")     
		      .style("top", (d3.event.pageY) - 60 + "px");    
		  })                  
		.on("mouseout", function(d) {       
		  div.transition()        
		      .duration(500)      
		      .style("opacity", 0);   
		});
 	donationslines.append('line')
		.attr('y1', yScale(100000))
		.attr('y2', yScale(100000))
		.attr('x1', function(d) { return xScale(parseDate('06-07-2007')); })
		.attr('x2', 647*barwidth)
		.attr("class", "donaciones")
	    	.on("mouseover", function(d) {      
			  div.transition()        
			      .duration(200)      
			      .style("opacity", .9);      
			  div.html("Límite Donaciones 100.000€" )  
			      .style("left", (d3.event.pageX) + "px")     
			      .style("top", (d3.event.pageY) - 60 + "px");    
			  })                  
			.on("mouseout", function(d) {       
			  div.transition()        
			      .duration(500)      
			      .style("opacity", 0);   
		     	 });
	donationslines.append('line')
	    .attr('y1', yScale(-60000))
	    .attr('y2', yScale(-60000))
	    .attr('x1', 0)
	    .attr('x2', function(d) { return xScale(parseDate('06-07-2007')); })
	    .attr("class", "donaciones")
	    .on("mouseover", function(d) {      
		  div.transition()        
		      .duration(200)      
		      .style("opacity", .9);      
		  div.html("Límite Donaciones 60.000€" )  
		      .style("left", (d3.event.pageX) + "px")     
		      .style("top", (d3.event.pageY) +20 + "px");    
		  })                  
	      .on("mouseout", function(d) {       
		  div.transition()        
		      .duration(500)      
		      .style("opacity", 0);   
	      });
 	donationslines.append('line')
		.attr('y1', yScale(-100000))
		.attr('y2', yScale(-100000))
		.attr('x1', function(d) { return xScale(parseDate('06-07-2007')); })
		.attr('x2', 647*barwidth)
		.attr("class", "donaciones")
		.on("mouseover", function(d) {      
			  div.transition()        
			      .duration(200)      
			      .style("opacity", .9);      
			  div.html("Límite Donaciones 100.000€" )  
			      .style("left", (d3.event.pageX) + "px")     
			      .style("top", (d3.event.pageY) +20 + "px");    
			  })                  
			.on("mouseout", function(d) {       
			    div.transition()        
				.duration(500)      
				.style("opacity", 0);   
			});

	//Donations horizontal lines notime. TODO: iterate through values
	donationslinesnotime.append('line')
		.attr('y1', yScale(60000))
		.attr('y2', yScale(60000))
		.attr('x1', 0)
		.attr('x2',596*barwidth) //6 julio 2007. BOE http://www.boe.es/diario_boe/txt.php?id=BOE-A-2007-13022
		.attr("class", "donaciones")
		.on("mouseover", function(d) {      
		  div.transition()        
		      .duration(200)      
		      .style("opacity", .9);      
		  div.html("Límite Donaciones 60.000€" )  
		      .style("left", (d3.event.pageX) + "px")     
		      .style("top", (d3.event.pageY) - 60 + "px");    
		  })                  
		.on("mouseout", function(d) {       
		  div.transition()        
		      .duration(500)      
		      .style("opacity", 0);   
		});
 	donationslinesnotime.append('line')
		.attr('y1', yScale(100000))
		.attr('y2', yScale(100000))
		.attr('x1', 596*barwidth)
		.attr('x2', 647*barwidth)
		.attr("class", "donaciones")
	    	.on("mouseover", function(d) {      
			  div.transition()        
			      .duration(200)      
			      .style("opacity", .9);      
			  div.html("Límite Donaciones 100.000€" )  
			      .style("left", (d3.event.pageX) + "px")     
			      .style("top", (d3.event.pageY) - 60 + "px");    
			  })                  
			.on("mouseout", function(d) {       
			  div.transition()        
			      .duration(500)      
			      .style("opacity", 0);   
		     	 });
	donationslinesnotime.append('line')
	    .attr('y1', yScale(-60000))
	    .attr('y2', yScale(-60000))
	    .attr('x1', 0)
	    .attr('x2', 596*barwidth)
	    .attr("class", "donaciones")
	    .on("mouseover", function(d) {      
		  div.transition()        
		      .duration(200)      
		      .style("opacity", .9);      
		  div.html("Límite Donaciones 60.000€" )  
		      .style("left", (d3.event.pageX) + "px")     
		      .style("top", (d3.event.pageY) +20 + "px");    
		  })                  
	      .on("mouseout", function(d) {       
		  div.transition()        
		      .duration(500)      
		      .style("opacity", 0);   
	      });
 	donationslinesnotime.append('line')
		.attr('y1', yScale(-100000))
		.attr('y2', yScale(-100000))
		.attr('x1', 596*barwidth)
		.attr('x2', 647*barwidth)
		.attr("class", "donaciones")
		.on("mouseover", function(d) {      
			  div.transition()        
			      .duration(200)      
			      .style("opacity", .9);      
			  div.html("Límite Donaciones 100.000€" )  
			      .style("left", (d3.event.pageX) + "px")     
			      .style("top", (d3.event.pageY) +20 + "px");    
			  })                  
			.on("mouseout", function(d) {       
			    div.transition()        
				.duration(500)      
				.style("opacity", 0);   
			});

	//Sets the bars with time scale
	barstimescale.selectAll(".bar")
      	.data(data)
    	.enter().append("rect")
    	.attr("fill", function(d) { return d.entradas < 0 ? "#C00000" : "#0055D4"; })
	.attr("opacity",.4)
	.attr("class", 
		function(d) { 
			return d.persona.replace(/\s+/g, '').replace(/\.+/g, '') +" bar"; //sets the name of the person without spaces as class for the bar
		}) 
	//The tooltips time scale
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth+1)
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

	//Sets the bars with time scale and saldo
	barstimescalewithsaldo.selectAll(".bar")
      	.data(data)
    	.enter().append("rect")
    	.attr("fill", function(d) { return d.entradas < 0 ? "#C00000" : "#0055D4"; })
	.attr("opacity",.4)
	.attr("class", 
		function(d) { 
			return d.persona.replace(/\s+/g, '').replace(/\.+/g, '') +" bar"; //sets the name of the person without spaces as class for the bar
		}) 
	//The tooltips time scale
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth+1)
	.attr("y", function(d) { return yScaleB(Math.max(0, d.entradas)); })
	.attr("height", function(d) { return Math.abs(yScaleB(d.entradas) - yScaleB(0)); })
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
		
	//Election years TODO iterate through array
	elections.append("text").attr("x", 5).attr("y", electionsmunicipal-10)
		.text("Elecciones")
		.attr("font-size", "12px")
		.attr("fill", "black")
		.attr("font-weight", "bold"); 
	//elecciones Generales	
	elections.append("text").attr("x", 5).attr("y", electionsgeneral+7.5)
		.text("Generales")
		.attr("font-size", "12px")
		.attr("fill", "grey");
	elections.append('line')
    .attr('y1', electionsgeneral)
    .attr('y2', electionsgeneral+electionslineheight )
    .attr('x1', function(d) { return xScale(parseDate('06-06-1993')); })
    .attr('x2', function(d) { return xScale(parseDate('06-06-1993')); })
		.attr('title','Generales 1993')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', electionsgeneral)  
			});
	elections.append('line')
    .attr('y1', electionsgeneral)
    .attr('y2', electionsgeneral+electionslineheight )
    .attr('x1', function(d) { return xScale(parseDate('03-03-1996')); })
    .attr('x2', function(d) { return xScale(parseDate('03-03-1996')); })
		.attr('title','Generales 1996')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', electionsgeneral)  
			});
	elections.append('line')
    .attr('y1', electionsgeneral)
    .attr('y2', electionsgeneral+electionslineheight)
    .attr('x1', function(d) { return xScale(parseDate('12-03-2000')); })
    .attr('x2', function(d) { return xScale(parseDate('12-03-2000')); })
		.attr('title','Generales 2000')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', electionsgeneral)  
			});
	elections.append('line')
    .attr('y1', electionsgeneral)
    .attr('y2', electionsgeneral+electionslineheight)
    .attr('x1', function(d) { return xScale(parseDate('14-03-2004')); })
    .attr('x2', function(d) { return xScale(parseDate('14-03-2004')); })
		.attr('title','Generales 2004')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', electionsgeneral)  
			})
	elections.append('text')
		.attr("x", function(d) { return xScale(parseDate('14-04-2004')); })
		.attr("y", electionsgeneral+electionslineheight-3)
		.text("Generales 2004").attr("font-size", "12px")
		.attr("fill", "grey");
	elections.append('line')
    .attr('y1', electionsgeneral)
    .attr('y2', electionsgeneral+electionslineheight)
    .attr('x1', function(d) { return xScale(parseDate('09-03-2008')); })
    .attr('x2', function(d) { return xScale(parseDate('09-03-2008')); })
		.attr('title','Generales 2008')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', electionsgeneral)  
			});
	elections.append('text')
		.attr("x", function(d) { return xScale(parseDate('09-03-2008')); })
		.attr("y", electionsgeneral+electionslineheight-3)
		.text("Generales 2008").attr("font-size", "12px")
		.attr("fill", "grey");
	//Elecciones Municipales 
	elections.append("text").attr("x", 5).attr("y", electionsmunicipal+10)
		.text("Municipales")
		.attr("font-size", "12px")
		.attr("fill", "grey");
	elections.append('line')
		.attr('y1', electionsmunicipal)
		.attr('y2', electionsmunicipal+electionslineheight)
		.attr('x1', function(d) { return xScale(parseDate('26-05-1991')); })
		.attr('x2', function(d) { return xScale(parseDate('26-05-1991')); })
		.attr('title','Municipales 1991')
		.on("mouseover", function(d) {      
			d3.select(this).attr('y1', 0)
				})
		.on("mouseout", function(d) {       
				d3.select(this).attr('y1', electionsmunicipal)  
			});
	elections.append('line')
		.attr('y1', electionsmunicipal)
		.attr('y2', electionsmunicipal+electionslineheight)
		.attr('x1', function(d) { return xScale(parseDate('28-05-1995')); })
		.attr('x2', function(d) { return xScale(parseDate('28-05-1995')); })
		.attr('title','Municipales 1995')
		.on("mouseover", function(d) {      
			d3.select(this).attr('y1', 0)
				})
		.on("mouseout", function(d) {       
				d3.select(this).attr('y1', electionsmunicipal)  
			});
	elections.append('line')
    .attr('y1', electionsmunicipal)
    .attr('y2', electionsmunicipal+electionslineheight)
    .attr('x1', function(d) { return xScale(parseDate('13-06-1999')); })
    .attr('x2', function(d) { return xScale(parseDate('13-06-1999')); })
		.attr('title','Municipales 1999')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', electionsmunicipal)  
			});
	elections.append('line')
    .attr('y1', electionsmunicipal)
    .attr('y2', electionsmunicipal+electionslineheight)
    .attr('x1', function(d) { return xScale(parseDate('25-05-2003')); })
    .attr('x2', function(d) { return xScale(parseDate('25-05-2003')); })
		.attr('title','Municipales 2003')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', electionsmunicipal)  
			});
	elections.append('line')
    .attr('y1', electionsmunicipal)
    .attr('y2', electionsmunicipal+electionslineheight)
    .attr('x1', function(d) { return xScale(parseDate('27-05-2007')); })
    .attr('x2', function(d) { return xScale(parseDate('27-05-2007')); })
		.attr('title','Municipales 2007')
		.on("mouseover", function(d) {      
		  d3.select(this).attr('y1', 0)
		    })
		.on("mouseout", function(d) {       
		    d3.select(this).attr('y1', electionsmunicipal)  
			});

	//Saldo notime
	saldopath.append("path")
		.attr("d", function(d) { return lineFunction(data);}).attr("id","saldocalculado")
		.on("mouseover", function(d) {      
		    div.transition()        
			.duration(200)      
			.style("opacity", .9);      
		    div.html("Saldo calculado: entradas - salidas" )  
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 0) + "px");    
		    })                  
		.on("mouseout", function(d) {       
		    div.transition()        
			.duration(500)      
			.style("opacity", 0);   
		});

	/*saldopath.append("path")
		.attr("d", function(d) { return lineFunction2(data);}).attr("class","saldoanotado");*/
	
	//saldos dots. Dibuja circulos donde hay datos sobre saldo anotado
	/*svg.selectAll("circle")
	.data(data)
	.enter().append("circle")
	.attr("cx", function(d) { return xScale(d.date); })
	//.attr("cx", function(d,i) { return i*barwidth;})
	.attr("cy",function(d) { return yScale(d.SaldoAnotado);})
	.attr("r", 1.5);
	svg.selectAll("circle")
	.data(data)
	.enter().append("circle")
	.attr("cx", function(d) { return xScale(d.date); })
	   .attr("cy",function(d) { return yScale(d.SaldoCalculado);})
	   .attr("r", 1);*/

	//Sets the circles
	entradascirculos.selectAll("circle")
	.data(data)
	.enter().append("circle")
	.attr("fill", function(d) { return d.entradas < 0 ? "#C00000" : "#0055D4"; })
	.attr("cx", function(d) { return xScale(d.date); })
	.attr("cy",function(d) { return Math.random() * 350 + 20;})
	.attr("r", function(d) { return Math.sqrt(Math.abs(d.entradas))/22; })//square root of value for radius, as the area of circle is π*r². 22 is arbitrary value
	.attr("opacity", .9)
	.attr("class", 
		function(d) {
			return d.persona.replace(/\s+/g, '').replace(/\.+/g, '') + " "+ d.confirmado +" circulos"; //sets the name of the person without spaces as class for the bar
		}) 
	.on("mouseover", function(d) {      
		    div.transition()        
			.duration(200)      
			.style("opacity", .9);      
		    div.html(d.fecha + "<br/><strong/>"  + d.persona + "</strong/><br/>"  + formatComma(d.entradas) + "€ <br/>'"  + d.descripcion + "'" )  
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 0) + "px");    
		    })                  
		.on("mouseout", function(d) {       
		    div.transition()        
			.duration(500)      
			.style("opacity", 0);   
		});

	//Sets the Bars with no time scale
	barsnotimescale.selectAll(".barnotime")
      	.data(data)
    	.enter().append("rect")
    	.attr("fill", function(d) { return d.entradas < 0 ? "#C00000" : "#0055D4"; })
	.attr("class", 
		function(d) { //TODO iterate through array
			return d.persona.replace(/\s+/g, '').replace(/\.+/g, '')+" barnotime"; //sets the name of the person without spaces as class for the bar
		}) 
	//The tooltips
      .attr("x", function(d, i) { return i * barwidth; })
      //.attr("x", function(d) { return xScale(d.date); })
      .attr("width", barwidth+1)
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
