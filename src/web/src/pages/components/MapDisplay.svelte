<script lang="ts">
    import type { SensorMap } from "models/State";
    import { AcceptedMapFiles } from "context/mapContext";
    import { writable } from "svelte/store";
    import * as api from 'api/hubkits';

    export let SensorMap: SensorMap = null;
    let newMapUrl: string = "";
    let ErrorText = writable("");

    async function UpdateHubkit() {
        console.log("updating current SensorMap");
        document.getElementById("uploadMapDataError").classList.add("collapsed");
        if (newMapUrl && SensorMap) {
            try {
                await api.UpdateSensorMap(SensorMap);
            } catch (error) {
                console.log("error in updating:");
                console.log(error);
                document.getElementById("uploadMapDataError").classList.remove("collapsed");
                ErrorText.set(error);
            }
        }
    }
    
</script>

<section>
    <span>
        {#if !SensorMap}
            nuttin' here
        {:else if !SensorMap.Hubkit?.MapUrl}
            No Map Data for this Hubkit.
            <label>Upload Map File</label>
            <input type="file" bind:value={newMapUrl} accept={AcceptedMapFiles.join(",")}/>
            <button on:click={() => UpdateHubkit()}>Upload</button>
            <div id="uploadMapDataError" class="error collapsed">{$ErrorText}</div>
        {:else}
        {/if}
    </span>
</section>

<style>

    .collapsed {
        display: none;
    }
    section {
        margin: auto;
    }
</style>