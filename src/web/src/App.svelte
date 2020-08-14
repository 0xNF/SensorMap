<script lang="ts">
    import { Router, Route, Link } from "svelte-routing";
    import { onMount, setContext } from "svelte";
    import { key as userContextKey,
        initialValue as userContextInitialValue,
        User,
    } from "./context/userContext";
    import About from "./pages/About.svelte";
    import LoginForm from "./pages/LoginForm.svelte";
    import Map from "./pages/Map.svelte";

    export let url = ""; //This property is necessary declare to avoid ignore the Router

    /* initial setup */
    onMount(() => {
        setContext(userContextKey, userContextInitialValue);
    });
</script>

<section>
    <Router url="{url}">
        <header>
            hi
        </header>
        <main class="content">
            <Route path="about" component="{About}" /> 
            <Route path="/">
                <LoginForm />
            </Route>
            <Route path="/map">
                <Map />
            </Route>
        </main>
        <footer>
            (c) 2020 ayy lmao, llc.
        </footer>
    </Router>
</section>


<style>
    section {
        /* background: linear-gradient(to right, #cd76e2, #e358ab); */
        height: 100%;
        display: flex;
        flex-direction: column;
        margin: 0;
      }

      :global(.bg) {
        background-color: #F2F2F2;
    }
    /* html {
        height: 100%;
    } */
    header {
        flex: 0 1 5%;
        background: red;
    }
    main {
        flex: 0 1 90%;
        background: yellow;
    }
    footer {
        flex: 0 1 5%;
        background: blue;
    }
</style>