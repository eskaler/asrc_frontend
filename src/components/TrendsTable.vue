<template>
  <div id="trends-table" class="h-100">
    <h1>Таблица</h1>    
    <div class="row">
      <div class="col-lg-11">
        <b-input-group>
          <template v-slot:prepend>
            <b-input-group-text >Временной интервал</b-input-group-text>
          </template>
          <!-- @input="setDateInterval" -->
            <b-form-datepicker
              id="datepicker-datefrom"
              v-model="dateFrom"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
              
              initial-date="2019-09-05"
              placeholder="От"
              locale="ru"
          ></b-form-datepicker>
            <b-form-datepicker
              id="datepicker-dateto"
              v-model="dateTo"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
              initial-date="2019-09-13"
              
              placeholder="До"
              locale="ru"
          ></b-form-datepicker>
        </b-input-group>
      </div>  
      <div class="col-lg-1">
        <b-button variant="outline-primary" @click="prepareTableData">Таблица</b-button>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <b-input-group>
          <template v-slot:prepend>
            <b-input-group-text >Объект</b-input-group-text>
          </template>
          <b-form-select 
            id="objectsList" 
            text-field="name"
            value-field="name"
            :options="$route.params.objects" 
            :disabled="tableIsNotReady"
            ref="objectsList"
            @change="selectObject">
            <!-- <template v-slot:first>
              <b-form-select-option value="all" enabled>Отобразить все объекты</b-form-select-option>
            </template> -->
          </b-form-select>
        </b-input-group>
      </div>
    </div>

    <div class="row">
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
    <div class="row h-100" >
      <div class="col-lg-12 h-100 mh-100" v-if="tableData!=[]" >
        <b-table 
          id="objects-table"
          ref="objects-table"
          :fields="fields"
          :items="tableData" 
          :per-page="perPage"
          :current-page="currentPage"
          small
          hover
          sortable=true
          height='800px'
          class="mt-3 h-100" 
          outlined>
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
</template>

<script>
const api = require('./../utils/apihost');

export default {
  name: 'TrendsTable',
  data(){
    return {
      tableIsNotReady: true,
      tableData: [],
      objectsData: [],

      dateTo: null,
      dateFrom: null,

      fields: [],

      // isBusy: true,
      perPage: 16,
      currentPage: 1,

    }
  },
  methods: {
    async prepareTableData(){
      if(this.dateFrom != null && this.dateTo != null){
        this.tableIsNotReady = true;
        this.objectsData = [];
        this.tableData = [];        
        await this.$route.params.objects.forEach(async element => {
          const newObjectData = { 
            name: element,
            data: await this.getObjectData(element)
            };
          console.log('newObjectData', newObjectData);
          this.objectsData.push(newObjectData);
        });        

        this.tableIsNotReady = false;
        await this.selectObject(this.$route.params.objects[0]);

        return;
      }
      alert("Выберите интервал времени!");
    },

    async selectObject(value){
      //если выбран конкретный объект
      for (let i = 0; i < this.objectsData.length; i++) {
        let object = this.objectsData[i];
        console.log('checking object', object);
        if(object.name == value){
          this.fields = [];
          Object.keys(object.data[0]).forEach(element => {
            this.fields.push({
              key: element,
              sortable: true
            })
          });
          console.log('new fields', this.fields);
          this.tableData = object.data;
          return;
        }
      }
    },

    async getObjectData(tableName){      
      console.log(tableName);
      var dataQuery = `${api.host}/object/${tableName}/${this.dateFrom}/${this.dateTo}/data`;
      console.log('dataQuery', dataQuery);
      var newData = (await this.axios.get(dataQuery)).data;
      console.log('newData', newData);
      return newData;
    }
  },
  computed: {
    totalRows() {
      return this.tableData.length
    },
  },
  
  created() {

  },
  mounted(){
    
  }

}
</script>

<style>

</style>
