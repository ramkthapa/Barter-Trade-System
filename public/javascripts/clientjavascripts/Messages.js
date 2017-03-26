/**
 * Created by ESSEL on 12-Mar-15.
 */
$(document).ready(function () {

    var searchcustomer = location.protocol + '//' + location.host + '/search?key=%QUERY';
    var searchemail = location.protocol + '//' + location.host + '/searchemail';
    var host = location.protocol + '//' + location.host + '/sendmessages';
    var to, subject, text;
    $('input.typeahead').typeahead({
        order: "asc",
        name: 'countries',
        remote: searchcustomer,
        limit: 10
    });
    $("#typeahead").keyup(function () {
        customername = $("#typeahead").val();
        $.get(searchemail, {name: customername}, function (data) {
            if (data) {
                $("#to").val(data);
            }
        })
    });
    $("#typeahead").mouseleave(function () {
        customername = $("#typeahead").val();
        $.get(searchemail, {name: customername}, function (data) {
            if (data) {
                $("#to").val(data);
            }
        })
    });
    $("#send_email").click(function () {
        if (validateform() == false) {
            return;
        }
        to = $("#to").val();
        subject = $("#subject").val();
        text = $("#content").val();
        $("#message").text("Sending E-mail...Please wait");
        $.get(host, {to: to, subject: subject, text: text}, function (data) {
            if (data == "sent") {
                notify();
                clearForm();
            }
            $("#message").empty();

        });
    });
});
function validateform() {
    if (document.getElementById("to").value == "") {
        errornotify();
        return false

    } else if (document.getElementById("subject").value == "") {
        errornotify();
        return false
    } else if (document.getElementById("message").value == "") {
        errornotify();
        return false
    } else {
        return true
    }

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