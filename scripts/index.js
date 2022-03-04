
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
    AddOptions($("#wheatPriceSelect"), 3, 1, 15, 0); // auto add wheat price list
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
    let gc = "#" + SelectGroupId;
    //var selectedIndex = $(gc).prop("selectedIndex");
    return $(gc).val();
}

// calculate and return soil organic matter nitrogen credit
// parameter "inputControlId" is the ID of a specific percentage organic matter input value
function GetOrganicMatterCredit(inputControlId) {
    let inputValue = $("#" + inputControlId).val();
    const percentageThreshold = 5;
    const coef = 50.0;
    let credit = 0;
    if (inputValue > percentageThreshold)
        credit = (inputValue - percentageThreshold) * coef;
    return credit;
}

// get base value from a matrix or table
function GetBaseValue(baseTable, cropPriceSelectControlId, nitrogenPriceSelectControlId) {
    let baseValue;
    let cropPriceIndex = parseInt($("#" + cropPriceSelectControlId).prop("selectedIndex"));
    let nitrogenPriceIndex = parseInt($("#" + nitrogenPriceSelectControlId).prop("selectedIndex"));
    baseValue = baseTable[cropPriceIndex][nitrogenPriceIndex];
    return baseValue;
}

// General calculation model
// for sunflower, the tillageCredit is always equal to 0 because the base table already contains tillage credit
function GetFinalResult(baseValue, soilTestNitrateCredit, organicMatterCredit, prevCropCredit) {
    let v = Math.round(baseValue - soilTestNitrateCredit - organicMatterCredit - prevCropCredit);
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
    const sfConvTillDiff = 50;
    const sfMinNotillDiff = 20;
    const sfLangdonDiff = -40;
    sunflowerWesternOilseedConventionaltill = GetNewTable(sunflowerWesternOilseedLongtermnotill, sfConvTillDiff);
    sunflowerWesternConfectionConventionaltill = GetNewTable(sunflowerWesternConfectionLongtermnotill, sfConvTillDiff);
    sunflowerWesternConfectionMinimalnotill = GetNewTable(sunflowerWesternConfectionConventionaltill, sfMinNotillDiff);
    sunflowerWesternOilseedMinimalnotill = GetNewTable(sunflowerWesternOilseedConventionaltill, sfMinNotillDiff);
    sunflowerEasternConfectionMinimalnotill = GetNewTable(sunflowerEasternConfectionConventionaltill, sfMinNotillDiff);
    sunflowerEasternOilseedMinimalnotill = GetNewTable(sunflowerEasternOilseedConventionaltill, sfMinNotillDiff);
    sunflowerLangdonConfectionConventionaltill = GetNewTable(sunflowerEasternConfectionConventionaltill, sfLangdonDiff);
    sunflowerLangdonOilseedConventionaltill = GetNewTable(sunflowerEasternOilseedConventionaltill, sfLangdonDiff);
    sunflowerLangdonConfectionLongtermnotill = GetNewTable(sunflowerEasternConfectionLongtermnotill, sfLangdonDiff);
    sunflowerLangdonOilseedLongtermnotill = GetNewTable(sunflowerEasternOilseedLongtermnotill, sfLangdonDiff);
    sunflowerLangdonConfectionMinimalnotill = GetNewTable(sunflowerEasternConfectionMinimalnotill, sfLangdonDiff);
    sunflowerLangdonOilseedMinimalnotill = GetNewTable(sunflowerEasternOilseedMinimalnotill, sfLangdonDiff);
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
    let tb;
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
            alert("Something is wrong!");
    }
    return tb;
}

