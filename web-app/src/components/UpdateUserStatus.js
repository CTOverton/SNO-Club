import React from "react";
import { useParams } from 'react-router-dom'
import Container from "@material-ui/core/Container";

function UpdateUserStatus() {

    const { eventID, userID } = useParams();

    return(
        <Container maxWidth="sm">
            <h3>Christian Overton</h3>
            <subtitle1>C@CTOverton.com</subtitle1>
            <h4>Event ID: { eventID }</h4>
            <h4>Event ID: { userID }</h4>
        </Container>
    )
}

export default UpdateUserStatus