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


    const submit = ({ email, password }) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
            const u: User = new User("Test", "Test@Test.invalid");
            setContext(userContextKey, u);
            resolve();
            },
         1000)
        });
    /* initial setup */
    onMount(() => {
        setContext(userContextKey, userContextInitialValue);
    });
</script>

<section>
    <Router url="{url}">
        <div class="content">
            <Route path="about" component="{About}" /> 
            <Route path="/">
                <LoginForm />
            </Route>
            <Route path="/map">
                <Map />
            </Route>
        </div>
        <footer>
            (c) 2020 Asteria Corp.
        </footer>
    </Router>
</section>


<style>
    section {
        background: linear-gradient(to right, #cd76e2, #e358ab);
        height: 100%;
      }

      :global(.bg) {
        background-color: #F2F2F2;
    }

    .content {
        height: 100%;
        padding-bottom: -2.5rem;
    }

    footer {
        bottom: 0;
        height: 2.5rem;
        position: absolute;
    }
</style>