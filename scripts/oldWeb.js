var EasternNoTillOil = [
   [84,22,0,0,0,0,0,0,0],
   [117,68,24,0,0,0,0,0,0],
   [137,97,61,24,0,0,0,0,0],
   [150,117,86,55,24,0,0,0,0],
   [150,132,105,77,50,24,0,0,0],
   [150,142,119,95,71,47,24,0,0],
   [150,150,130,108,87,65,44,24,0],
   [150,150,139,118,99,80,61,42,24]
];

var EasternNoTillConf = [
   [94,32,0,0,0,0,0,0,0],
   [127,78,34,0,0,0,0,0,0],
   [147,107,71,34,0,0,0,0,0],
   [150,127,96,65,34,0,0,0,0],
   [150,142,115,87,60,34,0,0,0],
   [150,150,129,105,81,57,34,0,0],
   [150,150,140,118,97,75,54,34,0],
   [150,150,150,128,109,90,71,52,34]
];

var EasternConvOil = [
   [150,135,124,111,96,84,72,59,47],
   [150,145,135,125,116,106,97,87,78],
   [150,150,143,135,127,119,112,104,96],
   [150,150,148,141,135,128,126,115,109],
   [150,150,150,146,141,135,129,124,118],
   [150,150,150,150,145,140,135,130,125],
   [150,150,150,150,148,144,139,135,131],
   [150,150,150,150,150,147,143,139,135]
];

var EasternConvConf = [
   [150,145,134,121,106,94,82,69,57],
   [150,150,145,135,126,116,107,97,88],
   [150,150,150,145,137,129,122,114,106],
   [150,150,150,160,145,138,136,125,119],
   [150,150,150,150,150,145,139,134,128],
   [150,150,150,150,150,150,145,140,135],
   [150,150,150,150,150,150,150,145,141],
   [150,150,150,150,150,150,150,150,145]
];

var WesternNoTillOil = [
   [126,77,31,0,0,0,0,0,0],
   [150,115,77,43,0,0,0,0,0],
   [150,135,106,77,50,22,0,0,0],
   [150,150,126,101,78,54,31,9,0],
   [150,150,140,119,98,78,58,38,19],
   [150,150,150,132,113,95,78,60,43],
   [150,150,150,142,125,109,93,78,62],
   [150,150,150,150,135,121,106,92,78]
];

var WesternNoTillConf = [
   [136,87,41,0,0,0,0,0,0],
   [150,125,87,53,0,0,0,0,0],
   [150,145,116,87,60,32,0,0,0],
   [150,150,136,111,88,64,41,19,0],
   [150,150,150,129,108,88,68,48,29],
   [150,150,150,143,123,105,88,70,53],
   [150,150,150,150,135,119,103,88,72],
   [150,150,150,150,145,131,116,102,88]
];

var WesternConvOil = [
   [126,77,31,0,0,0,0,0,0],
   [150,115,77,43,0,0,0,0,0],
   [150,135,106,77,50,22,0,0,0],
   [150,150,126,101,78,54,31,9,0],
   [150,150,140,119,98,78,58,38,19],
   [150,150,150,132,113,95,78,60,43],
   [150,150,150,142,125,109,93,78,62],
   [150,150,150,150,135,121,106,92,78]
];

var WesternConvConf = [
   [136,87,41,0,0,0,0,0,0],
   [150,125,87,53,0,0,0,0,0],
   [150,145,116,87,60,32,0,0,0],
   [150,150,136,111,88,64,41,19,0],
   [150,150,150,129,108,88,68,48,29],
   [150,150,150,143,123,105,88,70,53],
   [150,150,150,150,135,119,103,88,72],
   [150,150,150,150,145,131,116,102,88]
];

var LangdonConvOil = [
   [100,85,74,61,46,34,22,9,0],
   [100,95,85,75,66,56,47,37,28],
   [100,100,93,85,77,69,62,54,46],
   [100,100,98,91,85,78,76,65,59],
   [100,100,100,96,91,85,79,74,68],
   [100,100,100,100,96,90,85,80,75],
   [100,100,100,100,98,94,89,85,81],
   [100,100,100,100,100,97,93,89,85]
];

var LangdonConvConf = [
   [100,95,84,71,56,44,32,19,0],
   [100,100,96,85,76,66,57,47,38],
   [100,100,100,95,87,79,72,64,56],
   [100,100,100,100,95,88,86,75,69],
   [100,100,100,100,100,95,89,84,78],
   [100,100,100,100,100,100,95,90,85],
   [100,100,100,100,100,100,99,95,91],
   [100,100,100,100,100,100,100,99,95]
];

