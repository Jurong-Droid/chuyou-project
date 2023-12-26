<template>
  <div class="app-container">
    <div style="display: flex; justify-content: space-between;">
      <div class="filter-container" style="width: 52%;">
        <div style="color:#409EFF;font-size: 34px;display: flex;justify-content: center;align-items: center;" >模型队列
          &nbsp;
          <el-select size="small" v-model="id" placeholder="选择边缘端" @change="handleSelectChange">
            <el-option
              v-for="item in edgeId"
              :key="item.id"
              :label="item.edgeName"
              :value="item.id">
            </el-option>
          </el-select>

        </div>
        <el-table :data="leftlist" border fit highlight-current-row style="font-size: 16px" :header-cell-style="{background:'#f5f7fa',color:'#409EFF'}" >
          <el-table-column align="center" label="队列次序" min-width="5">
            <template slot-scope="scope">
              {{ scope.row.queueSort=scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="序号" prop="modelid" min-width="5"></el-table-column>
          <el-table-column align="center" label="名称" prop="modelname" min-width="10"></el-table-column>
          <el-table-column align="center" label="运行时间（秒）" prop="runningTime" min-width="8">
            <template slot-scope="scope">
              <el-input size="mini" v-model="scope.row.runningTime"></el-input>
            </template>
          </el-table-column>

          <el-table-column align="center" label="功能" min-width="8">
            <template slot-scope="scope">
              <el-button size="mini" v-waves type="primary" @click="dropToRightTable(scope.row.modelid)">
                移出
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div align="center">
          <el-button v-if="this.id!==''" type="primary"  @click="addQueue" >确定</el-button>
        </div>

      </div>

      <div style="width: 48%;">
        <div class="filter-container"  >
          &nbsp;
          <el-input size="mini" v-model="listQuery.modelid" style="width:15%" @keyup.enter.native="handleFilter" placeholder="模型序号" clearable />
          <!--      <el-date-picker type="daterange" start-placeholder="开始日期" prefix-icon=0
                            end-placeholder="结束日期" range-separator="|" style="font-size: 20px;height:37px" @sendTimeData="getTime"></el-date-picker>-->
          <el-button size="mini" v-waves type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
          </el-button>
        </div>
        <div class="table-container">
          <el-table :data="tablelist"  v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row style="width: 100%;font-size: 16px" :header-cell-style="{background:'#f5f7fa',color:'#409EFF'}" >
            <el-table-column align="center" label="模型/模型组序号" prop="modelid" min-width="10" ></el-table-column>
            <el-table-column align="center" label="名称" prop="modelname" min-width="10"></el-table-column>
            <el-table-column align="center" label="功能" min-width="8">
              <template slot-scope="scope">
                <el-button size="mini" v-waves type="primary" @click="addToLeftTable(scope.row.modelid)">
                  添加
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import waves from '@/directives/waves/index.js' // 水波纹指令
export default {
  directives: {
    waves
  },
  data() {
    return {
      alllist:[],
      leftlist:[],
      tablelist:[],
      elist:[],
      totalCount: 0, //分页组件--数据总条数
      listLoading: false,
      edgeId:[],
      datalist:[],
      id:"",
      bydname:"",
      modellist:[],
      listQuery: {
        pageNum: 1, //页码
        pageRow: 50, //每页条数
        modelid: null,
      },
      tempModule:{
        modelid: null,
        runningTime: null,
        runningsign: null,
        opensign: null
      },
      leftTableData: []
    }
  },
  methods: {
    handleSizeChange(val) {
      //改变每页数量
      this.listQuery.pageRow = val
      this.handleFilter();
    },
    handleCurrentChange(val) {
      //改变页码
      this.listQuery.pageNum = val
      this.getList();
    },
    handleFilter() {
      //搜索
      this.listLoading = true
      setTimeout(() => {
        this.listLoading = false
      }, 1000)
    },
    addToLeftTable(modelid) {
      //添加到左侧表格
      const index = this.tablelist.findIndex(item => item.modelid === modelid)
      const item = this.tablelist[index]
      this.leftlist.push(item)
      this.tablelist.splice(index, 1)
    },
    dropToRightTable(modelid){
      const index=this.leftlist.findIndex(item=>item.modelid===modelid)
      const item=this.leftlist[index]
      this.tablelist.push(item)
      this.leftlist.splice(index,1)
    },
    updateTime(){
      // Assuming the current row is stored in a variable called `currentRow`
      const index = this.modellist.indexOf(currentRow);
      // this.modellist[index].runningTime=


    },

    getEdgeId(){
      this.listLoading=true;
      this.api({
        url: "/edgeInfo/listEdgeInfo",
        method: "get"
      }).then(data =>  {
        this.listLoading=false;
        for (const datum of data.list) {
          this.edgeId.push({
            "id": datum.id,
            "edgeName": datum.edgeName
          });
        }
      })
    },
    getQueueList(){
      this.listLoading=true;
      this.api({
        url: "/cameraInfo/listCamera",
        method: "get",
      }).then(data=>{
        this.leftTableData=data.list;
      })
    },
    // handleSelectChange(){
    //   this.tablelist=[];
    //   this.leftlist=[];
    //   this.modellist.forEach(temp=>{
    //     if (temp.edgeId==this.id){
    //       if(temp.modelname.includes("(")){
    //         if(temp.modelname.includes("吸烟打电话")){
    //           this.tablelist.push(temp);
    //         }
    //       }else {
    //         this.tablelist.push(temp);
    //       }
    //     }
    //   });
    //   this.leftTableData.forEach(temp=>{
    //     if (temp.edgeId==this.id){
    //       this.leftlist.push(temp);
    //     }
    //   })
    // },

    //代码之精华，包括两个列表去重功能，从数据库获取与页面修改矛盾冲突功能，解决组问题
    handleSelectChange(){
      this.tablelist=[];
      this.leftlist=[];
      this.leftTableData.forEach(temp=>{
        if (temp.edgeId==this.id){
          this.leftlist.push(temp);

        }
      })
      this.modellist.forEach(temp=>{
        if (temp.edgeId==this.id){
          if(temp.modelname.includes("(")){
            if(temp.modelname.includes("吸烟打电话")){
              if(!this.leftlist.some(item => item.modelid === temp.modelid)){
                this.tablelist.push(temp);
              }
            }
          }else {
            if(!this.leftlist.some(item => item.modelid === temp.modelid)){
              this.tablelist.push(temp);

            }
          }
        }
      });
    },
    addQueue() {
      if (this.tablelist.length === 0) {
        this.api({
          url: "/slideDetect/saveQueue",
          method: "post",
          data: this.leftlist
        }).then(() => {
          alert("队列发送成功！")
        })
      }else {
        alert("右侧还有模型未加入队列！")
      }
    }
  },
  async mounted() {
    document.body.style.zoom = "0.8";
    this.listLoading=true;
    await this.api({
      url:"/slideDetect/listModule",
      method:"get",
      params:this.listQuery
    }).then(data=>{
      this.listLoading=false;
      this.datalist=data.list;

      this.datalist.forEach(temp=>{
        this.modellist.push({
          modelid: temp.id,
          edgeId:temp.edgeId,
          runningTime: 5000,
          modelname: temp.moduleName,
          queueSort:0
        });
      });
      this.totalCount=data.totalCount
    });
    this.tablelist=this.modellist;
    this.getQueueList();
    this.getEdgeId();
  }

}

</script>

