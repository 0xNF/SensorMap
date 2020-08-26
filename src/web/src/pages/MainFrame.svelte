<script lang="ts">
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { Smaps } from "context/mapContext";
    import type { SensorMap } from "models/State";
    import SideMenu from "./components/SideMenu.svelte";
    import MainDisplay from './components/MainDisplay.svelte';
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

    function expandDropdown() {
        document.getElementById("hubkitSelectMenu").classList.toggle("show");
    }


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
                <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle"
                    on:click={() => expandDropdown()}
                    type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    </button>
                    <div id="hubkitSelectMenu" class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {#each $Smaps as sm}
                            <div class="dropdown-item" on:click={() => {SelectSensorMap(sm.Hubkit.Id)}}>
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
                <MainDisplay SensorMap={$SelectedSensorMap}/>
            {/if}
        </div>
</section>


<style type="scss">
    @import 'style/main.scss';
    section {
        height: 100%;
        display: flex;
        flex-direction: column;
        margin: 0;
      }

    header {
        flex: 0 1 5%;
        background: $Color_Primary;
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


/* Add a red background color to navbar links on hover */
.navbar a:hover, .dropdown:hover .dropbtn {
  background-color: $Color_Primary;
}

.dropdown-menu > div:hover {
    background-image: none;
    background-color: $Color_Primary;
}
</style>