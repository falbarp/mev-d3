d3.json('./practica_airbnb.json')
.then((featureCollection) => {
    drawMap(featureCollection);
});



function drawMap(featureCollection) {

    var width = 1000;
    var height = 1000;

    var svg = d3.select('#map')
        .append('svg')
        .attr('width', width*2)
        .attr('height', height)
        .append('g');

    var mytooltip = d3.select('#map')
        .append('div')
        .attr("class", "tooltip")
        .style("position", "absolute") 
        .style("pointer-events", "none") 
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "15px")
        .style("padding", 5);
  

    var center = d3.geoCentroid(featureCollection);
    var projection = d3.geoMercator()
        .fitSize([width -50, height -100], featureCollection) 
        .center(center)
        .translate([width / 2, height / 2 + 60]) 


    var pathProjection = d3.geoPath().projection(projection);
   
    var features = featureCollection.features; // <-----------------------

    var min_price = d3.min(features, (d) => d.properties.avgprice);
    var max_price = d3.max(features, (d) => d.properties.avgprice);

   var scaleColor = d3.scaleLinear()
        .domain([min_price,max_price])
        .range(["red", "blue", NaN]); // MODIFY

   var createdPath = svg.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', (d) => pathProjection(d))
        .attr("opacity", function(d, i) {
            d.opacity = 1
            return d.opacity
        })
        .attr('fill', (d) => scaleColor(d.properties.avgprice))
        .on('click', handleClick)
        

        function handleClick (event, d) { // In order to render barchart
          d3.select(this)       
          var neighborhood= d.properties.name
          drawGraph (featureCollection, neighborhood )
        }
        
  
     var nblegend = 10;
     var widthRect = (width / nblegend) - 2;
     var heightRect = 10;
 
     var scaleLegend = d3.scaleLinear()
         .domain([0, nblegend])
         .range([0, width]);
 

     var legend = svg.append("g")
         .selectAll("rect")
         .data(scaleColor.range())
         .enter()
         .append("rect")
         .attr("width", widthRect)
         .attr("height", heightRect)
         .attr("x", (d, i) => scaleLegend(i)) 
         .attr("fill", (d) => d);
 
    text_legend = [0, scaleColor.thresholds()]

    var f = d3.format(".1f");
     var text_legend = svg.append("g")
         .selectAll("text")
         .data(scaleColor.thresholds())
         .enter()
         .append("text")
         .attr("x", (d, i) => scaleLegend(i) + 65) 
         .attr("y", heightRect * 2.5)
         .text((d) => +f(d))
         .attr("font-size", 12)
  

  
}

function drawGraph (featureCollection, neighborhood) {
  var width = 500;
  var height = 500;

  var features = featureCollection.features; // <-------

  var svg2 = d3.select('#barchart')
  .append('svg')
  .attr('width', width*2)
  .attr('height', height)
  .append('g')


  var tooltip = d3.select("#barchart").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute") 
  .style("pointer-events", "none") 
  .style("visibility", "hidden")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", 5);

  

  features.forEach(element => {if (element.properties.name == neighborhood){
      zone = element;



  var scaleX = d3.scaleBand()
          .domain(zone.properties.avgbedrooms.map(function(d) {
              return d.bedrooms;
          }))
          .range([width, width*1.5])
          .padding(0.2)
  
  var scaleY = d3.scaleLinear()
          .domain([0, d3.max(zone.properties.avgbedrooms, function(d) {
              return d.total;
          })])
          .range([(height / 2) , 50])
  
  var x_axis = d3.axisBottom(scaleX)
  var y_axis = d3.axisLeft(scaleY)
  

  svg2.append("g")
  .attr("transform", "translate(0 " + height / 2 + ")")
  .call(x_axis)
  svg2.append("g")
  .attr("transform", "translate(" + width + ", 0)")
  .call(y_axis)
  
  
  svg2.selectAll('rect')
      .data(zone.properties.avgbedrooms)
      .enter()
      .append('rect')
      .attr('x',function(d){
          return scaleX(d.bedrooms)
      })
      .attr('y',function(d){
          return scaleY(d.total)
      })
      .attr("width", scaleX.bandwidth())
      .attr("height", function(d) {
          return height/2 - scaleY(d.total); 
      })
      .attr('fill', 'steelblue')
      .style('opacity', '0,5')
      .on('mouseover', function (event,d){
              d3.select(this)
                  .transition()
                  .duration(1000)
                  .attr("fill", "red")
                  .attr("width", (d) => scaleX.bandwidth() * 1.25)
                  .attr('x', (d) => scaleX(d.bedrooms) -10)

              tooltip.transition()
                  .duration(500)
                  .style("left", (event.pageX + 20) + "px")
                  .style("top", (event.pageY - 30) + "px")
                  .text(`Total: ${d.total}`)
                  .style("visibility", "visible")
      })
      .on('mouseout', function (event,d){
          d3.select(this)
              .transition()
              .duration(1000)
              .attr("fill", "grey")
              .attr("width", (d) => scaleX.bandwidth())
              .attr('x', (d) => scaleX(d.bedrooms))
          
          tooltip.transition()
              .duration(5000)
              .style("left", (event.pageX + 20) + "px")
              .style("top", (event.pageY - 30) + "px")
              .text(`Total: ${d.total}`)
              .style("visibility", "hidden")
  })
      svg2.append('g')
          .append("text")
          .attr("x", (width + 150))             
          .attr("y", 60)
          .attr("text-anchor", "middle")  
          .style("font-size", "20px") 
          .text(neighborhood);
    
  
  }});
      

}