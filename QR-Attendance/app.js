// ========== [ Globals ] ==========
let user = {
    FNAME: null,
    LNAME: null,
    EMAIL: null,
    PHONE: null,

    ATTENDANCE:null,

    ARRIVAL: false,
    DEPARTURE: false,

    FOUND: false
};

let members = {};

let list = "b4c0f0a45f"; // MailChimp List ID
let mailChimpAPIKey = "d071ed5ac532f38747685cc50802ec88-us16";


// ========== [ Events ] ==========

// Page Load
$(document).ready(function() {
    // Init Materialize
    M.AutoInit();

    // Get Members
    getMembers();

    // Init User
    Object.assign(user, urlObj());

    // Display Card
    let card = $('#card');

    checkUser();

    countMembers();

});

// Add Member
$('#addForm').submit(function(e) {
    e.preventDefault();

    let form = document.getElementById("addForm");

    db.collection('lists').doc('List 1').collection("members").add({
        FNAME: form.user_FNAME.value,
        LNAME: form.user_LNAME.value,
        EMAIL: form.user_EMAIL.value,
        PHONE: form.user_PHONE.value,
    });

    form.user_FNAME.value = '';
    form.user_LNAME.value = '';
    form.user_EMAIL.value = '';
    form.user_PHONE.value = '';

});

// Admin CVS Import
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
$('#test').click(function() {

    db.collection('lists').doc('List 1').collection("members").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {

            let keys = ['ARRIVAL', 'ATTENDANCE', 'DEPARTURE', 'EMAIL', 'FNAME', 'LNAME', 'LEID', 'NOTES', 'PHONE', 'RENT'];

            keys.forEach(function(key){
                let docData = doc.data();
                if (docData[key] == null) {
                    let dataobj = {};
                    dataobj[key] = '';
                    db.collection('lists').doc('List 1').collection("members").doc(doc.id).set(dataobj,
                        { merge: true }).then(function () {
                        console.log('Added '+ key +' to ' + doc.id);
                    });
                }
            });


        });
    });
});


$('#download').click(function() {
    db.collection('lists').doc('List 1').collection("members").get().then(function(querySnapshot) {
        return querySnapshot.docs.map(function(doc) {
            return doc.data();
        });
    }).then(function (exportArray) {
        console.log(exportArray);
        console.log(exportArray.length);

        let csv ='';
        let items = exportArray;

        let keysAmount = Object.keys(items[0]).length;
        // Loop the array of objects
        for(let row = 0; row < items.length; row++){

            let keysCounter = 0;

            // If this is the first row, generate the headings
            if(row === 0){

                // Loop each property of the object
                for(let key in items[row]){

                    // This is to not add a comma at the last cell
                    // The '\r\n' adds a new line
                    csv += key + (keysCounter+1 < keysAmount ? ',' : '\r\n' );
                    keysCounter++;
                }
                console.log(csv);
            }else{
                for(let key in items[row]){
                    csv += '"' + items[row][key] + '"' + (keysCounter+1 < keysAmount ? ',' : '\r\n' );
                    keysCounter++;
                }
            }

            keysCounter = 0;
        }

// Once we are done looping, download the .csv by creating a link
        let link = document.createElement('a')
        link.id = 'download-csv'
        link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csv));
        link.setAttribute('download', 'yourfiletextgoeshere.csv');
        document.body.appendChild(link)
        document.querySelector('#download-csv').click()

    });





});


//Search
const searchBar = document.forms['searchForm'].querySelector('input');
searchBar.addEventListener('keyup',function(e){
    const term = e.target.value.toLowerCase();
    const users = document.querySelector('#List').getElementsByTagName('li');
    Array.from(users).forEach(function(user){
        const searchKey = user.firstElementChild.innerHTML;
        if(searchKey.toLowerCase().indexOf(term) != -1) {
            user.style.display = 'list-item';
        } else {
            user.style.display = 'none';
        }
    })
});

