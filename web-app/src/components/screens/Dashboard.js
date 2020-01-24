import React from "react";
import {useFirestoreConnect} from "react-redux-firebase";
import {Container} from "@material-ui/core";
import AttendeeList from "../AttendeeList";

function Dashboard() {

    useFirestoreConnect(() => [
        {collection: 'events'},
        {collection: 'attendees'}
    ])

    return(
        <Container maxWidth="sm">
            <AttendeeList/>
        </Container>
    )
}

export default Dashboard