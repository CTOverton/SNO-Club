import React, {useState} from "react";
import { useParams } from 'react-router-dom'
import {Container, Button, Typography, Card, CardContent} from "@material-ui/core";
import {useSelector} from "react-redux";
import {isLoaded, useFirestore, useFirestoreConnect} from "react-redux-firebase";
import {makeStyles} from "@material-ui/core/styles";
import moment from "moment";

const useStyles = makeStyles({
    card: {
        minWidth: 275,
        marginBottom: 12,
    },
    title: {
        fontSize: 14,
    },
    mBottom: {
        marginBottom: 12,
    },
});

function UpdateUserStatus() {
    const classes = useStyles();

    const { eventID, userID } = useParams();

    //                 FIREBASE
    // ========================================
    const firestore = useFirestore()
    useFirestoreConnect(() => [
        {collection: 'events'},
        {collection: 'attendees', doc: userID}
    ])

    const event = useSelector(
        ({ firestore: { data } }) => data.events && data.events[eventID]
    )

    const user = useSelector(
        ({ firestore: { data } }) => data.attendees && data.attendees[userID]
    )
    // ========================================

    // const [ready, setReady] = useState(false);

    function onClick(e) {
        const {readyArrive, readyDepart} = user;

        if (new Date().getHours() < 18) {
            firestore.update(`attendees/${userID}`,{ readyArrive: !readyArrive})
                .then(() => {
                    console.log("Successfully set readyArrive to " + !readyArrive)
                })
        } else {
            firestore.update(`attendees/${userID}`,{ readyDepart: !readyDepart})
                .then(() => {
                    console.log("Successfully set readyDepart to " + !readyDepart)
                })
        }

    }

    if (!isLoaded(event) && !isLoaded(user)) {
        return 'Loading'
    }

    if (event && user) {
        const {firstName, lastName, email, readyArrive, readyDepart} = user;

        return(
            <Container maxWidth="sm">

                <Card className={classes.card}>
                    <CardContent>
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                            {email}
                        </Typography>
                        <Typography variant="h5" component="h2">
                            {firstName} {lastName}
                        </Typography>
                    </CardContent>
                    {/*<CardActions>
                    <Button size="small">Learn More</Button>
                </CardActions>*/}
                </Card>

                {((!readyArrive && new Date().getHours() < 18) || (!readyDepart && new Date().getHours() >= 18)) &&
                <Button className={classes.mBottom} variant="contained" color="primary" onClick={onClick}>
                    Ready to leave
                </Button>
                }

                {((readyArrive && new Date().getHours() < 18) || (readyDepart && new Date().getHours() >= 18)) &&
                <div>
                    <Typography className={classes.mBottom} variant="h5">
                        You're all set!
                    </Typography>

                    <Typography className={classes.mBottom} variant="body1" color="textSecondary">
                        If anything changes click below, otherwise we'll be at the mountain soon!
                    </Typography>

                    <Button variant="contained" onClick={onClick}>Wait I'm not Ready</Button>
                </div>
                }
            </Container>
        )
    } else {
        return (
            <Container>
                <Typography className={classes.mBottom} variant="h5">
                    User or event not found
                </Typography>
            </Container>
        )
    }


}

export default UpdateUserStatus