/**
 * Created by ESSEL on 10-Mar-15.
 */
$(document).ready(function () {

    var linktype = "";
    var hostproduct = location.protocol + '//' + location.host + '/searchproduct?key=%QUERY';
    var hostservice = location.protocol + '//' + location.host + '/searchservice?key=%QUERY';
    var hostproductID = location.protocol + '//' + location.host + '/searchproductID';
    var hostserviceID = location.protocol + '//' + location.host + '/searchserviceID';
    var host = location.protocol + '//' + location.host + '/sendmessages';


    //for searching for products
    $('#typeahead').typeahead({
        name: 'countries',
        remote: hostproduct,
        limit: 10
    });
    //for searching for services
    $('#typeaheadservice').typeahead({
        name: 'service',
        remote: hostservice,
        limit: 10
    });
//for productID's
    $("#subject").mouseleave(function () {
        if ($(document.getElementById("TradeOptionProduct")).attr("value") === "Product") {
            var productname = $("#typeahead").val();
            $.get(hostproductID, {name: productname}, function (data) {
                if (data) {
                    //send a link to customer
                    var urllink = location.protocol + '//' + location.host + '/ProductOffers/' + data;
                    linktype = urllink;
                    $("#productlink").val(urllink);
                }
            })
        }
    });
    //for service ID's
    $("#subjectservice").mouseleave(function () {
        if ($(document.getElementById("TradeOptionService")).attr("value") === "Service") {
            var servicename = $("#typeaheadservice").val();
            $.get(hostserviceID, {name: servicename}, function (data) {
                if (data) {
                    var urllink = location.protocol + '//' + location.host + '/ServiceOffers/' + data;
                    linktype = urllink;
                    $("#servicelink").val(urllink);
                }
            })
        }
    });
    var to, subject, text, html;
    $("#send_email").click(function () {
        if (validateform() === false) {
            return;
        }
        to = $("#to").val();
        subject = $("#subject").val();
        text = $("#content").val();
        html = linktype;
        $("#message").text("Sending E-mail...Please wait");
        $.get(host, {to: to, subject: subject, text: text, html: html}, function (data) {
            if (data == "sent") {
                clearForm();
                notify();
            }
            $("#message").empty();

        });
    });
    $("#send_emailservice").click(function () {

        if (validateserviceform() === false) {
            return;
        }
        to = $("#toservice").val();
        subject = $("#subjectservice").val();
        text = $("#contentservice").val();
        html = linktype;
        $("#messageservice").text("Sending E-mail...Please wait");
        $.get(host, {to: to, subject: subject, text: text, html: html}, function (data) {
            if (data == "sent") {
                clearFormService();
                notify();
            }
            $("#messageservice").empty();

        });
    });
    $('input[type="radio"]').click(function () {
        if ($(this).attr("value") === "Product") {
            $("#ServiceContent").hide();
            $("#ProductContent").show();
        }
        if ($(this).attr("value") === "Service") {
            $("#ProductContent").hide();
            $("#ServiceContent").show();

        }
    });
    $("#ServiceContent").hide();
});
function validateform() {
    var optionP = document.getElementById("TradeOptionProduct").checked;
    if (document.getElementById("to").value == "") {
        errornotify();
        return false

    } else if (document.getElementById("subject").value == "") {
        errornotify();
        return false
    } else if (document.getElementById("message").value == "") {
        errornotify();
        return false
    } else if ((optionP) == false) {
        errornotify();
        return false
    } else {
        return true
    }

}
function validateserviceform() {
    if (document.getElementById("toservice").value === "") {
        errornotify();
        return false

    } else if (document.getElementById("subjectservice").value === "") {
        errornotify();
        return false
    } else if (document.getElementById("contentservice").value === "") {
        errornotify();
        return false
    } else if ((document.getElementById("TradeOptionService").checked ) == false) {
        errornotify();
        return false
    } else {
        return true
    }

}
function clearFormService() {
    document.getElementById("contactservice").reset();
}
function clearForm() {
    document.getElementById("contact").reset();

}
function notify() {
    $(this).notifyMe(
        'bottom', // Position
        'success', // Type
        'Message Sent', // Title
        'Your message has successfully been delivered to customer', // Description
        200,// Velocity of notification
        2000 // (optional) Time of delay to close automatically
    );
}
function errornotify() {
    $(this).notifyMe(
        'bottom', // Position
        'error', // Type
        'Required Field *', // Title
        'Sorry!, your message cannot be sent.Please check and complete all required fields marked with (*).', // Description
        200,// Velocity of notification
        2000 // (optional) Time of delay to close automatically
    );
}