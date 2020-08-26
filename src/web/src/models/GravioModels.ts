/* this file models items that deal directly with Gravio objects */

import type { MapImage } from "./SmapModels";

/** A Gravio Area with some additional SMAP specific stuff like Display Name and Map URL. Areas belong to Hubkits. */
class Area {
    /** GUID of this Area, as known by Hubkit */
    readonly Id: string;
    /** Name of this Area, as known by Hubkit*/
    readonly AreaName: string;
    /** 0-indexed ordering for this Area, as known by Hubkit */
    readonly AreaIndex: number;
    /** List of devices linked to Area, as known by Hubkit. User may add to this list in SMAP if they choose */
    readonly Devices: Array<Device>;
    /** User-overridable Display Name for map display purposes. Defaults to this.AreaName if not supplied. */
    DisplayName?: string;
    /** url pointing to map image for this Area. May be empty. Both Hubkits as a whole, and Areas specifically may have their own unique maps*/
    MapUrl?: string;


    constructor (areaName: string, areaIndex: number, devices: Array<Device>, areaId: string, displayName?: string, mapUrl?: string) {
        this.Id = areaId;
        this.AreaName = areaName;
        this.AreaIndex = areaIndex;
        this.Devices = devices;
        this.DisplayName = displayName ?? areaName;
        this.MapUrl = mapUrl;
    }
}

/** A Gravio Device with some additional SMAP specific stuff like Display Name. Devices belong to Areas. */
class Device {
    /** GUID of this Device, as known by Hubkit */
    readonly Id: string;
    /** Name of this Device, as known by Hubkit */
    readonly DeviceName: string;
    /** 0-Indexed ordering of this Device, as known by Hubkit */
    readonly DeviceIndex: number;
    /** Type of device (humidity, temperature, etc) as known by Hubkit. May be edited by the user in SMAP if so desired. */
    DeviceType: string;
    /** User-overridable Display Name for map display purposes. Defaults to this.DeviceName if not supplied. */
    DisplayName?: string;

    constructor(deviceName: string, deviceIndex: number, deviceType: string, deviceId: string, displayName?: string) {
        this.Id = deviceId;
        this.DeviceName = deviceName;
        this.DeviceIndex = deviceIndex;
        this.DeviceType = deviceType;
        this.DisplayName = displayName ?? deviceName;
    }

    getIconImage(): string {
        const icon = DeviceType2IconMap[this.DeviceType];
        if (!icon) {
            return DeviceType2IconMap["Other"];
        }
        return icon;
    }
}

/** A Gravio Hubkit with some additional SMAP specific stuff like Display Name and Map URL. */
class Hubkit {
    /** GUID of this Hubkit, as supplied by the connected Hubkit */
    readonly Id: string;
    /** Name of this Hubkit, as supplied by the connected Hubkit */
    readonly HubkitName: string;
    /** List of Areas within this Hubkit, ad supplied by the connected Hubkit. May be edited by the user in SMAP if they so choose. */
    readonly Areas: Array<Area>;
    /** IP or DNS of the Hubkit, supplied by the user */
    Address: string;
    /** User-overridable Display Name for map display purposes. Defaults to this.DeviceName if not supplied. */
    DisplayName?: string;
    /** url pointing to map image for this Hubkit. May be empty. */
    MapUrl?: MapImage;

    constructor(hubkitName: string, areas: Array<Area>, address: string, hubkitId: string, displayName?: string, mapImage?: MapImage) {
        this.Id = hubkitId;
        this.HubkitName = hubkitName;
        this.Areas = areas;
        this.Address = address;
        this.DisplayName = displayName ?? hubkitName;
        this.MapUrl = mapImage;
    }
}

/** The top-most element of SMAP, which contains a hubkit (maybe more than one?) */
class SensorMap {
    /** Id of the SMap from the server */
    readonly Id: string;
    /** Whether or not the map is publicly viewable by anyone without logging in. */
    Public: boolean;
    /** Whether or not the map can be edited. */
    Locked: boolean;
    /** Actual map data that we're concerned with. Really, this is anything with a MapUrl. */
    Hubkit: Hubkit

    constructor(id: string, item: Hubkit, pub: boolean, locked: boolean) {
        this.Id = id;
        this.Public = pub;
        this.Locked = locked;
        this.Hubkit = item;
    }
}

/** Represents a Gravio Device with X and Y offsets to display on a Map image */
class PositionedDevice {
    /** Device that this positioned device is representing */
    readonly Device: Device;
    /** X position of this element */
    OffsetX: number;
    /** Y position of this element */
    OffsetY: number;

