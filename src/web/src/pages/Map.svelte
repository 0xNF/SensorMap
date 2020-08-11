<script lang="ts">
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import { Smaps } from "context/mapContext";
    import type { SensorMap } from "models/State";
    import SideMenu from "./components/SideMenu.svelte";
    import *  as api from 'api/hubkits';
    import type { Hubkit } from 'models/GravioModels';

    // todo get Hubkits and get previously selected map

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
    <div class="bg full">
        <nav>
            <button on:click={OpenSmapMenu}>⚙</button>
            <span id="user_name_block">
                User Name
                <button>👤</button>
            </span>
        </nav>
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
                You have this many: {($Smaps).length}
            {/if}
        </div>
    </div>
</section>


<style>
    section {
        height: 100%;
    }
    .full {
        height: 100%;
    }

    nav {
        background-color: white;
        border: black;
        border-style: solid;
        border-width: 0 0 2px 0;
        display: block;
    }
    #user_name_block {
        float: right;
    }

    #central_panel {
        display: grid;
        height: 50%;
    }
    #no_maps {
        display: grid;
        justify-content: center;
        margin: auto;
        font-size: 2em;
    }
</style>