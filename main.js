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
					text:"TexProtects.org/"
				}
};	
var graphColors = [
						'#3366CC',
						'#DC3912',
						'#FF9900',
						'#109618',
						'#990099',
						'#3B3EAC',
						'#0099C6',
						'#DD4477',
						'#66AA00',
						'#B82E2E',
						'#316395',
						'#994499',
						'#22AA99',
						'#AAAA11',
						'#6633CC',
						'#E67300',
						'#8B0707',
						'#329262',
						'#5574A6',
						'#3B3EAC'
						];

Highcharts.theme = {
    colors: graphColors,
    title: {
        style: {
            color: '#000',
            font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
    },
    subtitle: {
        style: {
            color: '#666666',
            font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
    },

    legend: {
        itemStyle: {
            font: '9pt Trebuchet MS, Verdana, sans-serif',
            color: 'black'
        },
        itemHoverStyle:{
            color: 'gray'
        }   
    }
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);

var idDict = {};
var valDict = {};

//Select2
var countySelect = $(".county-select").select2({
	maximumSelectionLength: 3
});
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
			if(!isNaN(datapoint) && datapoint != null){
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
			if(!isNaN(datapoint) && datapoint != null){
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

function statTable(wantRates){
	var means = [];
	var stds = [];
	var percents = [];
	var rowLabels = [];
	var names = [];
	var data = [];	
	var rates = [];
	var years = [];
	if(graph.chart.type == 'line'){
		years = graph.xAxis.categories;
	}
	for(var i = 0; i < graph.series.length; i ++){
		names.push(graph.series[i].name);
		if(graph.chart.type == 'line'){
			rowLabels.push(graph.series[i].name + " <span style='color:"+graphColors[i]+";'>&#9632;</span>");
		} else {
			rowLabels.push(graph.series[i].name);
		}
		data.push(graph.series[i].data);
	}
	var dec = 2;
	var total = 0;
	for(var i = 0; i < data.length; i++){
		var ratesRow = [];
		if(graph.chart.type == 'line'){
			var pop = getProp(getObj(years[i], names[i]), "Child Population");
			for(var k = 0; k < data[i].length; k++){
				if(pop != null){
					ratesRow.push(math.round((data[i][k] / pop)*100, 2) + "%");	
				} else {
					ratesRow.push("No data");
				}
			}
		} else {
			var pop = getProp(getObj(graph.yAxis.title.text, graph.xAxis.categories[i]), "Child Population");
			for(var k = 0; k < data[i].length; k++){
				if(pop != null){
					ratesRow.push(math.round((data[i][k] / pop)*100, 2) + "%");	
				} else {
					ratesRow.push("No data");
				}
			}
		}
		rates.push(ratesRow);
		var mean = math.mean(data[i])
		means.push(math.round(mean, dec));
		stds.push(math.round(math.std(data[i]), dec));
		total += mean;	
	}
	for(var i = 0; i < means.length; i++){
		percents.push(math.round(100*(means[i]/total), dec) + "%")
	}

	var percentLabel = "";
	if(graph.chart.type == 'line'){
		percentLabel = "<th>Percent</th>";
	}

	var table = "<div id='stats-div'><table id='stats-table' class='table table-striped'><h4 class='text-center'>Statistics</h4><thead><th>Data</th><th>Mean</th><th>Standard Deviation</th>"+percentLabel+"</thead><tbody>";
	var ratesTable = "<div id='stats-div'><table id='stats-table' class='table table-striped'><h4 class='text-center'>Statistics</h4><thead><th>Data</th><th>Mean</th><th>Standard Deviation</th>"+percentLabel;
	for(var i = 0; i < graph.xAxis.categories.length; i++){
		ratesTable += "<th>";
		ratesTable += graph.xAxis.categories[i] + " Rates";
		ratesTable += "</th>";
	}
	ratesTable += "</thead><tbody>";
	for(var i = 0; i < rowLabels.length; i++){
		table += "<tr><td>" + rowLabels[i] + "</td><td>" + means[i] + "</td><td>" + stds[i] + "</td>";
		ratesTable += "<tr><td>" + rowLabels[i] + "</td><td>" + means[i] + "</td><td>" + stds[i] + "</td>";
		if (graph.chart.type == 'line'){
			table += "<td>" + percents[i] + "</td>";
			ratesTable += "<td>" + percents[i] + "</td>";
		}
		for(var k = 0; k < rates[i].length; k++){
			ratesTable += "<td>" + rates[i][k] + "</td>";
		}
	 	table += "</tr>";
	 	ratesTable += "</tr>";
	}
	table += "</tbody></table></div>";
	ratesTable += "</tbody></table></div>";
	sessionStorage.setItem('statsTable', ratesTable);
	if(wantRates){
		return ratesTable;
	} else {
		return table;
	}
}

$.getJSON("finance.json", function(json){
	finance = json;
});

$.getJSON("databook.json", function(json){
	databook = json;
	loadCheckboxes();
	var counties = ["Dallas", "Collin"];
	var years = ["2009", "2010", "2011", "2012", "2013", "2014", "2015"];
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
				data: columnData,
				maximumSelectionLength: 19
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
	var first = true;

	var table = "<div id='data-div'><table id='data-table' class='table table-striped'><h4 class='text-center'>" + caption + "</h4>";
	table += "<thead><tr>" + "<th>County</th><th>Region</th>";
	for(var i = 0; i < header.length; i++){
		table += "<th>" + header[i] + "</th>";
	}
	table += "</tr></thead><tbody>";
	for(var i = 0; i < rowData.length; i++){
		table += "<tr>";
		first = true;	
		for(var k = 0; k < rowData[i].length; k++){
			if (first && graph.chart.type == "line"){
				first = false;
				table += "<td>" + rowData[i][k] + " <span style='color:"+graphColors[i]+";'>&#9632;</span></td>";
			} else {
				table += "<td>" + rowData[i][k] + "</td>";
			}
		}
		table += "</tr>";
	}
	table += "</tr></tbody></table></div>";
	sessionStorage.setItem('table', table);
	$("#data-div").replaceWith(table);
}

function currData(){
	var info = getTableData();
	var rowData = info[0];
	var header = info[1];
	header.unshift("Region");
	header.unshift("County");
	var caption = info[2];
	var text = header.join(", ") + "\n";
	for (var i = 0; i < rowData.length; i++){
		text += rowData[i].join(", ") + "\n";
	}
  var zip = new JSZip();
	zip.file("county-data.csv", text);
	zip.generateAsync({type:"blob"}).then(function (blob) {
    saveAs(blob, "county-data.zip");
	});
}

function allData(){
	var header = Object.keys(databook['2009'][0]);
	var years = Object.keys(databook);
	var text = header.join(", ") + "\n";
	var zip = new JSZip();
	var folder = zip.folder("county-data");
	for (var k = 0; k < years.length; k++){
		if (years[k] == "Outline" || years[k] == "Region" ){
			continue;
		}
		for(var i = 0; i < databook[years[k]].length; i++){
			var row = [];
			for(var j = 0; j < header.length; j++){
				row.push(databook[years[k]][i][header[j]]);
			}	
			text += row.join(", ") + "\n";
		}
		folder.file(years[k]+".csv", text);
	}
	zip.generateAsync({type:"blob"}).then(function (blob) {
		saveAs(blob, "county-data.zip");
	});
}

function genGraph(){
	sessionStorage.setItem('graph', JSON.stringify(graph));
	$("#container").highcharts(graph);
	fillTable();
	$("#stats-div").replaceWith(statTable(false));
}
