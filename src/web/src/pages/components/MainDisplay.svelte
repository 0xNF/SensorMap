<script lang="ts">
    import type { SensorMap } from "models/State";
    import { AcceptedMapFiles } from "context/mapContext";
    import { writable } from "svelte/store";
    import * as api from 'api/hubkits';
    import { onMount } from "svelte";
    import type { Device } from "models/GravioModels";
    import MapDisplay from "./MapDisplay.svelte";
    import TableDisplay from "./TableDisplay.svelte";
    import { SVG } from '@svgdotjs/svg.js'
    import '@svgdotjs/svg.draggable.js'

    export let SensorMap: SensorMap = null;
    let newMapUrl: string = "";
    let ErrorText = writable("");

    const views = {
        MapView: "MapView",
        TableView: "TableView",
    }
    let view = views.MapView;

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

    onMount(() => {
        console.log("hey mount");
        // var draw = SVG()
        // .fill("black")
        //     .addTo('#canvas')
        //     .size(1920, 1080)
        //     .viewbox(0, 0, 1920, 1080)
        //     .height("100%");
        //     var rect = draw.rect(100, 100);
        //     rect.fill("green");
        //     rect.draggable();
    });

    function load() {
        console.log("ayy load");
    }

    function addDevice(device: Device) {

    }

    function removeDevice(id: string) {

    }

    function addLabel(name: string, areaId: string) {

    }

    function showView(which: string) {
        console.log("setting view to: " + which );
    }
    
</script>

<section>
    <header style="display: flex;">
        <div style="width: 100%" class="btn-group btn-group-toggle float-right" data-toggle="buttons">
            <label class="btn btn-secondary {view === views.MapView ? "active" : ""}">
              <input type="radio" bind:group={view} value={views.MapView} checked={view === views.MapView}> Map View
            </label>
            <label class="btn btn-secondary {view === views.TableView ? "active" : ""}">
              <input type="radio" bind:group={view} value={views.TableView} checked={view === views.TableView}> Table View
            </label>
          </div>
    </header>
    <span>
        {#if !SensorMap}
            No Sensor Map is currently selected. Select one from the menu above, or register a new Hubkit.
        {:else}
            {#if !SensorMap.Hubkit?.MapUrl}
                No Map Data for this Hubkit.
                <label>Upload Map File</label>
                <input type="file" bind:value={newMapUrl} accept={AcceptedMapFiles.join(",")}/>
                <button on:click={() => UpdateHubkit()}>Upload</button>
                <div id="uploadMapDataError" class="error collapsed">{$ErrorText}</div>
            {:else}
                {#if view === views.MapView}
                    <MapDisplay />
                {:else}
                    <TableDisplay />
                {/if}
                <!-- <svg viewBox="0 0 1920 1080" height="90%" width="100%">
                    <image xlink:href="{SensorMap.Hubkit.MapUrl}"/>
                </svg> -->
            {/if}
        {/if}
        <div id="canvas" style="background-color: lightblue; height: 100%; width: 100%;">
        </div>
    </span>
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
        background: #82868C;
        display: block;
        /* padding: 5px 5px 0 5px; */
        margin: 0;
        padding: 0;
    }
    header button {

    }
    .btn.active {
        z-index: 0;
    }
    .btn-group > .btn.active {
        z-index: 0;
    }
    .btn-group-vertical > .btn.active, .btn-group-vertical > .btn:active, .btn-group-vertical > .btn:focus, .btn-group > .btn.active, .btn-group > .btn:active, .btn-group > .btn:focus  {
        z-index: 0;
    }
    .btn-group-vertical > .btn.active, .btn-group-vertical > .btn:active, .btn-group-vertical > .btn:focus, .btn-group > .btn.active, .btn-group > .btn:active, .btn-group > .btn:focus :hover {
        z-index: 0;
    }

    .collapsed {
        display: none;
    }
    section {
        margin: auto;
        height: 100%;
        width: 100%;
    }
</style>