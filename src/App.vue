<template>
<!--  <div style="background-color:#051024;width: 100%;height: 100%">-->
    <div id="app" style="width:100%;height: 100%;margin: 0 auto;">
      <router-view></router-view>
    </div>
<!--  </div>-->

</template>

<script>
export default {
  name: 'app',
  // mounted() {
  //   var browerWidth = window.innerWidth;
  //   var baseWidth = 1862;
  //   var zoomValue = baseWidth/browerWidth;
  //   document.getElementById("app").style.transform = "scale(" + zoomValue + "," + zoomValue + ")";
  //   window.onresize = function () {
  //     browerWidth = window.innerWidth;
  //     zoomValue = browerWidth / baseWidth;
  //     document.getElementById("app").style.transform = "scale(" + zoomValue + "," + zoomValue + ")";
  //   }
  // }
}
</script>

<style lang="scss">
  @import '~normalize.css/normalize.css';// normalize.css 样式格式化
  @import './styles/index.scss'; // 全局自定义的css样式
</style>
