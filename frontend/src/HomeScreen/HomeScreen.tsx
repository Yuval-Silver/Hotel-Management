import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"

import { CenteredLabel } from "../UIElements/CenteredLabel"
import { NavigationBar } from "../UIElements/NavigationBar"

export function HomeScreen(props: {
    userCredentials: UserCredentials,
    setUserCredentials: React.Dispatch<React.SetStateAction<UserCredentials>>
}) {
    const navigate = useNavigate();
    useEffect(() => {
        if (props.userCredentials.username === "") {
            navigate("/login");
        }
    }, [props.userCredentials, props.setUserCredentials, navigate]);

    return (
        <>
            <NavigationBar></NavigationBar>
            <CenteredLabel labelName="Home" />
            <Link to="/change-password">Change Password</Link>
            <br></br>
            <Link to="/user-creation">Create new user</Link>
        </>
    )
}


