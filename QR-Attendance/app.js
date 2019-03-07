// ========== [ Globals ] ==========
let user = {
    FNAME: null,
    LNAME: null,
    EMAIL: null,
    PHONE: null,

    ATTENDANCE:null,

    ARRIVE: false,
    DEPART: false,

};

let members = {};

let list = "b4c0f0a45f"; // MailChimp List ID
let apiUrl = 'http://localhost:4000'; // Local for testing
// let apiUrl = 'https://us-central1-sno-club.cloudfunctions.net/snoAPI';


// ========== [ Events ] ==========
// Page Load
$(document).ready(function() {
    // Init Materialize
    M.AutoInit();

    // Init User
    Object.assign(user, urlObj());
    console.log('User:');
    console.log(user);

    // Get Members
    getListMembers(list)
        .then(function (response) {
            members = response;

            let found = false;

            members.members.forEach(function (member, index, array) {
                let lowerCase = '' + user.EMAIL
                let mail = '' + member.email_address;
                if (mail.toLowerCase() == lowerCase.toLowerCase()) {
                    user = member;
                    checkUser();
                    found = true;
                }

                renderList(member);
                countMembers();
            });

            if (!found && user.EMAIL != null) {
                $('#NAME').html('User Not Found');
                card.addClass('red lighten-1');
                card.show();
            }
    });

    // Display Card
    let card = $('#card');

    //checkUser();

    //countMembers();

});

// Add Member
$('#addForm').submit(function(e) {
    e.preventDefault();

    let form = document.getElementById("addForm");

    addMember(list, JSON.stringify({
        "email_address": form.user_EMAIL.value,
        "status": "subscribed",
        "merge_fields": {
            "FNAME": form.user_FNAME.value,
            "LNAME": form.user_LNAME.value,
            "PHONE": form.user_PHONE.value
        }
    }))
        .then(function (response) {
            console.log(response);
            renderList(response);
            countMembers();

            form.user_FNAME.value = '';
            form.user_LNAME.value = '';
            form.user_EMAIL.value = '';
            form.user_PHONE.value = '';
    });
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

// ========== [ API ] ==========

// Get Lists
function getLists() {
    return new Promise(function(resolve, reject) {
        let settings = {
            "async": true,
            "crossDomain": true,
            "url": apiUrl + "/lists",
            "method": "GET",
            "headers": {
                "cache-control": "no-cache",
                "Postman-Token": "e0d54d24-c9bd-4683-8264-2242ada9a110"
            }
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            resolve(response);
        });
    });
}

// Get List Members
function getListMembers(listID) {
    return new Promise(function(resolve, reject) {
        let settings = {
            "async": true,
            "crossDomain": true,
            "url": apiUrl + "/lists/" + listID + "/members",
            "method": "GET",
            "headers": {
                "cache-control": "no-cache",
                "Postman-Token": "87ffaf21-4d91-44f2-ad68-f59e04197e9e"
            }
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            resolve(response);
        });
    });
}

// Update Member
function updateMember(listID, memberID, body) {
    return new Promise(function(resolve, reject) {
        let settings = {
            "async": true,
            "crossDomain": true,
            "url": apiUrl + "/lists/" + listID + "/members/" + memberID,
            "method": "PATCH",
            "headers": {
                "Content-Type": "application/json",
                "cache-control": "no-cache",
                "Postman-Token": "2361655a-430b-428c-a60f-f7cddc0d2eaa"
            },
            "processData": false,
            "data": body
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            resolve(response);
        });
    });
}

