var databook;
var graph = {
				chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: [],
            title: {
                text: null
            }
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        series: [{
            name: 'Year 1800',
            data: [107, 31, 635, 203, 2]
        }, {
            name: 'Year 1900',
            data: [133, 156, 947, 408, 6]
        }, {
            name: 'Year 2012',
            data: [1052, 954, 4250, 740, 38]
        }]
};	

var currYData;
var currXData;
var currYLabel;
var currentType;
var currentYear;
var idDict = {};
var valDict = {};

//Select2
var countySelect = $(".county-select").select2();
var columnSelect = null;

function loadCheckboxes(){
	for(var year in databook){
		$("#yearCheckboxes").append("<label class='checkbox-inline'><input type='checkbox' id='" + year + "' value='" + year + "'>" + year + "</label>")
	}
}

$.getJSON("databook.json", function(json){
	databook = json;
	loadCheckboxes();
	currYLabel = ['Child PopulationAges 0 - 13'];
	currentYear = ['2015']
	var dataObj = json[currentYear[0]]['Child Day Care Licensing Statistics as of August 31, 2015'][currYLabel[0]]
	currXData = Object.keys(dataObj);
	currYData = [];
	var i = 1;
	for(var key in dataObj){
		currYData.push(+dataObj[key]);
		if (i == 5){
			break;
		}
		i += 1;
	}
	currXData = currXData.slice(0, 5);
	currentType = "bar";
	makeGraph(currXData, currYData, currYLabel, currentType);

	// fill column dropdown box
	columnData = []
	var i = 0;
	for(var key in json['2015']){
		objs = [];
		for (var val in json['2015'][key]){
			if (val == "Region"){
				continue;
			}
			objs.push({"id":i, "text":val});
			idDict[val] = i;
			valDict[i] = val;
			i+=1;
		}
		columnData.push({"text":key, "children":objs});
	}
	columnSelect = $(".column-select").select2({
		data: columnData
	});

	columnSelect.on("select2:select", function(e){
		if(columnSelect.val() != null && columnSelect.val().length >= 2){
			$("input[type=checkbox]").attr("onclick", "radio(this);");
		}	
	});
	columnSelect.on("select2:unselect", function(e){
		if(columnSelect.val() == null || columnSelect.val().length < 2){
			$("input[type=checkbox]").attr("onclick", "");
		}
	});

	$('input[type=checkbox]').change(function(){
		if($('input[type=checkbox]:checked').length > 1){
			columnSelect = $(".column-select").select2({
				data: columnData,
				maximumSelectionLength: 1
			});
		} else {
			columnSelect = $(".column-select").select2({
				data: columnData
			});
		}
	});
});

function radio(elem)
{
  var elems = document.getElementsByTagName("input");
  var currentState = elem.checked;
  var elemsLength = elems.length;

  for(i=0; i<elemsLength; i++)
  {
    if(elems[i].type === "checkbox")
    {
       elems[i].checked = false;   
    }
  }

  elem.checked = currentState;
}

function makeGraph(xData, yData, yLabel, type){
	console.log(xData);
	console.log(yData);
	yLabel = yLabel[0];
	var x = "County";

  var json = {};

	var chart = {
		type:type 
	};
	json.chart = chart;

	var title = {
		text: x + " vs. " + yLabel
	};

	var xAxis = {
		title:{
			text: x
		},
		categories: xData
	};
	var yAxis = {
		title:{
			text: yLabel
		},
		plotLines: [{
			value: 0,
			width: 1,
			color: '#808080'
		}]
	};

	var series = [{
		data: yData				
	}];

   json.title = title;
   json.xAxis = xAxis;
   json.yAxis = yAxis;
   json.series = series;

   $('#container').highcharts(json);
}

function getYData(xData, yLabels){
	yLabels = yLabels[0];	
	var label2 = "";
	for(var key in databook['2015']){
		if(databook['2015'][key].hasOwnProperty(yLabels)){
			label2 = key;
			break;
		}
	}
	yData = [];
	for(var i = 0; i < xData.length; i++){
		yData.push(+databook['2015'][label2][yLabels][xData[i]]);	
	}
	return yData;
}

function getId(vals){
	ids = [];
	for(var i = 0; i < vals.length; i++){
		ids.push(idDict[vals[i]]);
	}
	return ids;
}

function getValue(ids){
	vals = [];
	for(var i = 0; i < ids.length; i++){
		vals.push(valDict[+ids[i]]);
	}
	return vals;
}

$(function () {
		//getting click event to show modal
    $('#edit-graph').click(function () {
			countySelect.val(currXData).trigger("change");
			columnSelect.val(getId(currYLabel)).trigger("change");
			$("#myModal").modal('show');
    });
});

function saveChanges(){
	var counties = $(".county-select").val();
	var yLabels = $(".column-select").val();
	// need at least 1 datapoint
	if (counties == null || yLabels == null){
		return;
	}

	currXData = counties;

	currYLabel = getValue(yLabels);
	currYData = getYData(currXData, currYLabel);

	makeGraph(currXData, currYData, currYLabel, currentType);	
}
