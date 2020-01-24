import React, {useState} from "react";
import {CardContent, Container, Typography} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import {makeStyles} from "@material-ui/core/styles";
import {useFirestore, useFirestoreConnect} from "react-redux-firebase";


const useStyles = makeStyles({
    title: {
        fontSize: 14,
    },
    mBottom: {
        marginBottom: 12,
    },
});

function AttendeeListItem({id, email, firstName, lastName, readyArrive, readyDepart}) {
    const classes = useStyles();
    const labelId = `checkbox-list-label-${id}`;

    const firestore = useFirestore()
    useFirestoreConnect(() => [
        {collection: 'attendees'}
    ])

    const [arrive, setArrive] = useState(readyArrive);
    const [depart, setDepart] = useState(readyDepart);

    function handleChange(e) {

        switch (e.target.id) {
            case "readyArrive":
                setArrive(e.target.checked);
                firestore.update(`attendees/${email}`,{ readyArrive: e.target.checked})
                    .then((doc) => {
                        // console.log(`${firstName} ${lastName} ${email} ${e.target.id} is ${e.target.checked} `)
                        console.log(`Updated ${doc}`)
                    })
                break;
            case "readyDepart":
                setDepart(e.target.checked);
                firestore.update(`attendees/${email}`,{ readyDepart: e.target.checked})
                    .then((doc) => {
                        // console.log(`${firstName} ${lastName} ${email} ${e.target.id} is ${e.target.checked} `)
                        console.log(`Updated ${doc}`)
                    })
                break;
            default:
                break;
        }

    }

    return(
        <ListItem role={undefined} dense button>
            <ListItemText id={labelId} primary={
                <div>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                        {email}
                    </Typography>
                    <Typography variant="h5" component="h2">
                        {firstName} {lastName}
                    </Typography>
                </div>
                } />
            <ListItemSecondaryAction>
                <Checkbox
                    id="readyArrive"
                    key="readyArrive"
                    edge="start"
                    checked={arrive}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                    onChange={handleChange}
                />
                <Checkbox
                    id="readyDepart"
                    edge="start"
                    checked={depart}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                    onChange={handleChange}
                />
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default AttendeeListItem