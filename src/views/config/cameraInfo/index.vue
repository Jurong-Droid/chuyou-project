<template>
<div class="app-container">
    <div class="filter-container">
        <el-input size="mini" v-model="listQuery.cameraName" style="width:8%;" @keyup.enter.native="handleFilter" placeholder="摄像头名称" clearable />
        <el-select size="mini" v-model="listQuery.areaId" style="width:8%;" placeholder="区域名称" clearable>
            <el-option v-for="item in areas" :key="item.id" :label="item.areaName" :value="item.id" />
        </el-select>
        <DatePicker startVaule="开始日期" endValue="结束日期" @sendTimeData="getTime"></DatePicker>
        <el-button size="mini" v-waves type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
        </el-button>
        <el-button size="mini" type="primary" icon="plus" v-permission="'cameraInfo:add'" @click="showCreate">添加</el-button>
    </div>
    <el-table :data="list"  v-loading="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row style="width: 100%;" :header-cell-style="{background:'#f5f7fa',color:'#409EFF'}">
        <el-table-column align="center" label="序号" min-width="5">
            <template slot-scope="scope">
                <span v-text="getIndex(scope.$index)"> </span>
            </template>
        </el-table-column>
        <el-table-column align="center" label="摄像头名称" min-width="15">
            <template slot-scope="scope">
                <span class="link-type" @click="handleDetail(scope.row)">{{ scope.row.cameraName }}</span>
            </template>
        </el-table-column>
        <el-table-column align="center" label="区域名称" prop="areaName" min-width="10"></el-table-column>
        <el-table-column align="center" label="ip" prop="ip" min-width="10"></el-table-column>
        <el-table-column align="center" label="视频流地址" prop="rtsp" min-width="20"></el-table-column>
        <el-table-column align="center" label="报警间隔（分钟）" prop="alertStep" min-width="6"></el-table-column>
        <el-table-column align="center" label="最近修改时间" prop="updateTime" min-width="10"></el-table-column>
        <el-table-column align="center" label="管理" min-width="15">
            <template slot-scope="scope">
                <el-button size="mini" :plain='true' type="primary" icon="add" @click="showBindModule(scope.$index)" v-permission="'cameraInfo:add'">绑定模型</el-button>
                <el-button size="mini" :plain='true' type="primary" icon="edit" @click="showUpdate(scope.$index)" v-permission="'cameraInfo:update'">修改</el-button>
                <el-button size="mini" :plain='true' type="danger" icon="delete" @click="deleteCamera(scope.$index)" v-permission="'cameraInfo:delete'">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-size="listQuery.pageRow" :total="totalCount" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form class="small-space" :model="tempCamera" label-position="left" label-width="15%">
            <el-form-item label="摄像头名称" required>
                <el-input type="text" v-model="tempCamera.cameraName" style="width: 40%" />
            </el-form-item>
            <el-form-item label="区域名称" required>
                <el-select v-model="tempCamera.areaId" placeholder="请选择区域信息" style="width: 40%">
                    <el-option v-for="item in areas" :key="item.id" :label="item.areaName" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="角色" required>
                <el-select v-model="tempCamera.roleIds" multiple placeholder="支持多角色" style="width: 40%">
                    <el-option v-for="item in roles" :key="item.roleId" :label="item.roleName" :value="item.roleId">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="ip地址">
                <el-input type="text" v-model="tempCamera.ip" autocomplete="off" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="视频流地址" required>
                <el-input type="textarea" autosize v-model="tempCamera.rtsp" placeholder="摄像头的直播流源 (支持RTSP和RTMP)" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="设备访问密码">
                <el-input type="password" v-model="tempCamera.password" autocomplete="new-password" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="报警间隔（分钟）" required>
                <el-input type="text" v-model="tempCamera.alertStep" style="width: 40%" onkeyup="this.value = this.value.replace(/[^\d.]/g,'');" maxlength="11">
                </el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button v-if="dialogStatus==='create'" type="success" @click="addCamera">创 建</el-button>
            <el-button type="primary" v-else @click="updateCamera">修 改</el-button>
        </div>
    </el-dialog>
    <el-dialog title="绑定检测算法模型" :visible.sync="dialogModuleVisible">
        <el-form class="small-space" :model="tempModule" label-position="left" label-width="15%">
            <el-form-item label="检测算法模型" required>
                <el-select v-model="tempModule.moduleIds" multiple placeholder="请选择算法模型" style="width: 40%">
                    <el-option v-for="item in modules" :key="item.id" :label="item.moduleName" :value="item.id" />
                </el-select>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogModuleVisible = false">取 消</el-button>
            <el-button type="success" @click="addModule">绑 定</el-button>
        </div>
    </el-dialog>
</div>
</template>

