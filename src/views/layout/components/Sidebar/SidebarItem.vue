<template>
  <div class="menu-wrapper">
    <template v-if="!item.hidden && item.children" v-for="item in routes">
      <router-link
        v-if="item.children.length === 1 && !item.children[0].children"
        :to="item.path + '/' + item.children[0].path"
        :key="item.children[0].name"
      >
        <el-menu-item
          :index="item.path + '/' + item.children[0].path"
          class="submenu-title-noDropdown"
          style="font-size: 18px; text-align: center"
        >
          <svg-icon
            v-if="item.children[0].meta && item.children[0].meta.icon"
            :icon-class="item.children[0].meta.icon"
          ></svg-icon>
          <span v-if="item.children[0].meta && item.children[0].meta.title">{{
            item.children[0].meta.title
          }}</span>
        </el-menu-item>
      </router-link>

      <!--左侧菜单-->
      <el-submenu
        v-else
        :index="item.name || item.path"
        :key="item.name"
        style="display: inline-block; width: 190px"
      >
        <template slot="title">
          <svg-icon
            v-if="item.meta && item.meta.icon"
            :icon-class="item.meta.icon"
          ></svg-icon>
          <span v-if="item.meta && item.meta.title" style="font-size: 18px">{{
            item.meta.title
          }}</span>
        </template>

        <!--子菜单-->
        <template v-for="child in item.children" v-if="!child.hidden">
          <sidebar-item
            class="nest-menu"
            v-if="child.children && child.children.length > 0"
            :routes="[child]"
            :key="child.path"
          ></sidebar-item>

          <router-link
            v-else
            :to="item.path + '/' + child.path"
            :key="child.name"
          >
            <el-menu-item :index="item.path + '/' + child.path">
              <svg-icon
                v-if="child.meta && child.meta.icon"
                :icon-class="child.meta.icon"
              ></svg-icon>
              <span v-if="child.meta && child.meta.title">{{
                child.meta.title
              }}</span>
            </el-menu-item>
          </router-link>
        </template>
      </el-submenu>
    </template>
  </div>
</template>

<script>
export default {
  name: "SidebarItem",
  props: {
    routes: {
      type: Array,
    },
  },
};
</script>

<style lang="scss" scoped>
.menu-wrapper {
  width: 1330px;
  height: 70px;
  line-height: 70px;
  margin-left: -50px;
}
</style>
