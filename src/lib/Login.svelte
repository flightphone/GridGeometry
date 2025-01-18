<script>
  import { mainObj } from "../store";
  let username;
  let password;
  let message;
  const login = async () => {
	if (mainObj.jsonData)
	{
		localStorage.setItem("access_token", "jsonData");
		window.location.reload();
		return;
	}

    const url = `${mainObj.baseUrl}/login`;

    let query = {
      username: username,
      password: password,
    };

	

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(query),
    }).catch(err => { 
		message =   err.toString();
		return {message:  err.toString()};
	});
	if (response.message)
		return;
    const token = await response.json().catch((err)=>{return {message: err.toString()}});
	if (token.message)
	{
		message = token.message;
	}
	else
	{
		
		message = "";
		localStorage.setItem("access_token", token.token);
		window.location.reload();
	}

  };
</script>

<div class="mdl-layout mdl-js-layout">
  <main class="mdl-layout__content">
    <div class="mdl-card mdl-shadow--6dp">
      <div class="mdl-card__title mdl-color--primary mdl-color-text--white">
        <h2 class="mdl-card__title-text">Sign In</h2>
      </div>
      <div class="mdl-card__supporting-text">
        <div
          class="mdl-textfield mdl-js-textfield mdl-textfield"
        >
          <input
            class="mdl-textfield__input"
            id="login"
            name="login"
            placeholder="login"
            bind:value={username}
          />
          <!--<label class="mdl-textfield__label" for="login">Login</label>-->
        </div>
        <div
          class="mdl-textfield mdl-js-textfield mdl-textfield"
        >
          <input
            class="mdl-textfield__input"
            type="password"
            id="password"
            name="password"
            bind:value={password}
            placeholder="password"
          />
          <!--<label class="mdl-textfield__label" for="password">Password</label>-->
        </div>
		<div>
			{message}
		  </div>
      </div>
	  
      <div class="mdl-card__actions mdl-card--border">
        <button
          onclick={login}
          class="mdl-cell mdl-cell--12-col mdl-button mdl-button--raised mdl-button--colored mdl-js-button mdl-js-ripple-effect mdl-color-text--white"
        >
          Login
        </button>
      </div>
    </div>
  </main>
</div>

<style>
  .mdl-layout {
    align-items: center;
    justify-content: center;
  }
  .mdl-layout__content {
    padding: 24px;
    flex: none;
  }
</style>
