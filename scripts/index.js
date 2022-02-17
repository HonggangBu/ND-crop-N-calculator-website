
//////////////////////  MAIN FUNCTION  /////////////////////////////
$(function () {
    "use strict";
    $('[data-toggle="tooltip"]').tooltip();




    //sunflower functions//
    sunflowerWesternOilseedConventionaltill = GetNewTable(sunflowerWesternOilseedLongtermnotill, 50);
    sunflowerWesternConfectionConventionaltill = GetNewTable(sunflowerWesternConfectionLongtermnotill, 50);
    AddOptions($("#sfPriceSelect"), 0.09, 0.03, 0.60, 2); // auto add sunflower price list
    AddOptions($("#sfNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1); // auto add sunflower nitrogen cost list
    OnSunflowerCalculateBtnClicked(); // on Sunflower Calculate Btn Clicked, display result

    //corn functions//
    AddOptions($("#cornPriceSelect"), 2, 1, 20, 0); // auto add corn price list
    AddOptions($("#cornNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1); // auto add corn nitrogen cost list
    OnCornRegionChange(); // hide or show irrigation/tillage div and soil texture/yield div when west ND or east ND selection is changed 
    OnCornTillChange(); // hide or show the division of soil texture/historic yield based on the change of irrigation/tillage
    OnCornCalculateBtnClicked(); // on corn Calculate Btn Clicked, display result


    //wheat & durum functions//
    AddOptions($("#wheatPriceSelect"), 3, 1, 20, 0); // auto add wheat price list
    AddOptions($("#wheatNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1); // auto add wheat nitrogen cost list
    OnWheatCalculateBtnClicked(); // on wheat Calculate Btn Clicked, display result

    //alert(sunflowerWesternConfectionConventionaltill[0][0]);
});

////////////////////////////////////////////////////
//////////////////////    subroutine    /////////////////////////

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

// get soil test nitrate N credit
function GetSoilTestNitrateCredit(inputControlId) {
    return $("#" + inputControlId).val();
}

// return previous crop nitrogen credit value
// parameter "SelectGroupId" is the ID of any select group control
function GetPreviousCropNitrogenCredit(SelectGroupId) {
    var gc = "#" + SelectGroupId;
    //var selectedIndex = $(gc).prop("selectedIndex");
    return $(gc).val();
}

// calculate and return soil organic matter nitrogen credit
// parameter "inputControlId" is the ID of a specific percentage organic matter input value
function GetOrganicMatterCredit(inputControlId) {
    var inputValue = $("#" + inputControlId).val();
    var percentageThreshold = 5;
    var coef = 50.0;
    var credit = 0;
    if (inputValue > percentageThreshold)
        credit = (inputValue - percentageThreshold) * coef;
    return credit;
}

// get base value from a matrix or table
function GetBaseValue(baseTable, cropPriceSelectControlId, nitrogenPriceSelectControlId) {
    var baseValue;
    var cropPriceIndex = parseInt($("#" + cropPriceSelectControlId).prop("selectedIndex"));
    var nitrogenPriceIndex = parseInt($("#" + nitrogenPriceSelectControlId).prop("selectedIndex"));
    baseValue = baseTable[cropPriceIndex][nitrogenPriceIndex];
    return baseValue;
}


// General calculation model
// for sunflower, the tillageCredit is always equal to 0 because the base table already contains tillage credit
function GetFinalResult(baseValue, soilTestNitrateCredit, organicMatterCredit, prevCropCredit, tillageCredit) {
    var v = Math.round(baseValue - soilTestNitrateCredit - organicMatterCredit - prevCropCredit - tillageCredit);
    return v > 0 ? v : 0;
}

// return a new data table that is a modified version of an existing table
function GetNewTable(existingTable, difference) {
    let rowNum = existingTable.length;
    let colNum = existingTable[0].length;
    var x = existingTable;
    var data;
    var newData;
    for (let i = 0; i < rowNum; i++) {
        for (let j = 0; j < colNum; j++) {
            newData = 0;
            data = existingTable[i][j];
            if (data > 0) {
                newData = data + difference;
            }
            x[i][j] = newData;
        }
    }
    return x;
}



/////////////////////////////////////////////////////

//////////////////////////    SUNFLOWER FUNCTIONS    ////////////////////////////




function OnSunflowerCalculateBtnClicked() {
    $("#sfCalculateBtn").click(function () {
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


function OnCornCalculateBtnClicked() {
    $("#cornCalculateBtn").click(function () {
        $("#cornResultText").text("The calculate button was clicked.");
    });
}

/////////////////////////////////////////////

/////////////////////  WHEAT FUNCTIONS  ////////////////////////
function OnWheatCalculateBtnClicked() {
    $("#wheatCalculateBtn").click(function () {
        $("#wheatResultText").text("The calculate button was clicked.");
    });
}

