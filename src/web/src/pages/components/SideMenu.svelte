<script lang="ts">
    import type { HubkitSubmission } from "models/SmapModels";
    import { Hubkits, AcceptedMapFiles } from "context/mapContext";
    import type { SensorMap } from "models/GravioModels";
    import { writable } from "svelte/store";
    import * as api from "api/hubkits";

    /** Hubkits given to the side menu by the containing element. Shows saved registered hubkits */
    export let SavedHubkits: Array<SensorMap> = [];

    /** function that executes when Close is clicked */
    export let CloseFunction: () => void;

    /** object holding which fields were errors upon submission */
    let errors = writable({});

    /** object holding the hubkit submission info. */
    let NewHubkitForm: HubkitSubmission = {
        Address: "",
        MapImage: "",
        Name: "",
    };

    /** refreshes hubkit data so that the side menu contains the newest areas, layers, etc */
    async function RefreshHubkits(): Promise<void> {
        // NF TODO
        console.log("refreshing hubkits");
        try {

        } catch (error) {
            console.log("encountered an error while refreshing hubkits:");
            console.log(error);
        }
    }

    /** Saves the changes Hubkit data, such as Hubkit or Area DisplayNames, or device positions (position on map can also be saved in the Maps component)*/
    async function UpdateHubkits(): Promise<void> {
        try {
            // NF todo
            console.log("updating Hubkits");
            return;
        } catch (error) {
            console.log("encountered an error while updating hubkit data:");
            console.log(error);
        }
    }

    /** attempts to register a hubkit. */
    async function TryAddHubkit(): Promise<void> {
        errors = writable({}); // reset error object
        let isErr = false;
        if (NewHubkitForm.Name.trim().length === 0) {
            errors["Name"] = "Name cannot be empty";
            isErr = true;
        }
        if (NewHubkitForm.Address.trim().length === 0) {
            errors["Address"] = "Address cannot be empty";
            isErr = true;
        }
        if (isErr) {
            return; /* do nothing except display errors */
        }
        else {
            /* try to submit the hubkit. */
            console.log("Attempting to add hubkit:");
            console.log(NewHubkitForm);
            try {
                await api.RegisterNewHubkit(NewHubkitForm);
            }
            catch (error) {
                errors["General"] = error;
            }
        }
    } 

    /** controls what section is expanded. If one section is expanded, all others are collapsed */
    let expandedHubkit = writable("Register Hubkitx");
    function toggleHubkit(which: string) {
        expandedArea.set(-1); /* also reset the areas accordings for any hubkits previous selected */
        if ($expandedHubkit === which) {
            expandedHubkit.set("");
            console.log(`set Hubkit ${which} to invisible`);
        } else {
            expandedHubkit.set(which);
            console.log(`set Hubkit ${which} to visible`);
        }
    }

    /** controls what sub-section is expanded. If one is expanded, the others are collapsed */
    let expandedArea = writable(-1);
    function toggleArea(which: number) {
        if ($expandedArea === which) {
            expandedArea.set(-1);
            console.log(`set Hubkit Area ${which} to invisible`);
        } else {
            expandedArea.set(which);
            console.log(`set Hubkit Area ${which} to visible`);
        }
    }

</script>