// ========== [ Functions ] ==========

// Take URL Parameters and create object
function urlObj() {
    let urlParams = new URLSearchParams(window.location.search);

    let url = {};
    let entries = urlParams.entries();
    for(pair of entries) {
        url[pair[0]] = pair[1];
    }
    return url;
}

// Get Members and Create List
function getMembers() {
    getData('lists/'+ list + '/members')
        .then(function (response) {
            members = response;
            console.log(members);
    });
}

// ========== [ API ] ==========

// MailChimp API GET
function getData(endPoint) {
    return new Promise(function (resolve, reject) {
        var settings = {
            "async": true,
            "crossDomain": true,
            // "url": "https://us-central1-sno-club.cloudfunctions.net/snoAPI/",
            "url": "http://localhost:4000/",
            "method": "GET",
            "headers": {
                "cache-control": "no-cache",
                "Postman-Token": "c3adbc9b-07a2-455d-91c0-96b7f584a251"
            }
        }

        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    });
}

// Update Member
function updateMember() {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://us16.api.mailchimp.com/3.0/lists/" + list + "/members/86d52dcb38ae46d9b7671d7e8e3b9546",
        "method": "PATCH",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer d071ed5ac532f38747685cc50802ec88-us16",
            "cache-control": "no-cache",
            "Postman-Token": "13791fbe-cc83-41ff-8e6c-8373a630a0cc"
        },
        "processData": false,
        "data": "{\r\n    \"merge_fields\": {\r\n        \"AF\": false\r\n    }\r\n}"
    }

    $.ajax(settings).done(function (response) {
        console.log(response);
    });
}


// Firebase
/*function checkUser() {
    return new Promise(function(resolve, reject) {
        if (user.EMAIL){
            db.collection('lists').doc('List 1').collection("members")
                .where("EMAIL", "==", user.EMAIL)
                .get()
                .then(function(querySnapshot) {
                    $('#NAME').html(user.FNAME + ' ' + user.LNAME);
                    $('#EMAIL').html(user.EMAIL);
                    $('#PHONE').html(user.PHONE);

                    querySnapshot.forEach(function(doc) {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        Object.assign(user, doc.data());

                        $('#NAME').html(user.FNAME + ' ' + user.LNAME);
                        $('#EMAIL').html(user.EMAIL);
                        $('#PHONE').html(user.PHONE);

                        $('#card').click(function() {
                            window.open('https://us16.admin.mailchimp.com/lists/members/view?id=' + user.LEID, '_blank');
                        });
                        checkIn(doc.id, (new Date().getHours() < 18));
                        if (doc.data().ARRIVAL != '' && doc.data().ARRIVAL) {$('#ARRIVAL').html('check_box')}
                        if (doc.data().DEPARTURE != '' && doc.data().DEPARTURE) {$('#DEPARTURE').html('check_box')}

                        user.FOUND = true;
                    });
                    resolve = (user.FOUND);

                    let card = $('#card');

                    if (user.FOUND) {
                        console.log('User Found');
                        card.addClass('teal');
                        card.show();
                    } else {
                        console.log('User Not Found');
                        card.addClass('red lighten-1');
                        card.show();
                    }


                })
                .catch(function(error) {
                    console.log("Error getting documents: ", error);
                    reject();
                });
        } else {
            $('#NAME').html(user.FNAME + ' ' + user.LNAME);
            $('#EMAIL').html(user.EMAIL);
            $('#PHONE').html(user.PHONE);

            let card = $('#card');

            console.log('User Not Found');
            card.addClass('red lighten-1');
            card.show();
        }

    });
}*/

