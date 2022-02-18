
//////////////////////  MAIN FUNCTION  /////////////////////////////
$(function () {
    "use strict";
    $('[data-toggle="tooltip"]').tooltip();

    //sunflower functions//
    GetSunflowerNewDataTables();
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
    let v = $("#" + inputControlId).val();
    return v > 0 ? v : 0;
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

// calculate new table values based on existing table and the desired difference
function GetNewTable(existingTable, difference) {
    let newTable = JSON.parse(JSON.stringify(existingTable)); //deep copy, only copy value without reference
    let rowNum = existingTable.length;
    let colNum = existingTable[0].length;
    for (let i = 0; i < rowNum; i++) {
        for (let j = 0; j < colNum; j++) {
            if (newTable[i][j] > 0) {
                newTable[i][j] += difference;
                if (newTable[i][j] < 0) {
                    newTable[i][j] = 0;
                }
            }
        }
    }
    return newTable;
}


/////////////////////////////////////////////////////

//////////////////////////    SUNFLOWER FUNCTIONS    ////////////////////////////

// calculate the rest sunflower base table values based on existing table values
function GetSunflowerNewDataTables() {
    sunflowerWesternOilseedConventionaltill = GetNewTable(sunflowerWesternOilseedLongtermnotill, 50);
    sunflowerWesternConfectionConventionaltill = GetNewTable(sunflowerWesternConfectionLongtermnotill, 50);
    sunflowerWesternConfectionMinimalnotill = GetNewTable(sunflowerWesternConfectionConventionaltill, 20);
    sunflowerWesternOilseedMinimalnotill = GetNewTable(sunflowerWesternOilseedConventionaltill, 20);
    sunflowerEasternConfectionMinimalnotill = GetNewTable(sunflowerWesternConfectionConventionaltill, 20);
    sunflowerEasternOilseedMinimalnotill = GetNewTable(sunflowerEasternOilseedConventionaltill, 20);
    sunflowerLangdonConfectionConventionaltill = GetNewTable(sunflowerEasternConfectionConventionaltill, -40);
    sunflowerLangdonOilseedConventionaltill = GetNewTable(sunflowerEasternOilseedConventionaltill, -40);
    sunflowerLangdonConfectionLongtermnotill = GetNewTable(sunflowerEasternConfectionLongtermnotill, -40);
    sunflowerLangdonOilseedLongtermnotill = GetNewTable(sunflowerEasternOilseedLongtermnotill, -40);
    sunflowerLangdonConfectionMinimalnotill = GetNewTable(sunflowerEasternConfectionMinimalnotill, -40);
    sunflowerLangdonOilseedMinimalnotill = GetNewTable(sunflowerEasternOilseedMinimalnotill, -40);
}

// get the string of the combination of sunflower region, sunflower type, and tillage type based on user selection
function GetSunflowerRegionTillageSeedSelectionCombination() {
    let selections = "";
    selections = $("input[name='sfRegion']:checked").val() + "_"
        + $("input[name='sfType']:checked").val() + "_"
        + $("input[name='sfTillage']:checked").val();
    return selections;
}

// get the sunflower base table (N recommendation table before credits) per the user selection
function GetSunflowerValueTable(userSelection) {
    var tb;
    switch (userSelection) {
        case "west_confection_longNoTill":
            //tb = sunflowerWesternConfectionLongtermnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerWesternConfectionLongtermnotill));
            break;
        case "west_confection_convTill":
            //tb = sunflowerWesternConfectionConventionaltill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerWesternConfectionConventionaltill));
            break;
        case "west_confection_minNoTill":
            //tb = sunflowerWesternConfectionMinimalnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerWesternConfectionMinimalnotill));
            break;
        case "west_oilseed_longNoTill":
            //tb = sunflowerWesternOilseedLongtermnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerWesternOilseedLongtermnotill));
            break;
        case "west_oilseed_convTill":
            //tb = sunflowerWesternOilseedConventionaltill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerWesternOilseedConventionaltill));
            break;
        case "west_oilseed_minNoTill":
            //tb = sunflowerWesternOilseedMinimalnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerWesternOilseedMinimalnotill));
            break;
        case "east_confection_longNoTill":
            //tb = sunflowerEasternConfectionLongtermnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerEasternConfectionLongtermnotill));
            break;
        case "east_confection_convTill":
            //tb = sunflowerEasternConfectionConventionaltill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerEasternConfectionConventionaltill));
            break;
        case "east_confection_minNoTill":
            //tb = sunflowerEasternConfectionMinimalnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerEasternConfectionMinimalnotill));
            break;
        case "east_oilseed_longNoTill":
            //tb = sunflowerEasternOilseedLongtermnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerEasternOilseedLongtermnotill));
            break;
        case "east_oilseed_convTill":
            //tb = sunflowerEasternOilseedConventionaltill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerEasternOilseedConventionaltill));
            break;
        case "east_oilseed_minNoTill":
            //tb = sunflowerEasternOilseedMinimalnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerEasternOilseedMinimalnotill));
            break;
        case "langdon_confection_longNoTill":
            //tb = sunflowerLangdonConfectionLongtermnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerLangdonConfectionLongtermnotill));
            break;
        case "langdon_confection_convTill":
            //tb = sunflowerLangdonConfectionConventionaltill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerLangdonConfectionConventionaltill));
            break;
        case "langdon_confection_minNoTill":
            //tb = sunflowerLangdonConfectionMinimalnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerLangdonConfectionMinimalnotill));
            break;
        case "langdon_oilseed_longNoTill":
            //tb = sunflowerLangdonOilseedLongtermnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerLangdonOilseedLongtermnotill));
            break;
        case "langdon_oilseed_convTill":
            //tb = sunflowerLangdonOilseedConventionaltill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerLangdonOilseedConventionaltill));
            break;
        case "langdon_oilseed_minNoTill":
            //tb = sunflowerLangdonOilseedMinimalnotill.slice();
            tb = JSON.parse(JSON.stringify(sunflowerLangdonOilseedMinimalnotill));
            break;
        default:
            alert("No valid selection!");
    }
    return tb;
}

// on sunflower calculate button clicked, calculate and display the result
function OnSunflowerCalculateBtnClicked() {
    $("#sfCalculateBtn").click(function () {
        let userSelectionStr = GetSunflowerRegionTillageSeedSelectionCombination();
        let baseValueTable = GetSunflowerValueTable(userSelectionStr);
        let finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfPriceSelect", "sfNitrogenPriceSelect"), GetSoilTestNitrateCredit("sfSoilTestNitrateInput"),
            GetOrganicMatterCredit("sfOrganicMatterInput"), GetPreviousCropNitrogenCredit("sfPreviousCropSelect"), 0);

        $("#sfResultText").text(finalResult);
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

// 
function OnCornCalculateBtnClicked() {
    $("#cornCalculateBtn").click(function () {
        $("#cornResultText").text("The calculate button was clicked.");
    });
}

/////////////////////////////////////////////

/////////////////////  WHEAT FUNCTIONS  ////////////////////////
// 
function OnWheatCalculateBtnClicked() {
    $("#wheatCalculateBtn").click(function () {
        $("#wheatResultText").text("The calculate button was clicked.");
    });
}

