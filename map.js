d3.json('./practica_airbnb.json')
    .then((featureCollection) => {
        drawMap(featureCollection);
    });

function drawMap(featureCollection) {
    console.log(featureCollection)
    console.log(featureCollection.features)
    var width = 1000;
    var height = 1000;

    var svg = d3.select('div')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');

    var center = d3.geoCentroid(featureCollection); //Finds central cordinates
    console.log(center)

    //to translate geo coordinates[long,lat] into X,Y coordinates.
    var projection = d3.geoMercator()
        .fitSize([width, height], featureCollection)
        //.scale(1000)
        .center(center) 
        .translate([width / 2, height / 2]) //Centers map

    //console.log(projection([long,lat]))

    //Creates a path with a projection
    var pathProjection = d3.geoPath().projection(projection);

    var features = featureCollection.features;

    var createdPath = svg.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('d', (d) => pathProjection(d))
        .attr("opacity", function(d, i) {
            d.opacity = 1
            return d.opacity
        });

    createdPath.on('click', function(event, d) {
        d.opacity = d.opacity ? 0 : 1;
        d3.select(this).attr('opacity', d.opacity);
        console.log(d.properties.name);
    })

    var scaleColor = d3.scaleOrdinal(d3.schemeTableau10);
    createdPath.attr('fill', (d) => scaleColor(d.properties.name));



    //Legend 
    var nblegend = 10;
    var widthRect = (width / nblegend) - 2;
    var heightRect = 10;

    var scaleLegend = d3.scaleLinear()
        .domain([0, nblegend])
        .range([0, width]);


    var legend = svg.append("g")
        .selectAll("rect")
        .data(d3.schemeTableau10)
        .enter()
        .append("rect")
        .attr("width", widthRect)
        .attr("height", heightRect)
        .attr("x", (d, i) => scaleLegend(i)) 
        .attr("fill", (d) => d);

    var text_legend = svg.append("g")
        .selectAll("text")
        .data(d3.schemeTableau10)
        .enter()
        .append("text")
        .attr("x", (d, i) => scaleLegend(i)) 
        .attr("y", heightRect * 2.5)
        .text((d) => d)
        .attr("font-size", 12)
}