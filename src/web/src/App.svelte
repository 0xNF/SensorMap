<script lang="ts">
    import { Router, Route, Link } from "svelte-routing";
    import { onMount, setContext } from "svelte";
    import { key as userContextKey,
        initialValue as userContextInitialValue,
        User,
    } from "./context/userContext";
    import About from "./pages/About.svelte";
    import LoginForm from "./pages/LoginForm.svelte";

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
        <nav>
           <Link to="/">Home</Link>
           <Link to="about">About</Link>
         </nav>
         <div>
            <Route path="about" component="{About}" /> 
            <Route path="/">
                <LoginForm />
            </Route>
         </div>
       </Router>
</section>

<style>
    section {
        height: 100vh;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background: linear-gradient(to right, #cd76e2, #e358ab);	
      }
</style>