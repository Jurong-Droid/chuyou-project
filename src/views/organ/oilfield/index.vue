<template>
  <div class="app-container">
    <div>
      <el-input size="mini" v-model="listLoading" placeholder="输入油田" style="width:15%"></el-input>
      <el-button size="mini" v-waves type="primary" icon="el-icon-search">搜索</el-button>
      <br>
    </div>
    <div>
      <el-table :data="leftlist" border fit highlight-current-row style="font-size: 16px" :header-cell-style="{background:'#f5f7fa',color:'#409EFF'}" >
        <el-table-column align="center" label="油田" prop="oilfield" min-width="12"></el-table-column>
        <el-table-column align="center" label="管理" min-width="20">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="listdelete(scope.row.id)" >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div align="center"><br>
      <el-button type="primary" @click="addlist()" >添加</el-button>
    </div>

    <el-dialog title="添加" :visible.sync="dialogFormVisible">
      <el-form class="small-space" :model="tempinfo" label-position="left" label-width="15%">

        <el-form-item label="油田名称" required>
          <el-input type="text" v-model="tempinfo.name" style="width: 40%"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="success" @click="addCamera">创 建</el-button>
      </div>
    </el-dialog>

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
      tempinfo:{
        id:null,
        name:null
      },
      dialogFormVisible:false,
      listLoading :null,
      leftlist:[]
    }
  },
  methods:{
    listdelete(n){
      const index=this.leftlist.findIndex(item=>item.id===n);
      this.leftlist.splice(index,1)
      this.api({
        url:"/organizationInfo/deletelist",
        method:"post",
        data:{
          oname:1,
          fid:n,
          name:null
        }
      }).then(data=>{
      })
    },
    handleSelectChange(){

    },
    handleFilter() {
      //搜索
      this.listLoading = true
      setTimeout(() => {
        this.listLoading = false
      }, 1000)
    },
    getlist(){
      this.api({
        url:"/organizationInfo/getoilfield",
        method:"get",
      }).then(data=>{
        console.log(data);
        data.forEach(temp=>{
          this.leftlist.push({
            id:temp.oilfieldId,
            oilfield: temp.oilfieldName,
          })
        })
      })
    },
    addlist(){
      this.dialogFormVisible=true;
    },
    addCamera(){
      let _vue=this;
      this.api({
        url:"/organizationInfo/addlist",
        method:"post",
        data:this.tempinfo
      }).then(data=>{
        _vue.$message.success('添加成功');
        this.leftlist=[];
        this.getlist();
      })
      this.dialogFormVisible=false;
    }
  },
  mounted() {
    document.body.style.zoom = "0.8";
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    this.getlist();
  }
}
</script>
