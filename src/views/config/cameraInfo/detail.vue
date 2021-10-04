<template>
<div class="app-container">
    <el-page-header @back="callback" content="摄像头信息详情">
    </el-page-header>
    <div style="margin:20px 0 5px 20px">
        <el-descriptions class="margin-top" :column="2" border>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-video-camera"></i>
                    摄像头名称
                </template>
                {{tempCamera.cameraName}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-map-location"></i>
                    区域名称
                </template>
                {{tempCamera.areaName}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-location-outline"></i>
                    ip地址
                </template>
                {{tempCamera.ip}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-position"></i>
                    视频流地址
                </template>
                {{tempCamera.rtsp}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-warning"></i>
                    报警间隔（分钟）
                </template>
                {{tempCamera.alertStep}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-date"></i>
                    创建时间
                </template>
                {{tempCamera.createTime}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-date"></i>
                    修改时间
                </template>
                {{tempCamera.updateTime}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-user-solid"></i>
                    角色
                </template>
                <div style="margin-right: 2%;display: inline-block" v-for="i in tempCamera.roles" :key="i.roleId">
                    <el-tag type="primary" v-text="i.roleName"></el-tag>
                </div>
            </el-descriptions-item>
        </el-descriptions>
    </div>
    <el-divider></el-divider>
    <div>
        <el-row type="flex">
            <el-col :span="24">
                <div class="grid-content bg-purple-light">
                    <p>摄像头关联的检测算法列表</p>
                </div>
            </el-col>
        </el-row>
        <el-table :data="list" v-loading="listLoading" element-loading-text="拼命加载中" border style="width: 100%">
            <el-table-column align="center" label="序号" type="index" min-width="5">
            </el-table-column>
            <el-table-column align="center" label="模型名称" prop="moduleName" min-width="10"></el-table-column>
            <el-table-column align="center" label="模型类型" prop="moduleType" min-width="10"></el-table-column>
            <el-table-column align="center" label="同步状态" min-width="6">
                <template slot-scope="scope">
                    <span>{{statusMap[scope.row.syncStatus]}}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" label="管理" min-width="15">
                <template slot-scope="scope">
                    <el-button size="mini" :plain='true' type="danger" icon="delete" @click="deleteBind(scope.row)" v-permission="'cameraInfo:delete'">解除绑定</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            tempCamera: {
                id: null,
                areaId: null,
                areaName: null,
                cameraName: null,
                ip: null,
                rtsp: null,
                password: null,
                alertStep: null,
                roles: []
            },
            list: [], //表格的数据
            listLoading: false, //数据加载等待动画
            statusMap: {
                100: '绑定同步中',
                101: '绑定成功',
                102: '绑定失败',
                200: '更新同步中',
                201: '更新成功',
                102: '绑定失败',
                300: '删除同步中',
                301: '删除成功',
                302: '删除失败'

            },
        }

    },
    created() {
        let data = this.$route.params.data;
        if (data) {
            this.tempCamera = data;
            this.getList();
        }

    },
    methods: {
        getList() {
            //查询列表
            this.listLoading = true;
            this.api({
                url: "/cameraInfo/listModules",
                method: "get",
                params: {
                    cameraId: this.tempCamera.id
                }
            }).then(data => {
                this.listLoading = false;
                this.list = data;
            })
        },
        deleteBind(row) {
            let _vue = this;
            this.api({
                url: "/cameraInfo/deleteBind",
                method: "post",
                data: {
                    cameraId: this.tempCamera.id,
                    moduleId: row.id
                }
            }).then(() => {
                _vue.$message.success('解除绑定成功！');
                _vue.getList()
            })
        },
        callback() {
            this.$router.push({
                name: 'cameraInfo',
            });
        }
    }
}
</script>

<style>
.el-col {
    border-radius: 4px;
}

.bg-purple-light {
    background: #e5e9f2;
}

.grid-content {
    border-radius: 4px;
    min-height: 36px;
}

p {
    padding: 10px 0;
}
</style>
