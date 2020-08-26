<script lang="ts">
    import type { Svg, G } from '@svgdotjs/svg.js';
    import { SVG } from '@svgdotjs/svg.js'
    import '@svgdotjs/svg.draggable.js'
    import type { SensorMap } from 'models/GravioModels';
    import { PositionedDevice } from 'models/GravioModels';
    import { afterUpdate, beforeUpdate, onMount } from 'svelte';

    export let SensorMap: SensorMap = null;

    
    const PositionedDevices: Array<PositionedDevice> = [];
    let mainSvg: Svg = null;
    const activeGroups: Array<G> = [];

    onMount(() => {
        mainSvg = SVG("#mainsvg") as Svg;
    });
    
    /** when we get a new SensorMap, get some new Positioned Devices */
    beforeUpdate(() => {
        console.log(`Before Updating Map Display with no SensorMap: ${SensorMap?.Id}`)
        PositionedDevices.length = 0;
        if (SensorMap?.Hubkit) {
            SensorMap.Hubkit.Areas.forEach((area,i,a) => {
                area.Devices.forEach((device, j, a2) => {
                    const pd = new PositionedDevice(device, 0, 0);
                    PositionedDevices.push(pd);
                })
            })
        }
        console.log(PositionedDevices);
    })

    /** after Svelte has finished re-rendering, we'll add in the svgs of the PositionedDevices */
    afterUpdate(() => {
        console.log(`After Updating Map Display with no SensorMap: ${SensorMap?.Id}`)
        /* clear the previous active groups */
        activeGroups.forEach((g, i, a) => {
            g.remove(); 
        });
        activeGroups.length = 0;

        PositionedDevices.forEach((pd, i, a) => {
            var pdg = mainSvg.group();
            pdg.attr("id", `pdg_${i}`);
            const r = mainSvg.rect(100, 100).fill("#000").attr("id", `rect_${i}`);
            pdg.add(r);
            pdg.draggable();
            activeGroups.push(pdg);
        });
    });

</script>

<section>
<!-- only renders for a valid Smap -->
{#if SensorMap?.Hubkit?.MapUrl}
    <svg id="mainsvg" preserveAspectRatio="preserve" viewBox="0 0 {SensorMap.Hubkit.MapUrl.Width} {SensorMap.Hubkit.MapUrl.Height}" class="svgbg">
        <image xlink:href="{SensorMap.Hubkit.MapUrl.Url}"/>
    </svg>
{:else}
    A Sensor Map was selected, but no Sensor Map data was found.
{/if}

</section>

<style type="scss">
    @import 'style/main.scss';
    section {
        height: 100%;
        width: 100%;
        position: relative; /* use in combination with svg-position: absolute */
    }
    
    .svgbg {
        /* This is so we can see the boundaries of our svg */
        background-color: "green";
        height: 100%;
        width: 100%;
        position: absolute; /* use in combination with section-position: relative to get rid of height-overflow errors on the svg*/
    }
</style>