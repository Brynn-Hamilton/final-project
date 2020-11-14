function tooltipHtml(n, val) {	/* function to create html content string in tooltip div. */
    if (val.turnout === 0) {
        return "<h4>" + n + "</h4><table>" +
            "<tr><td style='text-align:left'>Turnout&nbsp;Rate</td><td style='text-align:right'>N/A</td></tr>" +
            "<tr><td style='text-align:left'>Voter&nbsp;Eligible&nbsp;Pop&nbsp;</td><td style='text-align:right'>N/A</td></tr>" +
            "<tr><td style='text-align:left'>Voter&nbsp;Age&nbsp;Pop&nbsp;</td><td style='text-align:right'>N/A</td></tr>" +
            "</table>";
    }
    else {
        return "<h4>" + n + "</h4><table>" +
            "<tr><td style='text-align:left'>Turnout&nbsp;Rate</td><td style='text-align:right'>" + (val.turnout * 100).toFixed(2) + "%</td></tr>" +
            "<tr><td style='text-align:left'>Voter&nbsp;Eligible&nbsp;Pop&nbsp;</td><td style='text-align:right'>" + numberWithCommas(val.vep) + "</td></tr>" +
            "<tr><td style='text-align:left'>Voter&nbsp;Age&nbsp;Pop&nbsp;</td><td style='text-align:right'>" + numberWithCommas(val.vap) + "</td></tr>" +
            "</table>";
    }
}

function colorPercent(percentValue) {
    return rgbToHex((100 - percentValue) * 2.56, 0, percentValue * 2.56)
}

