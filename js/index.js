///Data Points CRUD

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

function addDataPoint(){
    var xValue = document.getElementById("dataPointsAddFieldX").value;
    if(xValue == ""){xValue = 0;}
    var yValue = document.getElementById("dataPointsAddFieldY").value;
    if(yValue == ""){yValue = 0;}
    var zValue = document.getElementById("dataPointsAddFieldZ").value;
    if(zValue == ""){zValue = 0;}
    //Create a new object of the DataPoint class leaving two attributes undefined and add it to an array
    dataPointsArray.push(new DataPoint(xValue, yValue, zValue));
    
    extractDataPoints();
    printDataPointsArray();
}

function removeDataPoint(dataPointID){
    //Remove the DataPoint object at the location provided by dataPointID
    dataPointsArray.splice(dataPointID, 1);

    extractDataPoints();
    printDataPointsArray();
}

let xDataPoints = [];
let yDataPoints = [];
let zDataPoints = [];

function extractDataPoints(){

    clearDataPoints();

    //All datapoints in the array are extracted and placed in separate arrays
    for(var i = 0; i < dataPointsArray.length; i++){
        xDataPoints.push(dataPointsArray[i].xValue);
        yDataPoints.push(dataPointsArray[i].yValue);
        zDataPoints.push(dataPointsArray[i].zValue);
    }
}

function clearDataPoints(){
    xDataPoints.length = 0;
    yDataPoints.length = 0;
    zDataPoints.length = 0;
}

function calculateRes(xValue, yValue, arrayLocation){

    updateRegressionPlaneValues();

    //The location of the compared datapoints zValue is compared to the regression plane´s value at the provided x, y coordinates
    var resValue = dataPointsArray[arrayLocation].zValue - zPlane[xValue][yValue];

    console.log(resValue);//debugging
    console.log(dataPointsArray[arrayLocation].zValue);//debugging
    console.log(zPlane[xValue][yValue]);//debugging

    resValue = resValue.toFixed(2);

    var res2Value = resValue * resValue;
    res2Value = res2Value.toFixed(2);

    dataPointsArray[arrayLocation].resValue = resValue;
    dataPointsArray[arrayLocation].res2Value = res2Value;
}

///Data Points Panel

