var chosenzipdata;
var xScale;
var yScale;
var rScale;
var xMax = 1;
var yMax = 1;
var currYear;
yearMax = 2016;
yearMin = 2010;
var scatterplot;

function getvizdata()
{
    d3.csv("/data/chosen_all.csv", function(error, data) {

            data.forEach(function(d) {
                d.zip = parseInt(d.Incident_Zip);
                d.music = parseFloat(d.Party_Bar_Complaints);
                d.niceness = parseFloat(d.Niceness_norm);
                d.Year = parseInt(d.Year)//parseInt(d.year);
            });

        chosenzipdata = data;
        var dataFirst = data.filter(function (d) {
            return parseInt(d.Year) == yearMin
        });

        scatterplot = new ScatterPlot(dataFirst)
        //console.log(dataFirst)
        scatterplot.doscatterplot(dataFirst);
    });
}


$( "#slider-range-max" ).slider({
    range: "max",
    min: yearMin,
    max: yearMax,
    value: 2,
    slide: function( event, ui ) {
        $( "#amount" ).val( ui.value );

        var datayear = chosenzipdata.filter(function (d) {
            return parseInt(d.Year) == parseInt(ui.value);
        });
        
        scatterplot.updateplot(datayear);
    }
});


var s = $('#slider-range-max').slider();
i = 0;
currYear = 2010

function timedUpdate() 
{
    if (currYear == 2010) 
    {
        currYear++;

        var datayear = chosenzipdata.filter(function (d) {
            return parseInt(d.Year) == parseInt(currYear);
        });
        scatterplot.updateplot(datayear);
        s.slider("value",currYear);
        $("#amount").val(currYear);
    }  

    setTimeout(function()
    {
        currYear++;

        var datayear = chosenzipdata.filter(function (d) {
        return parseInt(d.Year) == parseInt(currYear);
        });

        scatterplot.updateplot(datayear);
        //Updating slider
        s.slider("value",currYear);
        $("#amount").val(currYear);

        if (currYear <= 2016) {
            timedUpdate()
        }
        if (currYear > 2016) {
            currYear = 2010
            s.slider("value",currYear);
            $("#amount").val(currYear);
            datayear = chosenzipdata.filter(function(d) { return parseInt(d.Year) == 2010;});
            scatterplot.updateplot(datayear);
        }
    }, 
    3000);
}

function ScatterPlot(dataset1)
{
    this.dataset = dataset1


}
     
ScatterPlot.prototype.doscatterplot = function(dataset)
{
    //Width and height
    var w = 1000;
    var h = 500;
    
    var padding = 50;


    xScale = d3.scale.linear()
        .domain([0, xMax])
        .range([padding, w - padding * 2]);


    yScale = d3.scale.linear()
        .domain([0, yMax])
        .range([h - padding , padding]);

    rScale = d3.scale.linear()
        .domain([0, 2])
        .range([2, 8]);

    // Define X axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(8);

    // Define Y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(7);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

    //Create SVG element
    var svgScatter = d3.select("#scatterplot")
                .append("svg")
                .attr("width", w)
                .attr("height", h);
    
    var colorScale = d3.scale.category20()
    var i = 0;

    svgScatter.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d.niceness);
        })
        .attr("cy", function(d) {
            return yScale(d.music);
        })
        .attr("r", function(d) {
            return rScale((d.music + d.niceness)*5);
        })
        .attr("fill", function(d) {
            i++;
            return colorScale(i);
        })
        .on("mouseover", function(d) {      
            div.transition()        
                .duration(200)      
                .style("opacity", 1);      


            div .html("<div class'tooltip'>" + d.zip + "<br/>music: "  + d.music + "<br/>niceness: "  + d.niceness +"</div>") 
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY -28) + "px");    
        })                  
        .on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0) });

    svgScatter.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text(function(d) {
            return d.zip;
        })
        .attr("x", function(d) {
            return xScale(d.niceness);
        })
        .attr("y", function(d) {
            return yScale(d.music);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "19px")
        .attr("font-weight", "bold")
        .attr("fill", "black");

    //Create X axis
    svgScatter.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding) + ")")
            .call(xAxis) 
        .append("text")
            .attr("class", "label")
            .attr("x", w - padding * 2)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("niceness");
    
    //Create Y axis
    svgScatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis)
        .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 14)
            .attr("x", -50)
            //.attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("music");

    svgScatter.append("text")
        .text("Your text goes here")
        .attr("transform","translate(50,30)")
        .attr("x",function(d) {
            return (w/2)-padding
        })
        .style("text-anchor", "middle")
        .style("font", "bold")
        .style("font-size","22px");


}

ScatterPlot.prototype.updateplot = function(dataset)
{
    //var placeholder = $("#viz1")
    //var svg = jQuery("svg", placeholder);

    var svgScatter = d3.select("#scatterplot").select("svg")

    svgScatter.selectAll("circle")
        .data(dataset)
        .transition()
        .duration(1500)
        .attr("cx", function(d) {
            return xScale(d.niceness);
        })
        .attr("cy", function(d) {
            return yScale(d.music);
        })
        .attr("r", function(d) {
            return rScale((d.music + d.niceness)*5);
        });

    svgScatter.selectAll("text")
        .data(dataset)
        .transition()
        .duration(1500)
        .text(function(d) {
            return d.zip;
        })
        .attr("x", function(d) {
            return xScale(d.niceness);
        })
        .attr("y", function(d) {
            return yScale(d.music);
        })
        //.attr("font-family", "sans-serif")
        //.attr("font-size", "9px")
        //.attr("fill", "lightsteelblue")
        ;
}