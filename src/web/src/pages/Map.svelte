<script lang="ts">
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { Smaps } from "context/mapContext";
    import type { SensorMap } from "models/State";
    import SideMenu from "./components/SideMenu2.svelte";
    import MapDisplay from './components/MapDisplay.svelte';
    import *  as api from 'api/hubkits';
    import type { Hubkit } from 'models/GravioModels';

    // todo get Hubkits and get previously selected map
    /** The map that is represented on the screen, selected by the user */
    let SelectedSensorMap: any = writable(null);

    /* Menu operations */
    let IsMenuOpen = writable(false);

    function OpenSmapMenu(): void {
        $IsMenuOpen = !$IsMenuOpen; 
        console.log("Setting side menu open to: " + $IsMenuOpen);
    }

    function CloseSmapMenu(): void {
        $IsMenuOpen = false;
        console.log("Closing side menu");
    }

    function ExpandDropdown(which: string) {
        document.getElementById(which).classList.toggle("collapsed");
    }

    function SelectSensorMap(id: string) {
        console.log("Selecting sensor map with hubkit id: " + id);
        const Smap:SensorMap = $Smaps.find((x) => x.Hubkit.Id === id);
        if (Smap) {
            SelectedSensorMap.set(Smap);
        } else {
            console.log("Failed to find hubkit by that id");
        }
    }

    /* Init */
    onMount(async () => {
        try {
            const fetchedSensorMaps: Array<SensorMap> = await api.GetSensorMaps();
            $Smaps.length = 0; /* clear the array */
            fetchedSensorMaps.forEach((v: SensorMap) => {
                $Smaps.push(v);
            });
        }
        catch (e) {
            // nf todo - better error handling. Show to user?
            console.log(e);
        }
    });


</script>

<section>
        <header style="display: flex;">
            <button on:click={OpenSmapMenu}>⚙</button>
            <span style="margin: 0 auto; text-align: center; display: flex;">
                <span style="display: flex; flex-direction: column; justify-content: center; width: 200px;">
                    {#if !$SelectedSensorMap}
                        No Sensor Map Selected
                    {:else}
                        {$SelectedSensorMap.Hubkit.DisplayName}
                    {/if}
                </span>   
                <div class="dropdown" style="margin: auto 0; margin-left: 15px;">
                    <button class="dropbtn">
                        <span>v</span>
                    </button>
                    <div class="dropdown-content">
                        {#each $Smaps as sm}
                            <div on:click={() => {SelectSensorMap(sm.Hubkit.Id)}}>
                                {sm.Hubkit.DisplayName}
                            </div>
                        {/each}
                    </div>
                </div>
            </span>
            <span id="user_name_block">
                User Name
                <button>👤</button>
            </span>
        </header>
        <span class="side_display" style={$IsMenuOpen ? "display: inline" : "display: none"}>
            <SideMenu CloseFunction={CloseSmapMenu} SavedHubkits={$Smaps}/>
        </span>
        <div id="central_panel">
            {#if ($Smaps).length == 0}
                <div id="no_maps">
                    You have no maps
                    <button on:click={OpenSmapMenu}>+ Add Some</button>
                </div>
            {:else}
                <!-- <MapDisplay SensorMap={$SelectedSensorMap}/> -->
            {/if}
        </div>
</section>


<style>
    section {
        height: 100%;
        display: flex;
        flex-direction: column;
        margin: 0;
      }

    header {
        flex: 0 1 5%;
        background: red;
        border: black;
        border-style: solid;
        border-width: 0 0 2px 0;
        display: block;
        padding: 5px 5px 0 5px;
    }

    .full {
        height: 100%;
    }


    #user_name_block {
        float: right;
    }

    #central_panel {
        /* display: grid;
        height: 50%; */
        height:100%;
    }
    #no_maps {
        display: grid;
        justify-content: center;
        margin: auto;
        font-size: 2em;
    }

    .collapsed {
        display: none;
    }


    /* The dropdown container */
.dropdown {
  float: right;
  overflow: hidden;
}

/* Dropdown button */
.dropdown .dropbtn {
  border: none;
  outline: none;
  background-color: inherit;
  font-family: inherit; /* Important for vertical align on mobile phones */
  margin: 0; /* Important for vertical align on mobile phones */
}

/* Add a red background color to navbar links on hover */
.navbar a:hover, .dropdown:hover .dropbtn {
  background-color: red;
}

/* Dropdown content (hidden by default) */
.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.dropdown-content button {
  float: none;
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  text-align: left;
}

/* Add a grey background color to dropdown links on hover */
.dropdown-content div:hover {
  background-color: #ddd;
}

/* Show the dropdown menu on hover */
.dropdown:hover .dropdown-content {
  display: block;
}
</style>