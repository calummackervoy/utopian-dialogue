import React, { useState } from "react";

import {
    Grid,
    GridItem,
    Image
} from "@chakra-ui/react";

export interface GridComponent {
    imgSrc: string;
}

export interface IGridSelect {
    gridComponents: GridComponent[];
    onSelect: (i: number) => void;
    itemsPerRow: number;
    gap: number;
}

// displays a set of options into a grid select
export default function GridSelect({gridComponents, onSelect, itemsPerRow=3, gap=5}: IGridSelect): React.ReactElement {

    let components = [];

    // loop over each grid component and decide how it should be rendered
    for(let i = 0; i < gridComponents.length; i++) {
        let c = gridComponents[i];
        if(c.imgSrc) {
            components.push(
                <GridItem key={i} onClick={() => onSelect(i)}>
                    <Image src={c.imgSrc}></Image>
                </GridItem>
            );
        }
    }

    let templateColumns = "repeat(" + itemsPerRow + ", 1fr)";

    return (
        <Grid templateColumns={templateColumns} gap={gap}>
            {components}
        </Grid>
    );
}
