/**
 * Created by ESSEL on 12-Mar-15.
 */
function PreviewImage() {
    var oFReader = new FileReader();
    oFReader.readAsDataURL(document.getElementById("uploadgrpimg").files[0]);
    oFReader.onload = function (oFREvent) {
        document.getElementById("goupimg").src = oFREvent.target.result;
    };

};
function clearForm() {
    document.getElementById("contact").reset();
}
function validateform() {

    if (document.getElementById("GroupName").value == "") {
        errornotify();
        return false
    } else if (document.getElementById("GroupPhoto").value == "") {
        errornotify();
        return false
    } else {
        return true
    }

}
function errornotify() {
    $(this).notifyMe(
        'bottom', // Position
        'error', // Type
        'Required Field *', // Title
        'Sorry!, Group cannot be created.Please check and complete all required fields marked with (*).', // Description
        200,// Velocity of notification
        2000 // (optional) Time of delay to close automatically
    );
}

