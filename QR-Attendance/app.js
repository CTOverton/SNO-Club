// ========== [ Globals ] ==========
let user = {
    FNAME: null,
    LNAME: null,
    EMAIL: null,
    PHONE: null,

    ARRIVAL: false,
    DEPARTURE: false,

    FOUND: false
};

// ========== [ Events ] ==========

// Page Load
$(document).ready(function() {
    // Init Materialize
    $('.collapsible').collapsible();

    // Init User
    user.FNAME = urlObj().FNAME;
    user.LNAME = urlObj().LNAME;
    user.EMAIL = urlObj().EMAIL;
    user.PHONE = urlObj().PHONE;

    // Display Card
    let card = $('#card');

    checkUser();
    //     .then(function(found) {
    //         console.log(found);
    //         if (found) {
    //             console.log('User Found');
    //             card.addClass('teal');
    //             card.show();
    //         } else {
    //             console.log('User Not Found');
    //             card.addClass('red lighten-1');
    //             card.show();
    //         }
    //
    //     }).catch(function() {
    //         console.log('wtf')
    // });

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


/*    db.collection('lists').doc('List 1').collection("members").doc('3IDSGRPQZu4d56SvQ6J2')
    .get().then(function (doc) {
        console.log(doc);
        if (doc.data().DEPARTURE == null) {
            db.collection('lists').doc('List 1').collection("members").doc('3IDSGRPQZu4d56SvQ6J2').set({
                DEPARTURE: ''
            }, { merge: true });
            console.log(doc.data().DEPARTURE);
        }
        console.log(doc.data().DEPARTURE);

    });*/


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






/*

querySnapshot.forEach(function(doc) {
    promises.push();
    exportObj.push(doc.data());

});
*/

// ========== [ Functions ] ==========

function urlObj() {
    let urlParams = new URLSearchParams(window.location.search);

    let url = {};
    let entries = urlParams.entries();
    for(pair of entries) {
        url[pair[0]] = pair[1];
    }
    return url;
}

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

/*

.collection("members")
    .orderBy("Attendance", "asc")

    */
