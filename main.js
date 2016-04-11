var databook;
var finance;
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
            }
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        series: [],
				credits:{
					href:"http://www.texprotects.org/",
					text:"Texprotects.org/"
				}
	};	

var idDict = {};
var valDict = {};

//Select2
var countySelect = $(".county-select").select2();
var columnSelect = null;

function loadCheckboxes(){
	for(var year in databook){
		if(year == "Region" || year == "Outline"){
			continue;
		}
		$("#yearCheckboxes").append("<label class='checkbox-inline'><input onclick='' type='checkbox' id='" + year + "' value='" + year + "'>" + year + "</label>")
	}
}

function getObj(year, countyName){
	for(var i = 0; i < databook[year].length; i++){
		if(databook[year][i]['County'] == countyName){
			return databook[year][i];
		}
	}
	return null;
}

function getProp(obj, name){
	if(obj.hasOwnProperty(name)){
		return obj[name];	
	} else {
		return null;
	}
}

function createSeries(columns){
	var series = [];
	var countyObs = [];
  var counties = graph.xAxis.categories;
	for (var i = 0; i < counties.length; i++){
		countyObs.push(getObj(graph.yAxis.title.text, counties[i]));
	}
	for (var i = 0; i < columns.length; i++){
		var data = [];
		for(var c = 0; c < counties.length; c++){
			var datapoint = getProp(countyObs[c], columns[i]);
			if(!isNaN(datapoint)){
				datapoint = datapoint.replace(/%/g, "");
				data.push(+datapoint);
			} else {
				data.push(null);
			}
		}
		series.push({"name": columns[i], "data": data});
	}	
	return series;
}

function createLineSeries(years, counties, column){
	var series = [];
	for(var i = 0; i < counties.length; i++){
		var datapoints = [];
		for(var k = 0; k < years.length; k++){
			var datapoint = getProp(getObj(years[k], counties[i]), [column]);
			if(!isNaN(datapoint)){
				datapoint = datapoint.replace(/%/g, "");
				datapoints.push(+datapoint);
			} else {
				datapoints.push(null);
			}
		}	
		series.push({"name": counties[i], "data": datapoints});
	}
	return series;
}

function statTable(){
	var means = [];
	var stds = [];
	var medians = [];
	var modes = [];
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
		stds.push(math.round(math.mean(data[i]), dec));
		medians.push(math.round(math.mean(data[i]), dec));
		modes.push(math.mode(data[i]).toString());
	}
	var table = "<table id='stats-table' class='table'><thead><th>Data</th><th>Mean</th><th>Standard Deviation</th><th>Median</th><th>Mode</th></thead><tbody>";
	for(var i = 0; i < rowLabels.length; i++){
		table += "<tr><td>" + rowLabels[i] + "</td><td>" + means[i] + "</td><td>" + stds[i] + "</td><td>" + medians[i] + "</td><td>" + modes[i] + "</td></tr>";
	}
	table += "</tbody></table>";
	return table;
}

$.getJSON("finance.json", function(json){
	finance = json;
});

$.getJSON("databook.json", function(json){
	databook = json;
	loadCheckboxes();
	var counties = ["Austin", "Dallas", "Travis", "Tarrant", "State Total"];
	var years = ["2015", "2014", "2013", "2012", "2011", "2010", "2009"];
	graph.xAxis.categories = years;
	var column = "Confirmed Victims of Child Abuse/ Neglect";
	graph.yAxis.title.text = column;
	graph.xAxis.title.text = "Year";
	graph.series = createLineSeries(years, counties, column);
	graph.chart.type = "line";
	genGraph();

	// fill column dropdown box
	columnData = [];
	id = 0;
	for (var cat in databook['Outline']){
		if (cat.indexOf("APS") != -1){
			continue;
		}
		children = [];
		for (var i = 0; i < databook['Outline'][cat].length; i++){
			var val = databook['Outline'][cat][i];
			children.push({"id":id, "text": val});
			idDict[val] = id;
			valDict[id] = val;
			id += 1;
		}
		columnData.push({"text":cat, "children":children});
	}
	columnSelect = $(".column-select").select2({
		data: columnData,
		maximumSelectionLength: 1
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

function getTableData(){
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
	return [rowData, header, caption];
}

function fillTable(){
	var info = getTableData();
	var rowData = info[0];
	var header = info[1];
	var caption = info[2];

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

function table(data, id, caption){
	var html = "<table id='"+id+"' class='table'>";
	if(caption){
		html += "<caption>" + caption + "</caption>";
	}
	html += "<thead><tr>";
	var keys = Object.keys(data[0]);
	for(var i = 0; i < keys.length; i++){
		html += "<th>" + keys[i] + "</th>";	
	}
	html += "</tr></thead>";
	html += "<tbody>";
	for(var i = 0; i < data.length; i++){
		html += "<tr>";
		for(var j = 0; j < keys.length; j++){
			html += "<td>" + data[i][keys[j]] + "</td>";
		}
		html +="</tr>";
	}
	html += "</tbody>";
	html += "</table>";
	return html;
}

function urlToUri(url, callback){
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        var dataURL;
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        dataURL = canvas.toDataURL("JPEG");
        callback(dataURL);
        canvas = null; 
    };
    img.src = url;
}

function makepdf(table){
	var exportUrl = 'http://export.highcharts.com/';
	var optionsStr = JSON.stringify(graph);
  dataString = encodeURI('async=true&type=SVG&width=500&options=' + optionsStr);
	$.ajax({
			type: 'POST',
			data: dataString,
			url: exportUrl,
			success: function (data) {
					var url = exportUrl + data;
					urlToUri(url, function(uri){
						var info = getTableData();
						for (var i = 0; i < info[0].length; i++){
							for(var k = 0; k < info[0][i].length; k++){
								try{
									info[0][i][k] = info[0][i][k].toString();		
								} catch (err){
									info[0][i][k] = "";
								}
							}
						}
						info[1].splice(0, 0, "Region");
						info[1].splice(0, 0, "County");
						info[0].splice(0, 0, info[1]);
						var docDefinition = {
							content: [
								{
									image:uri,
									width:500
								},
								{ text: info[2], style: 'subheader'},
								{
									style: 'tab',
									table:{
										body: info[0]
									}
								},
								{
									style: 'tab',
									table: {
										body: rows,
									}
								}
							],
							styles: {
								tab:{
									color:"black",
									margin: [0, 5, 0, 15]
								}
							}	
						};
						pdfMake.createPdf(docDefinition).open();
					});
			},
			error: function (err) {
					console.log('error', err.statusText);
			}
	});
}

function singleCounty(){
	if(finance == null){
		console.log("Finance is null");
		$.getJSON("finance.json", function(json){
			finance = json;
			singleCounty();
		});
	} else {
		cols = Object.keys(finance[0]);
		cols.sort();
		cols.reverse();
		rows = [];
		for (var i = 0; i < finance.length; i++){
			var arr = [];
			for(var k = 0; k < cols.length; k++){
				arr.push(finance[i][cols[k]]);
			}
			rows.push(arr);
		}
		rows.splice(0, 0, cols);
		makepdf(rows);
	}
}

function genGraph(){
	$("#container").highcharts(graph);
	fillTable();
	$("#stats-table").replaceWith(statTable());
}
