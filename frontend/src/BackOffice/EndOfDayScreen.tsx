import { useState } from "react";
import { ScreenProps } from "../Utils/Props";
import CenteredLabel from "../UIElements/CenteredLabel";
import Input, { InputType } from "../UIElements/Forms/Input";
import FormContainer from "../UIElements/Forms/FormContainer";
import Modal, { ModalController } from "../UIElements/Modal";
import { FetchError, makeRequest, RequestError } from "../APIRequests/APIRequests";
import useUserRedirect from "../Utils/Hooks/useUserRedirect";


const EndOfDayScreen: React.FC<ScreenProps> = ({
    userCredentials, setShowConnectionErrorMessage
}) => {
    const [endOfDayMessage, setEndOfDayMessage] = useState<ModalController | undefined>(undefined);
    
    useUserRedirect(userCredentials, ["Admin"], ["FrontDesk"]);
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const res = await makeRequest("api/BackOffice/end-of-day", "POST", "text", undefined, userCredentials.token);
            handleResponse(res);
        } catch (error: any) {
            if (error instanceof FetchError) {
                setShowConnectionErrorMessage(true);
            }
            if (error instanceof RequestError) {
                setEndOfDayMessage({
                    title: "General Error Occurred",
                    message: error.message,
                });
            }
        }
    }

    const handleResponse = async (res: Response) => {
        switch (res.status) {
            case 200:
                setEndOfDayMessage({
                    title: "Success!",
                    message: "Successfully ended the day!",
                });
                break;
            default:
                setShowConnectionErrorMessage(true);
                break;
        }
    };

    return (
        <>
            <CenteredLabel>End Of Day Procedure</CenteredLabel>
            <FormContainer onSubmit={(e) => handleSubmit(e)}>
                <Input
                    id="endOfDayButton"
                    type={InputType.Submit}
                    value="End day"
                />
            </FormContainer>

            {endOfDayMessage && (
                <Modal title={endOfDayMessage.title} onClose={() => setEndOfDayMessage(undefined)}>
                    {endOfDayMessage.message}
                </Modal>
            )}
        </>
    )
}

export default EndOfDayScreen;