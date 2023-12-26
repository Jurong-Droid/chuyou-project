<template>
  <div class="app-container" style=" overflow: hidden; padding-left: 0px">

    <el-row type="flex" style="margin-bottom: -20px;overflow: hidden;margin-right: 1px" :style="combinedStyle">

      <el-col :span="3" v-loading="listLoading" element-loading-text="数据加载中..." :style="{width:isCollapse?'10%':'0.5px'}">
        <div style="width: 10%;height: 95%;overflow: scroll;position: absolute;z-index: 1002;"
        :style="{display: isCollapse ?'block':'none'}"
        >
          <div>
<!--            "overflow: scroll;width: 100%;height: 40%"-->
          <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText"/>
<!--      @node-click="clickNode"    default-checked-keys=""  -->
          <el-tree class="filter-tree" ref="tree" :data="data" node-key="id" :expand-on-click-node="false" show-checkbox
                   :props="defaultProps"   highlight-current
                   @check-change="handleCheckChange" :check-strictly="true"
                   default-expand-all>
          </el-tree>


          </div>
        </div>
      </el-col>
<!--      <el-button  size="mini" type="primary" @click="opentree"  class="vertical-text" style="height: 50%;align-self: center" circle :icon="isCollapse?'el-icon-arrow-left':'el-icon-arrow-right'"></el-button>-->
      <el-button  size="mini"   @click="opentree"  class="vertical-text" style="height: 50%;margin-left: -20px;z-index: 1003;align-self: center;margin-right: 1px" circle >
        <i v-if="isCollapse" class="el-icon-arrow-left"  style="margin-left: 0px"></i>
        <i v-else class="el-icon-arrow-right" style="transform: translateX(7px);"></i>
      </el-button>
      <el-col :span="21" :style="{flexGrow:isCollapse?'0':'1'}">
        <div>
          <splitScreen @custom-event="closetree"></splitScreen>
        </div>
      </el-col>
    </el-row>

  </div>

</template>

<script>
import SplitScreen from "@/components/SplitScreen";

export default {
  components: {
    SplitScreen,
  },
  data() {
    return {
      isCollapse:true,
      locationlist:[],
      oparealist:[],
      filterText: "",
      listLoading: false, //数据加载等待动画
      listQuery: {
        id: [],
        level: "",
        url : ""
      },
      data: [
      ],
      defaultProps: {
        children: "children",
        label: "name",
        level: "level",
      },
    };
  },
  computed:{
    combinedStyle(){
      return{
        flexWrap:this.isCollapse?'nowrap':'wrap',
        marginRight:this.isCollapse?'0px':'1px',
      };
    },
  },
  provide() {
    return {
      searchParam: () => this.listQuery,

    };
  },
  async created() {
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    window.addEventListener('beforeunload', this.CloseCameraLive);
    document.body.style.zoom = "80%";
    this.getoparea();
    this.getlocation();
    await this.getList();
    await this.getNextAboList();
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    opentree(){
      if (this.isCollapse) this.isCollapse=false;
      else this.isCollapse=true;
    },
    async getNextAboList() {
      let n = 0;
      const data = await this.api({
        url: "/screenDisplay/getLastAbnormalList",
        methods: "get",
        params: {
          pageNum: 1,
          pageRow: 50,
        }
      });

      for (const item of data.list) {
        if (!this.listQuery.id.includes(item.camId) && n < 4) {
          n++;

          // 使用setTimeout来延迟调用setChecked方法
          await new Promise((resolve) => {
            setTimeout(async () => {
              await this.$refs.tree.setChecked(item.camId, true);
              resolve();
            }, 200);  // 延迟200毫秒
          });
        }
      }
    },

    getlocation(){
      this.api({
        url:"/organizationInfo/getlocation",
        method:"get",
      }).then(data=>{
        data.forEach(temp=>{
          this.locationlist.push({
            id:temp.locationId,
            fid:temp.opareaId,
            oparea: temp.opareaName,
            location:temp.locationName
          })
        })
      })
    },
    getoparea(){
      this.api({
        url:"/organizationInfo/getoparea",
        method:"get",
      }).then(data=>{
        data.forEach(temp=>{
          this.oparealist.push({
            id:temp.opareaId,
            fid:temp.oilplantId,
            oparea: temp.opareaName
          })
          this.data.push({
            id:temp.opareaId,
            level: "1",
            name:temp.opareaName,
            children: []
          })
        })
      })
    },

    closetree(id) {
      if (id[0]==0){
        this.$refs.tree.setChecked(id[1],false)
        this.listQuery.id=this.listQuery.id.filter(item=>item!=id);
      }else {
        this.$refs.tree.setChecked(id[1],true)
        this.listQuery.id.push(id[1])
      }
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },

    getList() {
      //查询列表
      if (!this.hasPerm("cameraLive:list")) {
        return;
      }
      this.listLoading = true;
      this.api({
        url: "/cameraLive/listCameraInfo",
        method: "get",
        params:{
          intell:"0"
        }

      }).then((data) => {
        this.listLoading = false;
        data.forEach(temp=>{
          this.locationlist.forEach(emp=>{
            if (temp.name==emp.location){
              const element = this.data.find(el => el.id == emp.fid);
              if (element) {
                element.children.push(temp);
              }
            }
          })
        })
        this.data = this.data.filter(el => el.children.length > 0);

      }).catch((err) => {
        this.listLoading = false;
      });
    },


    handleCheckChange(data, checked, indeterminate){

      if (data.level==1) {return;}
      if (this.listQuery.id){
        this.listQuery.level=data.level;}
      if (checked){
       this.listQuery.id.push(data.id);
        console.log("push:"+data.id)
      }
      else {
        this.listQuery.id=this.listQuery.id.filter(item=>item!=data.id);
        this.selectCloseCameraLive(data.id)
        console.log("remove:"+data.id)
      }
    },
    selectCloseCameraLive(id){
      this.api({
        url:"/cameraLive/scloseCameraLive",
        method:"post",
        data:{
          id:id
        }
      }).then((data)=>{
        console.log("关闭成功")
      })
    },
    CloseCameraLive(){
      this.api({
        url:"/cameraLive/closeCameraLive",
        method:"get",
      }).then((data)=>{
        console.log("关闭成功")
      })
    }
  },
  beforeRouteLeave(to, from, next) {
    this.CloseCameraLive();
    next();
  }
};
</script>


<style scoped>
/**高亮显示el-tree选中的节点 */
.el-tree--highlight-current /deep/ .el-tree-node.is-current > .el-tree-node__content:before {
  content: "";
  background-color: rgb(64, 158, 255);
  width: 4px;
  height: 80%;
  float: left;
  position: absolute;

}

.el-tree--highlight-current /deep/ .el-tree-node.is-current > .el-tree-node__content {
  background-color: rgb(255, 255, 255);
  color: rgb(64, 158, 255);
  position: relative;
}
</style>
