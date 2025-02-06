
function onChangeBalanceSheet(colIndex,rowIndex){
    var prevcap1 = Number(getValueFromTableCell('table98', 3, 1).toFixed(2)); 
    var prevcap = Number(getValueFromTableCell('table98', 3, 2).toFixed(2)); 
    var currcap = Number(getValueFromTableCell('table98', 3, 3).toFixed(2)); 
    var nextcap = Number(getValueFromTableCell('table98', 3, 4).toFixed(2)); 
    var nextcap1 = Number(getValueFromTableCell('table98', 3, 5).toFixed(2)); 
    var nextcap2 = Number(getValueFromTableCell('table98', 3, 6).toFixed(2)); 
  
    var prevPL1 = Number(getValueFromTableCell('table98', 3, 1).toFixed(2));
    var prevPL = Number(getValueFromTableCell('table98', 4, 2).toFixed(2)); 
    var currPL = Number(getValueFromTableCell('table98', 4, 3).toFixed(2)); 
    var nextPL = Number(getValueFromTableCell('table98', 4, 4).toFixed(2)); 
    var nextPL1 = Number(getValueFromTableCell('table98', 3, 5).toFixed(2)); 
    var nextPL2 = Number(getValueFromTableCell('table98', 3, 6).toFixed(2));
  
    setTableCellData('table98', 5, 1, prevcap1+prevPL1, true);
    setTableCellData('table98', 5, 2, prevcap+prevPL, true);
    setTableCellData('table98', 5, 3, currcap+currPL, true);
    setTableCellData('table98', 5, 4, nextcap+nextPL, true);
    setTableCellData('table98', 5, 5, nextcap1+nextPL1, true);
    setTableCellData('table98', 5, 6, nextcap2+nextPL2, true);
  
    if(colIndex==1){
      
  
    var row5column1 = Number(getValueFromTableCell('table98', 5, 1).toFixed(2));
  var row6column1 = Number(getValueFromTableCell('table98', 6, 1).toFixed(2));
  var row7column1 = Number(getValueFromTableCell('table98', 7, 1).toFixed(2));
  setTableCellData('table98', 8, 1, row5column1+row6column1+row7column1, true);
  
  var row9column1 = Number(getValueFromTableCell('table98', 9, 1).toFixed(2));
  var row10column1 = Number(getValueFromTableCell('table98', 10, 1).toFixed(2));
  setTableCellData('table98', 11, 1, row9column1-row10column1, true);
  
  var row11column1 = Number(getValueFromTableCell('table98', 11, 1).toFixed(2));
  var row12column1 = Number(getValueFromTableCell('table98', 12, 1).toFixed(2));
  setTableCellData('table98', 13, 1, row11column1+row12column1, true);
  
  var row8column1 = Number(getValueFromTableCell('table98', 8, 1).toFixed(2));
  var row13column1 = Number(getValueFromTableCell('table98', 13, 1).toFixed(2));
  setTableCellData('table98', 14, 1, row8column1-row13column1, true);
  
  var row15column1 = Number(getValueFromTableCell('table98', 15, 1).toFixed(2));
  var row16column1 = Number(getValueFromTableCell('table98', 16, 1).toFixed(2));
  var row17column1 = Number(getValueFromTableCell('table98', 17, 1).toFixed(2));
  var row18column1 = Number(getValueFromTableCell('table98', 18, 1).toFixed(2));
  var row19column1 = Number(getValueFromTableCell('table98', 19, 1).toFixed(2));
  setTableCellData('table98', 20, 1, row15column1+row16column1+row17column1+row18column1+row19column1, true);
  
  var row21column1 = Number(getValueFromTableCell('table98', 21, 1).toFixed(2));
  var row22column1 = Number(getValueFromTableCell('table98', 22, 1).toFixed(2));
  var row23column1 = Number(getValueFromTableCell('table98', 23, 1).toFixed(2));
  setTableCellData('table98', 24, 1, row21column1+row22column1+row23column1, true);
  
  var row24column1 = Number(getValueFromTableCell('table98', 24, 1).toFixed(2));
  var row25column1 = Number(getValueFromTableCell('table98', 25, 1).toFixed(2));
  setTableCellData('table98', 26, 1, row24column1+row25column1, true);
  
  var row20column1 = Number(getValueFromTableCell('table98', 20, 1).toFixed(2));
  var row24column1 = Number(getValueFromTableCell('table98', 24, 1).toFixed(2));
  setTableCellData('table98', 27, 1, row20column1-row24column1, true);
  
  var row26column1 = Number(getValueFromTableCell('table98', 26, 1).toFixed(2));
  setTableCellData('table98', 28, 1, row20column1-row26column1, true);
  
    } else if(colIndex==2){
      
  
      var row5column2 = Number(getValueFromTableCell('table98', 5, 2).toFixed(2));
  var row6column2 = Number(getValueFromTableCell('table98', 6, 2).toFixed(2));
  var row7column2 = Number(getValueFromTableCell('table98', 7, 2).toFixed(2));
  setTableCellData('table98', 8, 2, row5column2+row6column2+row7column2, true);
  
  var row9column2 = Number(getValueFromTableCell('table98', 9, 2).toFixed(2));
  var row10column2 = Number(getValueFromTableCell('table98', 10, 2).toFixed(2));
  setTableCellData('table98', 11, 2, row9column2-row10column2, true);
  
  var row11column2 = Number(getValueFromTableCell('table98', 11, 2).toFixed(2));
  var row12column2 = Number(getValueFromTableCell('table98', 12, 2).toFixed(2));
  setTableCellData('table98', 13, 2, row11column2+row12column2, true);
  
  var row8column2 = Number(getValueFromTableCell('table98', 8, 2).toFixed(2));
  var row13column2 = Number(getValueFromTableCell('table98', 13, 2).toFixed(2));
  setTableCellData('table98', 14, 2, row8column2-row13column2, true);
  
  var row15column2 = Number(getValueFromTableCell('table98', 15, 2).toFixed(2));
  var row16column2 = Number(getValueFromTableCell('table98', 16, 2).toFixed(2));
  var row17column2 = Number(getValueFromTableCell('table98', 17, 2).toFixed(2));
  var row18column2 = Number(getValueFromTableCell('table98', 18, 2).toFixed(2));
  var row19column2 = Number(getValueFromTableCell('table98', 19, 2).toFixed(2));
  setTableCellData('table98', 20, 2, row15column2+row16column2+row17column2+row18column2+row19column2, true);
  
  var row21column2 = Number(getValueFromTableCell('table98', 21, 2).toFixed(2));
  var row22column2 = Number(getValueFromTableCell('table98', 22, 2).toFixed(2));
  var row23column2 = Number(getValueFromTableCell('table98', 23, 2).toFixed(2));
  setTableCellData('table98', 24, 2, row21column2+row22column2+row23column2, true);
  
  var row24column2 = Number(getValueFromTableCell('table98', 24, 2).toFixed(2));
  var row25column2 = Number(getValueFromTableCell('table98', 25, 2).toFixed(2));
  setTableCellData('table98', 26, 2, row24column2+row25column2, true);
  
  var row20column2 = Number(getValueFromTableCell('table98', 20, 2).toFixed(2));
  var row24column2 = Number(getValueFromTableCell('table98', 24, 2).toFixed(2));
  setTableCellData('table98', 27, 2, row20column2-row24column2, true);
  
  var row26column2 = Number(getValueFromTableCell('table98', 26, 2).toFixed(2));
  setTableCellData('table98', 28, 2, row20column2-row26column2, true);
  
    } else if(colIndex==3){
      
      var row5column3 = Number(getValueFromTableCell('table98', 5, 3).toFixed(2));
  var row6column3 = Number(getValueFromTableCell('table98', 6, 3).toFixed(2));
  var row7column3 = Number(getValueFromTableCell('table98', 7, 3).toFixed(2));
  setTableCellData('table98', 8, 3, row5column3+row6column3+row7column3, true);
  
  var row9column3 = Number(getValueFromTableCell('table98', 9, 3).toFixed(2));
  var row10column3 = Number(getValueFromTableCell('table98', 10, 3).toFixed(2));
  setTableCellData('table98', 11, 3, row9column3-row10column3, true);
  
  var row11column3 = Number(getValueFromTableCell('table98', 11, 3).toFixed(2));
  var row12column3 = Number(getValueFromTableCell('table98', 12, 3).toFixed(2));
  setTableCellData('table98', 13, 3, row11column3+row12column3, true);
  
  var row8column3 = Number(getValueFromTableCell('table98', 8, 3).toFixed(2));
  var row13column3 = Number(getValueFromTableCell('table98', 13, 3).toFixed(2));
  setTableCellData('table98', 14, 3, row8column3-row13column3, true);
  
  var row15column3 = Number(getValueFromTableCell('table98', 15, 3).toFixed(2));
  var row16column3 = Number(getValueFromTableCell('table98', 16, 3).toFixed(2));
  var row17column3 = Number(getValueFromTableCell('table98', 17, 3).toFixed(2));
  var row18column3 = Number(getValueFromTableCell('table98', 18, 3).toFixed(2));
  var row19column3 = Number(getValueFromTableCell('table98', 19, 3).toFixed(2));
  setTableCellData('table98', 20, 3, row15column3+row16column3+row17column3+row18column3+row19column3, true);
  
  var row21column3 = Number(getValueFromTableCell('table98', 21, 3).toFixed(2));
  var row22column3 = Number(getValueFromTableCell('table98', 22, 3).toFixed(2));
  var row23column3 = Number(getValueFromTableCell('table98', 23, 3).toFixed(2));
  setTableCellData('table98', 24, 3, row21column3+row22column3+row23column3, true);
  
  var row24column3 = Number(getValueFromTableCell('table98', 24, 3).toFixed(2));
  var row25column3 = Number(getValueFromTableCell('table98', 25, 3).toFixed(2));
  setTableCellData('table98', 26, 3, row24column3+row25column3, true);
  
  var row20column3 = Number(getValueFromTableCell('table98', 20, 3).toFixed(2));
  var row24column3 = Number(getValueFromTableCell('table98', 24, 3).toFixed(2));
  setTableCellData('table98', 27, 3, row20column3-row24column3, true);
  
  var row26column3 = Number(getValueFromTableCell('table98', 26, 3).toFixed(2));
  setTableCellData('table98', 28, 3, row20column3-row26column3, true);
    } else if(colIndex==4){
      var row5column4 = Number(getValueFromTableCell('table98', 5, 4).toFixed(2));
  var row6column4 = Number(getValueFromTableCell('table98', 6, 4).toFixed(2));
  var row7column4 = Number(getValueFromTableCell('table98', 7, 4).toFixed(2));
  setTableCellData('table98', 8, 4, row5column4+row6column4+row7column4, true);
  
  var row9column4 = Number(getValueFromTableCell('table98', 9, 4).toFixed(2));
  var row10column4 = Number(getValueFromTableCell('table98', 10, 4).toFixed(2));
  setTableCellData('table98', 11, 4, row9column4-row10column4, true);
  
  var row11column4 = Number(getValueFromTableCell('table98', 11, 4).toFixed(2));
  var row12column4 = Number(getValueFromTableCell('table98', 12, 4).toFixed(2));
  setTableCellData('table98', 13, 4, row11column4+row12column4, true);
  
  var row8column4 = Number(getValueFromTableCell('table98', 8, 4).toFixed(2));
  var row13column4 = Number(getValueFromTableCell('table98', 13, 4).toFixed(2));
  setTableCellData('table98', 14, 4, row8column4-row13column4, true);
  
  var row15column4 = Number(getValueFromTableCell('table98', 15, 4).toFixed(2));
  var row16column4 = Number(getValueFromTableCell('table98', 16, 4).toFixed(2));
  var row17column4 = Number(getValueFromTableCell('table98', 17, 4).toFixed(2));
  var row18column4 = Number(getValueFromTableCell('table98', 18, 4).toFixed(2));
  var row19column4 = Number(getValueFromTableCell('table98', 19, 4).toFixed(2));
  setTableCellData('table98', 20, 4, row15column4+row16column4+row17column4+row18column4+row19column4, true);
  
  var row21column4 = Number(getValueFromTableCell('table98', 21, 4).toFixed(2));
  var row22column4 = Number(getValueFromTableCell('table98', 22, 4).toFixed(2));
  var row23column4 = Number(getValueFromTableCell('table98', 23, 4).toFixed(2));
  setTableCellData('table98', 24, 4, row21column4+row22column4+row23column4, true);
  
  var row24column4 = Number(getValueFromTableCell('table98', 24, 4).toFixed(2));
  var row25column4 = Number(getValueFromTableCell('table98', 25, 4).toFixed(2));
  setTableCellData('table98', 26, 4, row24column4+row25column4, true);
  
  var row20column4 = Number(getValueFromTableCell('table98', 20, 4).toFixed(2));
  var row24column4 = Number(getValueFromTableCell('table98', 24, 4).toFixed(2));
  setTableCellData('table98', 27, 4, row20column4-row24column4, true);
  
  var row26column4 = Number(getValueFromTableCell('table98', 26, 4).toFixed(2));
  setTableCellData('table98', 28, 4, row20column4-row26column4, true);
    } else if(colIndex==5){
      var row5column5 = Number(getValueFromTableCell('table98', 5, 5).toFixed(2));
  var row6column5 = Number(getValueFromTableCell('table98', 6, 5).toFixed(2));
  var row7column5 = Number(getValueFromTableCell('table98', 7, 5).toFixed(2));
  setTableCellData('table98', 8, 5, row5column5+row6column5+row7column5, true);
  
  var row9column5 = Number(getValueFromTableCell('table98', 9, 5).toFixed(2));
  var row10column5 = Number(getValueFromTableCell('table98', 10, 5).toFixed(2));
  setTableCellData('table98', 11, 5, row9column5-row10column5, true);
  
  var row11column5 = Number(getValueFromTableCell('table98', 11, 5).toFixed(2));
  var row12column5 = Number(getValueFromTableCell('table98', 12, 5).toFixed(2));
  setTableCellData('table98', 13, 5, row11column5+row12column5, true);
  
  var row8column5 = Number(getValueFromTableCell('table98', 8, 5).toFixed(2));
  var row13column5 = Number(getValueFromTableCell('table98', 13, 5).toFixed(2));
  setTableCellData('table98', 14, 5, row8column5-row13column5, true);
  
  var row15column5 = Number(getValueFromTableCell('table98', 15, 5).toFixed(2));
  var row16column5 = Number(getValueFromTableCell('table98', 16, 5).toFixed(2));
  var row17column5 = Number(getValueFromTableCell('table98', 17, 5).toFixed(2));
  var row18column5 = Number(getValueFromTableCell('table98', 18, 5).toFixed(2));
  var row19column5 = Number(getValueFromTableCell('table98', 19, 5).toFixed(2));
  setTableCellData('table98', 20, 5, row15column5+row16column5+row17column5+row18column5+row19column5, true);
  
  var row21column5 = Number(getValueFromTableCell('table98', 21, 5).toFixed(2));
  var row22column5 = Number(getValueFromTableCell('table98', 22, 5).toFixed(2));
  var row23column5 = Number(getValueFromTableCell('table98', 23, 5).toFixed(2));
  setTableCellData('table98', 24, 5, row21column5+row22column5+row23column5, true);
  
  var row24column5 = Number(getValueFromTableCell('table98', 24, 5).toFixed(2));
  var row25column5 = Number(getValueFromTableCell('table98', 25, 5).toFixed(2));
  setTableCellData('table98', 26, 5, row24column5+row25column5, true);
  
  var row20column5 = Number(getValueFromTableCell('table98', 20, 5).toFixed(2));
  var row24column5 = Number(getValueFromTableCell('table98', 24, 5).toFixed(2));
  setTableCellData('table98', 27, 5, row20column5-row24column5, true);
  
  var row26column5 = Number(getValueFromTableCell('table98', 26, 5).toFixed(2));
  setTableCellData('table98', 28, 5, row20column5-row26column5, true);
    } else if(colIndex==6){
      var row5column6 = Number(getValueFromTableCell('table98', 5, 6).toFixed(2));
  var row6column6 = Number(getValueFromTableCell('table98', 6, 6).toFixed(2));
  var row7column6 = Number(getValueFromTableCell('table98', 7, 6).toFixed(2));
  setTableCellData('table98', 8, 6, row5column6+row6column6+row7column6, true);
  
  var row9column6 = Number(getValueFromTableCell('table98', 9, 6).toFixed(2));
  var row10column6 = Number(getValueFromTableCell('table98', 10, 6).toFixed(2));
  setTableCellData('table98', 11, 6, row9column6-row10column6, true);
  
  var row11column6 = Number(getValueFromTableCell('table98', 11, 6).toFixed(2));
  var row12column6 = Number(getValueFromTableCell('table98', 12, 6).toFixed(2));
  setTableCellData('table98', 13, 6, row11column6+row12column6, true);
  
  var row8column6 = Number(getValueFromTableCell('table98', 8, 6).toFixed(2));
  var row13column6 = Number(getValueFromTableCell('table98', 13, 6).toFixed(2));
  setTableCellData('table98', 14, 6, row8column6-row13column6, true);
  
  var row15column6 = Number(getValueFromTableCell('table98', 15, 6).toFixed(2));
  var row16column6 = Number(getValueFromTableCell('table98', 16, 6).toFixed(2));
  var row17column6 = Number(getValueFromTableCell('table98', 17, 6).toFixed(2));
  var row18column6 = Number(getValueFromTableCell('table98', 18, 6).toFixed(2));
  var row19column6 = Number(getValueFromTableCell('table98', 19, 6).toFixed(2));
  setTableCellData('table98', 20, 6, row15column6+row16column6+row17column6+row18column6+row19column6, true);
  
  var row21column6 = Number(getValueFromTableCell('table98', 21, 6).toFixed(2));
  var row22column6 = Number(getValueFromTableCell('table98', 22, 6).toFixed(2));
  var row23column6 = Number(getValueFromTableCell('table98', 23, 6).toFixed(2));
  setTableCellData('table98', 24, 6, row21column6+row22column6+row23column6, true);
  
  var row24column6 = Number(getValueFromTableCell('table98', 24, 6).toFixed(2));
  var row25column6 = Number(getValueFromTableCell('table98', 25, 6).toFixed(2));
  setTableCellData('table98', 26, 6, row24column6+row25column6, true);
  
  var row20column6 = Number(getValueFromTableCell('table98', 20, 6).toFixed(2));
  var row24column6 = Number(getValueFromTableCell('table98', 24, 6).toFixed(2));
  setTableCellData('table98', 27, 6, row20column6-row24column6, true);
  
  var row26column6 = Number(getValueFromTableCell('table98', 26, 6).toFixed(2));
  setTableCellData('table98', 28, 6, row20column6-row26column6, true);
    }
  
  }