## Dependencies

The application is dependant on libraries included in the application. Plotly, D3 & Numeric. As these libraries are all local it is highly unlikely that they will within a short time need maintainance. 

Otherwise the application only has a dependency on the functionality of modern web browsers.

```
<script src="js/d3.v7.min.js"></script>
<script src="js/plotly-2.18.2.min.js"></script>
<script src="js/numeric-1.2.6.min.js"></script>
```

## Code Structure

All the code relating to application function is located inside the index.js file inside the js folder. HTML only initiates the js functions and CSS provides styling to the HTML elements.

Code inside the index.js file is mainly divided into functions related to the data points, the regression surface and the model container. This documentation only covers the index.js and index.html file.

## Data Points

All datapoints are managed inside an object array and each time a new data point is added or removed the array is modified.

```
let dataPointsArray = [];

class DataPoint{
    constructor(xValue, yValue, zValue, resValue, res2Value){
        this.xValue = xValue;
        this.yValue = yValue;
        this.zValue = zValue;
        this.resValue = resValue;
        this.res2Value = res2Value;
    }
}
```


Adding and removing data points are made through functions specifically designed for that task. These are just the names of the functions:

```
function addDataPoint()
function removeDataPoint(dataPointID)
function extractDataPoints()
function clearDataPoints()
```


For use in the 3D model the different axis values (x,y,z) has to be seperated and fed into different arrays. This is achived through a for loop that loops through the array of data point objects and extracts the respective x,y,z values to be fed into specific arrays.

```
let xDataPoints = [];
let yDataPoints = [];
let zDataPoints = [];
```


The data points are printed into the html code by creating and removing html elements through two functions. The html elements are created parent first, meaning that parent elements are created and then child elements are created tying them to the parent element. This continues until all html elements are created and the whole process runs in a loop for each data point.

```
//This is not the whole function and only for illustration purposes
function printDataPointsArray(){
    for(var i = 0; i < dataPointsArray.length; i++){
        const dataPointsCurrent = document.getElementById("dataPointsCurrent");
        const dataPointsCurrentItem = document.createElement("div");
        var dataPointsCurrentItemID = "dataPointsCurrentItem" + i;
        dataPointsCurrentItem.setAttribute("id", dataPointsCurrentItemID);
        dataPointsCurrent.appendChild(dataPointsCurrentItem);
    }
}
```

## 3D Model & Regression Plane

The 3D model consits of a plotly.js model made in javascript. The size of the model is entirely determined by the size of the regression plane inside it. The size of the regression plane is determined by the location of the data points. The model has a minimum x and y value of 0-10 but streches to encompass all datapoints and maintain an equal x and z max value.

The regression plane is mad up of three arrays x,y,z where z is an array consiting of arrays.

```
var xPlane;
var yPlane;
var zPlane;

var modelSize = 6;
for(var i = 0; i < dataPointsArray.length; i++){
    if(dataPointsArray[i].xValue > modelSize){
        modelSize = parseInt(dataPointsArray[i].xValue) + 2;
    }
    if(dataPointsArray[i].yValue > modelSize){
        modelSize = parseInt(dataPointsArray[i].yValue) + 2;
    }
}
```

The x,y arrays are filled with values by a d3.js function 

```
xPlane = d3.range(0, modelSize);
yPlane = d3.range(0, modelSize);
```


The z array is filled with a layerd for loop where the increase in z value is manipulated by "co1Input", "co2Input" and "co3Input" which are taken from an html input. co1Input determines the starting altitude of the lowest z value. co2Input determines the rate of z value increase in the x value. co3Input determines the rate of z value increase in the y value.as the x,y values grow. Using different co2Input and co3Input will create a lean in the model.

```
var co1Input = parseFloat(document.getElementById("co1ValueInput").value);
var co2Input = parseFloat(document.getElementById("co2ValueInput").value);
var co3Input = parseFloat(document.getElementById("co3ValueInput").value);

zPlane = [];

for (var i = 0; i < yPlane.length; i++) {
    var row = [];
    for (var j = 0; j < xPlane.length; j++) {
    row.push((co1Input) + (j*co2Input) + (i*co3Input));
    }
    zPlane.push(row);
}
```


The plotly.js 3D model is created by a function and reacts to changes in the model without reseting the model view camera in the browser. Plotly.js is fed arrays of data and layout to create the model. The data array consists of an element for each seperate element in the array meaning the regression plane is one and the data points are another. 

```
//Regression Plane
opacity: 0.9,
type: 'surface',
x: xPlane,
y: yPlane, 
z: zPlane,
colorscale: 'Electric',
hovertemplate: 'X1: %{x}<br>X2: %{y}<br>Y: %{z}',
name: "Regression Plane"
```


The lines between the data points and the regression plane are made in the following for loop. An element is created for each data point and the data points value are used for the x,y position of the line as the line only moves in the z axis. The z value is determined by the location of the data point and the calculated location of the regression plane.

```
for (var i = 0; i < xDataPoints.length; i++) {
    var lineTrace = {
        opacity: 0.5,
        type: 'scatter3d',
        mode: 'lines',
        hoverinfo: "none",
        x: [xDataPoints[i], xDataPoints[i]],
        y: [yDataPoints[i], yDataPoints[i]],
        z: [zDataPoints[i], zPlane[Math.floor(yDataPoints[i])][Math.floor(xDataPoints[i])]],
        line: {
            width: 3,
            color: 'rgb(0, 0, 0)'
        }
    };
    data.push(lineTrace);
}
```