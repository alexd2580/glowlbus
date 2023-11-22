import * as React from "react";
import { Dimmer, DimmerDimmableProps, Loader, Segment } from "semantic-ui-react";
import * as R from "ramda";

type LoadingOverlayProps = React.PropsWithChildren<{
    active: boolean,
    children: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
}> & DimmerDimmableProps;

export const LoadingOverlay = (props: LoadingOverlayProps) => {
    const defaultDimmerProps = {
        as: Segment,
        dimmed: props.active,
    };
    const overrideDimmerProps = R.omit(["active", "children"], props);
    const dimmerProps = R.mergeDeepRight(defaultDimmerProps, overrideDimmerProps);

    return (
        <Dimmer.Dimmable {...dimmerProps}>
            <Dimmer active={props.active} page>
                <Loader size='massive' active indeterminate />
            </Dimmer>

            {props.children}
        </Dimmer.Dimmable>
    );
}
