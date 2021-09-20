<template>
<div class="app-container">
    <div class="filter-container">
        <el-form>
            <el-form-item>
                <el-button type="primary" icon="plus" @click="showCreate" v-permission="'detectFunc:operate'">添加
                </el-button>
            </el-form-item>
        </el-form>
    </div>
    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row :cell-style="cellStyle">
        <el-table-column align="center" label="序号" min-width="5%">
            <template slot-scope="scope">
                <span v-text="getIndex(scope.$index)"> </span>
            </template>
        </el-table-column>
        <el-table-column align="center" prop="detectFuncName" label="检测方法名称" min-width="20%"></el-table-column>
        <el-table-column align="center" prop="funcFor" label="检测方法说明" min-width="30%" />
        <el-table-column align="center" label="标注框展示" min-width="20%" />
        <el-table-column align="center" prop="opacity" label="标注框透明度" min-width="10%" />
        <el-table-column align="center" label="管理" min-width="15%">
            <template slot-scope="scope">
                <el-button size="mini" :plain='true' type="primary" icon="edit" @click="showUpdate(scope.$index)" v-permission="'detectFunc:operate'">修改</el-button>
                <el-button size="mini" :plain='true' type="danger" icon="delete" @click="deleteDetectFunc(scope.$index)" v-permission="'detectFunc:operate'">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.pageNum" :page-size="listQuery.pageRow" :total="totalCount" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form class="small-space" :model="tempDetectFuncVo" label-position="left" label-width="auto">
            <el-form-item label="检测方法名称" required>
                <el-input type="text" style="width:40%" autosize v-model="tempDetectFuncVo.detectFuncName" placeholder="请输入名称">
                </el-input>
            </el-form-item>
            <el-form-item label="检测方法说明">
                <el-input type="textarea" style="width:40%" show-word-limit v-model="tempDetectFuncVo.funcFor" maxlength="100" placeholder="请输入内容">
                </el-input>
            </el-form-item>
            <el-form-item label="标注框颜色" required>
                <el-color-picker  v-model="tempDetectFuncVo.tagColor" show-alpha :predefine="predefineColors"></el-color-picker>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button v-if="dialogStatus==='create'" type="success" @click="saveDetectFunc">创 建</el-button>
            <el-button type="primary" v-else @click="saveDetectFunc">修 改</el-button>
        </div>
    </el-dialog>
</div>
</template>

<script>
export default {
    data() {
        return {
            totalCount: 0, //分页组件--数据总条数
            list: [], //表格的数据
            listLoading: false, //数据加载等待动画
            listQuery: {
                pageNum: 1, //页码
                pageRow: 50, //每页条数
                name: ''
            },
            dialogStatus: 'create',
            dialogFormVisible: false,
            textMap: {
                update: '编辑',
                create: '创建'
            },
            tempDetectFuncVo: {
                id: "",
                detectFuncName: "",
                funcFor: "",
                tagColor: ""
            },
            predefineColors: [
                'rgba(139,0,139,0.5)',
                'rgba(255,255,0,0.5)',
                'rgba(227,207,87,0.5)',
                'rgba(0,0,255,0.5)',
                'rgba(3,168,158,0.5)',
                'rgba(210,180,140,0.5)',
            ]
        }
    },
    created() {
        this.getList();
    },
    methods: {
        getList() {
            //查询列表
            if (!this.hasPerm('detectFunc:list')) {
                return
            }
            this.listLoading = true;
            this.api({
                url: "/detectFunc/listDetectFuncInPage",
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
            //改变了查询条件,从第一页开始查询
            this.listQuery.pageNum = 1
            this.getList()
        },
        getIndex($index) {
            //表格序号
            return (this.listQuery.pageNum - 1) * this.listQuery.pageRow + $index + 1
        },
        cellStyle({row,column}) { //根据报警级别显示颜色
            if (column.label === "标注框展示") {
                return 'background:' + row.tagColor
            }
        },
        showCreate() {
            //显示新增对话框
            this.tempDetectFuncVo.id = "";
            this.tempDetectFuncVo.detectFuncName = "";
            this.tempDetectFuncVo.funcFor = "";
            this.tempDetectFuncVo.tagColor = "";
            this.dialogStatus = "create"
            this.dialogFormVisible = true
        },
        showUpdate($index) {
            //显示修改对话框
            this.tempDetectFuncVo.id = this.list[$index].id;
            this.tempDetectFuncVo.detectFuncName = this.list[$index].detectFuncName;
            this.tempDetectFuncVo.funcFor = this.list[$index].funcFor;
            this.tempDetectFuncVo.tagColor = this.list[$index].tagColor;
            this.dialogStatus = "update"
            this.dialogFormVisible = true
        },
        deleteDetectFunc($index) {
            this.$confirm("此操作将删除对应的标注方法, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.api({
                    url: "/detectFunc/removeDetectFunc",
                    method: "post",
                    data: {
                        keyId: this.list[$index].id
                    },
                }).then((data) => {
                    this.$message.success('删除成功！');
                    this.getList();
                });
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        },
        saveDetectFunc() {
            //保存
            this.api({
                url: "/detectFunc/saveDetectFunc",
                method: "post",
                data: this.tempDetectFuncVo
            }).then(() => {
                this.getList();
                this.dialogFormVisible = false;
                if (this.dialogStatus === "create") {
                    this.$message.success('新增成功！');
                } else {
                    this.$message.success('更新成功！');
                }

            })
        }

    }
}
</script>
