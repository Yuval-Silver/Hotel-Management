import React, { useState } from "react";
import { NavigationBar } from "../UIElements/NavigationBar";
import CenteredLabel from "../UIElements/CenteredLabel";
import Input, { InputType } from "../UIElements/Forms/Input";
import Modal, { ModalController } from "../UIElements/Modal";
import { Room } from "../APIRequests/ServerData";
import FormContainer from "../UIElements/Forms/FormContainer";
import RoomStateRadioButton from "./Elements/RoomRadioButtons";
import RoomOccupationRadioButton from "./Elements/RoomOccupationRadioButtons";
import MenuGridLayout from "../UIElements/MenuGridLayout";
import { ScreenProps } from "../Utils/Props";
import useAuthenticationRedirect from "../Utils/useAuthenticationRedirect";

const RoomInformationScreen: React.FC<ScreenProps> = ({
    userCredentials,
}) => {
    useAuthenticationRedirect(userCredentials.username);
    
    const [roomType, setRoomType] = useState("");
    const [roomState, setRoomState] = useState("");
    const [occupancy, setOccupancy] = useState("");
    const [reservationId, setReservationId] = useState("");
    
    const [queryMessage, setQueryMessage] = useState<ModalController | undefined>(undefined);
    
    const [rooms, setRooms] = useState<Room[]>([]);
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
    }
    
    return (
        <>
            <NavigationBar />
            <CenteredLabel>Room Search</CenteredLabel>
            <FormContainer onSubmit={handleSubmit}>
                <Input
                    id="room-type"
                    label="Room type"
                    value={roomType}
                    type={InputType.Text}
                    placeholder="Enter room type"
                    onChange={(e) => setRoomType(e.target.value)}
                />
                
                <MenuGridLayout>
                    <RoomStateRadioButton value={roomState} setValue={setRoomState} />
                    <RoomOccupationRadioButton value={occupancy} setValue={setOccupancy} />
                </MenuGridLayout>
                
                <Input
                    id="reservation-id"
                    label="Reservation Id"
                    value={reservationId}
                    type={InputType.Number}
                    placeholder="Enter reservation Id"
                    onChange={(e) => setReservationId(e.target.value)}
                />
                
                <Input
                    id="query-rooms"
                    type={InputType.Submit}
                    value="Search"
                />
            </FormContainer>
            
            {rooms.length > 0 && (
                <ul>
                    {rooms.map((room) => (
                        <div className="fieldsContainer">
                            <p>Room Id: {room.roomId}</p>
                            <p>Room Type: {room.type}</p>
                            <p>Room State: {room.state}</p>
                            <p>Room Occupation: {room.occupied ? "Occupied" : "Free"}</p>
                            <p>Room Reservation Id: {room.reservation ? room.reservation : "No Reservation"}</p>
                        </div>
                    ))}
                </ul>
            )}
            
            {queryMessage && (
                <Modal title={queryMessage.title} onClose={() => { setQueryMessage(undefined) }}>
                    {queryMessage.message}
                </Modal>
            )}

        </>
    )
}

export default RoomInformationScreen;