    constructor(device: Device, offX: number, offY: number) {
        this.Device = device;
        this.OffsetX = offX;
        this.OffsetY = offY;
    }
}

/** A list of potential Device Types. This is not guaranteed to be complete or up-to-date. */
const DeviceTypeMap = {
    Aqara_Door: "Aqara-Door",
    Aqara_Humidity: "Aqara-Humidity",
    Aqara_Occupancy: "Aqara-Occupancy",
    Aqara_Pressure: "Aqara-Pressure",
    Aqara_SingleButton: "Aqara-SingleButton",
    Aqara_Temperature: "Aqara-Temperature",
    Aqara_TwoButton: "Aqara-TwoButton",
    Aqara_Vibration_Falling: "Aqara-Vibration-Falling",
    Aqara_Vibration_Inclination: "Aqara-Vibration-Inclination",
    Aqara_Vibration_Movement: "Aqara-Vibration-Movement",
    Aqara_Vibration_Stable: "Aqara-Vibration-Stable",
    Barcode: "Barcode",
    BuiltInAndUSBCamera: "BuiltInAndUSBCamera",
    PictureOnvifDevice: "PictureOnvidDevice",
    Camera: "Camera",
    EnOcean_Generic_Temperature_JP: "EnOcean-Generic-Temperature-JP",
    EnOcean_Generic_Temperature_JPOccupancy_JP: "EnOcean-Occupancy-JP",
    Gravio_CO2: "Gravio-CO2",
    Gravio_Door_JP: "Gravio-Door-JP",
    Gravio_Door: "Gravio-Door",
    Gravio_CO2Lidar_USB: "Gravio-Lidar-USB",
    Gravio_Temperature_JP: "Gravio-Temperature-JP",
    Gravio_Temperature: "Gravio-Temperature",
    Gravio_TwoButtonSwitch_JP: "Gravio-TwoButtonSwitch-JP",
    Gravio_UltraSonic_USB: "Gravio-UltraSonic-USB",
    ORC_UV_M03_serie: "ORC-UV-M03-serie",
    Pressac_CO2_JP: "Pressac-CO2-JP",
};
/** A list of Device Types to their Gravio Icon in the assets folder. Not guaranteed to be complete or up-to-date. */
const DeviceType2IconMap = {
    "Aqara-Door": "layer_icon_door_and_window_sensor.scale-400",
    "Aqara-Humidity": "icon_humidity.scale-400",
    "Aqara-Occupancy": "icon_occupancy.scale-400",
    "Aqara-Pressure": "icon_pressure.scale-400",
    "Aqara-SingleButton": "icon_button.scale-400",
    "Aqara-Temperature": "icon_temperature.scale-400",
    "Aqara-TwoButton": "icon_button.scale-400",
    "Aqara-Vibration-Falling": "icon_vibration.scale-400",
    "Aqara-Vibration-Inclination": "icon_vibration.scale-400",
    "Aqara-Vibration-Movement": "icon_vibration.scale-400",
    "Aqara-Vibration-Stable": "icon_vibration.scale-400",
    "Barcode": "icon_barcode.scale-400",
    "BuiltInAndUSBCamera": "icon_picture.scale-400",
    "Camera": "layer_icon_camera.scale-400",
    "PictureOnvifDevice": "icon_picture.scale-400",
    "EnOcean-Generic-Temperature-JP": "icon_temperature.scale-400",
    "EnOcean-Occupancy-JP": "icon_occupancy.scale-400",
    "Gravio-CO2": "icon_co2.scale-400",
    "Gravio-Door-JP": "layer_icon_door_and_window_sensor.scale-400",
    "Gravio-Door": "layer_icon_door_and_window_sensor.scale-400",
    "Gravio-Lidar-USB": "icon_other.scale-400",
    "Gravio-Temperature-JP": "icon_temperature.scale-400",
    "Gravio-Temperature": "icon_temperature.scale-400",
    "Gravio-TwoButtonSwitch-JP": "icon_button.scale-400",
    "Gravio-UltraSonic-USB": "icon_other.scale-400",
    "ORC-UV-M03-serie": "icon_other.scale-400",
    "Pressac-CO2-JP": "icon_co2.scale-400",
    "Other": "devices_icon_devices.scale-400",
};


export {
    Hubkit,
    Area,
    Device,
    SensorMap,
    PositionedDevice,
    DeviceTypeMap,
    DeviceType2IconMap,
}