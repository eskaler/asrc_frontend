<template>
  <div id="trends-objects">
    <div class="container-fluid">
      <div class="row">
          <div class="col-lg-8"><h2>Выбор объектов</h2> </div>
          <div class="col-lg-1">
            <router-link 
              v-if="selectedObjects.length > 0" 
              :to="{name: 'trends-graph', params: {objects: this.objectNames}}">
              <b-button variant="outline-primary">
                <b-icon icon="graph-up"></b-icon> График</b-button>
            </router-link>
          </div>
          <div class="col-lg-1">
            <router-link 
              v-if="selectedObjects.length > 0" 
              :to="{name: 'trends-table', params: {objects: this.objectNames}}">
              <b-button variant="outline-primary">
                <b-icon icon="table"></b-icon> Таблица</b-button>
            </router-link>
          </div>
          <div class="col-lg-1">
            <router-link 
              v-if="selectedObjects.length > 0" 
              :to="{name: 'events', params: {objects: this.objectNames}}">
              <b-button variant="outline-primary">
                <b-icon icon="clock"></b-icon> События</b-button>
            </router-link>
          </div>
      </div>
      <div class="row">
          <div class="col-lg">
            <div class="row">
              <div class="col-lg-6">
                <b-form-group
                  
                >
                  <b-input-group size="sm">
                    <template v-slot:prepend>
                      <b-input-group-text >Фильтр</b-input-group-text>
                    </template>
                    <b-form-input
                      v-model="filter"
                      type="search"
                      id="filterInput"
                      placeholder="Поиск..."
                    ></b-form-input>
                    <!-- <b-input-group-append>
                      <b-button :disabled="!filter" @click="filter = ''">Очистить</b-button>
                    </b-input-group-append> -->
                  </b-input-group>
                </b-form-group>
              </div>
              <div class="col-lg-6">
                <b-pagination
                  v-model="currentPage"
                  :total-rows="totalRows"
                  :per-page="perPage"
                  aria-controls="objects-table"
                  align="fill"
                  size="sm"
                  class="my-0"
                ></b-pagination>
              </div>
            </div>
            <div class="row">
              <b-table 
                id="objects-table"
                ref="objectsTable"
                :items="objects" 
                :busy="isBusy" 
                :fields="fields" 
                :per-page="perPage"
                :current-page="currentPage"
                :filter="filter"
                @row-selected="onAddRowSelected"
                @filtered="onFiltered"
                small
                selectable
                hover
                class="mt-3" outlined>
                <template v-slot:table-busy>
                  <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Загрузка...</strong>
                  </div>
                </template>
              </b-table>
            </div>

          </div>
          <div class="col-lg-2 justify-content-center ml-3">
            <div class="span2">
              <p><b-button variant="success" class="btn-block" @click="addSelectedObjects">
                <b-icon icon="play"></b-icon> Добавить</b-button></p>
            
            
              <p><b-button variant="danger" class="btn-block" @click="removeSelectedObjects">
                <b-icon icon="caret-left"></b-icon> Удалить</b-button></p>
            
            
              <p><b-button variant="danger" class="btn-block" @click="removeAllSelectedObjects">
                <b-icon icon="skip-backward"></b-icon> Удалить все</b-button></p>
            </div>
          </div>
          <div class="col-lg">
            <b-table 
                id="selected-objects-table"
                ref="selectedObjectsTable"
                :items="selectedObjects" 
                :fields="fields" 
                @row-selected="onRemoveRowSelected"
                small
                selectable
                hover
                class="mt-3" outlined>
                <template v-slot:table-busy>
                  <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Загрузка...</strong>
                  </div>
                </template>
              </b-table>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
const api = require('./../utils/apihost');

export default {
  name: 'TrendsObjects',
  data(){
    return {
      
      objects: [],
      selectedToAdd: [],
      selectedToRemove: [],
      
      selectedObjects: [],
      
      //параметры таблицы объектов
      isBusy: true,
      perPage: 16,
      currentPage: 1,
      totalRows: 1,
      
      filter: null,
      fields: [
          {
            key: 'tablename',
            label: 'Объект'
          },
          {
            key: 'description',
            label: 'Описание'
          }
        ],
    }
  },  
  methods: {
    onAddRowSelected(items) {
      this.selectedToAdd = items;
    },
    onRemoveRowSelected(items) {
      this.selectedToRemove = items;
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
    addSelectedObjects(){
      
      this.selectedObjects = this.selectedObjects.concat(this.selectedToAdd.filter((item) => this.selectedObjects.indexOf(item) < 0));
      localStorage.setItem('selectedObjects', JSON.stringify(this.selectedObjects));
      this.$refs.objectsTable.clearSelected();
    },
    removeSelectedObjects(){
      this.selectedToRemove.forEach(toRemove => {
        for (let i = 0; i < this.selectedObjects.length; i++) {
          const element = this.selectedObjects[i];
          if(toRemove.tablename == element.tablename){
            this.selectedObjects.splice(i,1);
            break;
          }
        }
      });
      localStorage.setItem('selectedObjects', JSON.stringify(this.selectedObjects));
      this.$refs.selectedObjectsTable.clearSelected();
    },
    removeAllSelectedObjects(){
      this.selectedObjects = [];
      localStorage.removeItem('selectedObjects');
      this.$refs.selectedObjectsTable.clearSelected();
    }
  },
  computed: {
    objectNames(){
      var names = [];
      for (let i = 0; i < this.selectedObjects.length; i++) {
        const element = this.selectedObjects[i];
        names.push(element.tablename);
      }
      return names;
    }
  },
  mounted(){
    console.log(localStorage);
    this.axios.get(`${api.host}/object/all`).then(response =>{
      this.objects = response.data;
      this.totalRows = this.objects.length;
      this.isBusy = !this.isBusy;
    })
    if(typeof(localStorage['selectedObjects']) == 'undefined')
      return;
    this.selectedObjects = JSON.parse(localStorage['selectedObjects']);
  }

}
</script>

<style>

</style>
