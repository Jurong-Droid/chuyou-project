<template>
  <div class="app-container">
    <div style="margin-bottom: 14px">
      <el-input
        size="mini"
        v-model="listLoading"
        placeholder="输入区域"
        style="width: 15%"
      ></el-input>
      <el-button
        style="margin-left: 14px"
        size="mini"
        v-waves
        type="primary"
        icon="el-icon-search"
        >搜索</el-button
      >
      <br />
    </div>
    <div>
      <el-table
        :data="leftlist"
        border
        fit
        highlight-current-row
        style="font-size: 16px"
        :header-cell-style="{ background: '#f5f7fa', color: '#3c3c3c' }"
      >
        <el-table-column
          align="center"
          label="区域"
          prop="location"
          min-width="12"
        ></el-table-column>
        <el-table-column
          align="center"
          label="所属单位"
          prop="oparea"
          min-width="12"
        ></el-table-column>
        <el-table-column
          align="center"
          label="所属采油厂"
          prop="oilplant"
          min-width="12"
        ></el-table-column>
        <el-table-column
          align="center"
          label="所属油田"
          prop="oilfield"
          min-width="12"
        ></el-table-column>
        <el-table-column align="center" label="管理" min-width="20">
          <template slot-scope="scope">
            <el-popconfirm
              title="请确认是否删除？"
              @confirm="listdelete(scope.row.id)"
            >
              <el-button type="primary" size="mini" slot="reference"
                >删除</el-button
              ></el-popconfirm
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div align="center">
      <br />
      <el-button type="primary" @click="addlist()">添加</el-button>
    </div>

    <el-dialog title="添加" :visible.sync="dialogFormVisible" width="600px">
      <el-form
        class="small-space"
        :model="tempinfo"
        label-position="right"
        label-width="100px"
      >
        <el-form-item label="油田名称" required>
          <el-select
            @change="oilfieldSelectChange()"
            v-model="oilfieldid"
            placeholder="请选择油田"
          >
            <el-option
              v-for="item in oilfieldlist"
              :key="item.id"
              :label="item.oilfield"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采油厂名称" required>
          <el-select
            @change="oilplantSelectChange()"
            v-model="oilplantid"
            placeholder="请选择采油厂"
          >
            <el-option
              v-for="item in tempoilplantlist"
              :key="item.id"
              :label="item.oilplant"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="单位名称" required>
          <el-select
            v-model="tempinfo.fid"
            placeholder="请选择单位"
          >
            <el-option
              v-for="item in tempoparealist"
              :key="item.id"
              :label="item.oparea"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域名称" required>
          <el-input type="text" v-model="tempinfo.name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCamera">创 建</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import waves from "@/directives/waves/index.js"; // 水波纹指令
export default {
  directives: {
    waves,
  },
  data() {
    return {
      tempoparealist: [],
      tempoilplantlist: [],
      oparea: [],
      oparealist: [],
      oilplantlist: [],
      oilplant: [],
      oilfieldlist: [],
      oilfield: [],
      oilplantid: null,
      oilfieldid: null,
      tempinfo: {
        oname: 4,
        fid: null,
        name: null,
      },
      dialogFormVisible: false,
      listLoading: null,
      leftlist: [],
    };
  },
  methods: {
    addlist() {
      this.dialogFormVisible = true;
    },
    addCamera() {
      let _vue = this;
      this.api({
        url: "/organizationInfo/addlist",
        method: "post",
        data: this.tempinfo,
      }).then((data) => {
        this.leftlist = [];
        this.getlist();
      });
      this.dialogFormVisible = false;
    },
    getoilfield() {
      this.api({
        url: "/organizationInfo/getoilfield",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.oilfieldlist.push({
            id: temp.oilfieldId,
            oilfield: temp.oilfieldName,
          });
        });
      });
    },
    getoilplant() {
      this.api({
        url: "/organizationInfo/getoilplant",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.oilplantlist.push({
            id: temp.oilplantId,
            fid: temp.oilfieldId,
            oilfield: temp.oilfieldName,
            oilplant: temp.oilplantName,
          });
        });
      });
    },
    getoparea() {
      this.api({
        url: "/organizationInfo/getoparea",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.oparealist.push({
            id: temp.opareaId,
            fid: temp.oilplantId,
            oilfield: temp.oilfieldName,
            oilplant: temp.oilplantName,
            oparea: temp.opareaName,
          });
        });
      });
    },
    listdelete(n) {
      const index = this.leftlist.findIndex((item) => item.id === n);
      this.leftlist.splice(index, 1);
      this.api({
        url: "/organizationInfo/deletelist",
        method: "post",
        data: {
          oname: 4,
          fid: n,
          name: null,
        },
      }).then((data) => {});
    },
    oilfieldSelectChange() {
      (this.oilplantid = null),
        (this.tempoilplantlist = []),
        this.oilplantlist.forEach((temp) => {
          if (temp.fid === this.oilfieldid) {
            this.tempoilplantlist.push(temp);
          }
        });
    },
    oilplantSelectChange() {
      (this.tempinfo.fid = null),
        (this.tempoparealist = []),
        this.oparealist.forEach((temp) => {
          if (temp.fid === this.oilplantid) {
            this.tempoparealist.push(temp);
          }
        });
    },
    handleFilter() {
      //搜索
      this.listLoading = true;
      setTimeout(() => {
        this.listLoading = false;
      }, 1000);
    },
    getlist() {
      this.api({
        url: "/organizationInfo/getlocation",
        method: "get",
      }).then((data) => {
        data.forEach((temp) => {
          this.leftlist.push({
            id: temp.locationId,
            location: temp.locationName,
            oilplant: temp.oilplantName,
            oparea: temp.opareaName,
            oilfield: temp.oilfieldName,
          });
        });
      });
    },
  },
  mounted() {
    document.body.style.zoom = "0.8";
    if (location.href.indexOf("#reloaded") == -1) {
      location.href = location.href + "#reloaded";
      location.reload();
    }
    this.getlist();
    this.getoilfield();
    this.getoilplant();
    this.getoparea();
  },
};
</script>
