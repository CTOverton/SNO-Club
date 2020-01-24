import React from "react";
import {CardContent, Container, Typography} from "@material-ui/core";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import {makeStyles} from "@material-ui/core/styles";


const useStyles = makeStyles({
    title: {
        fontSize: 14,
    },
    mBottom: {
        marginBottom: 12,
    },
});

function AttendeeListItem({id, firstName, lastName, email, user_hash}) {
    const classes = useStyles();
    const labelId = `checkbox-list-label-${id}`;

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
                    edge="start"
                    checked={false}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ 'aria-labelledby': labelId }}
                />
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default AttendeeListItem