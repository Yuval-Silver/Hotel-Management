import { useEffect, useState } from "react";
import { AuthenticatedUserProps } from "../Utils/Props";
import { useNavigate } from "react-router-dom";
import CenteredLabel from "../UIElements/CenteredLabel";
import Input, { InputType } from "../UIElements/Forms/Input";
import FormContainer from "../UIElements/Forms/FormContainer";
import { FetchError, makeRequest, RequestError } from "../APIRequests/APIRequests";
import Modal, { ModalController } from "../UIElements/Modal";
import { checkExtraPermissions } from "../Navigation/Navigation";

const RemoveExtraScreen: React.FC<AuthenticatedUserProps> = ({
    userCredentials, setShowConnectionErrorMessage
}) => {
    const [reservationId, setReservationId] = useState(-1);
    const [extraId, setExtraId] = useState(-1);
    const [removeExtraMessage, setRemoveExtraMessage] = useState<ModalController | undefined>(undefined);

    const navigate = useNavigate();
    useEffect(() => {
        checkExtraPermissions(userCredentials.role, userCredentials.department, navigate);
    }, [userCredentials, navigate]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const removeExtraData = { reservationId, extraId };

        try {
            const res = await makeRequest("api/Reservations/remove-extra", "POST", "json", removeExtraData, userCredentials.token);
            handleResponse(res);
        } catch (error: any) {
            if (error instanceof FetchError) {
                setShowConnectionErrorMessage(true);
            }
            if (error instanceof RequestError) {
                setRemoveExtraMessage({
                    title: "General Error Occurred",
                    message: error.message,
                });
            }
        }
    }

    const handleResponse = async (res: Response) => {
        switch (res.status) {
            case 200:
                setRemoveExtraMessage({
                    title: "Success!",
                    message: "Successfully removed extra!",
                });
                break;
            case 400:
                setRemoveExtraMessage({
                        title: "Failed!",
                        message: await res.text(),
                    });
                    break;
            default:
                setShowConnectionErrorMessage(true);
                break;
        }
    };

    return (
        <>
            <CenteredLabel>Remove Extra</CenteredLabel>
            <FormContainer onSubmit={(e) => handleSubmit(e)}>
                <Input
                    id="reservationId"
                    label="Reservation Id"
                    type={InputType.Number}
                    placeholder="Enter reservationId Id"
                    onChange={(e) => setReservationId(Number(e.target.value))}
                />
                <Input
                    id="extraId"
                    label="Extra Id"
                    type={InputType.Number}
                    placeholder="Enter extra id"
                    onChange={(e) => setExtraId(Number(e.target.value))}
                />
                <Input
                    id="removeExtraButton"
                    type={InputType.Submit}
                    value="Remove extra"
                />
            </FormContainer>
            {removeExtraMessage && (
                <Modal title={removeExtraMessage.title} onClose={() => setRemoveExtraMessage(undefined)}>
                    {removeExtraMessage.message}
                </Modal>
            )}
        </>
    )
}

export default RemoveExtraScreen;