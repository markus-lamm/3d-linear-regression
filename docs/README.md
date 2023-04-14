# Dependencies

The application is dependant on libraries included in the application. Plotly, D3 & Numeric. As these libraries are all local it is highly unlikely that they will within a short time need maintainance. 

Otherwise the application only has a dependency on the functionality of modern web browsers.

```
<script src="js/d3.v7.min.js"></script>
<script src="js/plotly-2.18.2.min.js"></script>
<script src="js/numeric-1.2.6.min.js"></script>
```

# Code Structure

All the code relating to application function is located inside the index.js file inside the js folder. HTML only initiates the js functions and CSS provides styling to the HTML elements.

Code inside the index.js file is mainly divided into functions related to the data points, the regression surface and the model container. This documentation only covers the index.js and index.html file.

# Data Points

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

# 3D Model & Regression Plane

The 3D model consits of a plotly.js model made in javascript. The size of the model is entirely determined by the size of the regression plane inside it. The size of the regression plane is determined by the location of the data points. The model has a minimum x and y value of 0-10 but streches to encompass all datapoints and maintain an equal x and z max value.

The regression plane is mad up of three arrays x,y,z where z is an array consiting of arrays.

```
var xPlane;
var yPlane;
var zPlane;

var modelSize = 11;
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


The z array is filled with a layerd for loop where the increase in z value is manipulated by "hInput", "aInput" and "lInput" which are taken from an html input. hInput determines the starting altitude of the lowest z value. aInput determines the rate of z value increase as the x,y values grow. lInput modifies the aInput values to create a lean in the model.

```
var hInput = parseInt(document.getElementById("hValueInput").value);
var aInput = parseInt(document.getElementById("avalueInput").value);
var lInput = parseInt(document.getElementById("lvalueInput").value);

zPlane = [];

for (var i = 0; i < yPlane.length; i++) {
    var row = [];
    for (var j = 0; j < xPlane.length; j++) {
    row.push(hInput + (i*0.1*aInput*(lInput*0.05)) + (j*0.05*aInput));
    }
    zPlane.push(row);
}
```


The coefficient in the model which describes the relation between the x,y,z coordinated and there placement in the model is determined by the following function. The function was created by generative ai and attempts to recreate the function in a more developer friendly code have not been successfull.

```
// Flatten the y array into a 1D array
const yFlat = zPlane.flat();

// Create a matrix of input data
const X = [];
for (let i = 0; i < xPlane.length; i++) {
    for (let j = 0; j < yPlane.length; j++) {
        X.push([1, xPlane[i], yPlane[j], xPlane[i]**2, xPlane[i]*yPlane[j], yPlane[j]**2]);
    }
}

// Perform polynomial regression using the normal equations method
const Xt = numeric.transpose(X);
const XtX = numeric.dot(Xt, X);
const XtXInv = numeric.inv(XtX);
const XtY = numeric.dot(Xt, yFlat);
const beta = numeric.dot(XtXInv, XtY);

// Create the regression equation
const regressionEquation = `Y = ${Math.floor(beta[0].toFixed(0))} + ${beta[1].toFixed(2)} X1 + ${beta[2].toFixed(2)} X2`;
document.getElementById("regression-equation").innerHTML = regressionEquation;
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