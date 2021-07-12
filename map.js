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

    var center = d3.geoCentroid(featureCollection); //Encontrar la coordenada central del mapa (de la featureCollection)
    //var center_area = d3.geoCentroid(featureCollection.features[0]); //Encontrar la coordenada central de un area. (de un feature)

    console.log(center)

    //to translate geo coordinates[long,lat] into X,Y coordinates.
    var projection = d3.geoMercator()
        .fitSize([width, height], featureCollection) // equivalente a  .fitExtent([[0, 0], [width, height]], featureCollection)
        //.scale(1000)
        //Si quiero centrar el mapa en otro centro que no sea el devuelto por fitSize.
        .center(center) //centrar el mapa en una long,lat determinada
        .translate([width / 2, height / 2]) //centrar el mapa en una posicion x,y determinada

    //console.log(projection([long,lat]))

    //Para crear paths a partir de una proyección 
    var pathProjection = d3.geoPath().projection(projection);
    //console.log(pathProjection(featureCollection.features[0]))
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



    //Creacion de una leyenda
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
        .attr("x", (d, i) => scaleLegend(i)) // o (i * (widthRect + 2)) //No haria falta scaleLegend
        .attr("fill", (d) => d);

    var text_legend = svg.append("g")
        .selectAll("text")
        .data(d3.schemeTableau10)
        .enter()
        .append("text")
        .attr("x", (d, i) => scaleLegend(i)) // o (i * (widthRect + 2))
        .attr("y", heightRect * 2.5)
        .text((d) => d)
        .attr("font-size", 12)
}