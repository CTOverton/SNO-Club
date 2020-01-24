import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import {isLoaded, isEmpty, useFirestoreConnect} from "react-redux-firebase";
import {useSelector} from "react-redux";
import AttendeeListItem from "./AttendeeListItem";
import Item from "./FirestoreTemplates/TemplateFirestoreItem";

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
}));

function AttendeeList() {
    const classes = useStyles();

    //                 FIREBASE
    // ========================================
    useFirestoreConnect(() => [
        {collection: 'attendees'}
    ])

    const attendees = useSelector(
        ({ firestore: { ordered } }) => ordered.attendees
    )
    // ========================================

    if (!isLoaded(attendees)) {
        return 'Loading'
    }

    if (isEmpty(attendees)) {
        return 'No attendees'
    }

    console.log(attendees)

    return (
        <List className={classes.root}>
            {attendees.map(({ id, ...attendee }, index) => (
                <AttendeeListItem key={id} id={id} {...attendee} />
            ))}
        </List>
    );
}

export default AttendeeList
