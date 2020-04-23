<template>
  <div id="app" style="height: 1024px">
    <!-- https://getbootstrap.com/docs/4.0/examples/starter-template/?# -->
    <nav class="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
      <a class="navbar-brand" href="#">Визуализация архивов АСРК</a>

      <ul class="navbar-nav mr-auto">
        <li class="nav-item active">
          <a class="nav-link" href="#"><router-link to="/trends">Тренды</router-link><span class="sr-only">(current)</span></a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">События</a>
        </li>
      </ul>
      <!-- <form class="form-inline my-2 my-lg-0">
        <input class="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search" />
        <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
      </form> -->
    </nav>

    <main role="main" class="container-fluid h-100" style="padding-top:65px">

      
        <router-view ></router-view>
      

    </main><!-- /.container -->
  </div>
</template>

<script>
export default {
  name: "App",
  mounted(){
    this.$router.push('/trends')
  }
};
</script>

