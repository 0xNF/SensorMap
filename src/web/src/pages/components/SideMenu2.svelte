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
    <a href="javascript:void(0)" class="closebtn" on:click={() => CloseFunction()}>&times;</a>
    <a href="#">About</a>
    <a href="#">Services</a>
    <a href="#">Clients</a>
    <a href="#">Contact</a>
</section>

<style>

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
  width: 250px; /* 0 width - change this with JavaScript */
  position: fixed; /* Stay in place */
  z-index: 1; /* Stay on top */
  top: 0; /* Stay at the top */
  left: 0;
  background-color: #111; /* Black*/
  overflow-x: hidden; /* Disable horizontal scroll */
  overflow-y: scroll; /* Enable vertical scroll */
  padding-top: 60px; /* Place content 60px from the top */
  transition: 0.5s; /* 0.5 second transition effect to slide in the sidenav */
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
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}
</style>