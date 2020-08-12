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

/** Updates a SensorMap on the server, such as for DisplayName, new Map image, or new device positions
 * Returns either the servers view of the new SensorMap, or an error
 */
async function UpdateSensorMap(sensorMap: Gravio.SensorMap): Promise<Gravio.SensorMap> {
    try {
        // NF TODO - here is where we will submit the sensor information for storage on the server
        return Promise.reject("invalid file type");
    } catch (error) {
        return Promise.reject(error);
    }
}

export {
    GetHubkits,
    RegisterNewHubkit,
    GetSensorMaps,
    UpdateSensorMap,
}