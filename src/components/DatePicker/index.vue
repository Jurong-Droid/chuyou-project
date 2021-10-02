<template>
<el-date-picker size="mini" v-model="updateValue" type="daterange" align="right" range-separator="至" :start-placeholder="startVaule" :end-placeholder="endValue" :picker-options="pickerOptions">
</el-date-picker>
</template>

<script>
const utils = require('@/utils/index')
export default {
    name: "",
    data() {
        return {
            listQuery: {
                updateTimeFrom: null,
                updateTimeTo: null
            },
            updateValue: [],
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
    watch: {
        updateValue(value) {
            if (value) {
                this.listQuery.updateTimeFrom = utils.parseTime(value[0]);
                this.listQuery.updateTimeTo = utils.parseTime(value[1]);
            } else {
                this.listQuery.updateTimeFrom = null;
                this.listQuery.updateTimeTo = null;
            }
            this.sendTimeData();
        }
    },
    props: ["startVaule", "endValue"],
    methods:{
        sendTimeData:function(){
            this.$emit('sendTimeData',this.listQuery);
        }
    }
};
</script>

<style>
</style>
