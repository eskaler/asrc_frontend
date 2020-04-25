<template>
  <div id="app" style="height: 1024px">
    <!-- https://getbootstrap.com/docs/4.0/examples/starter-template/?# -->
  
  <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
        <a href="#" class="navbar-brand">АСРК. Визуализация архивных данных</a>
        <div id="navbarMenu">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <router-link to="/trends" class="nav-link" active-class="active">Тренды</router-link>
                </li>
                <li class="nav-item">
                    <router-link to="/events" class="nav-link" active-class="active">События</router-link>
                </li>
            </ul>
        </div>

    </nav>  

    <main role="main" class="container-fluid h-100" style="padding-top:10px">

      
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

