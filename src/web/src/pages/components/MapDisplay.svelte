<script lang="ts">
    import { SVG } from '@svgdotjs/svg.js'
    import '@svgdotjs/svg.draggable.js'
    import type { SensorMap } from 'models/GravioModels';

    export let SensorMap: SensorMap = null;

</script>

<section>
<!-- only renders for a valid Smap -->
{#if SensorMap?.Hubkit?.MapUrl}
    <svg viewBox="0 0 1020 1080" height="90%" width="100%">
        <image xlink:href="{SensorMap.Hubkit.MapUrl}"/>
    </svg>
{:else}
    A Sensor Map was selected, but no Sensor Map data was found. 
{/if}

</section>

<style>

</style>