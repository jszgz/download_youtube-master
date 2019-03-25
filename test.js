var timer;
var lastcheck = 0;
var startTime = new Date().getTime();

function load() {
    $("#ticket_progressbar").progressbar({value: 0, disabled: true});
    $("#download_progressbar").progressbar({value: 0, disabled: true});
    $("#convert_progressbar").progressbar({value: 0, disabled: true});
    setTimeout('reload()', 60000);
}

function reload() {
}

function check(step) {
    timer = setTimeout('check("' + step + '")', 10000);
    var date = new Date();
    $.ajax({
        url: statusurl, dataType: 'jsonp', timeout: 10000, starttime: date.getTime(), success: function (data) {
            if (this.starttime > lastcheck) {
                lastcheck = this.starttime;
                clearTimeout(timer);
                if (data.error != null) {
                    $('#error').html(data.error);
                    $('#error').fadeIn();
                    ga('send', 'exception', {
                        'exDescription': data.error ? data.error : 'Empty response',
                        'exFatal': false
                    });
                    return;
                }
                if (data["status"] && step != data["status"]["@attributes"]["step"]) {
                    $("#" + step).toggleClass('disabled', 500);
                    $("#" + step + "_progressbar").progressbar({value: 100,});
                    if (data["status"]["@attributes"]["step"] != 'error') {
                        step = data["status"]["@attributes"]["step"];
                        $("#" + step).toggleClass('disabled', 500);
                    }
                }
                if (step == 'finished') {
                    page_change("/download/" + data.id + "/" + data.videoid + "/");
                    var conversionTime = (new Date().getTime()) - startTime;
                    ga('send', 'timing', 'Conversion', 'Conversion Time', conversionTime);
                    return;
                }
                if (step == 'changeserver') {
                    statusurl = statusurl.replace(new RegExp(data.server, "g"), data["status"]["@attributes"]["info"]);
                }
                if (data["status"]) {
                    $("#" + step + "_progressbar").progressbar({value: parseInt(data["status"]["@attributes"]["percent"]),});
                    $("#" + step + "_percent").html(data["status"]["@attributes"]["percent"] + "%");
                }
                if (step == 'ticket') {
                    document.title = '(' + data["status"]["@attributes"]["percent"] + '%) ' + lang_waiting + ' ' + filename;
                } else if (step == 'download') {
                    document.title = '(' + data["status"]["@attributes"]["percent"] + '%) ' + lang_grabbing + ' ' + filename;
                    $("#ticket_progressbar").progressbar({value: 100});
                } else if (step == 'convert') {
                    document.title = '(' + data["status"]["@attributes"]["percent"] + '%) ' + lang_converting + ' ' + filename;
                    $("#ticket_progressbar").progressbar({value: 100});
                    $("#download_progressbar").progressbar({value: 100});
                }
                if (data.warning != null) {
                    $('#warning').show();
                    $('#warning').html(data.warning);
                } else {
                    $('#warning').hide();
                }
                $("#" + step + "_info").html(data["status"]["@attributes"]["info"]);
                timer = setTimeout('check("' + step + '")', 3000);
            }
        }, error: function (xhr, status, errorThrown) {
            clearTimeout(timer);
            $('#warning').show();
            $('#warning').html("There seems to be a problem with the connection to the conversion server. Please refresh or start the conversion again!");
            timer = setTimeout('check("' + step + '")', 3000);
        }
    });
}