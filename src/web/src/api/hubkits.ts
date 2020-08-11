import type * as  Gravio from "../models/GravioModels";
import * as mocks from "../models/GravioModelMocks";
import type { HubkitSubmission } from "models/SmapModels";

/** Returns the hubkits that are associated with the current User */
async function GetHubkits(): Promise<Array<Gravio.Hubkit>> {
    return Promise.resolve([
        mocks.Hubkits.Hubkit0,
    ]);
}

async function RegisterNewHubkit(hkit: HubkitSubmission): Promise<void> {
    try {
        await GetHubkits()
        //nf todo for testing
        return Promise.reject("something went wrong, ese");
    }
    catch (e) {
        // nf todo better error management
        return Promise.reject(e);
    }
}

/** Returns the SensorMaps the user has registered  */
async function GetSensorMaps(): Promise<Array<Gravio.SensorMap>> {
    return Promise.resolve(
        Object.values(mocks.SensorMaps)
    )
}


export {
    GetHubkits,
    RegisterNewHubkit,
    GetSensorMaps,
}