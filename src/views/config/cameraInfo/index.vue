<template>
<div class="app-container">
    <div class="filter-container">
        <el-input size="mini" v-model="listQuery.cameraName" style="width:8%;" @keyup.enter.native="handleFilter" placeholder="摄像头名称" clearable />
        <el-select size="mini" v-model="listQuery.areaId" style="width:8%;" placeholder="区域名称" clearable>
            <el-option v-for="item in areas" :key="item.id" :label="item.areaName" :value="item.id" />
        </el-select>
        <el-date-picker size="mini" v-model="updateValue" type="daterange" align="right" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions">
        </el-date-picker>
        <el-button size="mini" v-waves type="primary" icon="el-icon-search" @click="handleFilter">
            搜索
        </el-button>
        <el-button size="mini" type="primary" icon="plus" v-permission="'cameraInfo:add'" @click="showCreate">添加</el-button>
    </div>
    <el-table :data="list" v-loading.body="listLoading" element-loading-text="拼命加载中" border fit highlight-current-row style="width: 100%;">
        <el-table-column align="center" label="序号" min-width="5">
            <template slot-scope="scope">
                <span v-text="getIndex(scope.$index)"> </span>
            </template>
        </el-table-column>
        <el-table-column align="center" label="摄像头名称" prop="cameraName" min-width="15"></el-table-column>
        <el-table-column align="center" label="区域名称" prop="areaName" min-width="10"></el-table-column>
        <el-table-column align="center" label="ip" prop="ip" min-width="10"></el-table-column>
        <el-table-column align="center" label="rtsp地址" prop="rtsp" min-width="20"></el-table-column>
        <el-table-column align="center" label="报警间隔（分钟）" prop="alertStep" min-width="6"></el-table-column>
        <el-table-column align="center" label="角色" min-width="14">
            <template slot-scope="scope">
                <div style="margin-right: 2%;display: inline-block" v-for="i in scope.row.roles" :key="i.roleId">
                    <el-tag type="primary" v-text="i.roleName"></el-tag>
                </div>
            </template>
        </el-table-column>
        <el-table-column align="center" label="最近修改时间" prop="updateTime" min-width="10"></el-table-column>
        <el-table-column align="center" label="管理" min-width="15">
            <template slot-scope="scope">
                <el-button type="primary" icon="edit" @click="showUpdate(scope.$index)" v-permission="'cameraInfo:update'">修改</el-button>
                <el-button type="danger" icon="delete" @click="deleteCamera(scope.$index)" v-permission="'cameraInfo:delete'">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-size="listQuery.pageRow" :total="totalCount" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form class="small-space" :model="tempCamera" label-position="left" label-width="auto">
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
                <el-input type="text" v-model="tempCamera.ip" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="rtsp地址" required>
                <el-input type="textarea" autosize v-model="tempCamera.rtsp" placeholder="摄像头的直播流源 (支持RTSP和RTMP)" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="设备访问密码">
                <el-input type="password" v-model="tempCamera.password" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="报警间隔（分钟）" required>
                <el-input type="text" v-model="tempCamera.alertStep" style="width: 40%" onkeyup="this.value = this.value.replace(/[^\d.]/g,'');" maxlength="11">
                </el-input>
            </el-form-item>
            <el-form-item label="边缘端的ssh地址">
                <el-input type="text" v-model="tempCamera.edgeHost" placeholder="默认端口22,若不是,则格式为ip:port" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="边缘端系统的用户名">
                <el-input type="text" autosize v-model="tempCamera.edgeUsername" style="width: 40%">
                </el-input>
            </el-form-item>
            <el-form-item label="边缘端系统的用户密码">
                <el-input type="password" v-model="tempCamera.edgePassword" style="width: 40%">
                </el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button v-if="dialogStatus==='create'" type="success" @click="addCamera">创 建</el-button>
            <el-button type="primary" v-else @click="updateCamera">修 改</el-button>
        </div>
    </el-dialog>
</div>
</template>

<script>
import waves from '@/directives/waves/index.js' // 水波纹指令
const utils = require('@/utils/index')
export default {
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
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
        }
    },
    created() {
        this.getList();
        if (this.hasPerm('cameraInfo:add') || this.hasPerm('cameraInfo:update')) {
            this.getAllRoles();
            this.getAllAreas();
        }
    },
    watch: {
        updateValue(value) {
            if (value) {
                this.listQuery.updateTimeFrom = utils.parseTime(value[0]);
                this.listQuery.updateTimeTo = utils.parseTime(value[1]);
            } else {
                this.listQuery.updateTimeFrom = null;
                this.listQuery.updateTimeTo = null;
            }

        }
    },
    methods: {
        getAllRoles() {
            this.api({
                url: "/user/getAllRoles",
                method: "get"
            }).then(data => {
                this.roles = data;
            })
        },
        getAllAreas() {
            this.api({
                url: "/cameraInfo/getAllAreas",
                method: "get"
            }).then(data => {
                this.areas = data;
            })
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

                //若是带有参数，则打开修改页面
                let cameraId = this.$route.params.cameraId;
                if (cameraId) {
                    let i;
                    for (i = 0; i < this.list.length; i++) {
                        if (cameraId === this.list[i].id) {
                            break;
                        }
                    }
                    this.showUpdate(i);

                }

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
                        id: camera.id
                    }
                }).then(() => {
                    _vue.getList()
                    _vue.$message.success('删除成功!')
                }).catch(() => {
                    _vue.$message.error("删除失败")
                })
            })
        },
    }
}
</script>

<style scoped>
.el-range-input {
    padding-bottom: 10px;
}
</style>
