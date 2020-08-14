import * as Gravio from "./GravioModels";
import { DeviceTypeMap } from "./GravioModels";

export const Devices:{ [key: string]: Gravio.Device} = {
    Temperature0: new Gravio.Device("Temperature 0", 0, DeviceTypeMap.Aqara_Temperature, "0"),
    Humidity0: new Gravio.Device("Humidity 0", 1, DeviceTypeMap.Aqara_Humidity, "1"),
    SingleButton0: new Gravio.Device("SingleButton 0", 2, DeviceTypeMap.Aqara_SingleButton, "2"),
    Motion0: new Gravio.Device("Motion 0", 3, DeviceTypeMap.Aqara_Occupancy, "3"),
};

export const Areas: { [key: string]: Gravio.Area } = {
    Area0: new Gravio.Area("Test Area 0", 0, [Devices.Temperature0, Devices.Humidity0, Devices.SingleButton0, Devices.Motion0,], "0"),
    Empty0: new Gravio.Area("Empty 0", 0, [], "0xEmpty0"),
    Empty1: new Gravio.Area("Empty 1", 1, [], "0xEmpty1"),
    Empty2: new Gravio.Area("Empty 2", 2, [], "0xEmpty2"),
};

export const Hubkits: { [key: string]: Gravio.Hubkit } = {
    Hubkit0: new Gravio.Hubkit("Test GHub 0", [Areas.Area0], "127.0.0.1", "0xdeadbeef", null, "assets/TestAssets/FloorBlank2.png"),
    Hubkit_NoAreas: new Gravio.Hubkit("No Areas Hubkit", [], "127.0.0.2", "0xfeedabba"),
    Hubkit_AreasButEmpty: new Gravio.Hubkit("Areas are Empty", [Areas.Empty0, Areas.Empty1, Areas.Empty2,], "127.0.0.3", "0xEmpty"),
};

export const SensorMaps: { [key: string]: Gravio.SensorMap } = {
    SensorMap0: new Gravio.SensorMap("0", Hubkits.Hubkit0, true, false),
    SensorMap1: new Gravio.SensorMap("1", Hubkits.Hubkit_NoAreas, false, false),
    SensorMap2: new Gravio.SensorMap("2", Hubkits.Hubkit_AreasButEmpty, false, true),

};