var seeds = 40;
var greaterFive = 150;
var threeToFive = 100;
var oneToThree = 50;
var lessThanOne = 0;
var yellowLeaves = 0;
var greenLeaves = 30;
var darkLeaves = 80;

var regionSelected = "none";
var tillage = "none";
var flowerPriceIndex = 0;
var nitrogenPriceIndex = 0;
var testNitrate = 0;
var cropCredits = 0;
var organicMatter = 0;

function getValue(inputName){
   return parseFloat(document.getElementById(inputName).value);
}

function setValue(inputName , number){
   document.getElementById(inputName).value = number;
}

function setFloat2(inputName , number){
   setValue(inputName, number.toFixed(2));
}

function setFloat1(inputName , number){
   setValue(inputName, number.toFixed(1));
}

function setInt(inputName , number){
   setValue(inputName, parseInt(number));
}

function setFlowerPriceIndex(value){
   flowerPriceIndex = parseInt(value / 0.03) - 3;
}

function setNitrogenPriceIndex(value){
   nitrogenPriceIndex = Math.round(value / 0.10) - 2;
}

function setOrganicMatter(){
   var number = getValue("organicMatPercen");
   if( number > 5.9){
      organicMatter = 50 * Math.floor( number - 5 );
   } else {
      organicMatter = 0;
   }
}

function checkLimits(inputName, value){
   var valueFine = value;
   switch(inputName){
      case "flowerPrice":
         if(valueFine > 0.30){
            valueFine = 0.30;
         } else if (valueFine < 0.09 ){
            valueFine = 0.09;
         }
         break;
      case "nitrogenPrice":
         if(valueFine > 1.00){
            valueFine = 1.00;
         } else if(valueFine < 0.20 ){
            valueFine = 0.20;
         }
         break;
      case "soilTest":
         if(valueFine < 0 ){
            valueFine = 0;
         }
         break;
      case "organicMatPercen":
         if(valueFine > 100.0){
            valueFine = 100.0;
         } else if(valueFine < 0.0 ){
            valueFine = 0.0;
         }
         break;
   }
   return valueFine;
}

function checkNumber(inputName){
   var number = 0;
   switch(inputName){
      case "flowerPrice":
         number = checkLimits(inputName ,(Math.round(getValue(inputName) / 0.03) * 0.03));
         setFlowerPriceIndex(number.toFixed(2));
         break;
      case "nitrogenPrice":
         number = checkLimits(inputName , (Math.round(getValue(inputName) / 0.10) * 0.10) );
         setNitrogenPriceIndex(number.toFixed(2));
         break;
      case "soilTest":
         number = checkLimits(inputName ,getValue(inputName) );
         testNitrate = number;
         break;
      case "organicMatPercen":
         number = checkLimits(inputName , getValue(inputName) );
         setOrganicMatter(number);
         break;
   }
   setRecom();
}

function increment(inputName){
   var value = 0;
   var inputValue = getValue(inputName) / 0.1;
   switch(inputName){
      case "flowerPrice":
         value = checkLimits(inputName ,(Math.round(getValue(inputName) / 0.03) * 0.03)  + 0.03);
         setFlowerPriceIndex(value.toFixed(2));
         setFloat2(inputName, value);
         break;
      case "nitrogenPrice":
         value = checkLimits(inputName , (Math.round(getValue(inputName) / 0.10) * 0.10) + 0.10);
         setNitrogenPriceIndex(value.toFixed(2));
         setFloat2(inputName, value);
         break;
      case "soilTest":
         value = checkLimits(inputName , (getValue(inputName) + 1) );
         testNitrate = value;
         setInt(inputName, value);
         break;
      case "organicMatPercen":
         value = checkLimits(inputName , (getValue(inputName) + 0.1) );
         setFloat1(inputName, value);
         setOrganicMatter();
         break;
   }
   setRecom();
}

function decrement(inputName){
   switch(inputName){
      case "flowerPrice":
         value = checkLimits(inputName ,(Math.round(getValue(inputName) / 0.03) * 0.03)  - 0.03);
         setFlowerPriceIndex(value.toFixed(2));
         setFloat2(inputName, value);
         break;
      case "nitrogenPrice":
         value = checkLimits(inputName , (Math.round(getValue(inputName) / 0.10) * 0.10) - 0.10);
         setNitrogenPriceIndex(value.toFixed(2));
         setFloat2(inputName, value);
         break;
      case "soilTest":
         value = checkLimits(inputName , (getValue(inputName) - 1) );
         testNitrate = value;
         setInt(inputName, value);
         break;
      case "organicMatPercen":
         value = checkLimits(inputName , (getValue(inputName) - 0.1) );
         setFloat1(inputName, value);
         setOrganicMatter();
         break;
   }
   setRecom();
}

