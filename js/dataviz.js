/* Built in d3 http://d3js.org/

Bar chart based on DRY Bar Chart http://bl.ocks.org/mbostock/5977197 
Tooltip based on http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
Also some ideas come from https://github.com/erhardt/Attention-Plotter
*/

var barwidth = 1.98, //width of the bars
 widthyears = 5,
 electionsmunicipal = 410,
 electionsgeneral = electionsmunicipal + 18,
 electionsgalicia = electionsmunicipal + 36,
 electionslineheight = 15;

//Prepare canvas size
var margin = {top: 35, right: 20, bottom: 100, left: 65},
    width = 676*2 - margin.left - margin.right,
    height = 495 - margin.top - margin.bottom;

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
	.attr("x", "120")
	.attr("y", "20")
	.attr("width", "250")
	.attr("height", "301");

//set elections lines
var elections = svg.append('g').attr('class','elections electionschart').attr('id','electionsgraph');

//sets saldos dots
var saldosdots = svg.append('g').attr('class','saldosdots');

//sets entradas circulos
var entradascirculos = svg.append('g').attr('id','circuloschart');
svg.append('g').attr('class','personatable');

//Bars time scale
var barstimescale = svg.append('g').attr('id','barstimescale');

//Bars time scale with saldo
var barstimescalewithsaldo = svg.append('g').attr('id','barstimescalewithsaldo');
/*barstimescalewithsaldo.append('text')
		.attr("x", 180)
		.attr("y", 80)
		.text("Diferencia entre Anotado-Calculado");*/
barstimescalewithsaldo
	.append('text')
	.attr('id','diffswitch').attr("class","inactivo")
	.attr("x", 180)
	.attr("y", 80)
	.text("Activar diferencia entre Anotado-Calculado")
	.on('click',function(d) { 
		if (d3.select(this).attr('class')==='inactivo'){ 
		d3.select(this).attr("class","activo"); 
		barstimescalewithsaldo.selectAll(".bar").attr("opacity",0);
		barstimescalewithsaldo.selectAll(".saldoanotado").attr("opacity",0);
		barstimescalewithsaldo.selectAll("#saldocalculado").attr("opacity",.5);
		barstimescalewithsaldo.selectAll(".circulossaldo").attr("fill","#888");
		barstimescalewithsaldo.selectAll(".bardiff").style("display","block");
		} else {
		d3.select(this).attr("class","inactivo"); 
		barstimescalewithsaldo.selectAll(".bar").attr("opacity",1);
		barstimescalewithsaldo.selectAll(".saldoanotado").attr("opacity",1);
		barstimescalewithsaldo.selectAll("#saldocalculado").attr("opacity",1);
		barstimescalewithsaldo.selectAll(".circulossaldo").attr("fill","#000");
		barstimescalewithsaldo.selectAll(".bardiff").style("display","none");
		}
	});
barstimescalewithsaldo
	.append('rect')
	.attr('y', 66 )
  .attr('height', 20  )
  .attr('x', 170 )
  .attr('width',  320)
	.attr('stroke-width','1px')
	.attr("stroke","#000")
	.attr("fill","none");

//Bars no time scale
var barsnotimescale = svg.append('g').attr('id','barsnotimescale');

//set Donations line
var donationslines = barstimescale.append('g').attr('class','donationslines');
var donationslinesnotime = barsnotimescale.append('g').attr('class','donationslinesnotime');

//replaces spaces and . in viplist function(d) { return d.SaldoCalculado; }
var replacement = function(d) { return d.replace(/\s+/g, '').replace(/\.+/g, '');};

//Saldo Calculado Line Chart
var lineFunction = d3.svg.line()
	.interpolate("linear")
 	.x(function(d) { return xScale(d.date); })	
	.y(function(d) { return yScaleB(d.SaldoCalculado);}); 
var saldopath = barstimescalewithsaldo.append('g').attr('id','saldocalculado').attr('class','saldocalculado');

