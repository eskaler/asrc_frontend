<template>
  <div id="trends-graph">
    <h2>График</h2>    
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
              
              initial-date="2020-02-28"
              placeholder="От"
              locale="ru"
          ></b-form-datepicker>
            <b-form-datepicker
              id="datepicker-dateto"
              v-model="dateTo"
              :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
              initial-date="2020-03-31"
              
              placeholder="До"
              locale="ru"
          ></b-form-datepicker>
        </b-input-group>
      </div>  
      <div class="col-lg-1">
        <b-button variant="outline-primary" @click="prepareGraphData">График</b-button>
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
            v-model="selectedObjectName"
            text-field="name"
            value-field="name"
            :options="$route.params.objects" 
            :disabled="graphIsNotReady"
            ref="objectsList"
            
            @change="selectObject">
            <template v-slot:first>
              <b-form-select-option value="all" enabled>Отобразить все объекты</b-form-select-option>
            </template>
          </b-form-select>
        </b-input-group>
      </div>
      
    </div>
    <div class="row">
      <div class="col-lg-8">
        <vue-plotly :data="graphData" :layout="layout" :options="options" 
          v-on:doubleclick="resetyaxis"
          ref="plotlyGraph" style="height:800px"/>
      </div>
      <div class="col-lg-4" v-if="selectedObjectName!=[]">
        <b-table 
          id="objects-table"
          ref="objectsTable"
          :items="selectedObjectTableData" 
          :fields="fields" 
          small
          hover
          sticky-header="700px"
          height=800
          class="mt-3" outlined>
          <template v-slot:cell(date_time)="data">
            {{ (new Date(data.value)).toLocaleDateString("ru", { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }) }}  
          </template>
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
import VuePlotly from '@statnett/vue-plotly'
const api = require('./../utils/apihost');
const logIcon = require('./../assets/logIcon');
import Plotly from 'plotly.js'
import plotFR from 'plotly.js/lib/locales/ru'

Plotly.register(plotFR)
// Plotly.setPlotConfig({ locale: 'fr' })

