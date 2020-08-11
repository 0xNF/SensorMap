import type { Area, Hubkit, SensorMap } from "./GravioModels";

class User {
    readonly Id: string;
    DisplayName: string;
}


class State {
    /** Currently logged in User */
    CurrentUser: User | null;
    /** Map that is currently being viewed */
    CurrentMap: SensorMap;
    /** Hubkits that are available to the user to edit or view. */
    AvailableHubkits: Array<Hubkit>;
}

export {
    User,
    SensorMap,
    State,
}