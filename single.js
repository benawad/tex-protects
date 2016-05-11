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
Highcharts.setOptions(Highcharts.theme);

var graph = $.parseJSON(sessionStorage.getItem('graph'));
if(graph == null){
	graph = $.parseJSON(sessionStorage.getItem('graph'));
}
graph['legend'] = {
	itemStyle: {
		font: '14pt Trebuchet MS, Verdana, sans-serif'
	},
	verticalAlign: 'top'
};
console.log(graph);
$("#container").highcharts(graph);
var statsTable = sessionStorage.getItem('statsTable');
if (statsTable == null){
	statsTable = sessionStorage.getItem('statsTable');
}
$("#stats-table").replaceWith(statsTable);
var table = sessionStorage.getItem("table");
if (table == null){
	table = sessionStorage.getItem("table");
}
$("#data-table").replaceWith(table);

function makeTable(data, id, caption){
	var html = "<table id='"+id+"' class='table table-striped'>";
	if(caption){
		html += "<caption>" + caption + "</caption>";
	}
	html += "<thead><tr>";
	var keys = Object.keys(data[0]);
	for(var j = 0; j < 2; j++){
		html += "<th>" + data[0][keys[j]] + "</th>";
	}
	html += "</tr></thead>";
	html += "<tbody>";
	for(var i = 1; i < data.length; i++){
		html += "<tr>";
		for(var j = 0; j < 2; j++){
			html += "<td>" + data[i][keys[j]] + "</td>";
		}
		html +="</tr>";
	}
	html += "</tbody>";
	html += "</table>";
	return html;
}

$.getJSON("finance.json", function(finance){
	$("#finance").empty();
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
	$("#finance").append(makeTable(rows, "", ""));
});