function printDataPointsArray(){
    
    deleteDataPointsArray();
    var res2Total = 0;

    //New HTML elements are created for each datapoint and placed inside a preexisting container "dataPointsCurrent"
    for(var i = 0; i < dataPointsArray.length; i++){
        
        calculateRes(dataPointsArray[i].xValue, dataPointsArray[i].yValue, i);

        const dataPointsCurrent = document.getElementById("dataPointsCurrent");
        const dataPointsCurrentItem = document.createElement("div");
        var dataPointsCurrentItemID = "dataPointsCurrentItem" + i;
        dataPointsCurrentItem.setAttribute("id", dataPointsCurrentItemID);
        dataPointsCurrent.appendChild(dataPointsCurrentItem);
    
        const dataPointsCurrentField = document.createElement("div");
        dataPointsCurrentField.setAttribute("id", "dataPointsCurrentField");
        dataPointsCurrentItem.appendChild(dataPointsCurrentField); 
    
        const dataPointsCurrentFieldX = document.createElement("div");
        dataPointsCurrentFieldX.setAttribute("id", "dataPointsCurrentFieldX");
        const dataPointsCurrentFieldXValue = document.createTextNode(dataPointsArray[i].xValue);
        dataPointsCurrentFieldX.appendChild(dataPointsCurrentFieldXValue);
        dataPointsCurrentField.appendChild(dataPointsCurrentFieldX); 
    
        const dataPointsCurrentFieldY = document.createElement("div");
        dataPointsCurrentFieldY.setAttribute("id", "dataPointsCurrentFieldY");
        const dataPointsCurrentFieldYValue = document.createTextNode(dataPointsArray[i].yValue);
        dataPointsCurrentFieldY.appendChild(dataPointsCurrentFieldYValue);
        dataPointsCurrentField.appendChild(dataPointsCurrentFieldY); 
    
        const dataPointsCurrentFieldZ = document.createElement("div");
        dataPointsCurrentFieldZ.setAttribute("id", "dataPointsCurrentFieldZ");
        const dataPointsCurrentFieldZValue = document.createTextNode(dataPointsArray[i].zValue);
        dataPointsCurrentFieldZ.appendChild(dataPointsCurrentFieldZValue);
        dataPointsCurrentField.appendChild(dataPointsCurrentFieldZ); 
        
        const dataPointsCurrentFieldRes = document.createElement("div");
        dataPointsCurrentFieldRes.setAttribute("id", "dataPointsCurrentFieldRes");
        const dataPointsCurrentFieldResValue = document.createTextNode(dataPointsArray[i].resValue);
        dataPointsCurrentFieldRes.appendChild(dataPointsCurrentFieldResValue);
        dataPointsCurrentField.appendChild(dataPointsCurrentFieldRes); 
        
        const dataPointsCurrentFieldRes2 = document.createElement("div");
        dataPointsCurrentFieldRes2.setAttribute("id", "dataPointsCurrentFieldRes2");
        const dataPointsCurrentFieldRes2Value = document.createTextNode(dataPointsArray[i].res2Value);
        dataPointsCurrentFieldRes2.appendChild(dataPointsCurrentFieldRes2Value);
        dataPointsCurrentField.appendChild(dataPointsCurrentFieldRes2); 
        
        const dataPointsRemoveButton = document.createElement("div");
        dataPointsRemoveButton.setAttribute("id", "dataPointsRemoveButton");
        dataPointsRemoveButton.setAttribute("onclick", "removeDataPoint(" + i + "); draw3DModel()");
        const dataPointsRemoveButtonText = document.createTextNode("x");
        dataPointsRemoveButton.appendChild(dataPointsRemoveButtonText);
        dataPointsCurrentItem.appendChild(dataPointsRemoveButton);    
        
        res2Total = parseFloat(res2Total) + parseFloat(dataPointsArray[i].res2Value);
    }

    res2Total = res2Total.toFixed(2);

    //The sum of all datapoints res2 values are displayed
    document.getElementById("dataPointsTotalFieldRes2").innerHTML = res2Total;
}

function deleteDataPointsArray(){
    const parent = document.getElementById("dataPointsCurrent");

    while(parent.hasChildNodes()){
        parent.removeChild(parent.firstChild);
    }
}

///Plotly.js 3D Model

var xPlane;
var yPlane;
var zPlane;

function updateRegressionPlaneValues(){
    //Default size is 8(0-7) but if any datapoint x or y coordinate exceed that the model grows to encompass it
    var modelSize = 8;
    for(var i = 0; i < dataPointsArray.length; i++){
        if(dataPointsArray[i].xValue > modelSize){
            modelSize = parseInt(dataPointsArray[i].xValue) + 2;
        }
        if(dataPointsArray[i].yValue > modelSize){
            modelSize = parseInt(dataPointsArray[i].yValue) + 2;
        }
    }

    xPlane = d3.range(0, modelSize);
    yPlane = d3.range(0, modelSize);
    var hInput = parseInt(document.getElementById("hValueInput").value);
    var aInput = parseInt(document.getElementById("avalueInput").value);
    var lInput = parseInt(document.getElementById("lvalueInput").value);
    
    zPlane = [];
    
    for (var i = 0; i < yPlane.length; i++) {
      var row = [];
      for (var j = 0; j < xPlane.length; j++) {
        row.push((hInput*0.1) + (i*0.1*aInput*(lInput*0.05)) + (j*0.05*aInput));
      }
      zPlane.push(row);
    }

    ///Generates the coeffcient regression plane equasion

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
    const regressionEquation = `Y = ${beta[0].toFixed(1)} + ${beta[2].toFixed(2)} X1 + ${beta[1].toFixed(2)} X2`;
    document.getElementById("regression-equation").innerHTML = regressionEquation;
}

draw3DModel();

