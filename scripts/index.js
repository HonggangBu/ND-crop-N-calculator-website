$(function () {
    $('[data-toggle="tooltip"]').tooltip();

    AddOptions($("#sunflowerPriceSelect"), 0.09, 0.03, 0.60, 2); // sunflower price list
    AddOptions($("#sunflowerNitrogenPriceSelect"), 0.2, 0.1, 2.0, 1); // sunflower nitrogen cost list
    //OnAnySelectChangeClearResult();

});

////////////////////////////////////////////////////
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