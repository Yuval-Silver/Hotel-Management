import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "../UIElements/NavigationBar";
import CenteredLabel from "../UIElements/CenteredLabel";
import Input from "../UIElements/Forms/Input";
import { Button } from "../UIElements/Button";
import Modal from "../UIElements/Modal";
import { updateRoom } from "./RoomUpdate";
import { RoomOccupationRadioButton, RoomStateRadioButton } from "./RoomRadioButtons";

export function RoomUpdateScreen(props: {
    userCredentials: UserCredentials,
    setShowConnectionErrorMessage: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [showRoomUpdateSuccessMessage, setShowRoomUpdateSuccessMessage] = useState(false);
    const [showRoomUpdateErrorMessage, setShowRoomUpdateErrorMessage] = useState(false);
    const [showRoomNotFoundErrorMessage, setShowRoomNotFoundErrorMessage] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        if (props.userCredentials.role !== "Admin") {
            navigate("/login");
        }
        if (props.userCredentials.department !== "FrontDesk") {
            navigate("/home");
        }
    }, [props.userCredentials, navigate]);

    return (
        <>
            <NavigationBar></NavigationBar>
            <CenteredLabel labelName="Update Room State"></CenteredLabel>
            <form id="roomUpdateForm" className="fieldsContainer" action="http://localhost:8000/api/Rooms/update">
                <Input id="roomNumber" className="field" type="number" name="roomNumber"
                    placeholder="Enter room number" errorMessageId="roomNumberErrorMessage">
                    Room number
                </Input>
                <RoomStateRadioButton></RoomStateRadioButton>
                <RoomOccupationRadioButton></RoomOccupationRadioButton>

                <Input id="reservationId" className="field" type="number" name="reservationId"
                    placeholder="Enter reservation Id" errorMessageId="reservationIdErrorMessage">
                    Reservation Id
                </Input>

                <Button
                    className="fieldLabel"
                    bgColor="white"
                    textColor="black"
                    borderWidth="1px"
                    onClick={(event) => updateRoom(event,
                        props.userCredentials.token,
                        props.setShowConnectionErrorMessage,
                        setShowRoomUpdateSuccessMessage,
                        setShowRoomUpdateErrorMessage,
                        setShowRoomNotFoundErrorMessage)}>
                    Update Room
                </Button>
            </form>
            <Modal title="Room Update Succeeded" show={showRoomUpdateSuccessMessage} onClose={() => { setShowRoomUpdateSuccessMessage(false) }}>
                <h5>Room was updated successfully.</h5>
            </Modal>
            <Modal title="Room Update Failed" show={showRoomUpdateErrorMessage} onClose={() => { setShowRoomUpdateErrorMessage(false) }}>
                <h5>Failed to update room.</h5>
            </Modal>
            <Modal title="Room Not Found" show={showRoomNotFoundErrorMessage} onClose={() => { setShowRoomNotFoundErrorMessage(false) }}>
                <h5>Failed to find room number.</h5>
            </Modal>
        </>
    )
}