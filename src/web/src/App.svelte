<script lang="ts">
    import { Router, Route, Link } from "svelte-routing";
    import { onMount, setContext } from "svelte";
    import { key as userContextKey,
        initialValue as userContextInitialValue,
        User,
    } from "./context/userContext";
    import About from "./pages/About.svelte";
    import LoginForm from "./pages/LoginForm.svelte";
    import MainFrame from "./pages/MainFrame.svelte";

    export let url = ""; //This property is necessary declare to avoid ignore the Router

    /* initial setup */
    onMount(() => {
        setContext(userContextKey, userContextInitialValue);
    });
</script>

<section>
    <Router url="{url}">
        <main class="content">
            <Route path="about" component="{About}" /> 
            <Route path="/">
                <LoginForm />
            </Route>
            <Route path="/map">
                <MainFrame />
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
    main {
        flex: 0 1 95%;
        background: lightblue;
    }
    footer {
        flex: 0 1 5%;
        background: blue;
    }
</style>