//Saldo Anotado Line Chart2 diferencia
var lineFunction2 = d3.svg.line()
	.interpolate("linear")
	.x(function(d) { return xScale(d.date); })
	.y(function(d) { return yScaleB(d.SaldoAnotado);});


d3.tsv("data/viplist.tsv", function(error, data) {//reads the viplist.tsv file
	//Creates Legend for notime graph
	var legendnotime = d3.select("#legendnotime").attr("class", "legend");
	//button to activate confirmados entries
	legendnotime.append("button").attr("class","btn btn-default pull-right").text("Activa: Entradas y Salidas confirmadas")
		.on('click',function(d) {	
				if (d3.select(this).attr('class')==='btn btn-default pull-right') {
					barsnotimescale.selectAll('rect.barnotime.confirmado').attr('stroke-width','1px').attr('stroke','#000');
					d3.select(this).attr("class", "btn btn-default pull-right activo").style('border','2px solid black');
					} else {
					barsnotimescale.selectAll('rect.barnotime.confirmado').attr('stroke-width','0px');
					d3.select(this).attr("class", "btn btn-default pull-right").style('border','');
					}
			});
	legendnotime.append("h5").style("font-weight","bold").text("Selecciona una persona"); //legend title
	legendnotime.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs " + d.tipo;})
		.text(function(d) { return d.people; })
		.on('click',function(d) { //when click on name
			var personflat = replacement(d.people), //removes spaces and . from person name
			    tipodonante = d.tipo,
			    confirmado = d.confirmado;
				if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs donante' || d3.select(this).attr('class')==='inactive btn btn-default btn-xs beneficiario' || d3.select(this).attr('class')==='inactive btn btn-default btn-xs donabenef'){
					//first time
					barsnotimescale.selectAll('svg .barnotime').attr("opacity",1)
					barsnotimescale.selectAll('svg .barnotime').transition().duration(500).attr("opacity",.15); //dims all bars 
					barsnotimescale.selectAll('svg .barnotime.confirmado.'+personflat).transition().duration(2500).attr("class","barnotime highlighted "+personflat+ " confirmado"); 
					barsnotimescale.selectAll('svg .barnotime.'+personflat).transition().duration(2500).attr("class","barnotime highlighted "+personflat);   
					d3.select(this).transition().duration(0).attr("class","btn-warning btn btn-default btn-xs"); //adds class .active to button
				//second time
				} else if (d3.select(this).attr('class')==='btn-warning btn btn-default btn-xs'){
					d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs " + d.tipo;}); //removes .active class
					barsnotimescale.selectAll("svg .barnotime.confirmado.highlighted."+  personflat).attr("class","barnotime confirmado "+  personflat);
					barsnotimescale.selectAll("svg .barnotime.highlighted."+  personflat).attr("class","barnotime "+  personflat);
					barsnotimescale.selectAll('svg .barnotime').transition().duration(500).attr("opacity",1);
				}
	  		});

	//Creates Legend for time graph
	var legend = d3.select("#legend").attr("class", "legend");
	legend.append("button").attr("class","btn btn-default pull-right").text("Activa: Entradas y Salidas confirmadas")
		.on('click',function(d) {	
				if (d3.select(this).attr('class')==='btn btn-default pull-right') {
					svg.selectAll('rect.bar.confirmado').attr('opacity','1').attr('stroke-width','1px').attr('stroke','#000');
					d3.select(this).attr("class", "btn btn-default pull-right activo").style('border','2px solid black');
					} else {
					svg.selectAll('rect.bar.confirmado').attr('stroke-width','0px');
					d3.select(this).attr("class", "btn btn-default pull-right").style('border','');
					}
			});
	legend.append("h5").style("font-weight","bold").text("Selecciona una persona"); //legend title
	legend.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs " + d.tipo;})
		.text(function(d) { return d.people; })
		.on('click',function(d) { //when click on name
			var personflat = replacement(d.people), //removes spaces and . from person name
			    tipodonante = d.tipo,
			    confirmado = d.confirmado;
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs donante' 
				|| d3.select(this).attr('class')==='inactive btn btn-default btn-xs beneficiario' 		
				|| d3.select(this).attr('class')==='inactive btn btn-default btn-xs donabenef'){
				//first time
				svg.selectAll('svg .bar').attr("opacity",1)
				svg.selectAll('svg .bar').transition().duration(500).attr("opacity",.05); //dims all bars
				svg.selectAll('svg .bar.confirmado.'+personflat).transition().duration(2500).attr("class","bar highlighted confirmado "+personflat); 
				svg.selectAll('svg .bar.'+personflat).transition().duration(2500).attr("class","bar highlighted "+personflat); 
				d3.select(this).transition().duration(0).attr("class","btn-warning btn btn-default btn-xs"); //adds class .active to button
			//second time
			} else if (d3.select(this).attr('class')==='btn-warning btn btn-default btn-xs'){
				d3.select(this).attr("class",function(d) { return "inactive btn btn-default btn-xs " + d.tipo;}); //removes .active class
				svg.selectAll("svg .highlighted.confirmado."+ personflat).attr("class","bar confirmado "+ personflat);
				svg.selectAll("svg .highlighted."+ personflat).attr("class","bar "+ personflat);
				svg.selectAll('svg .bar').transition().duration(500).attr("opacity",.4);
			}
		});

	//Creates Legend for time graph Circles
	var legend = d3.select("#legendcirculos").attr("class", "legend");
	//button to activate confirmados entries
	legend.append("button").attr("class","btn btn-default pull-right").text("Activa: Entradas y Salidas confirmadas")
		.on('click',function(d) {	
				if (d3.select(this).attr('class')==='btn btn-default pull-right') {
					entradascirculos.selectAll('svg .circulos.confirmado').attr('stroke-width','2px').attr('stroke','#000');
					d3.select(this).attr("class", "btn btn-default pull-right activado").style('border','2px solid black');
					} else {
					entradascirculos.selectAll('svg .circulos.confirmado').attr('stroke-width','0px');
					d3.select(this).attr("class", "btn btn-default pull-right").style('border','');
					}
			});
	legend.append("h5").style("font-weight","bold").text("Selecciona persona/entidad. Haz click de nuevo para reordenar"); //legend title
	xScale.domain(['15-04-1990','15-12-2008']);
 	//interacctive legend for circles
	legend.selectAll('div')
		.data(data)
		.enter().append("div")
		.attr("class", function(d) { return "inactive btn btn-default btn-xs " + d.tipo;})
		.attr("title", function(d) { return "(" + d.entidad + ") " + d.description;})
		.text(function(d) { return d.people; })
		.on('click',function(d) { //when click on name
			var personflat = replacement(d.people), //removes spaces and . from person name
			    tipodonante = d.tipo;					
			if (d3.select(this).attr('class')==='inactive btn btn-default btn-xs donante' 
				|| d3.select(this).attr('class')==='inactive btn btn-default btn-xs beneficiario' 
				|| d3.select(this).attr('class')==='inactive btn btn-default btn-xs donabenef'){
				//first time
					entradascirculos.selectAll('svg .circulos').attr("opacity",.7);
					entradascirculos.selectAll('svg .circulos').transition().duration(500).attr("opacity",0.1); //dims all bars 
					entradascirculos.selectAll('svg .circulos.confirmado.'+personflat).transition().duration(2500).attr("class","circulos selected "+personflat + " confirmado"); 
					entradascirculos.selectAll('svg .circulos.'+personflat).transition().duration(2500).attr("class","circulos selected "+personflat); 
					svg.selectAll('.personatable text').remove(	);
					if (d.entidad == '') { //don't show  ( ) if the field entiad is empty
						svg.select('.personatable').append('text').attr("x", 0 - margin.left ).attr("y", 0).text(d.people).attr("font-size", "20px").attr("fill", "black").style("display","block").attr("class","vipname");
					} else {
						svg.select('.personatable').append('text').attr("x", 0 - margin.left ).attr("y", 0).text(d.people + " (" + d.entidad +")").attr("font-size", "20px").attr("fill", "black").style("display","block").attr("class","vipname");
					}
					svg.select('.personatable').append('text').attr("x", 0 - margin.left ).attr("y", 25).text(d.description).attr("font-size", "12px").attr("fill", "black").attr("width", "400px").style("display","block").attr("class","description");
					svg.selectAll('.gobline').remove();
					if (d.GobInit != "") svg.append('text').attr('class','gobline').attr("x", 0 - margin.left ).attr("y", height).text("Tiempo en gobierno").attr("font-size", "10px").attr("fill", "black").style("display","block");
					svg.append('line').attr('class','gobline').attr('stroke-width','9px').attr("stroke","#000").attr("opacity",0.4)
						.attr('y1', height)
						.attr('y2', height)
						.attr('x1', xScale(parseDate(d.GobInit)))
						.attr('x2', xScale(parseDate(d.GobEnd)));
					svg.append('line').attr('class','gobline').attr('stroke-width','9px').attr("stroke","#000").attr("opacity",0.4)
						.attr('y1', height)
						.attr('y2', height)
						.attr('x1', xScale(parseDate(d.GobInit2)))
						.attr('x2', xScale(parseDate(d.GobEnd2)));
					//legend.selectAll('.btn-warning').attr("class","btn btn-default btn-xs btn-default");
					d3.select(this).transition().duration(0).attr("class","btn-warning btn btn-default btn-xs"); //adds class .active to button
				//second time
				} else if (d3.select(this).attr('class')==='btn-warning btn btn-default btn-xs'){
					svg.selectAll('.personatable text.vipname').transition().duration(1200).attr("y",height-95).attr("font-size", "25px");
					svg.select('.personatable text.description').transition().duration(1200).attr("y", height-75).text(d.description).attr("font-size", "12px").attr("fill", "black").attr("width", "400px").style("display","block");
					entradascirculos.selectAll('.selected').transition().duration(1200).attr("cy",height-30); 
					svg.selectAll('.gobline').transition().duration(1200).attr("y1",height-10).attr("y2",height-10).attr("y",height-10).attr("font-size", "15px");
					d3.select(this).attr("class","btn-danger btn btn-default btn-xs"); //adds class .active to button
				//third time
				} else if (d3.select(this).attr('class')==='btn-danger btn btn-default btn-xs'){
					d3.select(this).attr("class", "inactive btn btn-default btn-xs " + tipodonante); //removes .active class
					svg.selectAll('.personatable text').text("");
					svg.selectAll('.gobline').remove();
					entradascirculos.selectAll("svg .selected."+  personflat).attr("class","circulos "+  personflat)
						.attr("cy",function(d) { return Math.random() * 350 + 5;});
					entradascirculos.selectAll("svg .selected.confirmado."+  personflat).attr("class","circulos "+  personflat + " confirmado" )
						.attr("cy",function(d) { return Math.random() * 350 + 5;});
					entradascirculos.selectAll('svg .circulos').transition().duration(800).attr("opacity",0.8);
				}
	  	});
}); //end read viplist.tsv file