// Api
function checkUser() {
    return new Promise(function(resolve, reject) {
        if (user.EMAIL){
            db.collection('lists').doc('List 1').collection("members")
                .where("EMAIL", "==", user.EMAIL)
                .get()
                .then(function(querySnapshot) {
                    $('#NAME').html(user.FNAME + ' ' + user.LNAME);
                    $('#EMAIL').html(user.EMAIL);
                    $('#PHONE').html(user.PHONE);

                    querySnapshot.forEach(function(doc) {
                        // doc.data() is never undefined for query doc snapshots
                        console.log(doc.id, " => ", doc.data());
                        Object.assign(user, doc.data());

                        $('#NAME').html(user.FNAME + ' ' + user.LNAME);
                        $('#EMAIL').html(user.EMAIL);
                        $('#PHONE').html(user.PHONE);

                        $('#card').click(function() {
                            window.open('https://us16.admin.mailchimp.com/lists/members/view?id=' + user.LEID, '_blank');
                        });
                        checkIn(doc.id, (new Date().getHours() < 18));
                        if (doc.data().ARRIVAL != '' && doc.data().ARRIVAL) {$('#ARRIVAL').html('check_box')}
                        if (doc.data().DEPARTURE != '' && doc.data().DEPARTURE) {$('#DEPARTURE').html('check_box')}

                        user.FOUND = true;
                    });
                    resolve = (user.FOUND);

                    let card = $('#card');

                    if (user.FOUND) {
                        console.log('User Found');
                        card.addClass('teal');
                        card.show();
                    } else {
                        console.log('User Not Found');
                        card.addClass('red lighten-1');
                        card.show();
                    }


                })
                .catch(function(error) {
                    console.log("Error getting documents: ", error);
                    reject();
                });
        } else {
            $('#NAME').html(user.FNAME + ' ' + user.LNAME);
            $('#EMAIL').html(user.EMAIL);
            $('#PHONE').html(user.PHONE);

            let card = $('#card');

            console.log('User Not Found');
            card.addClass('red lighten-1');
            card.show();
        }

    });
}


function checkIn(docID, Arrival) {
    let doc = db.collection('lists').doc('List 1').collection("members").doc(docID);
    if(Arrival) {
        doc.set({
            ARRIVAL: new Date()
        }, { merge: true });
    } else {
        doc.set({
            DEPARTURE: new Date()
        }, { merge: true });
    }
}

