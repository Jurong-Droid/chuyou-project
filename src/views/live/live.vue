<template>
<div class="app-container">
    <el-row type="flex" style="margin-bottom: -20px">
        <el-col :span="3" v-loading="listLoading" element-loading-text="数据加载中...">
            <div>
                <el-input size="mini" placeholder="输入关键字进行过滤" v-model="filterText">
                </el-input>

                <el-tree class="filter-tree" :expand-on-click-node="false" :highlight-current="true" :data="data" :props="defaultProps" default-expand-all :filter-node-method="filterNode" @node-click="clickNode" ref="tree">
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
        SplitScreen
    },
    data() {
        return {
            filterText: '',
            listLoading: false, //数据加载等待动画
            listQuery: {
                id: null,
                level: ""
            },
            data: [],
            defaultProps: {
                children: 'children',
                label: 'name',
                level: 'level'
            }
        };
    },
    provide() {
        return {
            searchParam: () => this.listQuery
        }
    },
    created() {
        this.getList();
    },
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        }
    },

    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return data.name.indexOf(value) !== -1;
        },
        getList() {
            //查询列表
            if (!this.hasPerm("videoLive:list")) {
                return;
            }
            this.listLoading = true;
            this.api({
                url: "/videoLive/listVideoCamera",
                method: "get",
                // params: this.listQuery,
            }).then((data) => {
                this.listLoading = false;
                this.data = data;
                this.listQuery = {
                    id: data[0].id,
                    level: data[0].level
                }
            });
        },
        clickNode(data, node, obj) {
            this.listQuery = {
                id: data.id,
                level: data.level
            }
        },
    }
};
</script>
