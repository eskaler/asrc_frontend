<template>
  <div id="trends-table" class="h-100">
    <!-- <h1>События</h1>     -->
    <div class="row">
      <div class="col-lg-4">
        <b-input-group>
          <template v-slot:prepend>
            <b-input-group-text >Врем. интервал</b-input-group-text>
          </template>
          <!-- @input="setDateInterval" -->
            <b-form-datepicker
              id="datepicker-datefrom"
              v-model="dateFrom"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
              
              initial-date="2019-07-05"
              placeholder="От"
              locale="ru"
          ></b-form-datepicker>
            <b-form-datepicker
              id="datepicker-dateto"
              v-model="dateTo"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
              initial-date="2020-01-17"
              
              placeholder="До"
              locale="ru"
          ></b-form-datepicker>
        </b-input-group>
      </div>  
      <div class="col-lg-3">
        <b-input-group>
          
          <template v-slot:prepend>
            <b-input-group-text >Объект</b-input-group-text>
          </template>
          <b-form-select 
            id="objectsList" 
            text-field="name"
            value-field="name"
            v-model="prjMarkFilter"
            :options="$route.params.objects" 
            :disabled="!showTable"
            ref="objectsList"
            >
            <template v-slot:first>
              <b-form-select-option value="null" enabled>События всех объектов</b-form-select-option>
            </template>
          </b-form-select>
        </b-input-group>
      </div>
      <div class="col-lg-3">
        <b-input-group>
          <template v-slot:prepend>
            <b-input-group-text >Тип события</b-input-group-text>
          </template>
          <b-form-select 
            v-model="msgTypeFilter"
            :options="filterMsgTypeOptions" 
            :disabled="!showTable"
            >
          </b-form-select>
        </b-input-group>
      </div>

      <div class="col-lg-1">
        <b-button variant="outline-primary" @click="prepareTableData">Просмотр</b-button>
      </div>
    </div>

    <div class="row mt-4">
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
          :filter-function="filterTable"
          small
          hover

          sortable=true
          sort-by="date_time"
          sort-desc=true
          
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
        { key: 'msg_user',    label: 'Инициатор'},
        { key: 'msg_text',    label: 'Сообщение'},        
      ],

      // isBusy: true,
      perPage: 16,
      currentPage: 1,
      totalRows: 1,      

      rowColors:{
        3: 'danger',
        103: 'success'
      },

      filterOn: ['msg_type', 'prj_mark'],
      prjMarkFilter: null,
      msgTypeFilter: null,
      filterMsgTypeOptions: [
        { value: null, text: 'Все'},
        { value: '3', text: 'Неисправность оборудования'},
        { value: '103', text: 'Восстановление работоспособности оборудования'}
      ]

    }
  },
  methods: {
    async prepareTableData(){
      if(this.dateFrom != null && this.dateTo != null){
        this.showTable = true;
        for (let i = 0; i < this.$route.params.objects.length; i++) {
          var query = `${api.host}/event/${this.$route.params.objects[i]}/${this.dateFrom}/${this.dateTo}/data`;
          var objectEvents = (await this.axios.get(query)).data;
          this.tableData = this.tableData.concat(objectEvents);          
        }
        console.log(this.tableData);
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
    filterTable(item, filter){
      var filterParams = {        
        prjMark: filter.split('|')[0] == "null" ? "null" : filter.split('|')[0].split('_')[1],
        msgType: filter.split('|')[1]
      }
      if(filterParams.msgType == "null" && filterParams.prjMark == "null")
        return true;
      if(filterParams.msgType == 'null')
        return item['msg_prjmark'] == filterParams.prjMark;
      if(filterParams.prjMark == 'null')
        return item['msg_type'] == filterParams.msgType;
      return item['msg_type'] == filterParams.msgType && item['msg_prjmark'] == filterParams.prjMark;
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    }
  },
  computed: {
    filter() {
      return `${this.prjMarkFilter}|${this.msgTypeFilter}`;
    }
  },
  
  created() {

  },
  mounted(){
    
  }

}
</script>

<style>

</style>
