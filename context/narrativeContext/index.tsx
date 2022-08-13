import React, { lazy, createContext, ReactElement, useState, useEffect } from "react";
import MainMenu from "../../components/frames/mainMenu";
import Home from "../../components/frames/home"
import WhoAmI from "../../components/frames/whoAmI";
import WhereAmI from "../../components/frames/whereAmI";
import Agora from "../../components/frames/agora";
//import HolyBuilding from "../../components/frames/holyBuilding";
//import Death from "../../components/frames/death";
//import DataSilos from "../../components/frames/dataSilos";
//import DataSilosMudSignup from "../../components/frames/dataSilosMudSignup";
import ReadFromInkStoryFrame from "../../components/frames/readFromInkStoryFrame";

export interface INarrativeContext {
    activeFrame: ReactElement;
    setFrame?: (name: string) => void;
};

export const NarrativeContext = createContext<INarrativeContext>({activeFrame: null});

// a dictionary of React Element import routes. Register your frames here!
export const FRAME_DICTIONARY = {
    // TODO: code-splitting will improve performance for this design greatly at scale
    // however it involves using another format from IIEF or UMD
    // look into using ESM format (had difficulties bundling this)
    //'home': lazy(() => import('../../components/frames/home')),
    'mainMenu': MainMenu,
    'home': Home,
    'whoAmI': WhoAmI,
    'whereAmI': WhereAmI,
    'agora': Agora,
    //'holySpire': HolyBuilding,
    //'death': Death,
    //'dataSilos': DataSilos,
    //'dataSilosMudSignup': DataSilosMudSignup,
    'readFromInkStoryFrame': ReadFromInkStoryFrame,
}

export const NarrativeProvider = ({
    children
}): ReactElement => {

    const [activeFrame, setActiveFrame] = useState<ReactElement>(null);

    const getActiveFrameElement: (name: string) => ReactElement = (name: string) => {
        return FRAME_DICTIONARY[name]({followLink: setFrame});
    }

    const setFrame = (name: string) => {
        if(name in FRAME_DICTIONARY) {
            setActiveFrame(getActiveFrameElement(name));
            return;
        }
        console.error("attempt made to set frame to " + name + " but this key doesn't exist!");
    }

    useEffect(() => {
        setFrame("mainMenu");
    }, []);

    return(
        <NarrativeContext.Provider
            value={{
                activeFrame,
                setFrame
            }}
        >
            {children}
        </NarrativeContext.Provider>
    );
};
