function plot_populate_by_year(statename) {
    var years = [];
    var actuals = [];
    var vep = [];
    var vap = [];
    var stateId;

    var bar = new Promise((resolve, reject) => {
        $.ajax({
            url: '/state-codes/states/' + statename,
            type: 'GET',
            success: function (statecode) {
                if (statecode) {
                    stateId = statecode.Id;
                    $.ajax({
                        url: '/state-voter-turnout/historic/all/' + stateId,
                        type: 'GET',
                        success: function (data) {
                            if (data) {
                                actuals = data;
                                $.ajax({
                                    url: '/state-voter-turnout/years',
                                    type: 'GET',
                                    success: function (y) {
                                        if (y) { years = y; }
                                        resolve();
                                    },
                                    error: function (request, error) { resolve(); }
                                });
                            }
                            else { resolve(); }
                        },
                        error: function (request, error) { resolve(); }
                    });
                }
                else { resolve(); }
            },
            error: function (request, error) { resolve(); }
        });
    });
    bar.then(() => {
        for (x of actuals) {
            vep.push(x.VotingEligiblePop);
            vap.push(x.VotingAgePop);
        }
        $("state-pop-line").html("");

        var trace1 = {
            x: years,
            y: vep,
            type: "scatter",
            mode: "lines+markers",
            name: "Voting Eligible Population",
            marker: {
                size: 6
            }
        };
        var trace2 = {
            x: years,
            y: vap,
            type: "scatter",
            mode: "lines+markers",
            name: "Voting Age Population",
            marker: {
                size: 6
            }
        };

        var chart_data = [trace1, trace2];

        var titleText = "Voting Eligible and Voting Age Population for " + statename;
        var chart_layout = {
            yaxis: { title: "Population" },
            xaxis: { title: "Years" },
            title: { text: titleText }
        };

        Plotly.newPlot("state-pop-line", chart_data, chart_layout);
    });
}

function plot_state_by_year(statename) {
    var years = [];
    var extra_years = [2016, 2018, 2020, 2022, 2024];
    var actuals = [];
    var predicted = [];
    var actual_turnout = [];
    var predicted_turnout = [];
    var counted = [];
    var stateId;

    var bar = new Promise((resolve, reject) => {
        $.ajax({
            url: '/state-codes/states/' + statename,
            type: 'GET',
            success: function (statecode) {
                if (statecode) {
                    stateId = statecode.Id;
                    $.ajax({
                        url: '/state-voter-turnout/historic/all/' + stateId,
                        type: 'GET',
                        success: function (hist_data) {
                            if (hist_data) {
                                actuals = hist_data;
                                $.ajax({
                                    url: '/state-voter-turnout/years',
                                    type: 'GET',
                                    success: function (y) {
                                        if (y) {
                                            years = y;
                                            (years.concat(extra_years)).forEach(function (i) {
                                                $.ajax({
                                                    url: '/state-voter-turnout/predict/state/' + i + '/' + stateId + '/0/0',
                                                    type: 'GET',
                                                    success: function (data) {
                                                        if (data) {
                                                            predicted.push(data[0])
                                                        }
                                                        counted.push(0);
                                                    },
                                                    error: function (request, error) {
                                                        resolve();
                                                    }
                                                })
                                                    .done(() => {
                                                        if ((years.concat(extra_years)).length == counted.length) {
                                                            resolve();
                                                        }
                                                    });
                                            });
                                        }
                                        else { resolve(); }
                                    }
                                });
                            }
                        },
                        error: function (request, error) { resolve(); }
                    });
                }
                else { resolve(); }
            },
            error: function (request, error) { resolve(); }
        });
    });
    bar.then(() => {
        for (x of actuals) {
            actual_turnout.push(x.VoterTurnout);
        }
        for (x of predicted) {
            predicted_turnout.push(x.VoterTurnout);
        }
        $("state-line").html("");

        var trace1 = {
            x: years,
            y: actual_turnout,
            type: "scatter",
            mode: "markers",
            name: "Actual",
            marker: {
                size: 12
            }
        };
        var trace2 = {
            x: years.concat(extra_years),
            y: predicted_turnout,
            mode: "lines+markers",
            type: "scatter",
            name: "Predicted"
        };

        var chart_data = [trace1, trace2];

        var titleText = "Predicted vs Actual Voter Turnout Percent for " + statename;
        var chart_layout = {
            yaxis: { title: 'Voter Turnout %' },
            xaxis: { title: 'Years' },
            title: { text: titleText }
        };

        Plotly.newPlot("state-line", chart_data, chart_layout);
    });
}

