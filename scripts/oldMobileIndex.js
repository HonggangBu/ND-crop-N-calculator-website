// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);


    // common variables
    var TILLAGE_CREDIT = 0;
    var MIN_NO_TILL_CREDIT = -20;
    var LONG_NO_TILL_CREDIT = 50;
    var baseValueTable;
    var CornMinusPlus = " ± 30 lbs/acre";
    var SunflowerMinusPlus = " ± 20 lbs/acre";


    ///////////////////////////////////////////////////////////////////
    // main function
    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);


        // Dynamically show the current year in the footer copyright
        $(".dynamic-year").text((new Date()).getFullYear());

        // add home page background color and footer background color
        //$("#Home-Page").css("background-color","lightgray");
        $("#Home-Page").css("background", "url(images/orange_paper_texture.jpg)");
        $('[data-role="footer"]').css("background-color", "cornsilk");
        $('[data-role="header"]').css("background-color", "darkSlateGray");

        // add nitrogen price options to crop calculators
        AddOptions($("#ccnprice"), 0.2, 0.1, 1, 1); //corn
        AddOptions($("#wnprice"), 0.2, 0.1, 1, 1); //wheat
        AddOptions($("#sfnprice"), 0.2, 0.1, 1, 1); // sunflower

        // add crop price options
        AddOptions($("#cccprice"), 2, 1, 10, 0); // corn
        AddOptions($("#wprice"), 3, 1, 10, 0); // wheat
        AddOptions($("#sfprice"), 0.09, 0.03, 0.30, 2); // sunflower

        // add previous crop options to calculators
        AddPrevCropOptions($("#cornPrevCrop"), 'cornPreviousCrop');
        AddPrevCropOptions($("#wheatPrevCrop"), 'wheatPreviousCrop');
        AddPrevCropOptions($("#sunflowerPrevCrop"), 'sunflowerPreviousCrop');

        // check if user input is valid for soil test nitrate N and organic matter
        CheckNitrateTestUserInput($("#CornBasicPageNext"), $("#cSoilTestN"), $("#corn-NTest-error-msg"));
        CheckOrganicMatterUserInput($("#CornBasicPageNext"), $("#cOrganicMatter"), $("#corn-organicMatter-error-msg"));
        CheckNitrateTestUserInput($("#WheatBasicPageNext"), $("#wSoilTestN"), $("#wheat-NTest-error-msg"));
        CheckOrganicMatterUserInput($("#WheatBasicPageNext"), $("#wOrganicMatter"), $("#wheat-organicMatter-error-msg"));
        CheckNitrateTestUserInput($("#SfBasicPageNext"), $("#sfSoilTestN"), $("#sf-NTest-error-msg"));
        CheckOrganicMatterUserInput($("#SfBasicPageNext"), $("#sfOrganicMatter"), $("#sf-organicMatter-error-msg"));


        // go to previous page from corn result page
        $("#cornPrevResult").click(function () {
            window.history.go(-1);
        });

        // set the result displaying area to be readonly
        $('#CornResultText').prop('readonly', true);
        $('#WheatResultText').prop('readonly', true);
        $('#SfResultText').prop('readonly', true);

        // based on selected region, go to result page or next parameter selection page
        OnCornRegionSelectionPageNextBtnClick();

        // calculate value for wheat result page
        OnWheatRegionPageNextBtnClick();

        // calculate sunflower N recommendation value and display it
        OnSfTillagePageNextBtnClick();

        // dynamic response to the radio button change in the corn irrigation and tillage options page
        // show or hide "soil texture and tillage" radio part div
        OnIrrigationTillageSelection();

        // calculate the result and display it in the result page
        OnIrrigationTillagePageNextBtnClick();

        // dynamically display crop pictures in the home page
        DynamicImageDisplay();

        // open "max return to N" reference pdf
        ViewPdf("MaxReturnPdf", "http://www.agronext.iastate.edu/soilfertility/info/regnfertratenceisfc05.pdf");

        // open corn pdf in a new window
        ViewPdf("GoToCornDoc", "https://www.ndsu.edu/fileadmin/soils/pdfs/cornsf722.pdf");

        // open wheat pdf in a new window
        ViewPdf("GoToWheatDoc", "https://www.ndsu.edu/fileadmin/soils/pdfs/sf712_2.pdf");

        // open sunflower pdf in a new window
        ViewPdf("GoToSunflowerDoc", "https://www.ndsu.edu/fileadmin/soils/pdfs/SF713__Fertilizing_Sunflower.pdf");

        //OpenPdf("MaxReturnPdf", "images/MaxReturn.pdf");
        //OpenPdf("GoToCornDoc", "images/corn.pdf");
        //OpenPdf("GoToWheatDoc", "images/wheat.pdf");
        //OpenPdf("GoToSunflowerDoc", "images/sunflower.pdf");

    }





    ////////////////////////////////////////////////////////////
    // subroutines

    // open and view pdf file from a web link when a link btn is clicked
    function ViewPdf(linkBtnId, pdfLink) {
        var fullLink = "https://docs.google.com/viewer?url=" + pdfLink + "&embedded=true";
        document.getElementById(linkBtnId).addEventListener("click", function () {
            window.open(fullLink, '_blank', 'location=no'); // open pdf with the plugin "inappbrowser" if use "_blank"
        });
    }




    // function OpenPdf(linkBtnId, pdfLink) {
    //    document.getElementById(linkBtnId).addEventListener("click", function () {
    //        window.open(pdfLink, '_system', 'location=no'); // open pdf with the plugin "inappbrowser" if use "_blank"
    //    });
    //}
    

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


    function GetPrevCropNCredit(RadioGroupName) {
        var gc = "input[name=" + RadioGroupName + "]:checked";
        return $(gc).val();
    }
    // $('input[name=previousCrop]:checked').val()

    // calculate and return soil organic matter nitrogen credit
    // parameter "inputControlId" is the ID of a specific percentage organic matter input value
    function GetOrganicMatterCredit(inputControlId) {
        var inputValue = $("#" + inputControlId).val();
        var percentageThreshold = 5;
        var coef = 50;
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
    function GetFinalResult(baseValue, soilTestNitrateCredit, organicMatterCredit, prevCropCredit, tillageCredit) {
        var v = Math.round(baseValue - soilTestNitrateCredit - organicMatterCredit - prevCropCredit - tillageCredit);
        return v > 0 ? v : 0;
    }


    // events to occur when the "Forward" button on the corn calculator region selection page is clicked
    // if western region selected, calculate the recommendation value and display in the result page
    // if eastern region selected, go to next parameter selection page
    function OnCornRegionSelectionPageNextBtnClick() {
        document.getElementById("cornRegionPageNext").addEventListener("click", function () {

            if ($("#cwnd").is(':checked')) {
                // both of the following commands work
                $.mobile.navigate("#Corn-Result-Page");
                //location.href = "#Corn-Result-Page";

                // code to get and calculate the actual value
                // west ND region
                baseValueTable = [[150, 120, 37, 0, 0, 0, 0, 0, 0],
            [150, 150, 149, 94, 38, 0, 0, 0, 0],
            [150, 150, 150, 150, 121, 79, 38, 0, 0],
            [150, 150, 150, 150, 150, 138, 105, 71, 38],
            [150, 150, 150, 150, 150, 150, 149, 121, 94],
            [150, 150, 150, 150, 150, 150, 150, 150, 133],
            [150, 150, 150, 150, 150, 150, 150, 150, 150],
            [150, 150, 150, 150, 150, 150, 150, 150, 150],
            [150, 150, 150, 150, 150, 150, 150, 150, 150]];

                var finalResult = GetFinalResult(GetBaseValue(baseValueTable, "cccprice", "ccnprice"), GetSoilTestNitrateCredit("cSoilTestN"),
                    GetOrganicMatterCredit("cOrganicMatter"), GetPrevCropNCredit("cornPreviousCrop"), 0);
                $('input[id=CornResultText]').val("" + finalResult + CornMinusPlus);
            }
            else
                $.mobile.navigate("#Corn-IrrigationTill-Page");
        });
    }

    // events to occur when the "Forward" button on the corn calculator irrigation/tillage selection page is clicked
    function OnIrrigationTillagePageNextBtnClick() {
        document.getElementById("cornNextIrrigationTill").addEventListener("click", function () {
            var finalResult;
            if ($("#corn-irrigated").is(':checked')) {
                baseValueTable = [[255, 241, 228, 215, 201, 188, 175, 162, 149],
              [263, 254, 245, 237, 228, 219, 210, 201, 194],
              [268, 262, 256, 250, 244, 238, 232, 226, 220],
              [272, 267, 262, 257, 252, 247, 242, 237, 232],
              [273, 268, 263, 258, 253, 248, 243, 238, 233],
              [274, 269, 264, 259, 254, 249, 244, 239, 234],
              [275, 270, 265, 260, 255, 250, 245, 240, 235],
              [276, 271, 266, 261, 256, 251, 246, 241, 236],
              [277, 272, 267, 262, 257, 252, 247, 242, 237]];
                finalResult = GetFinalResult(GetBaseValue(baseValueTable, "cccprice", "ccnprice"), GetSoilTestNitrateCredit("cSoilTestN"),
                    GetOrganicMatterCredit("cOrganicMatter"), GetPrevCropNCredit("cornPreviousCrop"), 0);
            }
            if ($("#corn-notill").is(':checked')) {
                baseValueTable = [[200, 168, 137, 106, 75, 43, 12, 0, 0],
        [220, 200, 179, 158, 137, 116, 95, 75, 55],
        [232, 216, 199, 185, 169, 154, 137, 119, 107],
        [239, 226, 213, 200, 187, 176, 163, 150, 137],
        [243, 232, 220, 211, 201, 190, 179, 169, 158],
        [246, 237, 226, 217, 209, 200, 191, 183, 173],
        [247, 241, 232, 223, 215, 207, 200, 192, 184],
        [249, 243, 235, 228, 220, 213, 207, 200, 194],
        [252, 244, 239, 232, 225, 218, 212, 206, 200]];
                finalResult = GetFinalResult(GetBaseValue(baseValueTable, "cccprice", "ccnprice"), GetSoilTestNitrateCredit("cSoilTestN"),
                    GetOrganicMatterCredit("cOrganicMatter"), GetPrevCropNCredit("cornPreviousCrop"), 0);
            }
            if ($("#corn-conventionaltill").is(':checked') || $("#corn-minnotill").is(':checked')) {

                // if is min no-till, substract MIN_NO_TILL_CREDIT
                if ($("#corn-minnotill").is(':checked'))
                    TILLAGE_CREDIT = MIN_NO_TILL_CREDIT;
                else
                    TILLAGE_CREDIT = 0;

                if ($("#hchy").is(':checked')) {
                    baseValueTable = [[242, 214, 186, 159, 131, 103, 75, 47, 19],
             [260, 242, 222, 205, 186, 169, 149, 131, 113],
             [270, 257, 243, 229, 213, 200, 186, 172, 158],
             [276, 265, 254, 243, 232, 220, 208, 196, 184],
             [280, 270, 260, 250, 240, 230, 220, 210, 200],
             [285, 274, 263, 252, 243, 235, 226, 218, 212],
             [285, 277, 270, 264, 257, 251, 243, 236, 229],
             [286, 280, 274, 267, 261, 255, 249, 243, 237],
             [287, 283, 276, 270, 266, 260, 254, 248, 242]];
                    finalResult = GetFinalResult(GetBaseValue(baseValueTable, "cccprice", "ccnprice"), GetSoilTestNitrateCredit("cSoilTestN"),
                    GetOrganicMatterCredit("cOrganicMatter"), GetPrevCropNCredit("cornPreviousCrop"), TILLAGE_CREDIT);
                }
                if ($("#hcly").is(':checked')) {
                    baseValueTable = [[150, 150, 150, 117, 67, 17, 0, 0, 0],
              [150, 150, 150, 150, 150, 133, 100, 67, 34],
              [150, 150, 150, 150, 150, 150, 150, 143, 118],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150]];
                    finalResult = GetFinalResult(GetBaseValue(baseValueTable, "cccprice", "ccnprice"), GetSoilTestNitrateCredit("cSoilTestN"),
                    GetOrganicMatterCredit("cOrganicMatter"), GetPrevCropNCredit("cornPreviousCrop"), TILLAGE_CREDIT);
                }
                if ($("#mthy").is(':checked')) {
                    baseValueTable = [[222, 201, 180, 160, 139, 118, 97, 76, 55],
              [236, 222, 208, 194, 180, 166, 152, 138, 124],
              [235, 234, 223, 213, 202, 192, 181, 171, 161],
              [249, 241, 232, 223, 215, 206, 198, 190, 182],
              [252, 245, 238, 231, 223, 216, 209, 202, 195],
              [254, 248, 242, 236, 230, 222, 217, 211, 205],
              [255, 250, 245, 240, 234, 229, 223, 218, 213],
              [256, 252, 247, 243, 238, 233, 229, 223, 218],
              [257, 253, 248, 244, 239, 234, 230, 224, 219]];
                    finalResult = GetFinalResult(GetBaseValue(baseValueTable, "cccprice", "ccnprice"), GetSoilTestNitrateCredit("cSoilTestN"),
                    GetOrganicMatterCredit("cOrganicMatter"), GetPrevCropNCredit("cornPreviousCrop"), TILLAGE_CREDIT);
                }
                if ($("#mtly").is(':checked')) {
                    baseValueTable = [[150, 150, 124, 0, 0, 0, 0, 0, 0],
              [150, 150, 150, 150, 124, 41, 0, 0, 0],
              [150, 150, 150, 150, 150, 150, 124, 62, 0],
              [150, 150, 150, 150, 150, 150, 150, 150, 124],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150],
              [150, 150, 150, 150, 150, 150, 150, 150, 150]];
                    finalResult = GetFinalResult(GetBaseValue(baseValueTable, "cccprice", "ccnprice"), GetSoilTestNitrateCredit("cSoilTestN"),
                    GetOrganicMatterCredit("cOrganicMatter"), GetPrevCropNCredit("cornPreviousCrop"), TILLAGE_CREDIT);
                }
            }

            $('input[id=CornResultText]').val("" + finalResult + CornMinusPlus);

        });
    }



    function OnIrrigationTillageSelection() {
        $(document).on("pagecreate", "#Corn-IrrigationTill-Page", function () {
            $("input[name='corn-irrigation-till']").on("change", function () {
                if ($("input[name='corn-irrigation-till']:checked").val() === 'corn-conventionaltill' || $("input[name='corn-irrigation-till']:checked").val() === 'corn-minnotill')
                    $("#texture-yield").show();
                else
                    $("#texture-yield").hide();
            });
        });
    }


    // dynamically add previous crop radio controgroup options
    // radioControl is the controlgroup name
    // cropName is the radio type input name
    function AddPrevCropOptions(radioControl, cropName) {
        var prevCropHtml = '<legend><span class="label label-legend">Previous Crops Planted</span></legend>' +
            '<input type="radio" name=' + cropName + ' id="r1" value="0" checked="checked">' +
            '<label for="r1">no nitrogen-supplying crop</label>' +
            '<input type="radio" name=' + cropName + ' id="r2" value="40">' +
            '<label for="r2">soybean, field pea, dry Bean, lentil, Chickpea or harvested sweet pea</label>' +
             '<input type="radio" name=' + cropName + ' id="r3" value="0">' +
            '<label for="r3">sugarbeet with yellow leaves</label>' +
             '<input type="radio" name=' + cropName + ' id="r4" value="30">' +
            '<label for="r4">sugarbeet with yellow-green leaves</label>' +
             '<input type="radio" name=' + cropName + ' id="r5" value="80">' +
            '<label for="r5">sugarbeet with dark-green leaves</label>' +
             '<input type="radio" name=' + cropName + ' id="r6" value="150">' +
            '<label for="r6">harvested alfalfa or unharvested sweet clover (>=5 plants/sq-ft)</label>' +
             '<input type="radio" name=' + cropName + ' id="r7" value="100">' +
            '<label for="r7">harvested alfalfa or unharvested sweet clover (3-4 plants/sq-ft)</label>' +
             '<input type="radio" name=' + cropName + ' id="r8" value="50">' +
            '<label for="r8">harvested alfalfa or unharvested sweet clover (1-2 plants/sq-ft)</label>' +
             '<input type="radio" name=' + cropName + ' id="r9" value="0">' +
            '<label for="r9">harvested alfalfa or unharvested sweet clover (<1 plants/sq-ft)</label>';
        radioControl.html(prevCropHtml);
    }


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
        var h = Math.floor(len / 2);
        var optionSelected = $($("option", selectControl).get(h));
        optionSelected.attr('selected', 'selected');
        selectControl.selectmenu();
        selectControl.selectmenu('refresh', true);
    }


    // display error message if soil nitrate N test user input is not valid
    function CheckNitrateTestUserInput(nextLink, inputControl, errMsgDiv) {
        nextLink.click(function (e) {
            var v = inputControl.val();
            if ($.isNumeric(v)) {
                if (v < 0) {
                    DisplayErrMsg(e, errMsgDiv);
                }
                else {
                    errMsgDiv.hide();
                }
            }
            else {
                DisplayErrMsg(e, errMsgDiv);
            }
        });

        inputControl.change(function () {
            var v = inputControl.val();
            if (!errMsgDiv.hidden && $.isNumeric(v)) {
                if (v >= 0) {
                    errMsgDiv.hide();
                }
            }
        });

    }

    // display error message if soil organic matter user input is not valid
    function CheckOrganicMatterUserInput(nextLink, inputControl, errMsgDiv) {
        nextLink.click(function (e) {
            var v = inputControl.val();
            if ($.isNumeric(v)) {
                if (v < 0 || v >= 100) {
                    DisplayErrMsg(e, errMsgDiv);
                }
                else {
                    errMsgDiv.hide();
                }
            }
            else {
                DisplayErrMsg(e, errMsgDiv);
            }
        });

        inputControl.change(function () {
            var v = inputControl.val();
            if (!errMsgDiv.hidden && $.isNumeric(v)) {
                if (v >= 0) {
                    errMsgDiv.hide();
                }
            }
        });

    }

    function DisplayErrMsg(e, errMsgDiv) {
        e.preventDefault();
        errMsgDiv.show();
        errMsgDiv.text("Please input a valid value!");
    }



    function DynamicImageDisplay() {

        var yourFade = 1, // the amount of time in seconds that the elements will fade in fade out
        yourDelay = 2, // the amount of time in seconds that there will be a delay between the fade ins and fade outs
        fadeTime = yourFade * 1000, //convert fade seconds to milliseconds (1000)
        delayTime = yourDelay * 1000, // convert delay seconds to milliseconds (2000)
        totalTime = fadeTime + delayTime, //3000 milliseconds...needed for all those delays we talked about
        allElems = $('.to-be-faded').length, // find out exactly how many page elements have the 'toBeFaded' class (4)
        i,
        fadingElem;

        for (i = 0; i < allElems; i++) {
            fadingElem = "#elem" + i;
            $(fadingElem).delay(totalTime * i).fadeIn(fadeTime).delay(delayTime).fadeOut(fadeTime);
        }

        setInterval(function () {
            for (i = 0; i < allElems; i++) {
                fadingElem = "#elem" + i;
                $(fadingElem).delay(totalTime * i).fadeIn(fadeTime).delay(delayTime).fadeOut(fadeTime);
            }

        }, 1000 + allElems * totalTime);

    }



    // events to occur when the "Forward" button on the wheat calculator region/historical yields selection page is clicked
    // calculate wheat N recommendation value and display it
    function OnWheatRegionPageNextBtnClick() {
        document.getElementById("wheatRegionNext").addEventListener("click", function () {
            GetWheatTillageCredit();
            GetWheatBaseTable();
            WheatCalculationAndDisplay(baseValueTable, TILLAGE_CREDIT);
        });
    }

    // function to calculate the wheat N recommendation value and display it in the result page
    // baseTable is the base value table or matrix
    function WheatCalculationAndDisplay(baseTable, tillageCredit) {
        var baseValue = GetBaseValue(baseTable, "wprice", "wnprice");
        var result = GetFinalResult(baseValue, GetSoilTestNitrateCredit("wSoilTestN"),
        GetOrganicMatterCredit("wOrganicMatter"), GetPrevCropNCredit("wheatPreviousCrop"), tillageCredit);
        $('input[id=WheatResultText]').val("" + result + CornMinusPlus);
    }

    // determine wheat N calculator tillage credit based on user choice of tillage type
    function GetWheatTillageCredit() {
        if ($("#wstnt").is(':checked')) // minimal no-till
            TILLAGE_CREDIT = MIN_NO_TILL_CREDIT;
        else if ($("#wltnt").is(':checked')) // long-term no-till
            TILLAGE_CREDIT = LONG_NO_TILL_CREDIT;
        else // conventional till
            TILLAGE_CREDIT = 0;
    }

    // determine which base table to use for wheat N calculation
    function GetWheatBaseTable() {
        if (($("#wtwnd")).is(":checked")) {// western ND
            if (($("#wth")).is(":checked")) {// high yields
                baseValueTable = [[175, 170, 160, 150, 140, 130, 110, 50, 0],
                [175, 175, 170, 160, 150, 140, 130, 120, 100],
                [180, 180, 175, 170, 160, 150, 140, 130, 120],
                [185, 185, 180, 175, 170, 160, 150, 145, 140],
                [190, 185, 180, 175, 170, 160, 150, 145, 140],
                [190, 185, 180, 175, 170, 160, 150, 145, 140],
                [190, 185, 180, 175, 170, 160, 150, 145, 140],
                [190, 185, 180, 175, 170, 160, 150, 145, 140]];
            }
            if (($("#wtm")).is(":checked")) {// medium yields
                baseValueTable = [[125, 120, 110, 100, 90, 80, 60, 0, 0],
                [125, 125, 120, 110, 100, 90, 80, 70, 50],
                [130, 130, 125, 120, 110, 100, 90, 80, 70],
                [135, 135, 130, 125, 120, 110, 100, 95, 90],
                [140, 135, 130, 125, 120, 110, 100, 95, 90],
                [140, 135, 130, 125, 120, 110, 100, 95, 90],
                [140, 135, 130, 125, 120, 110, 100, 95, 90],
                [140, 135, 130, 125, 120, 110, 100, 95, 90]];
            }
            if (($("#wtl")).is(":checked")) {// low yields
                baseValueTable = [[100, 80, 70, 60, 50, 45, 40, 0, 0],
                [105, 95, 85, 75, 65, 55, 45, 30, 0],
                [110, 100, 90, 90, 70, 60, 50, 40, 30],
                [115, 110, 105, 100, 95, 90, 85, 80, 60],
                [115, 110, 105, 100, 95, 90, 85, 80, 60],
                [115, 110, 105, 100, 95, 90, 85, 80, 60],
                [115, 110, 105, 100, 95, 90, 85, 80, 60],
                [115, 110, 105, 100, 95, 90, 85, 80, 60]];
            }
        }
        else if (($("#wtend")).is(":checked")) {// eastern ND
            if (($("#wth")).is(":checked")) {// high yields
                baseValueTable = [[250, 190, 175, 150, 125, 60, 0, 0, 0],
                [250, 235, 220, 200, 180, 160, 120, 100, 0],
                [250, 235, 220, 200, 190, 180, 160, 140, 120],
                [250, 250, 225, 210, 200, 190, 180, 160, 150],
                [250, 250, 250, 240, 220, 200, 190, 180, 175],
                [250, 250, 250, 250, 225, 210, 200, 190, 180],
                [250, 250, 250, 250, 250, 220, 210, 200, 190],
                [250, 250, 250, 250, 250, 240, 230, 220, 200]];
            }
            if (($("#wtm")).is(":checked")) {// medium yields
                baseValueTable = [[125, 115, 105, 90, 60, 30, 0, 0, 0],
                [150, 140, 130, 120, 110, 100, 80, 50, 0],
                [160, 150, 140, 130, 120, 110, 100, 90, 80],
                [170, 160, 150, 140, 130, 120, 110, 100, 90],
                [180, 170, 160, 150, 140, 130, 120, 110, 100],
                [185, 175, 170, 165, 160, 150, 140, 130, 120],
                [190, 180, 175, 170, 165, 160, 150, 140, 130],
                [200, 190, 185, 180, 170, 165, 160, 150, 140]];
            }
            if (($("#wtl")).is(":checked")) {// low yields
                baseValueTable = [[75, 70, 60, 50, 25, 0, 0, 0, 0],
                   [80, 75, 70, 60, 50, 40, 30, 20, 0],
                   [100, 90, 80, 70, 60, 50, 40, 30, 20],
                   [125, 120, 115, 110, 105, 100, 90, 80, 70],
                   [140, 130, 120, 115, 110, 105, 95, 85, 75],
                   [150, 140, 130, 120, 115, 110, 105, 100, 95],
                   [155, 150, 145, 140, 135, 130, 125, 120, 115],
                   [160, 155, 150, 145, 140, 135, 130, 125, 120]];
            }
        }
        else {// Langdon area
            if (($("#wth")).is(":checked")) {// high yields
                baseValueTable = [[160, 145, 130, 125, 110, 100, 90, 75, 40],
                [160, 150, 140, 130, 120, 110, 100, 90, 80],
                [160, 155, 150, 140, 130, 120, 115, 105, 100],
                [160, 155, 150, 140, 135, 125, 120, 116, 110],
                [160, 155, 150, 145, 135, 130, 125, 120, 115],
                [160, 155, 150, 145, 140, 135, 130, 125, 120],
                [160, 155, 150, 145, 140, 135, 130, 130, 125],
                [160, 155, 150, 145, 140, 140, 135, 135, 130]];
            }
            if (($("#wtm")).is(":checked")) {// medium yields
                baseValueTable = [[130, 125, 120, 115, 110, 100, 80, 50, 20],
                [135, 130, 125, 120, 115, 100, 90, 80, 70],
                [140, 135, 130, 125, 120, 115, 100, 90, 80],
                [140, 135, 130, 125, 120, 115, 105, 95, 85],
                [140, 135, 130, 125, 120, 115, 110, 100, 85],
                [140, 135, 130, 130, 125, 120, 115, 105, 85],
                [140, 135, 135, 130, 125, 120, 115, 110, 95],
                [140, 135, 135, 130, 125, 120, 115, 110, 100]];
            }
            if (($("#wtl")).is(":checked")) {// low yields
                baseValueTable = [[100, 90, 80, 70, 60, 50, 40, 30, 20],
                [110, 100, 90, 80, 70, 60, 50, 40, 30],
                [120, 110, 100, 90, 80, 70, 60, 50, 40],
                [120, 115, 110, 100, 90, 80, 75, 65, 60],
                [120, 115, 110, 100, 95, 90, 80, 75, 70],
                [120, 115, 110, 105, 95, 90, 85, 80, 75],
                [120, 115, 110, 105, 100, 95, 90, 85, 80],
                [120, 115, 110, 110, 105, 100, 95, 90, 85]];
            }
        }
    }


    // events to occur when the "Forward" button on the sunflower calculator tillage/seed type selection page is clicked
    // calculate sunflower N recommendation value and display it
    function OnSfTillagePageNextBtnClick() {
        document.getElementById("sfTillageNext").addEventListener("click", function () {
            var finalResult;
            if (($("#sfwnd")).is(":checked")) {// western ND
                if (($("#sfct")).is(":checked")) {// conventional till
                    if (($("#sfos")).is(":checked")) {// oil-seed
                        baseValueTable = [
    [126, 77, 31, 0, 0, 0, 0, 0, 0],
    [150, 115, 77, 43, 0, 0, 0, 0, 0],
    [150, 135, 106, 77, 50, 22, 0, 0, 0],
    [150, 150, 126, 101, 78, 54, 31, 9, 0],
    [150, 150, 140, 119, 98, 78, 58, 38, 19],
    [150, 150, 150, 132, 113, 95, 78, 60, 43],
    [150, 150, 150, 142, 125, 109, 93, 78, 62],
    [150, 150, 150, 150, 135, 121, 106, 92, 78]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                    else {// confection
                        baseValueTable = [
    [136, 87, 41, 0, 0, 0, 0, 0, 0],
    [150, 125, 87, 53, 0, 0, 0, 0, 0],
    [150, 145, 116, 87, 60, 32, 0, 0, 0],
    [150, 150, 136, 111, 88, 64, 41, 19, 0],
    [150, 150, 150, 129, 108, 88, 68, 48, 29],
    [150, 150, 150, 143, 123, 105, 88, 70, 53],
    [150, 150, 150, 150, 135, 119, 103, 88, 72],
    [150, 150, 150, 150, 145, 131, 116, 102, 88]
                        ];

                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                }
                else if (($("#sfltnt")).is(":checked")) {// long-term no-till
                    if (($("#sfos")).is(":checked")) {// oil-seed
                        baseValueTable = [
    [126, 77, 31, 0, 0, 0, 0, 0, 0],
    [150, 115, 77, 43, 0, 0, 0, 0, 0],
    [150, 135, 106, 77, 50, 22, 0, 0, 0],
    [150, 150, 126, 101, 78, 54, 31, 9, 0],
    [150, 150, 140, 119, 98, 78, 58, 38, 19],
    [150, 150, 150, 132, 113, 95, 78, 60, 43],
    [150, 150, 150, 142, 125, 109, 93, 78, 62],
    [150, 150, 150, 150, 135, 121, 106, 92, 78]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                    else {// confection
                        baseValueTable = [
    [136, 87, 41, 0, 0, 0, 0, 0, 0],
    [150, 125, 87, 53, 0, 0, 0, 0, 0],
    [150, 145, 116, 87, 60, 32, 0, 0, 0],
    [150, 150, 136, 111, 88, 64, 41, 19, 0],
    [150, 150, 150, 129, 108, 88, 68, 48, 29],
    [150, 150, 150, 143, 123, 105, 88, 70, 53],
    [150, 150, 150, 150, 135, 119, 103, 88, 72],
    [150, 150, 150, 150, 145, 131, 116, 102, 88]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                }
                else {// minimal no-till
                    if (($("#sfos")).is(":checked")) { // oil-seed
                        baseValueTable = [
    [126, 77, 31, 0, 0, 0, 0, 0, 0],
    [150, 115, 77, 43, 0, 0, 0, 0, 0],
    [150, 135, 106, 77, 50, 22, 0, 0, 0],
    [150, 150, 126, 101, 78, 54, 31, 9, 0],
    [150, 150, 140, 119, 98, 78, 58, 38, 19],
    [150, 150, 150, 132, 113, 95, 78, 60, 43],
    [150, 150, 150, 142, 125, 109, 93, 78, 62],
    [150, 150, 150, 150, 135, 121, 106, 92, 78]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), MIN_NO_TILL_CREDIT);
                    }
                    else { // confection
                        baseValueTable = [
    [136, 87, 41, 0, 0, 0, 0, 0, 0],
    [150, 125, 87, 53, 0, 0, 0, 0, 0],
    [150, 145, 116, 87, 60, 32, 0, 0, 0],
    [150, 150, 136, 111, 88, 64, 41, 19, 0],
    [150, 150, 150, 129, 108, 88, 68, 48, 29],
    [150, 150, 150, 143, 123, 105, 88, 70, 53],
    [150, 150, 150, 150, 135, 119, 103, 88, 72],
    [150, 150, 150, 150, 145, 131, 116, 102, 88]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), MIN_NO_TILL_CREDIT);
                    }
                }
            }
            else if (($("#sfend")).is(":checked")) {// eastern ND
                if (($("#sfct")).is(":checked")) {// conventional till
                    if (($("#sfos")).is(":checked")) { // oil-seed
                        baseValueTable = [
    [150, 135, 124, 111, 96, 84, 72, 59, 47],
    [150, 145, 135, 125, 116, 106, 97, 87, 78],
    [150, 150, 143, 135, 127, 119, 112, 104, 96],
    [150, 150, 148, 141, 135, 128, 126, 115, 109],
    [150, 150, 150, 146, 141, 135, 129, 124, 118],
    [150, 150, 150, 150, 145, 140, 135, 130, 125],
    [150, 150, 150, 150, 148, 144, 139, 135, 131],
    [150, 150, 150, 150, 150, 147, 143, 139, 135]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                    else { // confection
                        baseValueTable = [
    [150, 145, 134, 121, 106, 94, 82, 69, 57],
    [150, 150, 145, 135, 126, 116, 107, 97, 88],
    [150, 150, 150, 145, 137, 129, 122, 114, 106],
    [150, 150, 150, 160, 145, 138, 136, 125, 119],
    [150, 150, 150, 150, 150, 145, 139, 134, 128],
    [150, 150, 150, 150, 150, 150, 145, 140, 135],
    [150, 150, 150, 150, 150, 150, 150, 145, 141],
    [150, 150, 150, 150, 150, 150, 150, 150, 145]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                }
                else if (($("#sfltnt")).is(":checked")) {// long-term no=till
                    if (($("#sfos")).is(":checked")) {// oil-seed
                        baseValueTable = [
[84, 22, 0, 0, 0, 0, 0, 0, 0],
[117, 68, 24, 0, 0, 0, 0, 0, 0],
[137, 97, 61, 24, 0, 0, 0, 0, 0],
[150, 117, 86, 55, 24, 0, 0, 0, 0],
[150, 132, 105, 77, 50, 24, 0, 0, 0],
[150, 142, 119, 95, 71, 47, 24, 0, 0],
[150, 150, 130, 108, 87, 65, 44, 24, 0],
[150, 150, 139, 118, 99, 80, 61, 42, 24]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                    else {// confection
                        baseValueTable = [
    [94, 32, 0, 0, 0, 0, 0, 0, 0],
    [127, 78, 34, 0, 0, 0, 0, 0, 0],
    [147, 107, 71, 34, 0, 0, 0, 0, 0],
    [150, 127, 96, 65, 34, 0, 0, 0, 0],
    [150, 142, 115, 87, 60, 34, 0, 0, 0],
    [150, 150, 129, 105, 81, 57, 34, 0, 0],
    [150, 150, 140, 118, 97, 75, 54, 34, 0],
    [150, 150, 150, 128, 109, 90, 71, 52, 34]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                }
                else {// minimal no-till
                    if (($("#sfos")).is(":checked")) {// oil-seed
                        baseValueTable = [
    [150, 135, 124, 111, 96, 84, 72, 59, 47],
    [150, 145, 135, 125, 116, 106, 97, 87, 78],
    [150, 150, 143, 135, 127, 119, 112, 104, 96],
    [150, 150, 148, 141, 135, 128, 126, 115, 109],
    [150, 150, 150, 146, 141, 135, 129, 124, 118],
    [150, 150, 150, 150, 145, 140, 135, 130, 125],
    [150, 150, 150, 150, 148, 144, 139, 135, 131],
    [150, 150, 150, 150, 150, 147, 143, 139, 135]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), MIN_NO_TILL_CREDIT);
                    }
                    else {// confection
                        baseValueTable = [
    [150, 145, 134, 121, 106, 94, 82, 69, 57],
    [150, 150, 145, 135, 126, 116, 107, 97, 88],
    [150, 150, 150, 145, 137, 129, 122, 114, 106],
    [150, 150, 150, 160, 145, 138, 136, 125, 119],
    [150, 150, 150, 150, 150, 145, 139, 134, 128],
    [150, 150, 150, 150, 150, 150, 145, 140, 135],
    [150, 150, 150, 150, 150, 150, 150, 145, 141],
    [150, 150, 150, 150, 150, 150, 150, 150, 145]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), MIN_NO_TILL_CREDIT);
                    }
                }
            }
            else {// Langdon area
                if (($("#sfct")).is(":checked")) {// conventional till
                    if (($("#sfos")).is(":checked")) {// oil-seed
                        baseValueTable = [
    [100, 85, 74, 61, 46, 34, 22, 9, 0],
    [100, 95, 85, 75, 66, 56, 47, 37, 28],
    [100, 100, 93, 85, 77, 69, 62, 54, 46],
    [100, 100, 98, 91, 85, 78, 76, 65, 59],
    [100, 100, 100, 96, 91, 85, 79, 74, 68],
    [100, 100, 100, 100, 96, 90, 85, 80, 75],
    [100, 100, 100, 100, 98, 94, 89, 85, 81],
    [100, 100, 100, 100, 100, 97, 93, 89, 85]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                    else {// confection
                        baseValueTable = [
    [100, 95, 84, 71, 56, 44, 32, 19, 0],
    [100, 100, 96, 85, 76, 66, 57, 47, 38],
    [100, 100, 100, 95, 87, 79, 72, 64, 56],
    [100, 100, 100, 100, 95, 88, 86, 75, 69],
    [100, 100, 100, 100, 100, 95, 89, 84, 78],
    [100, 100, 100, 100, 100, 100, 95, 90, 85],
    [100, 100, 100, 100, 100, 100, 99, 95, 91],
    [100, 100, 100, 100, 100, 100, 100, 99, 95]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                }
                else if (($("#sfltnt")).is(":checked")) {// long-term no=till
                    if (($("#sfos")).is(":checked")) {// oil-seed
                        baseValueTable = [
[84, 22, 0, 0, 0, 0, 0, 0, 0],
[117, 68, 24, 0, 0, 0, 0, 0, 0],
[137, 97, 61, 24, 0, 0, 0, 0, 0],
[150, 117, 86, 55, 24, 0, 0, 0, 0],
[150, 132, 105, 77, 50, 24, 0, 0, 0],
[150, 142, 119, 95, 71, 47, 24, 0, 0],
[150, 150, 130, 108, 87, 65, 44, 24, 0],
[150, 150, 139, 118, 99, 80, 61, 42, 24]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                    else {// confection
                        baseValueTable = [
    [94, 32, 0, 0, 0, 0, 0, 0, 0],
    [127, 78, 34, 0, 0, 0, 0, 0, 0],
    [147, 107, 71, 34, 0, 0, 0, 0, 0],
    [150, 127, 96, 65, 34, 0, 0, 0, 0],
    [150, 142, 115, 87, 60, 34, 0, 0, 0],
    [150, 150, 129, 105, 81, 57, 34, 0, 0],
    [150, 150, 140, 118, 97, 75, 54, 34, 0],
    [150, 150, 150, 128, 109, 90, 71, 52, 34]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), 0);
                    }
                }
                else {// minimal no-till
                    if (($("#sfos")).is(":checked")) {// oil-seed
                        baseValueTable = [
    [150, 135, 124, 111, 96, 84, 72, 59, 47],
    [150, 145, 135, 125, 116, 106, 97, 87, 78],
    [150, 150, 143, 135, 127, 119, 112, 104, 96],
    [150, 150, 148, 141, 135, 128, 126, 115, 109],
    [150, 150, 150, 146, 141, 135, 129, 124, 118],
    [150, 150, 150, 150, 145, 140, 135, 130, 125],
    [150, 150, 150, 150, 148, 144, 139, 135, 131],
    [150, 150, 150, 150, 150, 147, 143, 139, 135]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                    GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), MIN_NO_TILL_CREDIT);
                    }
                    else {// confection
                        baseValueTable = [
    [150, 145, 134, 121, 106, 94, 82, 69, 57],
    [150, 150, 145, 135, 126, 116, 107, 97, 88],
    [150, 150, 150, 145, 137, 129, 122, 114, 106],
    [150, 150, 150, 160, 145, 138, 136, 125, 119],
    [150, 150, 150, 150, 150, 145, 139, 134, 128],
    [150, 150, 150, 150, 150, 150, 145, 140, 135],
    [150, 150, 150, 150, 150, 150, 150, 145, 141],
    [150, 150, 150, 150, 150, 150, 150, 150, 145]
                        ];
                        finalResult = GetFinalResult(GetBaseValue(baseValueTable, "sfprice", "sfnprice"), GetSoilTestNitrateCredit("sfSoilTestN"),
                                            GetOrganicMatterCredit("sfOrganicMatter"), GetPrevCropNCredit("sunflowerPreviousCrop"), MIN_NO_TILL_CREDIT);
                    }
                }
            }

            $('input[id=SfResultText]').val("" + finalResult + SunflowerMinusPlus);
        });
    }





    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
})();