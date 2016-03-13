var databook = [];
var currentData;
var currentCounties;
var currentY;
var currentType;

for(var i = 0; i < 24; i++){
	// read csv
	$.ajax({
		url: "./data/2015/" + i + ".csv",
			async: true,
			success: function (csvd) {
					// convert csv to objects
					databook.push($.csv.toObjects(csvd));
			},
			dataType: "text",
	});
}

function makeGraph(data, y, type){

	y = y[0];

	console.log(data);

	var x = "County";

  var json = {};

	if (type == "Bar"){
		var chart = {
			type: 'bar'
		};
		json.chart = chart;
	} else if (type == "Scatter"){
		var chart = {
			type: 'scatter'
		};
		json.chart = chart;
	}

	var title = {
		text: x + " vs. " + y
	};

	var xData = [];
	var yData = [];

	for(var i = 0; i < data.length; i++){
		xData.push(data[i][x]);
		yData.push(+data[i][y]);
	}

	var xAxis = {
		title:{
			text: x
		},
		categories: xData
	};
	var yAxis = {
		title:{
			text: y
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

//Select2
var countySelect = $(".county-select").select2();
var columnSelect = $(".column-select").select2();

$(function () {
		//getting click event to show modal
    $('#edit-graph').click(function () {
			countySelect.val(currentCounties).trigger("change");
			columnSelect.val(currentY).trigger("change");
			$("#myModal").modal('show');
    });
});

function saveChanges(){
	var counties = $(".county-select").val();
	currentY = $(".column-select").val();
	// need at least 1 datapoint
	if (counties == null){
		return;
	}

	currentData = [];

	for (var i = 0; i < databook.length; i++){
		if (counties.indexOf(databook[i].County) != -1){
			currentData.push(databook[i]);
		}
	}
	
	if ($("#bar").hasClass("active")){
		currentType = "Bar";
	} else if ($("#line").hasClass("active")){
		currentType = "Line";
	} else if ($("#scatter").hasClass("active")){
		currentType = "Scatter";
	}

	makeGraph(currentData, currentY, currentType);	
	
}
