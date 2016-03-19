var databook;
var graph = {
				chart: {
            type: ''
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: [],
            title: {
                text: ''
            },
						labels: {
							formatter: function () {
									return '<a href="#single" onclick="singleCounty(\''+this.value+'\');">' + this.value + '</a>'
							},
							useHTML: true
						}

        },
        yAxis: {
            title: {
                text: ''
            }
        },
        series: []
	};	

var catDict = {};
var idDict = {};
var valDict = {};

//Select2
var countySelect = $(".county-select").select2();
var columnSelect = null;

function loadCheckboxes(){
	for(var year in databook){
		if(year == "Region"){
			continue;
		}
		$("#yearCheckboxes").append("<label class='checkbox-inline'><input onclick='radio(this);' type='checkbox' id='" + year + "' value='" + year + "'>" + year + "</label>")
	}
}

function getData(year, name, counties){
	var data = [];
	for(var i = 0; i < counties.length; i++){
		var datapoint = databook[year][catDict[name]][name][counties[i]];
		// remove %
		datapoint = datapoint.replace(/r/g, "");
		data.push(+datapoint);
	}
	return data;
}

function genCatDict(){
	for(var cat in databook['2015']){
		for(var stat in databook['2015'][cat]){
			catDict[stat] = cat;
		}
	}
}

function createSeries(columns){
	var series = [];
	for (var i = 0; i < columns.length; i++){
		series.push({"name": columns[i], "data": getData(graph.yAxis.title.text, columns[i], graph.xAxis.categories)});
	}	
	return series;
}

function createLineSeries(years, counties, column){
	var series = [];
	for(var i = 0; i < counties.length; i++){
		var datapoints = [];
		for(var k = 0; k < years.length; k++){
			datapoints = datapoints.concat(getData(years[k], column, [counties[i]]));
		}	
		series.push({"name": counties[i], "data": datapoints});
	}
	return series;
}

function statTable(){
	var means = [];
	var stds = [];
	var medians = [];
	var rowLabels = [];
	var names = [];
	var data = [];	
	for(var i = 0; i < graph.series.length; i ++){
		names.push(graph.series[i].name);
		data.push(graph.series[i].data);
	}
	rowLabels = names;
	var dec = 2;
	for(var i = 0; i < data.length; i++){
		means.push(math.round(math.mean(data[i]), dec));
		stds.push(math.round(math.std(data[i]), dec));
		medians.push(math.round(math.median(data[i]), dec));
	}
	var table = "<table id='stats-table' class='table'><thead><th>Data</th><th>Mean</th><th>Standard Deviation</th><th>Median</th></thead><tbody>";
	for(var i = 0; i < rowLabels.length; i++){
		table += "<tr><td>" + rowLabels[i] + "</td><td>" + means[i] + "</td><td>" + stds[i] + "</td><td>" + medians[i] + "</td></tr>";
	}
	table += "</tbody></table>";
	return table;
}

$.getJSON("databook.json", function(json){
	databook = json;
	loadCheckboxes();
	genCatDict();
	var year = "2015";
	graph.yAxis.title.text = year;
	graph.xAxis.categories = ["Moore", "Glasscock", "Hall", "Rains", "Nueces"];
	var columns = ["Hispanic", "Anglo"];
	graph.xAxis.title.text = "County";
	graph.series = createSeries(columns);
	graph.chart.type = "bar";
	genGraph();

	// fill column dropdown box
	columnData = []
	var i = 0;
	for(var key in json['2015']){
		objs = [];
		if (key.indexOf("APS") != -1){
			continue;
		}
		for (var val in json['2015'][key]){
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

function radio(elem){
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
			// clear checkboxes
			$("input[type=checkbox]").each(function(){this.checked = false;});
			
			if(graph.chart.type == "bar"){
				$("#" + graph.yAxis.title.text).prop("checked", true);
				countySelect.val(graph.xAxis.categories).trigger("change");
				var columns = [];
				for(var i = 0; i < graph.series.length;i++){
					columns.push(graph.series[i].name);
				}
				columnSelect.val(getId(columns)).trigger("change");
			} else {
				var years = graph.xAxis.categories;
				for(var i = 0; i < years.length; i++){
					$("#" + years[i]).prop("checked", true);
				}	
				var counties = [];
				for(var i = 0; i < graph.series.length; i++){
					counties.push(graph.series[i].name);
				}
				countySelect.val(counties).trigger("change");
				columnSelect.val(getId([graph.yAxis.title.text])).trigger("change");
			}
			$("#myModal").modal('show');
    });
});

function saveChanges(){
	var counties = $(".county-select").val();
	var columns = $(".column-select").val();
	// need at least 1 datapoint
	if (counties == null || columns == null){
		return;
	}
	var checkboxes = $("input[type=checkbox]:checked");
	if(checkboxes.length > 1){
		// make line graph
		graph.chart.type = 'line';
		var years = [];
		checkboxes.each(function(){years.push(this.id)});
		graph.xAxis.categories = years;
		graph.yAxis.title.text = getValue(columns)[0];
		graph.series = createLineSeries(years, counties, getValue(columns)[0]);
	}	else {
		graph.chart.type = "bar";
		graph.xAxis.categories = counties;
		graph.xAxis.title.text = "County";
		graph.yAxis.title.text = checkboxes.attr("id");
		graph.series = createSeries(getValue(columns));
	}
	genGraph();
}

function fillTable(){
	var rowData = [];
	var header = [];
	var caption = graph.yAxis.title.text;
	if (graph.chart.type == "bar"){
		for(var i = 0; i < graph.series.length; i++){
			header.push(graph.series[i].name);
		}
		for(var i = 0; i < graph.xAxis.categories.length; i++){
			var single = [];
			single.push(graph.xAxis.categories[i]);
			single.push(databook["Region"][graph.xAxis.categories[i]]);
			for(var k = 0; k < graph.series.length; k++){
				single.push(graph.series[k].data[i]);
			}
			rowData.push(single);
		}
	} else {
		for(var i = 0; i < graph.xAxis.categories.length; i++){
			header.push(graph.xAxis.categories[i]);
		}
		for(var i = 0; i < graph.series.length; i++){
			var single = [];
			single.push(graph.series[i].name);
			single.push(databook["Region"][graph.series[i].name]);
			single = single.concat(graph.series[i].data);
			rowData.push(single);
		}
	}

	var table = "<table id='data-table' class='table table-striped'><caption>" + caption + "</caption>";
	table += "<thead><tr>" + "<th>County</th><th>Region</th>";
	for(var i = 0; i < header.length; i++){
		table += "<th>" + header[i] + "</th>";
	}
	table += "</tr></thead><tbody>";
	for(var i = 0; i < rowData.length; i++){
		table += "<tr>";
		for(var k = 0; k < rowData[i].length; k++){
			table += "<td>" + rowData[i][k] + "</td>";
		}
		table += "</tr>";
	}
	table += "</tr></tbody></table>";
	$("#data-table").replaceWith(table);
}

function singleCounty(county){
	console.log(county);
}

function genGraph(){
	$("#container").highcharts(graph);
	fillTable();
	$("#stats-table").replaceWith(statTable());
}