<section id="mySidenav" class="sidenav">
        <button class="closebtn" on:click={() => CloseFunction()}>X</button>
        <!-- Register Hubkit Section -->
        <div class="CollapsableSection">
            <div class="CollapsableSectionHeader">
                <h3>Register Hubkit</h3>
                <span class="ButtonGroup">
                    <button  on:click={() => toggleHubkit("Register Hubkit")} title="Collapse this section">{ 
                        $expandedHubkit === "Register Hubkit" ? "˄" : "˅"
                    }</button>
                </span>
            </div>
            <div class="CollapsableSectionContent {$expandedHubkit !== "Register Hubkit" ? "Collapsed" : ""}">
                <form on:submit|preventDefault={TryAddHubkit}>
                    <div title="Name of the hubkit to connect to. Optional.">
                        <label>Name:</label>
                        <input required class="{errors["Name"] ? "errorBorder": ""}" type="text" placeholder="Hubkit name" bind:value={NewHubkitForm.Name}/>
                        {#if errors["Name"]} 
                            <div class="error">{errors["Name"]}</div>
                        {/if}
                    </div>
                    
                    <div title="IP address or DNS name of the hubkit to connect to. Required.">
                        <label>Address:</label>
                        <input required class="{errors["Address"] ? "errorBorder": ""}" type="text" placeholder="127.0.0.1" bind:value={NewHubkitForm.Address}/>
                        {#if errors["Address"]} 
                            <div class="error">{errors["Address"]}</div>
                        {/if}
                    </div>

                    <div title="Image file to use for the map display. Optional.">
                        <label>Map Image:</label>
                        <input class="{errors["Map"] ? "errorBorder": ""}" type="file" bind:value={NewHubkitForm.MapImage}/>
                        {#if errors["Map"]} 
                            <div class="error">{errors["Map"]}</div>
                        {/if}
                    </div>
                    <br/>
                    <button title="Register this Hubkit.">+ Add Hubkit</button>
                    {#if errors["General"]} 
                        <div class="error" id="ErrorGeneral">{errors["General"]}</div>
                    {/if}
                </form>
            </div>
        </div>

        <h2 style="text-decoration: underline;">Hubkits</h2>
        <!-- Modify Hubkit Section(s) -->
        {#if SavedHubkits.length === 0}
            <span class="CenteredItem">You haven't registered any Hubkits</span>
        {:else}
            {#each SavedHubkits as hk, i}
                <div class="CollapsableSection">
                    <div class="CollapsableSectionHeader">
                        <h3>{hk.Hubkit.DisplayName}</h3>
                        <span class="ButtonGroup">
                            <button title="Refresh" on:click={() => RefreshHubkits()}><img src="assets/refresh.svg" height="10" width="10"/></button>
                            <button  on:click={() => toggleHubkit(`${i}`)} title="Collapse this section">{ 
                                $expandedHubkit === `${i}` ? "˄" : "˅"
                            }</button>
                        </span>
                    </div>
                    <div class="CollapsableSectionContent {$expandedHubkit !== `${i}` ? "Collapsed" : ""}">
                        <!-- Metadata like Id, Name, public, etc -->
                        <div class="Metadata">
                            <label>Id</label>
                            <span>{hk.Hubkit.Id}</span>
                        
                            <label>Name</label>
                            <span>{hk.Hubkit.HubkitName}</span>

                            <label>Public</label>
                            <input type="checkbox" bind:checked={hk.Public}/>

                            <label>Locked</label>
                            <input type="checkbox" bind:checked={hk.Locked}/>
                        
                            <label>Display Name</label>
                            <input type="text" value={hk.Hubkit.DisplayName} placeholder={hk.Hubkit.HubkitName}/>

                            <label>Address</label>
                            <input type="text" required value={hk.Hubkit.Address} placeholder="127.0.0.1"/>

                            <label>Map File</label>
                            <span>
                                {hk.Hubkit.MapUrl ?? "No Map File Uploaded"}
                                <input type="file" bind:value={hk.Hubkit.MapUrl} accept={AcceptedMapFiles.join(",")}/>
                            </span>
                        </div>
                        <div class="CenteredItem">
                            <button title="Save changes to this Hubkit" on:click={() => UpdateHubkits()}>Update</button>
                        </div>
                        <!-- Area Info -->
                        <div class="HubkitAreas">
                            <h4>Areas</h4>
                            {#if hk.Hubkit.Areas.length === 0}
                                <span>No Areas in this Hubkit</span>
                            {:else}
                                {#each hk.Hubkit.Areas as area, k}
                                    <div class="CollapsableSection">
                                        <div class="CollapsableSectionHeader">
                                            <h5>{area.AreaName}</h5>
                                            <span class="ButtonGroup">
                                                <button  on:click={() => toggleArea(k)} title="Collapse this section">{ 
                                                    $expandedArea === k ? "˄" : "˅"
                                                }</button>
                                            </span>
                                        </div>
                                        {#if $expandedArea === k}
                                            <div class="AreaExpansion">
                                                <div class="Metadata">
                                                    <label>Display Name</label>
                                                    <input type="text" value={area.DisplayName} placeholder={area.AreaName}/>
                                                    <label>Map File</label>
                                                    <input type="file" value={area.MapUrl ? area.MapUrl : ""} />
                                                </div>
                                                <div class="AreaDeviceList">
                                                    <span style="text-decoration: underline">Devices</span>
                                                    {#if area.Devices.length === 0}
                                                        <span class="CenteredItem">No Devices in this Area</span>
                                                    {:else}
                                                        <ul class="DeviceList">
                                                            {#each area.Devices as device, j}
                                                                <li class="DeviceListItem">
                                                                    {device.DeviceName}
                                                                    <span class="ButtonGroup">
                                                                        <!-- Add is enabled only if device isnt on the map already -->
                                                                        <button title="add {device.DeviceName} to the map">+</button>
                                                                        <!-- Remove is disabled only if device is already on the map -->
                                                                        <button title="remove {device.DeviceName} from the map">-</button>
                                                                    </span>
                                                                    <div class="DeviceType">
                                                                        <img
                                                                        alt="icon for device type {device.DeviceType}"
                                                                        height="25" width="25" 
                                                                        src="assets/Devices/{device.getIconImage()}.png">
                                                                        {device.DeviceType}
                                                                    </div>
                                                                </li>
                                                            {/each}
                                                        </ul>
                                                    {/if}
                                                </div>
                                            </div>
                                        {/if}
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
</section>

<style type="scss">
    @import 'style/main.scss';
    
    /* Device Styles */
.DeviceType {

}
.DeviceType img {
    vertical-align: middle;
}
.DeviceType:before {
    content: '├'
}
.DeviceList {
    margin-top: 0px;
}
.DeviceListItem {
    list-style-type: none;
}
.DeviceListItem:before {
    content: '├';
    margin-left: -20px;
    margin-right: 5px; 
}
.DeviceListItem span {
    float: right;
}
.DeviceListItem span button {
    padding: 0px;
    width: 15px;
    text-align: center;
}
:global(.CenteredItem) {
    /* position: fixed; */
    width: 50%;
    margin: 0 auto;
    left: 0;
    right: 0;
    text-align: center;
}

/* Metadata Styles */
div.Metadata {
    display:grid;
    /* grid-template-columns: max-content max-content; */
    grid-template-columns: max-content 1fr;
    grid-column-gap: 25px;
}
div.Metadata label {
     text-align: left;
}
div.Metadata label:after {
    content: ":";
}
div.Metadata input[type="checkbox"] {
    width: 0px;
}

/* Card Styles */
.Collapsed {
    display: none;
}
.CollapsableSection {
    border-style: solid;
    border-color: black;
    border-width: 1px;
    padding: 5px;
    margin-bottom: 1px;
    background-color: beige;
}
.CollapsableSectionContent {

}
.CollapsableSectionHeader {
    text-decoration: underline;
    width: 100%;
    display: inline-flex;
}
.CollapsableSectionHeader .ButtonGroup {
    margin-left: auto;
    float: right;
}
.CollapsableSectionHeader button {

}
.CollapsableSectionHeader h3 {
    float: left;
}
.CollapsableSectionHeader h3:hover {
    text-decoration: underline;
}

/* Area styles */
.HubkitAreas .CollapsableSection {
    border-color: black;
    border-width: 2px;
    border-style: solid;
    background-color: white;
    margin-bottom: 1px;
    padding: 5px;
}
:global(.error) {
    color: red;
}
:global(.errorBorder) {
    border-color: red;
    border-width: 2px;
    border-style: solid;
}



/* The side navigation menu */
.sidenav {
  height: 100%; /* 100% Full-height */
  width: 350px; /* 0 width - change this with JavaScript */
  position: fixed; /* Stay in place */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at theop */
  left: 0;
  background-color: white; /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  overflow-y: auto; /* Enable vertical scroll */
  transition: 0.5s; /* 0.5 second transition effect to slide in the sidenav */
  padding-top: 50px; /* NF TODO - ask nas. this causes issue with with y-overflow */
}

/* The navigation menu links */
.sidenav a {
  padding: 8px 8px 8px 32px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

/* When you mouse over the navigation links, change their color */
.sidenav a:hover {
  color: #f1f1f1;
}

/* Position and style the close button (top right corner) */
.sidenav .closebtn {
  position: absolute;
  top: 5px;
  right: 5px;
  /* font-size: 36px; */
  margin-left: 50px;
}
</style>