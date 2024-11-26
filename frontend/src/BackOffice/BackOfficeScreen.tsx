import { useNavigate } from "react-router-dom";
import { AuthenticatedUserProps } from "../Utils/Props";

import plus from "../assets/plus-icon.svg";
import icon from "../assets/react.svg";
import IconButton from "../UIElements/Buttons/IconButton";
import CenteredLabel from "../UIElements/CenteredLabel";
import MenuGridLayout from "../UIElements/MenuGridLayout";
import useUserRedirect from "../Utils/Hooks/useUserRedirect";

const BackOfficeScreen: React.FC<AuthenticatedUserProps> = ({
    userCredentials
}) => {
    useUserRedirect(userCredentials, ["Admin"], ["FrontDesk"]);
    
    const navigate = useNavigate();
    
    const elements = [
        {image: plus, navUrl: "/guests/add",              text: "Create guests"},
        {image: icon, navUrl: "/back-office/end-of-day",    text: "End of day"},
    ];

    const buttons = [];
    for (const btn of elements) {
        buttons.push(
        <IconButton
            key={btn.navUrl}
            iconUrl={btn.image}
            borderWidth="2px"
            borderRadius="5px"
            fontSize="18pt"
            onClick={() => navigate(btn.navUrl)}
        >
            {btn.text}
        </IconButton>);
    }

    return <>
        <CenteredLabel>Back Office</CenteredLabel>
        <MenuGridLayout shadow>
            {buttons}
        </MenuGridLayout>
    </>;
}

export default BackOfficeScreen;