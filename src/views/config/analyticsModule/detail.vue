<template>
<div class="app-container">
    <el-page-header @back="callback" content="检测模型信息详情">
    </el-page-header>
    <div style="margin:20px 0 5px 20px">
        <el-descriptions class="margin-top" :column="2" border>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-monitor"></i>
                    所在边缘端名称
                </template>
                {{tempModule.edgeName}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    模型名称
                </template>
                {{tempModule.moduleName}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    模型类型
                </template>
                {{tempModule.moduleType}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    模型状态
                </template>
                {{statusMap[tempModule.status]}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-info"></i>
                    模型说明
                </template>
                {{tempModule.description}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    模型版本
                </template>
                {{tempModule.version}}
            </el-descriptions-item>
             <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-upload"></i>
                    上传存储路径
                </template>
                {{tempModule.storagePath}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-upload"></i>
                    同步路径
                </template>
                {{tempModule.syncPath}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-coin"></i>
                    模型的RabbitMQ的队列
                </template>
                {{tempModule.mqQueue}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-info"></i>
                    执行的脚本
                </template>
                {{tempModule.commandScript}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-date"></i>
                    创建时间
                </template>
                {{tempModule.createTime}}
            </el-descriptions-item>
            <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-date"></i>
                    修改时间
                </template>
                {{tempModule.updateTime}}
            </el-descriptions-item>
              <el-descriptions-item>
                <template slot="label">
                    <i class="el-icon-warning"></i>
                    尝试连接模型次数
                </template>
                {{tempModule.heartbeatCount}}
            </el-descriptions-item>
        </el-descriptions>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            tempModule: {
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
            statusMap: {
                1: '创建',
                2: '上传成功',
                3: '同步成功',
                4: '发布中',
                5: '发布成功',
                6: '同步失败',
                7: '发布失败',
                200: '正常运行',
                201: '无任务运行'
            },
        }

    },
    created() {
        let moduleId = this.$route.params.moduleId;
        if (moduleId) {
            this.getDetail(moduleId);
        }

    },
    methods: {
        getDetail(moduleId) {
            this.api({
                url: "/analyticsModule/detailAnalyticsModule",
                method: "get",
                params: {
                    'moduleId': moduleId
                }
            }).then(data => {
                this.tempModule = data;
            })
        },
        callback() {
            this.$router.push({
                name: 'analyticsModule',
            });
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
