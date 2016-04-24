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

var graph =	$.parseJSON(sessionStorage.getItem('graph'));
console.log(graph);
$("#container").highcharts(graph);
var table = sessionStorage.getItem("table");
$("#data-table").replaceWith(table);
