$(document).ready(function() {
    console.log(urlObj());
    console.log(urlObj().FNAME);
    console.log(urlObj().LNAME);



});


$('#listImport').submit(function(e) {
    e.preventDefault();

    let input = $('#upload')[0].files[0];

    if(!input){
        alert('No file selected.');
        return;
    }

    let reader = new FileReader();
    reader.readAsText(input);
    reader.onload = function(event) {
        let csv = event.target.result;
        let data = $.csv.toObjects(csv);

        for (let i=0; i<data.length; i++) {
            console.log(data[i]);
            db.collection('lists').doc('List 1').collection('members').add(data[i])
                .then(function(docRef) {
                    console.log('Document written with ID: ', docRef.id);
                })
                .catch(function(error) {
                    console.error('Error adding document: ', error);
                });

        }
    }

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