export default {
  name: 'TrendsGraph',
  components: {
    VuePlotly
  },
  data(){
    return {
      graphData: [],
      objectsData: [],
      selectedObjectName: "all",

      graphIsNotReady: true,

      dateTo: null,
      dateFrom: null,

      yaxis: [],

      layout:  {
        yaxis: {
          type: 'linear',
          autorange: true,
          domain: [0.5, 1]
        },
        xaxis: {
          type: 'date',
          autorange: true,
          
        },
        legend: {traceorder: 'reversed'},
        showlegend: true
      },
      options: {
        locale: 'ru',
        // responsive: true,
        displayModeBar: true,
        modeBarButtonsToAdd: [
        {
          name: 'Логарифмическая / линейная',
          direction: 'up',
          click: this.switchLogLinear,
          icon: logIcon
        }],
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
      },

      // isBusy: true,
      perPage: 16,
      currentPage: 1,
      fields: [
        {
          key: 'date_time',
          label: 'Время'
        },
        {
          key: 'whatever',
          label: 'Значение'
        },
      ],
    }
  },
  computed: {
    objectsAreReady(){
      return this.objectsData.length > 0;
    },
    selectedObjectTableData(){
      if(this.selectedObjectName == "all" ){
        return [];
      }
      let tableData = [];
      for (let i = 0; i < this.graphData.length; i++) {
        if(this.graphData[i].name == this.selectedObjectName){
          let selectedObjectData = this.graphData[i];
          for (let j = 0; j < selectedObjectData.x.length; j++) {
            var newTableEntry = {date_time: selectedObjectData.x[j]};
            newTableEntry[selectedObjectData.ydescription] = selectedObjectData.y[j];
            tableData.push(newTableEntry);
          }
        }
      }
      return tableData;
      
    }
  },
  methods: {
    resetyaxis(){
      console.log('resetaxis', this.yaxis);
      if(this.yaxis.length > 0){
        this.layout.yaxis.autorange = false;
        this.layout.yaxis.range = [...this.yaxis];
        
      }
        
    },
    async prepareGraphData(){
      if(this.dateFrom != null && this.dateTo != null){
        this.objectsData = [];
        this.graphData = [];
        this.selectedObjectName = "all";
        await this.$route.params.objects.forEach(async element => {
          const newObjectData = (await this.getObjectData(element));
          this.objectsData.push(newObjectData);
        });        
        this.graphIsNotReady = false;
        await this.selectObject("all");
        return;
      }
      alert("Выберите интервал времени!");
    },

    async selectObject(value){
      this.graphData = [];
      //если выбраны все объекты
      if(value == "all"){
        this.layout.shapes = [];
        this.layout.yaxis.autorange = true;
        this.graphData = this.objectsData;
        this.layout.yaxis.domain = [0,1];
        await this.$refs.plotlyGraph.react();
        return;
      }
      
      //если выбран конкретный объект
      this.layout.yaxis.domain = [0.5,1];
      for (let i = 0; i < this.objectsData.length; i++) {
        let object = this.objectsData[i];
        if(object.name == value){
          this.graphData.push(object);
          this.divideLayout(object.signals);
          this.graphData.push(object.upRange);        
          this.graphData.push(object.downRange);

          this.fields[1].key = object.ydescription;
          this.$refs.plotlyGraph.react();

          console.log('wtf', object.yaxisRange);
          this.layout.yaxis.range = [...object.yaxisRange];
          this.yaxis = [...object.yaxisRange];

          this.layout.yaxis.autorange = false;
          this.layout.shapes = object.shapes;
          this.options.doubleClick = 'reset';
          
          return;
        }
      }
    },

    //разделение layout для добавления сигналов
    divideLayout(signals){
      var total = signals.length;
      var part = 0.4/total;
      this.layout.subplots = [];
      for (let j = 0; j < total; j++) {
        const signal = signals[j];
        this.layout[`yaxis${signal.yaxisNumber}`] = { 
          showticklabels:false,
          domain: [j * part, j * part + part], 
          anchor: signal.yaxis,
          fixedrange: true

          };
        this.graphData.push(signal); 
      }
    },

    async getObjectData(tableName){
      return this.axios.get(`${api.host}/object/${tableName}/description`).then(async (response) => {
        var columns = response.data;
        var newData = {signals:[], upRange: {}, downRange: {}, y: []};
        var signalsCounter = 2;
        var dataQuery = "";
        this.layout.yaxis.range=[];
        //поиск столбца даты
        newData.x = (await this.axios.get(`${api.host}/object/${tableName}/date_time/${this.dateFrom}/${this.dateTo}/data`)).data['date_time'];

        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          dataQuery = `${api.host}/object/${tableName}/${column.columnname}/${this.dateFrom}/${this.dateTo}/data`;

          if(column.description == 'value'){
            newData.y  = (await this.axios.get(dataQuery)).data[column.columnname];
            newData.ydescription = column.columnname;
            newData.yaxisRange = (await this.axios.get(`${api.host}/object/${tableName}/${column.columnname}/${this.dateFrom}/${this.dateTo}/minmax`)).data;
            console.log('yaxis.range', newData.yaxisRange);
          }
          if(column.datatype == "boolean"){
            var signalData = {};
            signalData.y = (await this.axios.get(dataQuery)).data[column.columnname];
            for (let j = 0; j < signalData.length; j++) {
              signalData[j] = Number(signalData[j]);
            }
            signalData.x = newData.x;
            signalData.type = 'lines+points';
            signalData.fill = 'tozeroy';
            signalData.name = column.columnname;
            signalData.yaxis = `y${signalsCounter}`;
            signalData.yaxisNumber = signalsCounter;
            signalData.type = 'scatter';
            signalData.line= {shape: 'hv'};
            signalsCounter++;
            
            newData.signals.push(signalData);
          }
        }
        if(newData.y.length == 0){
          for (let i = 0; i < columns.length; i++) {
            const column = columns[i];
            if(column.datatype == "real"){
              dataQuery = `${api.host}/object/${tableName}/${column.columnname}/${this.dateFrom}/${this.dateTo}/data`;
              newData.y  = (await this.axios.get(dataQuery)).data[column.columnname];
              newData.ydescription = column.columnname;
              break;
            }
          }
        }

        newData.shapes =  (await this.axios.get( `${api.host}/object/${tableName}/threshold/shapes`)).data;
        

        newData.type = 'scatter';
        newData.line= {shape: 'hv'};
        newData.mode = 'lines';
        newData.name = tableName;
        newData.text = tableName;
        
        newData.value = tableName;
        return newData;
      })
    },


    switchLogLinear(){
      if(this.layout.yaxis.type == "log"){
        this.layout.yaxis.type = "linear"
      }
      else{
        this.layout.yaxis.range
        this.layout.yaxis.type = "log"
      }
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