// on sunflower calculate button clicked, calculate and display the result
function OnSunflowerCalculateBtnClicked() {
    $("#sfCalculateBtn").click(function () {
        let userSelectionStr = GetSunflowerRegionTillageSeedSelectionCombination();
        let baseValueTable = GetSunflowerValueTable(userSelectionStr);
        let finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfPriceSelect", "sfNitrogenPriceSelect"), GetSoilTestNitrateCredit("sfSoilTestNitrateInput"),
            GetOrganicMatterCredit("sfOrganicMatterInput"), GetPreviousCropNitrogenCredit("sfPreviousCropSelect"));

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


// get the combined string of corn region, irrigation, tillage, soil texture, and yield productivity based on user selection
function GetCornUserSelectionStringCombination() {
    let selections = "";
    if ($("input[name='cornRegion']:checked").val() == "westND") {
        selections = "westND";
    }
    else {
        selections = "eastND";
        if ($("input[name='cornTill']:checked").val() == "irrigate") {
            selections += "_" + "irrigate";
        }
        else if ($("input[name='cornTill']:checked").val() == "longNoTill") {
            selections += "_" + "longNoTill";
        }
        else if ($("input[name='cornTill']:checked").val() == "convTill") {
            selections += "_" + "convTill" + "_" + ($("input[name='cornSoilTexture']:checked").val());
        }
        else {
            selections += "_" + "minNoTill" + "_" + $("input[name='cornSoilTexture']:checked").val();
        }
    }
    return selections;
}

// get the corn recommendation value from the corresponding base table
function GetCornBaseValue(userCornSelection) {
    let v = 0;
    const minNotillDiff = 20;
    switch (userCornSelection) {
        case "westND":
            v = GetBaseValue(cornWest, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_irrigate":
            v = GetBaseValue(cornEastIrrigated, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_longNoTill":
            v = GetBaseValue(cornEastLongnotill, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_convTill_hchy":
            v = GetBaseValue(cornHighClayHighYield, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_convTill_hcly":
            v = GetBaseValue(cornHighClayLowYield, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_convTill_mthy":
            v = GetBaseValue(cornMediumTextureHighYield, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_convTill_mtly":
            v = GetBaseValue(cornMediumTextureLowYield, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_minNoTill_hchy":
            v = GetBaseValue(cornHighClayHighYield, "cornPriceSelect", "cornNitrogenPriceSelect") + minNotillDiff;
            break;
        case "eastND_minNoTill_hcly":
            v = GetBaseValue(cornHighClayLowYield, "cornPriceSelect", "cornNitrogenPriceSelect") + minNotillDiff;
            break;
        case "eastND_minNoTill_mthy":
            v = GetBaseValue(cornMediumTextureHighYield, "cornPriceSelect", "cornNitrogenPriceSelect") + minNotillDiff;
            break;
        case "eastND_minNoTill_mtly":
            v = GetBaseValue(cornMediumTextureLowYield, "cornPriceSelect", "cornNitrogenPriceSelect") + minNotillDiff;
            break;
    }
    return v;
}

// when corn calculate button is clicked, calculate and display the nitrogen recommendation result
function OnCornCalculateBtnClicked() {
    $("#cornCalculateBtn").click(function () {
        let userSelectionStr = GetCornUserSelectionStringCombination();
        let baseValue = GetCornBaseValue(userSelectionStr);
        let finalResult = GetFinalResult(baseValue, GetSoilTestNitrateCredit("cornSoilTestNitrateInput"),
            GetOrganicMatterCredit("cornOrganicMatterInput"), GetPreviousCropNitrogenCredit("cornPreviousCropSelect"));
        $("#cornResultText").text(finalResult);
    });
}

/////////////////////////////////////////////

/////////////////////  WHEAT FUNCTIONS  ////////////////////////

// 
// get the string of the combination of wheat region, historical productivity, and tillage type based on user selection
function GetWheatRegionTillageProductivitySelectionCombination() {
    let selections = "";
    selections = $("input[name='wheatRegion']:checked").val() + "_"
        + $("input[name='wheatProductivity']:checked").val() + "_"
        + $("input[name='wheatTillage']:checked").val();
    return selections;
}

// This function return the actual and exact base value based on user selections
// The returned value equals base value from one of the nine base tables plus tillage credit
// That means tillage credit is already included in the returned value
function GetWheatBaseValue(userSelection) {
    const minNotillDiff = 20;
    const eastWestLongNotillDiff = -50; // Easter medium long-term no-till is an exception
    const langdonLongNotillDiff = -30;
    let v = 0;

    switch (userSelection) {
        case "east_low_convTill":
            v = GetBaseValue(wheatEastLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "east_low_minNoTill":
            v = GetBaseValue(wheatEastLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "east_low_longNoTill":
            v = GetBaseValue(wheatEastLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + eastWestLongNotillDiff;
            break;
        case "west_low_convTill":
            v = GetBaseValue(wheatWestLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "west_low_minNoTill":
            v = GetBaseValue(wheatWestLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "west_low_longNoTill":
            v = GetBaseValue(wheatWestLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + eastWestLongNotillDiff;
            break;
        case "langdon_low_convTill":
            v = GetBaseValue(wheatLangdonLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "langdon_low_minNoTill":
            v = GetBaseValue(wheatLangdonLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "langdon_low_longNoTill":
            v = GetBaseValue(wheatLangdonLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + langdonLongNotillDiff;
            break;

        case "east_medium_convTill":
            v = GetBaseValue(wheatEastMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "east_medium_minNoTill":
            v = GetBaseValue(wheatEastMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "east_medium_longNoTill":
            v = GetBaseValue(wheatEastMediumLongnotill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "west_medium_convTill":
            v = GetBaseValue(wheatWestMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "west_medium_minNoTill":
            v = GetBaseValue(wheatWestMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "west_medium_longNoTill":
            v = GetBaseValue(wheatWestMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + eastWestLongNotillDiff;
            break;
        case "langdon_medium_convTill":
            v = GetBaseValue(wheatLangdonMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "langdon_medium_minNoTill":
            v = GetBaseValue(wheatLangdonMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "langdon_medium_longNoTill":
            v = GetBaseValue(wheatLangdonMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + langdonLongNotillDiff;
            break;

        case "east_high_convTill":
            v = GetBaseValue(wheatEastHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "east_high_minNoTill":
            v = GetBaseValue(wheatEastHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "east_high_longNoTill":
            v = GetBaseValue(wheatEastHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + eastWestLongNotillDiff;
            break;
        case "west_high_convTill":
            v = GetBaseValue(wheatWestHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "west_high_minNoTill":
            v = GetBaseValue(wheatWestHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "west_high_longNoTill":
            v = GetBaseValue(wheatWestHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + eastWestLongNotillDiff;
            break;
        case "langdon_high_convTill":
            v = GetBaseValue(wheatLangdonHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "langdon_high_minNoTill":
            v = GetBaseValue(wheatLangdonHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + minNotillDiff;
            break;
        case "langdon_high_longNoTill":
            v = GetBaseValue(wheatLangdonHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect") + langdonLongNotillDiff;
            break;
        default:
            alert("Something is wrong!");
    }
    return v;
}


// Calculate and display wheat nitrogen recommendation result when the calculate button is clicked
function OnWheatCalculateBtnClicked() {
    $("#wheatCalculateBtn").click(function () {
        let userSelectionStr = GetWheatRegionTillageProductivitySelectionCombination();
        let baseValue = GetWheatBaseValue(userSelectionStr);
        let finalResult = GetFinalResult(baseValue, GetSoilTestNitrateCredit("wheatSoilTestNitrateInput"),
            GetOrganicMatterCredit("wheatOrganicMatterInput"), GetPreviousCropNitrogenCredit("wheatPreviousCropSelect"));
        $("#wheatResultText").text(finalResult);
    });
}

