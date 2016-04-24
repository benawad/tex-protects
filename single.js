var graph =	$.parseJSON(sessionStorage.getItem('graph'));
$("#container").highcharts(graph);
var table = sessionStorage.getItem("table");
$("#data-table").replaceWith(table);
