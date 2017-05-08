 

    dataTable = {};
    zips = []
    var wClusterMap = 700, hClusterMap = 500
    var scaleClusterMap;

    function getclusterdata()
        {
            scaleClusterMap = d3.scale.linear()
                .domain([0, 1])
                .range([0, hClusterMap]);

            d3.csv("/data/zip_newdf_norm_w_cluster_v3.csv", function(error, data) {

                 data.forEach(function(d) {
                    dataTable[String(parseInt(d.Incident_Zip))] = [d.cluster,d.Niceness_norm,d.Party_Bar_Complaints];
                    zips.push(parseInt(d.Incident_Zip));
                 });

                 makeClusterMap();
            });
        };

    function makeClusterMap()
    {
        var colors = d3.scale.category20();
        var projection = d3.geo.mercator()
            .center([-73.926522306614344, 40.704388796109033])
            .translate([wClusterMap/2, hClusterMap/2])
            .scale([50000]);

        var svg = d3.select("#clustermap")
            .append("svg")
            .attr("width", wClusterMap)
            .attr("height", hClusterMap);

        var colorScale = d3.scale.category20()

        var path = d3.geo.path().projection(projection);
    
        d3.json("/data/nyc.json", function(json) {
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
                    var html = "";
                    html += "<div class='tooltip_kv'>";
                    html += "<span class='tooltip_key'>";
                    html += d.properties.borough;
                    html += "</span>";
                    html += "<span class='tooltip_value'>";
                    html += d.properties.postalCode;
                    html += "";
                    html += "</span>";
                    html += "</div>";
                    html += "<div class='tooltip_kv'>";
                    html += "<span class='tooltip_key'>";
                    html += "Cluster";
                    html += "</span>";
                    html += "<span class='tooltip_value'>";
                    if(zips.indexOf(parseInt(d.properties.postalCode)) != -1) {
                        html += dataTable[d.properties.postalCode][0];
                    }
                    else {
                        html += "Not available"
                    }
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
                    if(zips.indexOf(parseInt(d.properties.postalCode)) != -1) {
                        tmp = dataTable[d.properties.postalCode]
                        updateBars([tmp[1],tmp[2]]); //[Nice, party]
                    }
                })
                .on("mouseout", function() {
                    $(this).attr("fill-opacity", "1.0");
                    $("#tooltip-container").hide();
                })
                .style("fill", function(d) {  
                    if(zips.indexOf(parseInt(d.properties.postalCode)) != -1) {
                        return colorScale(parseInt(dataTable[d.properties.postalCode][0]));
                    }
                    return "white"
                });
        });

        makeBars();
    }

    function makeBars()
    {
        var dataset = [0.1,0.10]
        var barPadding = 5

        var svgbar = d3.select("#clusterselectionbar")
            .append("svg")
            .attr("width", wClusterMap/8)
            .attr("height", hClusterMap)
            .append("g")
            .attr("transform", 
                "translate(" + 10 + "," + 10 + ")");

        svgbar.selectAll("bar")
            .data(dataset)
            .enter()
            .append("rect")
            .style("fill", "#fdd0a2")
            .attr("x", function(d, i) {
                return i * ((wClusterMap/10) / dataset.length); 
                })
            .attr("width", (wClusterMap/15) / dataset.length - barPadding)
            .attr("y", function(d) { return hClusterMap - scaleClusterMap(d); 
                })
            .attr("height", function(d) { 
                var barHeight = d;
                return scaleClusterMap(barHeight);
             })
             .style("stroke-width", "2")
             .style("stroke", "#8c2d04");

        svgbar.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .attr("x", function(d, i) {
                return i * ((wClusterMap/10) / dataset.length);
            })
            .attr("y", function(d) {
                return hClusterMap - scaleClusterMap(d)-5;
            })
            .text(function(d) { return d; });

        svgbar.selectAll("q")
            .data(dataset)
            .enter()
            .append("text")
                        .attr("class","x axis")

            .attr("y", function(d,i) {
                return -i * ((wClusterMap/10) / dataset.length)
            })
            .attr("x", function(d, i) {
                return  0//i * ((w/10) / dataset.length);
            })
         .attr("transform", "rotate(90)")
           .style("text-anchor", "start")
           .style("fill", "black")
           .style("font-size", "22px")
           .style("font-weight","bold")
           .style("font-family","sans-serif")
            .text(function(d, i){
                return (i ? "Party" : "Nice");
            });  
    }        


    function updateBars(dataSet) {
        console.log(dataSet);

        
        var svgbar = d3.select("#clusterselectionbar").select("svg");

        svgbar.selectAll("rect")
            .data(dataSet)
            .transition()
            .duration(1000)
            .attr("height", function(d) {
                var barHeight = d;  //Scale up by factor of 5
                console.log(barHeight);
                return scaleClusterMap(barHeight);
            })
            .attr("y", function(d) {
                 return hClusterMap - scaleClusterMap(d);  //Height minus data value
            })
            //.attr("width", (w) / dataSet.length - barPadding)
            ;

        svgbar.selectAll("text")
            .data(dataSet)
            .transition()
            .duration(1000)
            .text(function(d) { return Math.round(d*100)/100; })
            /*
            .attr("x", function(d, i) {
                return i * ((w/10) / dataset.length);
            })
            */
            .attr("y", function(d) {
                return hClusterMap - scaleClusterMap(d)-5;
            });


    }