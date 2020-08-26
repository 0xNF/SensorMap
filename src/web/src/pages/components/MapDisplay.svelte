<script lang="ts">
    import { SVG } from '@svgdotjs/svg.js'
    import '@svgdotjs/svg.draggable.js'
    import type { SensorMap } from 'models/GravioModels';

    export let SensorMap: SensorMap = null;

</script>

<section>
<!-- only renders for a valid Smap -->
{#if SensorMap?.Hubkit?.MapUrl}
    <svg preserveAspectRatio="preserve" viewBox="0 0 {SensorMap.Hubkit.MapUrl.Width} {SensorMap.Hubkit.MapUrl.Height}" class="svgbg">
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