//Switch between graphs with and without time scales
d3.selectAll(".nav li").on('click', function() {//when click //
	if (d3.select(this).attr('id')==='contiempo'){ // with time
		if (d3.select(this).attr('class')==='active'){ // si activo
			//no hacer nada
		} else {						//si estaba desactivado
			d3.select(this).attr("class","active"); //adds class .active to button
			d3.select("#sintiempo").attr("class","");
			d3.select("#circulos").attr("class"," ");
			d3.select("#contiemposaldo").attr("class","");
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
			svg.selectAll('.personatable text').text("");
		}
	} else if (d3.select(this).attr('id')==='circulos'){ //bars + circles with time 
		if (d3.select(this).attr('class')==='active'){ // si activo
			//no hacer nada
		} else {						//si estaba desactivado
			d3.select(this).attr("class","active"); //adds class .active to button
			d3.select("#sintiempo").attr("class","");
			d3.select("#contiempo").attr("class","");
			d3.select("#contiemposaldo").attr("class","");
			d3.select("#circuloschart").style("display","block");
			d3.select("#backgroundimage").style("display","none");
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
		if (d3.select(this).attr('class')==='active'){ // si activo
			//no hacer nada
		} else {						//si estaba desactivado
			d3.select(this).attr("class","active"); 
			d3.select("#sintiempo").attr("class"," ");
			d3.select("#contiempo").attr("class"," ");
			d3.select("#circulos").attr("class"," ");
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
			svg.selectAll('.personatable text').text("");
		}
	} else {
		if (d3.select(this).attr('class')==='active'){ // without time
			return;						//no hacer nada
		} else {
			d3.select(this).attr("class","active");  
			d3.select("#contiempo").attr("class"," ");
			d3.select("#circulos").attr("class"," ");
			d3.select("#contiemposaldo").attr("class"," ");
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
			svg.selectAll('.personatable text').text("");
		}
	}
});

// CIRCLES Active buttons to hide and show circles of donantes and beneficiarios
d3.selectAll("#legendcirculos .btn").on('click', function() {//when click //
	if (d3.select(this).attr('class')=='btn btn-default btn-xs donante'){ // with time
			entradascirculos.selectAll("circle.positivo").style("display","none");
			d3.select(this).attr("class","btn btn-xs donante btn-warning");
			d3.selectAll("#legendcirculos div.donante").style("display","none");
	} else if (d3.select(this).attr('class')=='btn btn-xs donante btn-warning') {
			entradascirculos.selectAll("circle.positivo").style("display","block");
			d3.select(this).attr("class","btn btn-default btn-xs donante");
			d3.selectAll("#legendcirculos div.donante").style("display","inline-block");
	} else if (d3.select(this).attr('class')=='btn btn-default btn-xs beneficiario') {
			entradascirculos.selectAll("circle.negativo").style("display","none");
			d3.select(this).attr("class","btn btn-xs beneficiario btn-warning");
			d3.selectAll("#legendcirculos div.beneficiario").style("display","none");
	} else if (d3.select(this).attr('class')=='btn btn-xs beneficiario btn-warning') {
			entradascirculos.selectAll("circle.negativo").style("display","block");
			d3.select(this).attr("class","btn btn-default btn-xs beneficiario");
			d3.selectAll("#legendcirculos div.beneficiario").style("display","inline-block");
	} else if (d3.select(this).attr('class')=='btn btn-default btn-xs ingresossuiza') {
			entradascirculos.selectAll("circle.LuisBárcenas").style("display","block");
			d3.select(this).attr("class","btn btn-xs ingresossuiza btn-warning");
	} else if (d3.select(this).attr('class')=='btn btn-xs ingresossuiza btn-warning') {
			entradascirculos.selectAll("circle.LuisBárcenas").style("display","none");
			d3.select(this).attr("class","btn btn-default btn-xs ingresossuiza");
	} else {
	}
});


// BARS/time Active buttons to hide and show circles of donantes and beneficiarios
d3.selectAll("#legend .btn").on('click', function() {//when click //
	if (d3.select(this).attr('class')=='btn btn-default btn-xs donante'){ // with time
			barstimescale.selectAll("rect.positivo").style("display","none");
			d3.select(this).attr("class","btn btn-xs donante btn-warning");
			d3.selectAll("#legend div.donante").style("display","none");
	} else if (d3.select(this).attr('class')=='btn btn-xs donante btn-warning') {
			barstimescale.selectAll("rect.positivo").style("display","block");
			d3.select(this).attr("class","btn btn-default btn-xs donante");
			d3.selectAll("#legend div.donante").style("display","inline-block");
	} else if (d3.select(this).attr('class')=='btn btn-default btn-xs beneficiario') {
			barstimescale.selectAll("rect.negativo").style("display","none");
			d3.select(this).attr("class","btn btn-xs beneficiario btn-warning");
			d3.selectAll("#legend div.beneficiario").style("display","none");
	} else if (d3.select(this).attr('class')=='btn btn-xs beneficiario btn-warning') {
			barstimescale.selectAll("rect.negativo").style("display","block");
			d3.select(this).attr("class","btn btn-default btn-xs beneficiario");
			d3.selectAll("#legend div.beneficiario").style("display","inline-block");
	} else if (d3.select(this).attr('class')=='btn btn-default btn-xs ingresossuiza') {
			barstimescale.selectAll("rect.LuisBárcenas").style("display","none");
			d3.select(this).attr("class","btn btn-xs ingresossuiza btn-warning");
	} else if (d3.select(this).attr('class')=='btn btn-xs ingresossuiza btn-warning') {
			barstimescale.selectAll("rect.LuisBárcenas").style("display","none");
			d3.select(this).attr("class","btn btn-default btn-xs ingresossuiza");
	} else {
	}
});


//Enters data.tsv and starts the graph-----------------------------------------
d3.tsv("data/data.tsv", type, function(error, data) {//reads the data.tsv file
	data.forEach(function(d) {
    d.date = parseDate(d.date);
  });
	//Sets scales
  xScale.domain(d3.extent(data, function(d) { return d.date; })); //sets xScale depending on dates values
  //yScale.domain(d3.extent(data, function(d) { return d.entradas; })).nice(); //sets yScale depending on entradas values
	yScale.domain([-300000,250000]); //sets yScale depending on entradas values
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
		.attr('x2', function(d) { return xScale(parseDate('31-12-2008')); })
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
		.attr('x2', function(d) { return xScale(parseDate('31-12-2008')); })
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
		.attr('x2',602*barwidth) //6 julio 2007. BOE http://www.boe.es/diario_boe/txt.php?id=BOE-A-2007-13022
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
		.attr('x1', 602*barwidth)
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
	    .attr('x2', 602*barwidth)
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
		.attr('x1', 602*barwidth)
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
			return d.persona.replace(/\s+/g, '').replace(/\.+/g, '') + " "+ d.confirmado +" bar" + (d.entradas < 0 ? " negativo" : " positivo"); 
			//sets the name of the person without spaces as class for the bar and adds class negativo/positivo depending on value
		}) 
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth+1)
	.attr("y", function(d) { return yScale(Math.max(0, d.entradas)); })
	.attr("height", function(d) { return Math.abs(yScale(d.entradas) - yScale(0)); })
	//The tooltips time scale
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
			return d.persona.replace(/\s+/g, '').replace(/\.+/g, '') + " "+ d.confirmado +" bar"; //sets the name of the person without spaces as class for the bar
		}) 
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth+1)
	.attr("y", function(d) { return yScaleB(Math.max(0, d.entradas)); })
	.attr("height", function(d) { return Math.abs(yScaleB(d.entradas) - yScaleB(0)); })
	//The tooltips time scale
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
	elections.append("text").attr("x", 5).attr("y", electionsmunicipal-7)
		.text("Elecciones")
		.attr("font-size", "12px")
		.attr("fill", "black")
		.attr("font-weight", "bold"); 
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
//elecciones Generales	
	elections.append("text").attr("x", 5).attr("y", electionsgeneral+9)
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
	elections.append('text')
		.attr("x", function(d) { return xScale(parseDate('06-07-1993')); })
		.attr("y", electionsgeneral+electionslineheight-3)
		.text("Generales 1993").attr("class", "electionstext");
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
	elections.append('text')
		.attr("x", function(d) { return xScale(parseDate('03-04-1996')); })
		.attr("y", electionsgeneral+electionslineheight-3)
		.text("Generales 1996").attr("class", "electionstext");
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
	elections.append('text')
		.attr("x", function(d) { return xScale(parseDate('12-04-2000')); })
		.attr("y", electionsgeneral+electionslineheight-3)
		.text("Generales 2000").attr("class", "electionstext");
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
		.text("Generales 2004").attr("class", "electionstext");
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
		.attr("x", function(d) { return xScale(parseDate('09-04-2008')); })
		.attr("y", electionsgeneral+electionslineheight-3)
		.text("Gen. 2008").attr("class", "electionstext");
	//elecciones Galicia	
	elections.append("text").attr("x", 5).attr("y", electionsgalicia+7.5)
		.text("Galicia")
		.attr("font-size", "12px")
		.attr("fill", "grey");
	elections.append('line')
    .attr('y1', electionsgalicia)
    .attr('y2', electionsgalicia+electionslineheight )
    .attr('x1', function(d) { return xScale(parseDate('17-10-1993')); })
    .attr('x2', function(d) { return xScale(parseDate('17-10-1993')); })
		.attr('title','Galicia 1993')
		.on("mouseover", function(d) {d3.select(this).attr('y1', 0)})
		.on("mouseout", function(d) {d3.select(this).attr('y1', electionsgalicia)});
	elections.append('line')
    .attr('y1', electionsgalicia)
    .attr('y2', electionsgalicia+electionslineheight )
    .attr('x1', function(d) { return xScale(parseDate('19-10-1997')); })
    .attr('x2', function(d) { return xScale(parseDate('19-10-1997')); })
		.attr('title','Galicia 1997')
		.on("mouseover", function(d) {d3.select(this).attr('y1', 0)})
		.on("mouseout", function(d) {d3.select(this).attr('y1', electionsgalicia)});
	elections.append('line')
    .attr('y1', electionsgalicia)
    .attr('y2', electionsgalicia+electionslineheight )
    .attr('x1', function(d) { return xScale(parseDate('21-10-2001')); })
    .attr('x2', function(d) { return xScale(parseDate('21-10-2001')); })
		.attr('title','Galicia 2001')
		.on("mouseover", function(d) {d3.select(this).attr('y1', 0)})
		.on("mouseout", function(d) {d3.select(this).attr('y1', electionsgalicia)});
	elections.append('line')
    .attr('y1', electionsgalicia)
    .attr('y2', electionsgalicia+electionslineheight )
    .attr('x1', function(d) { return xScale(parseDate('19-06-2005')); })
    .attr('x2', function(d) { return xScale(parseDate('19-06-2005')); })
		.attr('title','Galicia 2005')
		.on("mouseover", function(d) {d3.select(this).attr('y1', 0)})
		.on("mouseout", function(d) {d3.select(this).attr('y1', electionsgalicia)});

	//Saldo time
	barstimescalewithsaldo.append('text')
		.attr("x", 180)
		.attr("y", 40)
		.text("Saldo Calculado");
	barstimescalewithsaldo.append('line')
    .attr('y1', 35)
    .attr('y2', 35)
    .attr('x1', 100)
    .attr('x2', 170).attr("class","saldocalculado");
	barstimescalewithsaldo.append('text')
		.attr("x", 180)
		.attr("y", 60)
		.text("Saldo anotado en las notas");
	barstimescalewithsaldo.append('line')
    .attr('y1', 53)
    .attr('y2', 53)
    .attr('x1', 100)
    .attr('x2', 170).attr("class","saldoanotado");
	barstimescalewithsaldo.append("circle")
		.attr("cx","120")
		.attr("cy","53")
		.attr("r", 2);
	barstimescalewithsaldo.append("circle")
		.attr("cx","140")
		.attr("cy","53")
		.attr("r", 2);
	barstimescalewithsaldo.append("circle")
		.attr("cx","160")
		.attr("cy","53")
		.attr("r", 2);
	barstimescalewithsaldo.append("circle")
		.attr("cx","170")
		.attr("cy","53")
		.attr("r", 2);


	//Sado Anotado
	saldopath.append("path")
		.attr("d", function(d) { return lineFunction2(data);}).attr("class","saldoanotado")
	.on("mouseover", function(d) {        
				d3.select(this).attr("stroke","#000");
				div.transition().duration(200).style("opacity", .9);    
		    div.html("Saldo Anotado en las cuentas de Barcenas" )  
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 0) + "px");    
		    })                  
		.on("mouseout", function(d) {       
				div.transition()
				.duration(500)
				.style("opacity", 0);    
		});


	//Saldo Calculado
	saldopath.append("path")
		.attr("d", function(d) { return lineFunction(data);})
		.attr("id","saldocalculado")
		.on("mouseover", function(d) {           
				div.transition()
				.duration(200)
				.style("opacity", .9); 
		    div.html("Saldo calculado: entradas - salidas" )  
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 50) + "px");    
		    })                  
		.on("mouseout", function(d) {       
				div.transition()
				.duration(500)
				.style("opacity", 0); 
		});

	//saldos dots. Dibuja circulos donde hay datos sobre saldo anotado
	barstimescalewithsaldo.selectAll("circle")
	.data(data)
	.enter().append("circle")
	.attr("class","circulossaldo")
	.attr("cx", function(d) { return xScale(d.date) +1; })
	.attr("cy",function(d) { return yScaleB(d.SaldoAnotado);})
	.attr("r", 2)
	.style("opacity", function(d) { return d.SaldoAnotado == 0 ? 0 : 1; })	
	.attr("title", function(d) { return "Saldo anotado en las cuentas " + formatComma(d.SaldoAnotado) + "€"; }  );


	//Difference (anotado - calculado) bars
	barstimescalewithsaldo.selectAll(".bardiff")
	.data(data)
	.enter().append("rect")
	.attr("class", "bardiff")
	.attr("fill", function(d) {
		return d.SaldoCalculado > Math.abs(d.SaldoAnotado) ? "#F00" : "#0F0"; 
		})
	.attr("x", function(d) { return xScale(d.date); })
	.attr("width", barwidth)
	.attr("y", function(d) { 	
		if (d.SaldoCalculado > Math.abs(d.SaldoAnotado) ) { 
			return yScaleB(d.SaldoCalculado);
		} else {
			return yScaleB(d.SaldoAnotado);
		} 
	})
	.attr("height", function(d) { 
		if (d.SaldoAnotado != "" && d.SaldoAnotado != "0" && d.SaldoCalculado > Math.abs(d.SaldoAnotado)  ) {
			return Math.abs(yScaleB(d.SaldoCalculado - d.SaldoAnotado) - yScaleB(0)) ;
		} else if (Math.abs(d.SaldoAnotado) > d.SaldoCalculado ) {
			return Math.abs(yScaleB(d.SaldoCalculado) - yScaleB(d.SaldoAnotado));
		} else { 
			return 0; 
		}
	});
	//Sets the circles
	entradascirculos.selectAll("circle")
	.data(data)
	.enter().append("circle")
	.attr("fill", function(d) { return d.entradas < 0 ? "#C00000" : "#0055D4"; })
	.attr("cx", function(d) { return xScale(d.date); })
	.attr("cy",function(d) { return Math.random() * 350 + 5;})
	.attr("r", function(d) { return Math.sqrt(Math.abs(d.entradas))/22; })//square root of value for radius, as the area of circle is π*r². 22 is arbitrary value
	.attr("opacity", 0.8)
	.attr("class", 
		function(d) {
			return d.persona.replace(/\s+/g, '').replace(/\.+/g, '') + " "+ d.confirmado +" circulos" + (d.entradas < 0 ? " negativo" : " positivo"); 
			//sets the name of the person without spaces as class for the bar and adds class negativo/positivo depending on value
		}) 
	.on("mouseover", function(d) {      
		div.transition()
			.duration(200)      
			.style("opacity", .9);      
		div.html("<span class='euros'>" + formatComma(Math.abs(d.entradas)) + "€</span>" +"<br/><small>Atribuido a:</small><br/><span class='euros'><strong/>"  + d.persona + "</strong/></span>" + " <br/><small>Anotado:</small> '" + d.descripcion + "'<br/><small>Fecha: </small>" + d.fecha )  
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
			return d.persona.replace(/\s+/g, '').replace(/\.+/g, '')+ " "+ d.confirmado +" barnotime"; //sets the name of the person without spaces as class for the bar
		}) 
	//The tooltips
      .attr("x", function(d, i) { return i * barwidth; })
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
