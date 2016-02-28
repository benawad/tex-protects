// read csv
$.ajax({
	url: "https://raw.githubusercontent.com/benawad/tex-protects/gh-pages/data.csv?token=AHgfSfaI3i_WoVkZC-_w2bfuTPW6sRiZks5W3KLpwA%3D%3D",
    async: true,
    success: function (csvd) {
				// convert csv to objects
        data = $.csv.toObjects(csvd);
    },
    dataType: "text",
    complete: function () {
			// get first five entries
			var sample = data.slice(0, 5);	
			// make bar graph
			barGraph(sample);
    }
});

function barGraph(data){

	var chart = {
		type: 'bar'
	};

	var title = {
		text: 'Child Population'
	};

	var counties = [];
	for(var i = 0; i < 5; i++){
		counties.push(data[i].County);
	}

	var xAxis = {
		title:{
			text: "Counties"
		},
		categories: counties
	};
	var yAxis = {
		title:{
			text: "Population"
		},
		plotLines: [{
			 value: 0,
			 width: 1,
			 color: '#808080'
		}]
	};

	var populations = [];
	
	for(var i = 0; i < 5; i++){
		populations.push(+data[i]["Child Population"]);
	}

	var series = [{
		data:populations				
	}];

	console.log(populations);

   var json = {};

	 json.chart = chart;
   json.title = title;
   json.xAxis = xAxis;
   json.yAxis = yAxis;
   json.series = series;

   $('#container').highcharts(json);

}

//function bob (data) {
	//var title = {
		//text: 'Average Temperatures of Cities'   
	//};
	//var subtitle = {
		//text: 'Source: worldClimate.com'
	//};

	//var counties = [];
	//for(var i = 0; i < 5; i++){
		//counties.push(data[i].County);
	//}

	//var xAxis = {
		//categories: counties
	//};
	//var yAxis = {
		//title: {
			 //text: 'Temperature (\xB0C)'
		//},
		//plotLines: [{
			 //value: 0,
			 //width: 1,
			 //color: '#808080'
		//}]
	//};   

	//var tooltip = {
		//valueSuffix: '\xB0C'
	//}

	//var legend = {
		//layout: 'vertical',
		//align: 'right',
		//verticalAlign: 'middle',
		//borderWidth: 0
	//};

	//var populations = [];
	
	//for(var i = 0; i < 5; i++){
		//populations.push(+data[i]["Child Population"]);
	//}

	//var series =  [
		//{
			 //name: 'Tokyo',
			 //data: [7.0, 6.9, 9.5, 14.5, 18.2]
		//}, 
		//{
			 //name: 'New York',
			 //data: [-0.2, 0.8, 5.7, 11.3, 17.0]
		//},
		//{
			 //name: 'London',
			 //data: [3.9, 4.2, 5.7, 8.5, 11.9]
		//}
	//];

	//var json = {};

	//json.title = title;
	//json.subtitle = subtitle;
	//json.xAxis = xAxis;
	//json.yAxis = yAxis;
	//json.tooltip = tooltip;
	//json.legend = legend;
	//json.series = series;

	//$('#container').highcharts(json);
//}