function draw3DModel(){
    updateRegressionPlaneValues();
    var data=[
        {
            //Regression Plane
            opacity: 0.9,
            type: 'surface',
            x: xPlane,
            y: yPlane, 
            z: zPlane,
            colorscale: 'Electric',
            hovertemplate: 'X1: %{x}<br>X2: %{y}<br>Y: %{z}',
            name: "Regression Plane"
        },
        {
            opacity: 0.9,
            type: 'scatter3d',
            x: xDataPoints,
            y: yDataPoints,
            z: zDataPoints,
            mode:'markers',
            marker: {
                size: 5,
                color: 'rgb(200, 0, 0)'
            },
            hovertemplate: 'X1: %{x}<br>X2: %{y}<br>Y: %{z}',
            name: "Data Point"
        },
        {
            //Bottom anchoring
            opacity: 0,
            type: 'scatter3d',
            x: [0],
            y: [0],
            z: [0],
            mode:'markers',
            hoverinfo: "none"
        }
        
    ];
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

    var layout = {
        showlegend: false,
        scene:{
            xaxis: {
                title:"X1",
                gridwidth: 3,
                gridcolor: "rgb(255, 255, 255)",
                showbackground: true,
                backgroundcolor: '#f5f5f5',
                zerolinecolor: "#C3C3C3",
                zerolinewidth: 3
            }, 
            yaxis: {
                title:"X2",
                gridwidth: 3,
                gridcolor: "rgb(255, 255, 255)",
                showbackground: true,
                backgroundcolor: '#f5f5f5',
                zerolinecolor: "#C3C3C3",
                zerolinewidth: 3                
            }, 
            zaxis: {
                title:"Y",
                gridwidth: 3,
                gridcolor: "rgb(255, 255, 255)",
                showbackground: true,
                backgroundcolor: '#f5f5f5',
                zerolinecolor: "#C3C3C3",
                zerolinewidth: 3            
            },
            camera: {
                center: {x: 0, y: 0, z: 0},
                eye: {x: 1.25, y: 1.25, z: 1.5},
                up: {x: 0, y: 0, z: 1},
                projection: {type: 'perspective'},
                zoom: 1
            },
            uirevision:'true'
        }
    };

    Plotly.react('model', data, layout, {responsive: true});
}

///Modifying Regression Plane values

/* Unmodified code is sourced at https://stackoverflow.com/questions/9186346/javascript-onclick-increment-number */
function increaseValue(input){
    var element;
    if (input == "hValueIncrease"){
        element = "hValueInput";
    }
    else if (input == "avalueIncrease"){
        element = "avalueInput";
    }
    else if (input == "lvalueIncrease"){
        element = "lvalueInput";
    }
    var value = parseInt(document.getElementById(element).value);
    if(element == "hValueInput" && value < 999){
        value ++;
        document.getElementById(element).value = value;
    }
    else if (value < 99 ){
        value ++;
        document.getElementById(element).value = value;
    }
    else{
        if(element == "hValueInput"){
            document.getElementById(element).value = 999;
        }
        else{
            document.getElementById(element).value = 99;
        }
    }
}

/* Unmodified code is sourced at https://stackoverflow.com/questions/9186346/javascript-onclick-increment-number */
function decreaseValue(input){
    var element;
    if (input == "hValueDecrease"){
        element = "hValueInput";
    }
    else if (input == "avalueDecrease"){
        element = "avalueInput";
    }
    else if (input == "lvalueDecrease"){
        element = "lvalueInput";
    }
    var value = parseInt(document.getElementById(element).value);
    if(element == "hValueInput" && value < -999){
        value ++;
        document.getElementById(element).value = value;
    }    
    else if (value > -99){
        value --;
        document.getElementById(element).value = value;
    }
    else{
        if(element == "hValueInput"){
            document.getElementById(element).value = -999;
        }
        else{
            document.getElementById(element).value = -99;
        }
    }
}

///Instructions Popup

function openInstructions(){
    document.getElementById("instructionsPopup").style.display = "flex";
}

function closeInstructions(){
    document.getElementById("instructionsPopup").style.display = "none";
}

window.onclick = function(trigger){
    if(trigger.target == instructionsPopup){
        document.getElementById("instructionsPopup").style.display = "none";
    }
}