function getTableData(location){
   var tableValue = 0;
   switch(location){
      case "eastern":
         switch(tillage){
            case "conventionalOil":
               tableValue = EasternConvOil[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "conventionalConf":
               tableValue = EasternConvConf[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "longTermOil":
               tableValue = EasternNoTillOil[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "longTermConf":
               tableValue = EasternNoTillConf[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "shortTermOil":
               tableValue = EasternConvOil[flowerPriceIndex][nitrogenPriceIndex] + 20;
               break;
            case "shortTermConf":
               tableValue = EasternConvConf[flowerPriceIndex][nitrogenPriceIndex] + 20;
               break;
         }
         break;
      case "western":
         switch(tillage){
            case "conventionalOil":
               tableValue = WesternConvOil[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "conventionalConf":
               tableValue = WesternConvConf[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "longTermOil":
               tableValue = WesternNoTillOil[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "longTermConf":
               tableValue = WesternNoTillConf[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "shortTermOil":
               tableValue = WesternConvOil[flowerPriceIndex][nitrogenPriceIndex] + 20;
               break;
            case "shortTermConf":
               tableValue = WesternConvConf[flowerPriceIndex][nitrogenPriceIndex] + 20;
               break;
         }
         break;
      case "langdon":
         switch(tillage){
            case "conventionalOil":
               tableValue = LangdonConvOil[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "conventionalConf":
               tableValue = LangdonConvConf[flowerPriceIndex][nitrogenPriceIndex];
               break;
            case "longTermOil":
               tableValue = EasternNoTillOil[flowerPriceIndex][nitrogenPriceIndex] - 50;
               break;
            case "longTermConf":
               tableValue = EasternNoTillConf[flowerPriceIndex][nitrogenPriceIndex] - 50;
               break;
            case "shortTermOil":
               tableValue = EasternConvOil[flowerPriceIndex][nitrogenPriceIndex] + 20;
               break;
            case "shortTermConf":
               tableValue = EasternConvConf[flowerPriceIndex][nitrogenPriceIndex] + 20;
               break;
         }
         break;
   }
   return tableValue;
}

function setRecom() {
   if(regionSelected != "none"){
      var tableData = getTableData(regionSelected);
      var recomNumberBefore = tableData;
      if(recomNumberBefore < 0){
         recomNumberBefore = 0;
      }

      var recomNumberAfter = tableData - testNitrate - cropCredits - organicMatter;
      if(recomNumberAfter < 0){
         recomNumberAfter = 0;
      }

      setValue("nitrogenRecom" , recomNumberBefore);
      setValue("nitrogenRecommendation" , recomNumberAfter);
   }
}

function regionEdit(location){
   switch(location){
      case "eastern":
         regionSelected = "eastern";
         break;
      case "western":
         regionSelected = "western";
         break;
      case "langdon":
         regionSelected = "langdon";
         break;
      default:
         regionSelected = "none";
         break;
   }
   setRecom();
}

function tillEdit(tillageIncome){
   switch(tillageIncome){
      case "conventionalOil":
         tillage = "conventionalOil";
         break;
      case "conventionalConf":
         tillage = "conventionalConf";
         break;
      case "longTermOil":
         tillage = "longTermOil";
         break;
      case "longTermConf":
         tillage = "longTermConf";
         break;
      case "shortTermOil":
         tillage = "shortTermOil";
         break;
      case "shortTermConf":
         tillage = "shortTermConf";
         break;
   }
   setRecom();
}

function creditsEdit(credits){
   switch(credits){
      case "seeds":
         cropCredits = seeds;
         break;
      case "greaterFive":
         cropCredits = greaterFive;
         break;
      case "threeToFive":
         cropCredits = threeToFive;
         break;
      case "oneToThree":
         cropCredits = oneToThree;
         break;
      case "lessThanOne":
         cropCredits = lessThanOne;
         break;
      case "yellowLeaves":
         cropCredits = yellowLeaves;
         break;
      case "greenLeaves":
         cropCredits = greenLeaves;
         break;
      case "darkLeaves":
         cropCredits = darkLeaves;
         break;
      default:
         cropCredits = 0;
         break;
   }
   setRecom();
}