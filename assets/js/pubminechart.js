var PUBMINECHART = {}

$(function() {
    $('#searchtext').focus()
})

$('#searchform').on('submit', function(e) {
    e.preventDefault()
    var url = 'http://molgenis27.target.rug.nl/pubmine/chartjs/'
    if ($('#searchtext').val()) {
        url += $('#searchtext').val()
    } else {
        url += $('#searchtext').attr('placeholder')
    }
    if ($('#overallcheckbox').is(':checked')) {
        url += '?overall'
    }
    window.location.href = url
})

function getMaxValue(chartData) {
    var max = 0;
    for (var i = 0; i < chartData.datasets.length; i++) {
        for (var j = 0; j < chartData.datasets[i].data.length; j++) {
            max = Math.max(max, chartData.datasets[i].data[j])
        }
    }
    return max;
}

function addLegend(data) {

    var legend =
        '<div id="legend" style="padding: 20px; font-family: GG; line-height: 1.2">' +
        '<span>' + data.query + '</span><br/>'

    for (var i in data.datasets) {
        var color = data.datasets[i].strokeColor
        var opacity = 1
        var included = true
        legend += '<div class="journalLabel" style="color: ' + color + ';">'
        legend += '<span id="journal' + i + '" class="journalName" style="opacity: ' + opacity + '">'
        legend += data.datasets[i].label + '</span>'
        legend += '</div>'
    }

    legend += '</div>'

    $('#chart').after(legend)
}

PUBMINECHART.showError = function(error) {
    $('#searchform').after('<div>' + error + '</div>')
}

PUBMINECHART.updateForm = function(data) {
    $('#searchtext').val(data.query)
    if (data.overall) {
        $('#overallcheckbox').prop('checked', true)
    }
}

PUBMINECHART.chart = function(data) {

    var chartOptions = {
        datasetFill: false,
        datasetStrokeWidth: 3,
        pointDotRadius: 4,
        scaleBeginAtZero: true,
        scaleFontSize: 16,
        animation: false,
        animationEasing: "easeOutQuart",
        responsive: false
    }

    if (data.datasets[0].counts) { // data are percentages
        chartOptions.scaleLabel = "<%= value %> %"
        chartOptions.multiTooltipTemplate = "<%= value %> %"
        var max = getMaxValue(data);
        if (max < 2) {
            chartOptions.scaleOverride = true
            chartOptions.scaleSteps = 2
            chartOptions.scaleStepWidth = 1
        }
    }

    var ctx = $('#chart').get(0).getContext('2d')
    new Chart(ctx).Line(data, chartOptions)
    addLegend(data)
}