// Add Member
function addMember(listID, body) {
    return new Promise(function(resolve, reject) {
        let settings = {
            "async": true,
            "crossDomain": true,
            "url": apiUrl + "/lists/" + listID + "/members/",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "cache-control": "no-cache",
                "Postman-Token": "6d5b5005-f578-4d5e-ac71-8399ae2e9c19"
            },
            "processData": false,
            "data": body
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
            resolve(response);
        });
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
/*

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
*/

function checkUser() {
    if (user.id) {
        let id = user.id;

        let FNAME = user.merge_fields.FNAME;
        let LNAME = user.merge_fields.LNAME;
        let EMAIL = user.email_address;
        let PHONE = user.merge_fields.PHONE;

        let ATTENDANCE = user.merge_fields.ATTENDANCE;
        let ARRIVE = user.merge_fields.ARRIVE;
        let DEPART = user.merge_fields.DEPART;
        let DRIVE = user.merge_fields.DRIVE;

        $('#NAME').html(FNAME + ' ' + LNAME);
        $('#EMAIL').html(EMAIL);
        $('#PHONE').html(PHONE);

        let card = $('#card');

        // Check Arrive / Depart
        if ((new Date().getHours() < 18)) {
            // Arrive
            updateMember(list, id, JSON.stringify({
                "merge_fields": {
                    "ARRIVE": true
                }
            })).then(function () {
                card.find('.ARRIVE').html('check_box');
                card.addClass('teal');
                card.show();
                countMembers();
            });
        } else {
            // Depart
            updateMember(list, id, JSON.stringify({
                "merge_fields": {
                    "DEPART": true
                }
            })).then(function () {
                card.find('.DEPART').html('check_box');
                card.addClass('teal');
                card.show();
                countMembers();
            });
        }
    }


    /*members

    "email_address": form.user_EMAIL.value,
        "status": "subscribed",
        "merge_fields": {
        "FNAME": form.user_FNAME.value,
            "LNAME": form.user_LNAME.value,
            "PHONE": form.user_PHONE.value
    }

    if (user.EMAIL) {
        $('#NAME').html(user.FNAME + ' ' + user.LNAME);
        $('#EMAIL').html(user.EMAIL);
        $('#PHONE').html(user.PHONE);

        checkIn(doc.id, (new Date().getHours() < 18));
        if (doc.data().ARRIVAL != '' && doc.data().ARRIVAL) {$('#ARRIVAL').html('check_box')}
        if (doc.data().DEPARTURE != '' && doc.data().DEPARTURE) {$('#DEPARTURE').html('check_box')}

        user.FOUND = true;

    }*/
}

function renderList(member) {
    let id = member.id;

    let FNAME = member.merge_fields.FNAME;
    let LNAME = member.merge_fields.LNAME;
    let EMAIL = member.email_address;
    let PHONE = member.merge_fields.PHONE;

    let ATTENDANCE = member.merge_fields.ATTENDANCE;
    let ARRIVE = member.merge_fields.ARRIVE;
    let DEPART = member.merge_fields.DEPART;
    let DRIVE = member.merge_fields.DRIVE;

    let template = $('#template').find('li').clone();

    template.attr('data-id', id);

    template.attr('data-fname', FNAME);
    template.attr('data-lname', LNAME);
    template.attr('data-email', EMAIL);
    template.attr('data-phone', PHONE);

    template.attr('data-attendance', ATTENDANCE);
    template.attr('data-arrive', ARRIVE);
    template.attr('data-depart', DEPART);
    template.attr('data-drive', DRIVE);

    // Set Search
    template.find('.search').html(FNAME + ' ' + LNAME + ' ' + EMAIL);

    // Set Display Data
    template.find('.NAME').html(FNAME + ' ' + LNAME);
    template.find('.EMAIL').html(EMAIL);
    template.find('.PHONE').html(
    '<a href=' + 'tel:' + PHONE + '>' + PHONE + '</a>'
    );

    // Generate Member Tags
    template.find('.tags').empty();
    if (member.tags) {
        for (tag of member.tags) {
            let el = document.createElement('div');
            el.className = 'chip';
            el.innerHTML = tag.name;
            template.find('.tags').append(el);
        }
    }


    // Check Merge Fields
    if(ARRIVE) {
        template.find('.ARRIVE').html('check_box')
    } else {
        template.find('.ARRIVE').html('check_box_outline_blank')
    }
    if(DEPART) {
        template.find('.DEPART').html('check_box')
    } else {
        template.find('.DEPART').html('check_box_outline_blank')
    }

    if(DRIVE) {
        template.find('.DRIVE').html('check_box')
    } else {
        template.find('.DRIVE').html('check_box_outline_blank')
    }
    if(ATTENDANCE == 'No Show') {
        template.find('.ATTENDANCE').html('indeterminate_check_box')
    } else {
        template.find('.ATTENDANCE').html('check_box_outline_blank')
    }

    // Enable Buttons

    // Arrive
    template.find('.ARRIVE_BTN').click(function () {
        let parent = $(this).closest('li');
        let id = parent.attr('data-id');
        let ARRIVE = parent.attr('data-arrive');

        ARRIVE = !(ARRIVE == 'true' || ARRIVE == '1');

        updateMember(list, id, JSON.stringify({
            "merge_fields": {
                "ARRIVE": ARRIVE
            }
        }));

        parent.attr('data-arrive', ARRIVE);

        if(ARRIVE) {
            parent.find('.ARRIVE').html('check_box');
        } else {
            parent.find('.ARRIVE').html('check_box_outline_blank');
        }
        countMembers();
    });

    // Depart
    template.find('.DEPART_BTN').click(function () {
        let parent = $(this).closest('li');
        let id = parent.attr('data-id');
        let DEPART = parent.attr('data-depart');

        DEPART = !(DEPART == 'true' || DEPART == '1');

        updateMember(list, id, JSON.stringify({
            "merge_fields": {
                "DEPART": DEPART
            }
        }));

        parent.attr('data-depart', DEPART);

        if(DEPART) {
            parent.find('.DEPART').html('check_box');
        } else {
            parent.find('.DEPART').html('check_box_outline_blank');
        }
        countMembers();
    });

    // Drive
    template.find('.DRIVE_BTN').click(function () {
        let parent = $(this).closest('li');
        let id = parent.attr('data-id');
        let DRIVE = parent.attr('data-drive');

        DRIVE = !(DRIVE == 'true' || DRIVE == '1');

        updateMember(list, id, JSON.stringify({
            "merge_fields": {
                "DRIVE": DRIVE
            }
        }));

        parent.attr('data-drive', DRIVE);

        if(DRIVE) {
            parent.find('.DRIVE').html('check_box');
        } else {
            parent.find('.DRIVE').html('check_box_outline_blank');
        }
        countMembers();
    });

    // Attendance / No Show
    template.find('.ATTENDANCE_BTN').click(function () {
        let parent = $(this).closest('li');
        let id = parent.attr('data-id');
        let ATTENDANCE = parent.attr('data-attendance');

        if (ATTENDANCE != 'No Show') {
            updateMember(list, id, JSON.stringify({
                "merge_fields": {
                    "ATTENDANCE": 'No Show'
                }
            }));
            parent.attr('data-attendance', 'No Show');
            parent.find('.ATTENDANCE').html('indeterminate_check_box')
        } else {
            updateMember(list, id, JSON.stringify({
                "merge_fields": {
                    "ATTENDANCE": 'Went'
                }
            }));
            parent.attr('data-attendance', 'Went');
            parent.find('.ATTENDANCE').html('check_box_outline_blank')
        }
        countMembers();
    });


    $('#List').append(template);
}

/*function renderList(members) {
    members.forEach(function (member) {
        let FNAME = member.merge_fields.FNAME;
        let LNAME = member.merge_fields.LNAME;
        let EMAIL = member.email_address;
        let id = member.id;

        let row = ce({
            type: 'div',
            className: 'grid-row'
        });

        let li = ce({
            type: 'li',
            className: 'member',
        });
        li.setAttribute("data-id", id);

        //For Search
        ce({
            type: 'div',
            className: 'search hide',
            html: FNAME + ' ' + LNAME + ' ' + EMAIL,
            parent: li
        });

        // Header
        let header = ce({
            type: 'div',
            className: 'collapsible-header',
            parent: li
        });

        let arriveIcon = ce({
            type: 'div',
            className: 'collapsible-header',
            parent: li
        });

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
    });
}*/

/*
function ce(settings) {
    let el = null;
    if (settings.type) { el = document.createElement(settings.type)} else {el = document.createElement('div')}
    if (settings.className) {el.className = settings.className}
    if (settings.html) {el.innerHTML = settings.html}
    if (settings.text) {el.innerText = settings.text}
    if (settings.parent) {settings.parent.appendChild(el)}
}
*/

/*
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
)*/


// Firestore
/*
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
*/

// New
function countMembers() {
    let currentCount = 0;
    let arrived = 0;
    let drivecount = 0;

    console.log(members);

    for (member of members.members) {
        // Count Drivers
        if (member.merge_fields.DRIVE == 'true' || member.merge_fields.DRIVE == '1') {
            drivecount++;
        }

        if (new Date().getHours() < 18) {
            if (member.merge_fields.ARRIVE == 'true' || member.merge_fields.ARRIVE == '1') {
                currentCount++;
            }
            $('#membercount').html(currentCount + drivecount + ' / 53');
        } else {
            if (member.merge_fields.ARRIVE == 'true' || member.merge_fields.ARRIVE == '1') {
                arrived++;
            }
            if (member.merge_fields.DEPART == 'true' || member.merge_fields.DEPART == '1') {
                currentCount++;
            }
            $('#membercount').html(currentCount + ' / ' + arrived + drivecount);
        }
    }


}