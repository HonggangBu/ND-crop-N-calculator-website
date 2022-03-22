
//////////////////////  MAIN FUNCTION  /////////////////////////////
$(function () {
    "use strict";
    $('[data-toggle="tooltip"]').tooltip();

    //sunflower functions//
    GetSunflowerNewDataTables();
    AddOptions($("#sfNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1, 4); // auto add nitrogen cost list
    OnSunflowerCalculateBtnClicked(); // on Sunflower Calculate Btn Clicked, display result

    //corn functions//
    AddOptions($("#cornPriceSelect"), 2, 1, 12, 0, 6); // auto add corn price list
    AddOptions($("#cornNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1, 4); // auto add nitrogen cost list
    OnCornRegionChange(); // hide or show tillage div and soil texture div when region selection is changed 
    OnCornTillChange(); // hide or show the division of soil texture based on the change of tillage selection
    OnCornIrrigationChange(); // hide or show the division of non-irrigation calculation part in response to user selection of irrigated/non-irrigated
    OnCornCalculateBtnClicked(); // on corn Calculate Btn Clicked, display result
    
    //wheat & durum functions//
    AddOptions($("#wheatPriceSelect"), 3, 1, 15, 0, 8); // auto add wheat price list
    AddOptions($("#wheatNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1, 4); // auto add nitrogen cost list
    OnWheatCalculateBtnClicked(); // on wheat Calculate Btn Clicked, display result

});

////////////////////////////////////////////////////
//////////////////////    subroutine    /////////////////////////

/////////////////////////   COMMON FUNCTIONS        /////////////////////////////

// dynamically add select control (drop list) options
function AddOptions(selectControl, startValue, increment, endValue, precision, selectedIndex) {
    var optTemp, v;
    var len = Math.floor((endValue - startValue) / increment) + 1;
    for (var i = 0; i < len; i++) {
        v = startValue + i * increment;
        v = Number(v).toFixed(precision);
        if (i == selectedIndex) {
            optTemp = "<option selected = 'true' value= i>" + v + "</option>";
        }
        else {
            optTemp = "<option value= i>" + v + "</option>";
        }

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
    var thresholdLow = 6.0;
    var thresholdHigh = 7.0;
    var credit = 0;
    if ((inputValue >= thresholdLow) && (inputValue < thresholdHigh)) {
        credit += 50;
    }
    if (inputValue >= thresholdHigh) {
        credit += 100;
    }
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

// get modified new base value from a data table
function GetNewBaseValue(baseTable, cropPriceSelectControlId, nitrogenPriceSelectControlId, difference) {
    let v = GetBaseValue(baseTable, cropPriceSelectControlId, nitrogenPriceSelectControlId);
    if (v > 0) {
        v += difference;
    }
    return v;
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

// hide or show some corn UI divisions in response to user selection of irrigation type, region, and tillage type
// hide or show division based on irrigation default selection or selection change
function OnCornIrrigationChange() {
    CornIrrigationResponse();
    $("input[name='cornIrrigation']").on("change", function () {
        CornIrrigationResponse();
    });
}

// hide or show division based on irrigation selection
function CornIrrigationResponse() {
    if ($("input[name='cornIrrigation']:checked").val() === 'nonIrrigated') {
        $("#nonIrrigationRelatedDiv").show();
    }
    else {
        $("#nonIrrigationRelatedDiv").hide();
    }
}

// hide or show tillage div and soil texture div based on region default selection or selection change
function OnCornRegionChange() {
    CornRegionResponse();
    $("input[name='cornRegion']").on("change", function () {
        CornRegionResponse();
    });
}

// sub function of "OnCornRegionChange()"
// hide or show tillage div and soil texture div based on region selection 
function CornRegionResponse() {
    if ($("input[name='cornRegion']:checked").val() === 'westND') {
        $("#tillDiv").hide();
        $("#soilTextureDiv").hide();
    }
    else if ($("input[name='cornRegion']:checked").val() === 'eastND') {
        $("#tillDiv").show();
        CornTillResponse();
    }
    else {
        $("#tillDiv").show();
        $("#soilTextureDiv").hide();
    }
}


// hide or show the division of soil texture based on the change of tillage
function OnCornTillChange() {
    CornTillResponse();
    $("input[name='cornTill']").on("change", function () {
        CornTillResponse();
    });
}

// subfunction of "OnCornTillChange"
// hide or show the division of soil texture based on the change of tillage
function CornTillResponse() {
    if ($("input[name='cornRegion']:checked").val() === 'eastND') {
        if ($("input[name='cornTill']:checked").val() === 'longNoTill') {
            $("#soilTextureDiv").hide();
        }
        else {
            $("#soilTextureDiv").show();
        }
    }
}


function GetCornUserSelectionStringCombination() {
    let str = "";
    if ($("input[name='cornIrrigation']:checked").val() == "irrigated") {
        str = "irrigated";
    }
    else {
        if ($("input[name='cornRegion']:checked").val() == "westND") {
            str = "westND";
        }
        else {
            str = $("input[name='cornRegion']:checked").val() + "_" + $("input[name='cornTill']:checked").val();
            if (($("input[name='cornRegion']:checked").val() == "eastND") && ($("input[name='cornTill']:checked").val() != "longNoTill")) {
                str += "_" + $("input[name='cornSoilTexture']:checked").val();
            }
        }
    }
    return str;
}


//
//
//
// get the corn nitrogen recommendation base value before credits from the corresponding base table
function GetCornBaseValue(userCornSelection) {
    let v = 0;
    const minNoTillDiff = 20;
    const longNoTillDiff = -50;
    switch (userCornSelection) {
        case "irrigated":
            v = GetBaseValue(cornIrrigated, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "westND":
            v = GetBaseValue(cornWestLongNoTill, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "langdon_longNoTill":
            v = GetNewBaseValue(cornLangdonConvTill, "cornPriceSelect", "cornNitrogenPriceSelect", longNoTillDiff);
            break;
        case "langdon_convTill":
            v = GetBaseValue(cornLangdonConvTill, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "langdon_minNoTill":
            v = GetNewBaseValue(cornLangdonConvTill, "cornPriceSelect", "cornNitrogenPriceSelect", minNoTillDiff);
            break;
        case "centralND_longNoTill":
            v = GetNewBaseValue(cornCentralConvTill, "cornPriceSelect", "cornNitrogenPriceSelect", longNoTillDiff);
            break;
        case "centralND_convTill":
            v = GetBaseValue(cornCentralConvTill, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "centralND_minNoTill":
            v = GetNewBaseValue(cornCentralConvTill, "cornPriceSelect", "cornNitrogenPriceSelect", minNoTillDiff);
            break;
        case "eastND_longNoTill":
            v = GetBaseValue(cornEastLongNoTill, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_convTill_mediumTexture":
            v = GetBaseValue(cornEastConvTillMediumTexture, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_convTill_highClayLowRisk":
            v = GetBaseValue(cornEastConvTillHighClayLowRisk, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_convTill_highClayHighRisk":
            v = GetBaseValue(cornEastConvTillHighClayHighRisk, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_convTill_highClayMediumLeaching":
            v = GetBaseValue(cornEastConvTillMediumLeachingRisk, "cornPriceSelect", "cornNitrogenPriceSelect");
            break;
        case "eastND_minNoTill_mediumTexture":
            v = GetNewBaseValue(cornEastConvTillMediumTexture, "cornPriceSelect", "cornNitrogenPriceSelect", minNoTillDiff);
            break;
        case "eastND_minNoTill_highClayLowRisk":
            v = GetNewBaseValue(cornEastConvTillHighClayLowRisk, "cornPriceSelect", "cornNitrogenPriceSelect", minNoTillDiff);
            break;
        case "eastND_minNoTill_highClayHighRisk":
            v = GetNewBaseValue(cornEastConvTillHighClayHighRisk, "cornPriceSelect", "cornNitrogenPriceSelect", minNoTillDiff);
            break;
        case "eastND_minNoTill_highClayMediumLeaching":
            v = GetNewBaseValue(cornEastConvTillMediumLeachingRisk, "cornPriceSelect", "cornNitrogenPriceSelect", minNoTillDiff);
            break;
    }
    return v;
}





// when corn calculate button is clicked, calculate and display the nitrogen recommendation result
function OnCornCalculateBtnClicked() {
    $("#cornCalculateBtn").click(function () {
        let userSelectionStr = GetCornUserSelectionStringCombination();
        //alert(userSelectionStr);
         let baseValue = GetCornBaseValue(userSelectionStr);
         //alert(baseValue);
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
            v = GetNewBaseValue(wheatEastLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "east_low_longNoTill":
            v = GetNewBaseValue(wheatEastLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", eastWestLongNotillDiff);
            break;
        case "west_low_convTill":
            v = GetBaseValue(wheatWestLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "west_low_minNoTill":
            v = GetNewBaseValue(wheatWestLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "west_low_longNoTill":
            v = GetNewBaseValue(wheatWestLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", eastWestLongNotillDiff);
            break;
        case "langdon_low_convTill":
            v = GetBaseValue(wheatLangdonLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "langdon_low_minNoTill":
            v = GetNewBaseValue(wheatLangdonLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "langdon_low_longNoTill":
            v = GetNewBaseValue(wheatLangdonLowConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", langdonLongNotillDiff);
            break;

        case "east_medium_convTill":
            v = GetBaseValue(wheatEastMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "east_medium_minNoTill":
            v = GetNewBaseValue(wheatEastMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "east_medium_longNoTill":
            v = GetBaseValue(wheatEastMediumLongnotill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "west_medium_convTill":
            v = GetBaseValue(wheatWestMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "west_medium_minNoTill":
            v = GetNewBaseValue(wheatWestMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "west_medium_longNoTill":
            v = GetNewBaseValue(wheatWestMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", eastWestLongNotillDiff);
            break;
        case "langdon_medium_convTill":
            v = GetBaseValue(wheatLangdonMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "langdon_medium_minNoTill":
            v = GetNewBaseValue(wheatLangdonMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "langdon_medium_longNoTill":
            v = GetNewBaseValue(wheatLangdonMediumConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", langdonLongNotillDiff);
            break;

        case "east_high_convTill":
            v = GetBaseValue(wheatEastHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "east_high_minNoTill":
            v = GetNewBaseValue(wheatEastHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "east_high_longNoTill":
            v = GetNewBaseValue(wheatEastHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", eastWestLongNotillDiff);
            break;
        case "west_high_convTill":
            v = GetBaseValue(wheatWestHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "west_high_minNoTill":
            v = GetNewBaseValue(wheatWestHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "west_high_longNoTill":
            v = GetNewBaseValue(wheatWestHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", eastWestLongNotillDiff);
            break;
        case "langdon_high_convTill":
            v = GetBaseValue(wheatLangdonHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect");
            break;
        case "langdon_high_minNoTill":
            v = GetNewBaseValue(wheatLangdonHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", minNotillDiff);
            break;
        case "langdon_high_longNoTill":
            v = GetNewBaseValue(wheatLangdonHighConventionaltill, "wheatPriceSelect", "wheatNitrogenPriceSelect", langdonLongNotillDiff);
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

