
$(document).ready(function() {
    console.log(urlObj());
    console.log(urlObj().FNAME);
    console.log(urlObj().LNAME);
});


function urlObj() {
    let urlParams = new URLSearchParams(window.location.search);

    let url = {};
    let entries = urlParams.entries();
    for(pair of entries) {
        url[pair[0]] = pair[1];
    }
    return url;
}