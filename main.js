var databook;
var currYData;
var currXData;
var currYLabel;
var currentType;

//Select2
var countySelect = $(".county-select").select2();
var columnSelect = null;

$.getJSON("databook.json", function(json){
	console.log(json);
	currYLabel = 'Child PopulationAges 0 - 13';
	var dataObj = json['2015']['Child Day Care Licensing Statistics as of August 31, 2015'][currYLabel]
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
	for(var key in json['2015']){
		objs = [];
		for (var val in json['2015'][key]){
			if (val == "Region"){
				continue;
			}
			objs.push({"id":val, "text":val})
		}
		columnData.push({"text":key, "children":objs});
	}
	columnSelect = $(".column-select").select2({
		data: columnData
	});
});

function makeGraph(xData, yData, yLabel, type){
	console.log(xData);
	console.log(yData);
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

$(function () {
		//getting click event to show modal
    $('#edit-graph').click(function () {
			countySelect.val(currXData).trigger("change");
			columnSelect.val(currYLabel).trigger("change");
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

	currYData = [];

	console.log(yLabels);
	
	if ($("#bar").hasClass("active")){
		currentType = "bar";
	} else if ($("#line").hasClass("active")){
		currentType = "line";
	} else if ($("#scatter").hasClass("active")){
		currentType = "scatter";
	}

	makeGraph(currXData, currYData, currYLabel, currentType);	
}
