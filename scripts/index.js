
//////////////////////  MAIN FUNCTION  /////////////////////////////
$(function () {
    "use strict";
    $('[data-toggle="tooltip"]').tooltip();

    AddOptions($("#sunflowerPriceSelect"), 0.09, 0.03, 0.60, 2); // sunflower price list
    AddOptions($("#sunflowerNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1); // sunflower nitrogen cost list
    OnSunflowerCalculateBtnClicked();


    AddOptions($("#cornPriceSelect"), 2, 1, 20, 0); // corn price list
    AddOptions($("#cornNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1); // corn nitrogen cost list
    OnCornRegionChange(); // hide or show irrigation/tillage div and soil texture/yield div when west ND or east ND selection is changed 
    OnCornTillChange(); // hide or show the division of soil texture/historic yield based on the change of irrigation/tillage
    OnCornCalculateBtnClicked();
});

////////////////////////////////////////////////////

/////////////////////////   COMMON FUNCTIONS        /////////////////////////////
// dynamically add select control (drop list) options
function AddOptions(selectControl, startValue, increment, endValue, precision) {
    var optTemp, v;
    var len = Math.floor((endValue - startValue) / increment) + 1;
    for (var i = 0; i < len; i++) {
        v = startValue + i * increment;
        v = Number(v).toFixed(precision);
        optTemp = "<option value= i>" + v + "</option>";
        selectControl.append(optTemp);
    }
}


/////////////////////////////////////////////////////

//////////////////////////    SUNFLOWER FUNCTIONS    ////////////////////////////

function OnSunflowerCalculateBtnClicked(){
    $("#sfCalculateBtn").click(function(){
        $("#sfResultText").text("The calculate button was clicked.");
      });
}



/////////////////////////////////////////////////////////////////////

/////////////////  CORN FUNCTIONS  /////////////////////////

// hide or show irrigation/tillage div and soil texture/yield div when west ND or east ND selection is changed 
function OnCornRegionChange() {
    CornRegionResponse();
    $("input[name='cornRegion']").on("change", function () {
        CornRegionResponse();
    });
}

// sub function of "OnCornRegionChange()"
// hide or show irrigation/tillage div and soil texture/yield div when west ND or east ND selection is changed 
function CornRegionResponse() {
    if ($("input[name='cornRegion']:checked").val() === 'westND') {
        $("#tillDiv").hide();
        $("#soilTextureDiv").hide();
    }
    else {
        $("#tillDiv").show();
        CornTillResponse();
    }
}


// hide or show the division of soil texture/historic yield based on the change of irrigation/tillage
function OnCornTillChange() {
    CornTillResponse();
    $("input[name='cornTill']").on("change", function () {
        CornTillResponse();
    });
}

// subfunction of "OnCornTillChange"
// hide or show the division of soil texture/historic yield based on the change of irrigation/tillage
function CornTillResponse() {
    if (($("input[name='cornTill']:checked").val() === 'irrigate') || ($("input[name='cornTill']:checked").val() === 'longNoTill')) {
        $("#soilTextureDiv").hide();
    }
    else {
        $("#soilTextureDiv").show();
    }
}


function OnCornCalculateBtnClicked(){
    $("#cornCalculateBtn").click(function(){
        $("#cornResultText").text("The calculate button was clicked.");
      });
}

/////////////////////////////////////////////

/////////////////////  WHEAT FUNCTIONS  ////////////////////////