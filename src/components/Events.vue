<template>
  <div id="trends-table" class="h-100">
    <h1>События</h1>    
    <div class="row">
      <div class="col-lg-10">
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
      <div class="col-lg-2">
        <b-button variant="outline-primary" @click="prepareTableData">Просмотр событий</b-button>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <b-input-group>
          <template v-slot:prepend>
            <b-input-group-text >Тип события</b-input-group-text>
          </template>
          <b-form-select 
            v-model="filter"
            :options="filterMsgTypeOptions" 
            :disabled="!showTable"
            >
          </b-form-select>
        </b-input-group>
      </div>
    </div>

    <div class="row">
      <div class="col-lg-12">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          aria-controls="events-table"
          align="fill"
          size="sm"
          class="my-0"
        ></b-pagination>
      </div>
      
    </div>
    <div class="row h-100" >
      <div class="col-lg-12 h-100 mh-100" v-if="showTable">
        <b-table 
          id="events-table"
          ref="objects-table"
          :busy="isBusy" 
          :fields="fields"
          :items="tableData" 
          :per-page="perPage"
          :current-page="currentPage"
          :filter="filter"
          :filter-function="filterMsgType"
          small
          hover
          sortable=true
          height='800px'
          class="mt-3 h-100" 
          outlined
          @filtered="onFiltered">
          <template v-slot:table-busy>
            
            <div class="text-center text-danger my-2">
              <b-spinner class="align-middle"></b-spinner>
              <strong>Загрузка...</strong>
            </div>
          </template>
          <template v-slot:cell(date_time)="data">
            {{ (new Date(data.value)).toLocaleDateString("ru", { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) }}  
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
      
      dateTo: null,
      dateFrom: null,
    
      tableData: [],

      isBusy: true,
      showTable: false,
      
      fields: [
        { key: 'date_time',   label: 'Время'},
        { key: 'msg_prjmark', label: 'Объект'},
        { key: 'msg_user',    label: 'Пользователь'},
        { key: 'msg_text',    label: 'Текст сообщения'},        
      ],

      // isBusy: true,
      perPage: 16,
      currentPage: 1,
      totalRows: 1,      

      rowColors:{
        3: 'danger',
        103: 'success'
      },

      filterOn: ['msg_type'],
      filter: null,
      filterMsgTypeOptions: [
        { value: null, text: 'Все'},
        { value: '3', text: 'Неисправность оборудования'},
        { value: '103', text: 'Восстановление работоспособности оборудования, значение контролируемого параметра ниже порогового'}
      ]

    }
  },
  methods: {
    async prepareTableData(){
      if(this.dateFrom != null && this.dateTo != null){
        this.showTable = true;
        this.tableData = (await this.axios.get(`${api.host}/event/${this.dateFrom}/${this.dateTo}/data`)).data;
        for (let i = 0; i < this.tableData.length; i++) {
          const event = this.tableData[i];
          event._rowVariant = this.rowColors[event.msg_type];
          this.tableData[i] = event;
        }
        this.totalRows = this.tableData.length;
        this.isBusy = false;
        return;
      }
      alert("Выберите интервал времени!");
    },
    filterMsgType(item, msgType){
      return item['msg_type'] == msgType;
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    }
  },
  computed: {
  },
  
  created() {

  },
  mounted(){
    
  }

}
</script>

<style>

</style>
