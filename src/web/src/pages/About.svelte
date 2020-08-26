<script lang="ts">
//   import { getContext } from 'svelte'
//   const theme = getContext('theme');
import ""

  const pageName="About Page";
</script>

<main class="bg">
    <h1> {pageName}!</h1>
    <p>Welcome this is my <b>{pageName}</b></p>
</main>

<style type="scss">
    @import 'style/main.scss';
    main {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    @media (min-width: 640px) {
        main {
            max-width: none;
        }
    }
</style>