function componentToHex(c) {
    var hex = Math.trunc(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var states = ["HI", "AK", "FL", "SC", "GA", "AL", "NC", "TN", "RI", "CT", "MA",
    "ME", "NH", "VT", "NY", "NJ", "PA", "DE", "MD", "WV", "KY", "OH",
    "MI", "WY", "MT", "ID", "WA", "DC", "TX", "CA", "AZ", "NV", "UT",
    "CO", "NM", "OR", "ND", "SD", "NE", "IA", "MS", "IN", "IL", "MN",
    "WI", "MO", "AR", "OK", "KS", "LA", "VA"];

function get_predicted_state_data(year, _callback) {
    var stateConfigs = {};
    var bar = new Promise((resolve, reject) => {
        states.forEach(function (d) {
            $.ajax({
                url: '/state-codes/abbr/' + d,
                type: 'GET',
                success: function (data) {
                    if (data) {
                        var id = data.Id;
                        $.ajax({
                            url: '/state-voter-turnout/predict/' + year + '/' + id + '/0/0',
                            type: 'GET',
                            success: function (sd) {
                                stateConfigs[d] = {
                                    turnout: sd[0].VoterTurnout,
                                    vep: sd[0].VotingEligiblePop,
                                    vap: sd[0].VotingAgePop,
                                    color: colorPercent((sd[0].VoterTurnout * 100))
                                };
                                if (Object.keys(stateConfigs).length === states.length) {
                                    resolve();
                                }
                            },
                            error: function (request, error) {
                                stateConfigs[d] = { turnout: 0, vep: 0, vap: 0, color: '#D3D3D3' };
                                if (Object.keys(stateConfigs).length === states.length) {
                                    resolve();
                                }
                            }
                        });
                    }
                    else {
                        stateConfigs[d] = { turnout: 0, vep: 0, vap: 0, color: '#D3D3D3' };
                        if (Object.keys(stateConfigs).length === states.length) {
                            resolve();
                        }
                    }
                },
                error: function (request, error) {
                    stateConfigs[d] = { turnout: 0, vep: 0, vap: 0, color: '#D3D3D3' };
                    if (Object.keys(stateConfigs).length === states.length) {
                        resolve();
                    }
                }
            });
        });
    });
    bar.then(() => {
        _callback(stateConfigs);
    });
}

function get_historic_state_data(year, _callback) {
    var stateData = [];
    var stateMapping = [];
    var stateConfigs = {};
    var bar = new Promise((resolve, reject) => {
        states.forEach(function (d) {
            $.ajax({
                url: '/state-voter-turnout/historic/' + year,
                type: 'GET',
                success: function (data) {
                    if (data) {
                        stateData = data;
                        $.ajax({
                            url: '/state-codes',
                            type: 'GET',
                            success: function (data) {
                                if (data) {
                                    stateMapping = data;
                                }
                                resolve();
                            },
                            error: function (request, error) {
                                stateMapping = [];
                                resolve();
                            }
                        });
                    }
                    else {
                        resolve();
                    }
                },
                error: function (request, error) {
                    stateData = [];
                    resolve();
                }
            });
        });
    });
    bar.then(() => {
        for (x of states) {
            stateCode = stateMapping.find(e => e.Abbreviation == x).Id;
            h = stateData.find(e => e.StateCode == stateCode);
            if (h) {
                stateConfigs[x] = {
                    turnout: h.VoterTurnout,
                    vep: h.VotingEligiblePop,
                    vap: h.VotingAgePop,
                    color: colorPercent((h.VoterTurnout * 100))
                };
            }
            else {
                stateConfigs[x] = {
                    turnout: 0,
                    vep: 0,
                    vap: 0,
                    color: '#D3D3D3'
                };
            }
        }
        _callback(stateConfigs);
    });
}

function get_state_years(_callback) {
    var years = [];
    var bar = new Promise((resolve, reject) => {
        $.ajax({
            url: '/state-voter-turnout/years',
            type: 'GET',
            success: function (data) {
                if (data) {
                    years = data;
                    resolve();
                }
                else {
                    years = [];
                    resolve();
                }
            },
            error: function (request, errr) {
                years = [];
                resolve();
            }
        });
    });
    bar.then(() => {
        lastYear = years.slice(-1)[0]
        if (lastYear) {
            futureYears = [];
            for (i = 1; i <= 5; i++) {
                futureYears.push((i * 2) + lastYear);
            }
            years = years.concat(futureYears);
        }
        _callback(years);
    });
}

function populate_state_map(year) {
    $("#statesvg").empty();
    if ($('#state-type-buttons input:radio:checked').val() == 'actual') {
        get_historic_state_data(year, (d) => {
            uStates.draw("#statesvg", d, tooltipHtml);
            d3.select(self.frameElement).style("height", "600px");
        });
    }
    else {
        get_predicted_state_data(year, (d) => {
            uStates.draw("#statesvg", d, tooltipHtml);
            d3.select(self.frameElement).style("height", "600px");
        });
    }
}

function plot_us_by_year() {
    var years = [];
    var extra_years = [2020, 2022, 2024, 2026, 2028];
    var actuals = [];
    var predicted = [];
    var future = [];
    var actual_turnout = [];
    var predicted_turnout = [];

    var bar = new Promise((resolve, reject) => {
        $.ajax({
            url: '/us-voter-turnout/historic',
            type: 'GET',
            success: function (hist_data) {
                if (hist_data) {
                    actuals = hist_data;
                    $.ajax({
                        url: '/us-voter-turnout/predict/all',
                        type: 'GET',
                        success: function (pred_data) {
                            if (pred_data) {
                                predicted = pred_data;
                                $.ajax({
                                    url: '/us-voter-turnout/years',
                                    type: 'GET',
                                    success: function (y) {
                                        if (y) {
                                            years = y;
                                        }
                                        extra_years.forEach(function (i) {
                                            $.ajax({
                                                url: '/us-voter-turnout/predict/' + i + '/' + (((2036 - i)%4) === 0 ? 1 : 0),
                                                type: 'GET',
                                                success: function (data) {
                                                    if (data) {
                                                        future.push(data[0])
                                                    }
                                                },
                                                error: function(request, error) {
                                                    resolve();
                                                }
                                            })
                                            .done(() => {
                                                if (future.length == extra_years.length) {
                                                    resolve();
                                                }
                                            });
                                        });
                                    },
                                    error: function (request, error) {
                                        resolve();
                                    }
                                });
                            }
                            else { resolve(); }
                        },
                        error: function (request, error) {
                            resolve();
                        }
                    });
                }
                else { resolve(); }
            },
            error: function (request, error) {
                resolve();
            }
        });
    });
    bar.then(() => {
        for (x of actuals) {
            actual_turnout.push(x.VoterTurnout);
        }
        for (x of predicted) {
            predicted_turnout.push(x.VoterTurnout);
        }
        for (x of future) {
            predicted_turnout.push(x.VoterTurnout);
        }
        $("us-line").html("");

        var trace1 = {
            x: years,
            y: actual_turnout,
            type: "scatter",
            mode: "markers",
            name: 'Actual',
            marker: {
                size: 12
            }
        };

        var trace2 = {
            x: years.concat(extra_years),
            y: predicted_turnout,
            mode: "lines+markers",
            type: "scatter",
            name: 'Predicted'
        };
        
        var chart_data = [trace1, trace2];

        var titleText = "Predicted vs Actual Voter Turnout Percent for the United States";
        var chart_layout = {
            yaxis: { title: 'Voter Turnout %' },
            xaxis: { title: 'Years' },
            title: { text: titleText }
        };

        Plotly.newPlot("us-line", chart_data, chart_layout);
    });
}

$(function () {
    var state_year_dropdown = d3.select("#state-year-select");
    var selected_year;
    var bar = new Promise((resolve, reject) => {
        get_state_years((a) => {
            a.forEach(x => {
                state_year_dropdown.append("option").text(x).property(x);
            });
            selected_year = a[0];
            resolve();
        });
    });
    bar.then(() => {
        populate_state_map(selected_year);
        plot_us_by_year();
    });
});