function renderList(doc) {
    var row = document.createElement('div');
    row.className += 'grid-row';


    let li = document.createElement('li');
    li.className = "member";
    li.setAttribute("data-id", doc.id);

    //For Search
    let search = document.createElement('div');
    search.className = 'search hide';
    search.innerHTML = doc.data().FNAME + ' ' + doc.data().LNAME + ' ' + doc.data().EMAIL;

    li.appendChild(search);

    // Header
    let header = document.createElement('div');
    header.className = "collapsible-header";

        let arriveIcon = document.createElement('i');
        arriveIcon.className = "arriveIcon material-icons";
        if (doc.data().ARRIVAL && doc.data().ARRIVAL !='') {
            arriveIcon.innerText = "check_box";
        } else {
            arriveIcon.innerText = "check_box_outline_blank";
        }

        let departIcon = document.createElement('i');
        departIcon.className = "departIcon material-icons";
        if (doc.data().DEPARTURE && doc.data().DEPARTURE !='') {
            departIcon.innerText = "check_box";
        } else {
            departIcon.innerText = "check_box_outline_blank";
        }

    header.appendChild(arriveIcon);
    header.appendChild(departIcon);
    header.innerHTML += (doc.data().FNAME + ' ' + doc.data().LNAME);

    // Body
    let body = document.createElement('div');
    body.className = "collapsible-body";

        let infoRow = document.createElement('div');
        infoRow.className = "row";

            let infoEmail = document.createElement('div');
            infoEmail.className = "col s6";
            infoEmail.innerHTML = doc.data().EMAIL;

            let infoPhone = document.createElement('div');
            infoPhone.className = "col s6";
            infoPhone.innerHTML = doc.data().PHONE;

        infoRow.appendChild(infoEmail);
        infoRow.appendChild(infoPhone);

        let checkInRow = document.createElement('div');
        checkInRow.className = "row";

            let checkInArrive = document.createElement('div');
            checkInArrive.className = "btn waves-effect waves-light";

                let checkInArriveIcon = document.createElement('i');
                checkInArriveIcon.className = "material-icons left";

                if (doc.data().ARRIVAL && doc.data().ARRIVAL !='') {
                    checkInArriveIcon.innerText = "check_box";
                } else {
                    checkInArriveIcon.innerText = "check_box_outline_blank";
                }

                checkInArrive.appendChild(checkInArriveIcon);
                checkInArrive.innerHTML += 'Arrival';

            let checkInDepart = document.createElement('div');
            checkInDepart.className = "btn waves-effect waves-light";

                let checkInDepartIcon = document.createElement('i');
                checkInDepartIcon.className = "material-icons left";

                if (doc.data().DEPARTURE && doc.data().DEPARTURE !='') {
                    checkInDepartIcon.innerText = "check_box";
                } else {
                    checkInDepartIcon.innerText = "check_box_outline_blank";
                }

                checkInDepart.appendChild(checkInDepartIcon);
                checkInDepart.innerHTML += 'Departure';

            checkInRow.appendChild(checkInArrive);
            checkInRow.appendChild(checkInDepart);

        let actionRow = document.createElement('div');
        actionRow.className = "row";

            let profileBtn = document.createElement('a');
            profileBtn.className = "btn waves-effect waves-light blue";
            profileBtn.href = "https://us16.admin.mailchimp.com/lists/members/view?id=" + doc.data().LEID;
            profileBtn.target = "_blank";

            profileBtn.innerHTML += "Profile";

                let profileBtnIcon = document.createElement('i');
                profileBtnIcon.className = "material-icons right";
                profileBtnIcon.innerHTML += "send";

                profileBtn.appendChild(profileBtnIcon);

            let removeBtn = document.createElement('div');
            removeBtn.className = "btn waves-effect waves-light red";
            removeBtn.innerHTML += "Remove";

                let removeBtnIcon = document.createElement('i');
                removeBtnIcon.className = "material-icons white-text right";
                removeBtnIcon.innerHTML += "delete";

                removeBtn.appendChild(removeBtnIcon);

            actionRow.appendChild(profileBtn);
            actionRow.appendChild(removeBtn);

        body.appendChild(infoRow);
        body.appendChild(checkInRow);
        body.appendChild(actionRow);

    li.appendChild(header);
    li.appendChild(body);

    //Buttons

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.parentElement.parentElement.getAttribute("data-id");
        //db.collection('lists').doc('List 1').collection("members").doc(id).delete();
    });






    $('#List').append(li);

}

db.collection('lists').doc('List 1').collection("members").onSnapshot(
    snapshot => {
        let changes = snapshot.docChanges();
        console.log(changes)
        changes.forEach(change => {
            console.log(change.doc.data())
            if (change.type == "added") {
                renderList(change.doc);
            }else if (change.type == "removed") {
                let li = document.getElementById("List").querySelector('[data-id=' + change.doc.id + ']');
                document.getElementById("List").removeChild(li);
            }
        })
    }
)


function countMembers() {
    let currentCount = 0;

    if (new Date().getHours() < 18) {
        db.collection('lists').doc('List 1').collection("members")
            .get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if (doc.data().ARRIVAL && doc.data().ARRIVAL !='') {
                    currentCount++;
                    $('#membercount').html(currentCount + ' / 54');
                }
            });
        });
    } else {
        db.collection('lists').doc('List 1').collection("members")
            .get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                if (doc.data().DEPARTURE && doc.data().DEPARTURE !='') {
                    currentCount++;
                    $('#membercount').html(currentCount + ' / 54');
                }
            });
        });
    }


}