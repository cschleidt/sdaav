function NYCComplaintMap(colorrange1)
{
    this.colorrange = colorrange1; 

    this.makeMap = function(scalemethod)
    {
        var w = 700, h = 500
        var projection = d3.geo.mercator()
            .center([-73.926522306614344, 40.704388796109033])
            .translate([w/2, h/2])
            .scale([50000]);

        var svg = d3.select("#viz")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        var path = d3.geo.path()
                .projection(projection);

        d3.json("nyc.json", function(json) {
            //console.log(json);  //Log output to console

            geojsonnyc = json;

            svg.append("g")
                .attr("class", "categories-choropleth")
                .selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke-width", "1")
                .style("stroke", "black")
                //.style('fill-opacity', 0.3)


                .on("mouseover", function(d) {
                    //console.log(d);

                    var html = "";

                    html += "<div class='tooltip_kv'>";
                    html += "<span class='tooltip_key'>";
                    html += "Party complaints";
                    html += "</span>";
                    html += "<span class='tooltip_value'>";
                    html += valueById.get(d.properties.postalCode);
                    html += "";
                    html += "</span>";
                    html += "</div>";

                    $("#tooltip-container").html(html);
                    $(this).attr("fill-opacity", "0.8");
                    $("#tooltip-container").show();

                    var coordinates = d3.mouse(this);

                    var map_width = $('.categories-choropleth')[0].getBoundingClientRect().width;

                    if (d3.event.layerX < map_width / 2) {
                        d3.select("#tooltip-container")
                        .style("top", (d3.event.layerY + 15) + "px")
                        .style("left", (d3.event.layerX + 15) + "px");
                    } else {
                        var tooltip_width = $("#tooltip-container").width();
                        d3.select("#tooltip-container")
                        .style("top", (d3.event.layerY + 15) + "px")
                        .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
                    }
                })
                .on("mouseout", function() {
                    $(this).attr("fill-opacity", "1.0");
                    $("#tooltip-container").hide();
                })
                .style("fill", function(d) {
                    if (valueById.get(d.properties.postalCode)) {
                        var i = scalemethod(valueById.get(d.properties.postalCode));
                        if(i) {
                            var color = colorrange[i].getColors();
                        }
                        else{
                            var color = colorrange[0].getColors();
                        }
                    } else {
                        var color = colorrange[0].getColors();
                    }
                    return "rgb(" + color.r + "," + color.g +
                            "," + color.b + ")";

                });

                // generer legend baseret på vores colormap
                var legendsvg = d3.select("#maplegend")
                    .append("svg")
                    .attr("width", 100)
                    .attr("height", 400);

                legend = legendsvg.selectAll(".lentry")
                                                .data(colorrange)
                                                .enter()
                                                .append("g")
                                                .attr("class","leg")
                
                legend.append("rect")
                            .attr("y", function(d,i) { return(i*40)})
                            .attr("width","40px")
                            .attr("height","40px")
                            .attr("fill", function(d, i) { 
                                var color = colorrange[i].getColors(); 
                                return "rgb(" + color.r + "," + color.g +
                                    "," + color.b + ")";
                                })
                            .attr("stroke","#7f7f7f")
                            .attr("stroke-width","0");
            
                legend.append("text")
                            .attr("class", "legText")
                            .text(function(d, i) {
                                if(i == 0) 
                                    return "Min";
                                else if(i == (colorrange.length - 1))
                                    return "Max";
                                
                                return "";
                            })
                            .attr("x", 45)
                            .attr("y", function(d, i) { return (40 * i) + 20 + 4; })
        });
    }
}

NYCComplaintMap.prototype.updatemap = function(scalemethod)
{
    var svg = d3.select("svg")

    svg.selectAll("path")
        .data(geojsonnyc.features)
        .transition()
        .duration(700)
        .style("fill", function(d) {
            if (valueById.get(d.properties.postalCode)) {
                var i = scalemethod(valueById.get(d.properties.postalCode));
                if(i) {
                    var color = colorrange[i].getColors();
                }
                else{
                    var color = colorrange[0].getColors();
                }
            } else {
                var color = colorrange[0].getColors();
            }
            return "rgb(" + color.r + "," + color.g +
                    "," + color.b + ")";
        });
}