// function get_state_years(_callback) {
//     var years = [];
//     var bar = new Promise((resolve, reject) => {
//         $.ajax({
//             url: '/state-voter-turnout/years',
//             type: 'GET',
//             success: function (data) {
//                 if (data) {
//                     years = data;
//                     resolve();
//                 }
//                 else {
//                     years = [];
//                     resolve();
//                 }
//             },
//             error: function (request, errr) {
//                 years = [];
//                 resolve();
//             }
//         });
//     });
//     bar.then(() => {
//         lastYear = years.slice(-1)[0]
//         if (lastYear) {
//             futureYears = [];
//             for (i = 1; i <= 5; i++) {
//                 futureYears.push((i * 2) + lastYear);
//             }
//             years = years.concat(futureYears);
//         }
//         _callback(years);
//     });
// }

function get_predicted_state_data(year, statecode, _callback) {
    var stateConfig = {};
    var bar = new Promise((resolve, reject) => {
        $.ajax({
            url: '/state-voter-turnout/predict/state/' + year + '/' + statecode + '/0/0',
            type: 'GET',
            success: function (sd) {
                if (sd) {
                    stateConfig = {
                        turnout: sd[0].VoterTurnout,
                        vep: sd[0].VotingEligiblePop,
                        vap: sd[0].VotingAgePop,
                        name: $("#state_id").val(),
                        color: colorPercent((sd[0].VoterTurnout * 100))
                    };
                }
                else { stateConfig = { turnout: 0, vep: 0, vap: 0, name: $("#state_id").val(), color: '#D3D3D3' }; }
                resolve();
            },
            error: function (request, error) {
                stateConfig[abbr] = { turnout: 0, vep: 0, vap: 0, name: $("#state_id").val(), color: '#D3D3D3' };
                resolve();
            }
        });
    });
    bar.then(() => {
        _callback(stateConfig);
    })
}

function get_historic_state_data(year, statecode, _callback) {
    var stateData = {};
    var stateConfig = {};
    var bar = new Promise((resolve, reject) => {
        $.ajax({
            url: '/state-voter-turnout/historic/' + year + '/' + statecode,
            type: 'GET',
            success: function (data) {
                if (data && data.length > 0) {
                    stateData = data[0];
                }
                resolve();
            },
            error: function (request, error) {
                stateData = {};
                resolve();
            }
        });
    });
    bar.then(() => {
        if (Object.keys(stateData).length > 0) {
            stateConfig = {
                turnout: stateData.VoterTurnout,
                vep: stateData.VotingEligiblePop,
                vap: stateData.VotingAgePop,
                name: $("#state_id").val(),
                color: colorPercent((stateData.VoterTurnout * 100))
            };
        }
        else {
            stateConfig = {
                turnout: 0,
                vep: 0,
                vap: 0,
                name: $("#state_id").val(),
                color: '#D3D3D3'
            };
        }
        _callback(stateConfig);
    });
}

// function populate_state(year, statecode) {
//     $("#statesvg").empty();
//     if ($('#state-type-buttons input:radio:checked').val() == 'actual') {
//         get_historic_state_data(year, statecode, (d) => {
//             //uStates.draw("#statesvg", d);
//             //d3.select(self.frameElement).style("height", "150px");
//         });
//     }
//     else {
//         get_predicted_state_data(year, statecode, (d) => {
//             //uStates.draw("#statesvg", d, tooltipHtml);
//             //d3.select(self.frameElement).style("height", "150px");
//         });
//     }
// }

$(function () {
    //var state_year_dropdown = d3.select("#state-year-select");
    //var selected_year;
    //var statecode;
    // var bar = new Promise((resolve, reject) => {
    //     get_state_years((a) => {
    //         a.forEach(x => {
    //             state_year_dropdown.append("option").text(x).property(x);
    //         });
    //         selected_year = a[0];
    //         $.ajax({
    //             url: '/state-codes/states/' + $("#state_id").val(),
    //             type: 'GET',
    //             success: function (data) {
    //                 if(data) {
    //                     statecode = data.Id;
    //                 }
    //                 resolve();
    //             },
    //             error: function (request, error) { resolve(); }
    //         });
    //     });
    // });
    //bar.then(() => {
    //    plot_state_by_year($("#state_id").val());
        //populate_state(selected_year, statecode);
    //});
    plot_state_by_year($("#state_id").val());
    plot_populate_by_year($("#state_id").val());
});