<script>
import DatePicker from "@/components/DatePicker"
import waves from '@/directives/waves/index.js' // 水波纹指令
export default {
    components: {
        DatePicker,
    },
    directives: {
        waves
    },
    data() {
        return {
            totalCount: 0, //分页组件--数据总条数
            list: [], //表格的数据
            listLoading: false, //数据加载等待动画
            listQuery: {
                pageNum: 1, //页码
                pageRow: 50, //每页条数
                areaId: null,
                cameraName: null,
                updateTimeFrom: null,
                updateTimeTo: null
            },
            updateValue: [],
            roles: [], //角色列表
            areas: [], //区域列表
            dialogStatus: 'create',
            dialogFormVisible: false,
            textMap: {
                update: '编辑',
                create: '新建'
            },
            tempCamera: {
                id: null,
                areaId: null,
                areaName: null,
                cameraName: null,
                ip: null,
                rtsp: null,
                password: null,
                alertStep: null,
                edgeHost: null,
                edgeUsername: null,
                edgePassword: null,
                roleIds: []
            },
            tempModule: {
                cameraId: null,
                moduleIds: []
            },
            dialogModuleVisible: false,
            modules: [], //检测算法模型列表
        }
    },
    created() {
        this.getList();
        if (this.hasPerm('cameraInfo:add') || this.hasPerm('cameraInfo:update')) {
            this.getAllRoles();
            this.getAllAreas();
        }
    },
    methods: {
        getAllRoles() {
            this.api({
                url: "/common/getUserRoles",
                method: "get"
            }).then(data => {
                this.roles = data;
            })
        },
        getAllAreas() {
            this.api({
                url: "/common/getAllAreas",
                method: "get"
            }).then(data => {
                this.areas = data;
            })
        },
        getAllModules() {
            this.api({
                url: "/common/getAllModules",
                method: "get"
            }).then(data => {
                this.modules = data;
            })
        },
        //时间查询组件设置时间方法
        getTime(date) {
            this.listQuery.updateTimeFrom = date.updateTimeFrom;
            this.listQuery.updateTimeTo = date.updateTimeTo;
        },
        getList() {
            //查询列表
            this.listLoading = true;
            this.api({
                url: "/cameraInfo/listCamera",
                method: "get",
                params: this.listQuery
            }).then(data => {
                this.listLoading = false;
                this.list = data.list;
                this.totalCount = data.totalCount;

            })
        },
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
            //查询事件
            this.listQuery.pageNum = 1
            this.getList()
        },
        getIndex($index) {
            //表格序号
            return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
        },
        showCreate() {
            //显示新增对话框
            this.tempCamera.areaId = "";
            this.tempCamera.areaName = "";
            this.tempCamera.cameraName = "";
            this.tempCamera.ip = "";
            this.tempCamera.rtsp = "";
            this.tempCamera.password = "";
            this.tempCamera.alertStep = "";
            this.tempCamera.edgeHost = "";
            this.tempCamera.edgeUsername = "";
            this.tempCamera.edgePassword = "";
            this.tempCamera.roleIds = [];
            this.dialogStatus = "create"
            this.dialogFormVisible = true
        },
        showUpdate($index) {
            let camera = this.list[$index];
            this.tempCamera.id = camera.id;
            this.tempCamera.areaId = camera.areaId;
            this.tempCamera.areaName = camera.areaName;
            this.tempCamera.cameraName = camera.cameraName;
            this.tempCamera.ip = camera.ip;
            this.tempCamera.rtsp = camera.rtsp;
            this.tempCamera.password = camera.password;
            this.tempCamera.alertStep = camera.alertStep;
            this.tempCamera.edgeHost = camera.edgeHost;
            this.tempCamera.edgeUsername = camera.edgeUsername;
            this.tempCamera.edgePassword = camera.edgePassword;
            this.tempCamera.roleIds = camera.roles.map(x => x.roleId);
            this.dialogStatus = "update"
            this.dialogFormVisible = true
        },
        showBindModule($index) {
            if (this.modules.length == 0) {
                this.getAllModules();
            }
            let cameraInfo = this.list[$index];
            this.tempModule.cameraId = cameraInfo.id;
            this.tempModule.moduleIds = [];
            this.dialogModuleVisible = true;

        },
        validate() {
            let u = this.tempCamera
            if (u.areaId.length === 0) {
                this.$message.warning('请选择区域信息')
                return false
            }
            if (u.cameraName.trim().length === 0) {
                this.$message.warning('请填写摄像头名称')
                return false
            }
            if (u.rtsp.trim().length === 0) {
                this.$message.warning('请填rtsp地址')
                return false
            }

            if (u.roleIds.length === 0) {
                this.$message.warning('请选择角色')
                return false
            }
            return true
        },
        addCamera() {
            if (!this.validate()) return
            //添加新用户
            this.api({
                url: "/cameraInfo/addCamera",
                method: "post",
                data: this.tempCamera
            }).then(() => {
                this.getList();
                this.dialogFormVisible = false
                this.$message.success('新增成功！');
            })
        },
        updateCamera() {
            if (!this.validate()) return
            //修改用户信息
            let _vue = this;
            this.api({
                url: "/cameraInfo/updateCamera",
                method: "post",
                data: this.tempCamera
            }).then(() => {
                this.$message.success('更新成功！');
                this.dialogFormVisible = false;
                //router没有提供清空数据的方法 刷新可清楚数据 
                location.reload();
            })
        },
        deleteCamera($index) {
            let _vue = this;
            this.$confirm('确定删除此设备?', '提示', {
                confirmButtonText: '确定',
                showCancelButton: false,
                type: 'warning'
            }).then(() => {
                let camera = _vue.list[$index];
                _vue.api({
                    url: "/cameraInfo/deleteCamera",
                    method: "post",
                    data: {
                        keyId: camera.id
                    }
                }).then(() => {
                    _vue.getList()
                    _vue.$message.success('删除成功!')
                }).catch(() => {
                    _vue.$message.error("删除失败")
                })
            })
        },
        addModule() {
            let _vue = this;
            this.api({
                url: "/cameraInfo/bindModule",
                method: "post",
                data: this.tempModule
            }).then(() => {
                _vue.$message.success('绑定成功！');
                _vue.dialogModuleVisible = false;
                _vue.getList()
            })
        },
        handleDetail(row) {
            this.$router.push({
                name: 'cameraDetail',
                params: {
                    'data': row
                }
            });
        }
    }
}
</script>

<style scoped>
.el-range-input {
    padding-bottom: 10px;
}
</style>
