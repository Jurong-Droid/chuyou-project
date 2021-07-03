<template>
<div class="app-container">
    <el-row type="flex" style="margin-bottom: -20px">
        <el-col :span="3" v-loading="listLoading" element-loading-text="数据加载中...">
            <div>
                <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText" />
                <el-tree class="filter-tree" ref="tree" :data="data" node-key="name" :expand-on-click-node="false" :props="defaultProps" :filter-node-method="filterNode" @node-click="clickNode" highlight-current default-expand-all>
                </el-tree>
            </div>
        </el-col>
        <el-col :span="21">
            <div>
                <SplitScreen></SplitScreen>
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
            filterText: "",
            listLoading: false, //数据加载等待动画
            listQuery: {
                id: null,
                level: "",
            },
            data: [],
            defaultProps: {
                children: "children",
                label: "name",
                level: "level",
            },
        };
    },
    provide() {
        return {
            searchParam: () => this.listQuery,
        };
    },
    created() {
        this.getList();
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        },
    },
    methods: {
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
                // params: this.listQuery,
            }).then((data) => {
                this.listLoading = false;
                this.data = data;
                this.listQuery = {
                    id: data[0].id,
                    level: data[0].level,
                };
                this.$nextTick(function () {
                    this.$refs.tree.setCurrentKey(data[0].name);
                })
            }).catch((err) => {
                this.listLoading = false;
            });
        },
        clickNode(data, node, obj) {
            this.listQuery = {
                id: data.id,
                level: data.level,
            };
        },
    },
};
</script>

<style scoped>
/**高亮显示el-tree选中的节点 */
.el-tree--highlight-current /deep/ .el-tree-node.is-current>.el-tree-node__content:before {
    content: "";
    background-color: rgb(64, 158, 255);
    width: 4px;
    height: 80%;
    float: left;
    position: absolute;

}

.el-tree--highlight-current /deep/ .el-tree-node.is-current>.el-tree-node__content {
    background-color: rgb(255, 255, 255);
    color: rgb(64, 158, 255);
    position: relative;
}
</style>
