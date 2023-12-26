<template>
  <scroll-bar>

    <el-menu v-if="this.$route.path!=='/dashboard'" class="el-menu-demo" mode="horizontal" unique-opened :default-active="$route.path" :collapse="isCollapse"
              text-color="#fff" active-text-color="#00ffff" style="width: 100%;left: 300px;text-align: center;">
      <sidebar-item :routes="permission_routers"></sidebar-item>
    </el-menu>
  </scroll-bar>

</template>
<script>
  import {mapGetters} from 'vuex'
  import SidebarItem from './SidebarItem'
  import ScrollBar from '@/components/ScrollBar'

  export default {
    components: {SidebarItem, ScrollBar},
    computed: {
      ...mapGetters([
        'permission_routers',
        'sidebar'
      ]),
      isCollapse() {
        return !this.sidebar.opened
      }
    }
  }
</script>
