<template>
  <el-menu
    v-if="this.$route.path == '/dashboard'"
    class="navbar"
    mode="horizontal"
  >
    <div style="text-align: center; width: 86%">
      <div class="white"></div>
      <div class="white_01"></div>
      <span
        class="middle-menu"
        @click="goCamera"
        style="
          cursor: pointer;
          font-family: HuXiaoBoNanShenTi-2-Regular;
          letter-spacing: 8px;
          font-size: 36px;
          width: 30%;
          text-align: center;
          margin-left: -8.1%;
        "
        >井间站智能监控系统</span
      >
    </div>
    <div class="right-menu">
      <template>
        <warnNotice class="right-menu-item hover-effect" />
      </template>
      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <img class="user-avatar" :src="img_user" />
          <!-- <i class="el-icon-caret-bottom"></i> -->
        </div>
        <el-dropdown-menu class="user-dropdown" slot="dropdown">
          <router-link class="inlineBlock" to="/">
            <el-dropdown-item> 首页 </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span @click="logout" style="display: block">退出登陆</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-menu>

  <el-menu v-else class="navbar_01" mode="horizontal">
    <span
      class="middle-menu"
      @click="goDashboard"
      style="
        cursor: pointer;
        font-family: HuXiaoBoNanShenTi-2-Regular;
        letter-spacing: 5px;
      "
      >井间站智能监控系统</span
    >
    <div class="right-menu">
      <template>
        <warnNotice class="right-menu-item hover-effect" />
      </template>
      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click"
      >
        <div class="avatar-wrapper">
          <img class="user-avatar" :src="img_user" />
          <!-- <i class="el-icon-caret-bottom"></i> -->
        </div>
        <el-dropdown-menu class="user-dropdown" slot="dropdown">
          <router-link class="inlineBlock" to="/">
            <el-dropdown-item> 首页 </el-dropdown-item>
          </router-link>
          <el-dropdown-item divided>
            <span @click="logout" style="display: block">退出登陆</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-menu>
</template>



<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";
import WarnNotice from "@/components/WarnNotice";
import img_user from "@/assets/user.png";

export default {
  components: {
    Breadcrumb,
    Hamburger,
    WarnNotice,
  },
  data() {
    return {
      img_user,
    };
  },
  computed: {
    ...mapGetters(["sidebar"]),
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch("ToggleSideBar");
    },
    logout() {
      this.$store.dispatch("LogOut").then(() => {
        location.reload(); // 为了重新实例化vue-router对象 避免bug
      });
    },
    goCamera() {
      this.$router.push({
        path: "/system/live/cameraLive",
      });
    },
    goDashboard() {
      this.$router.push({
        path: "/",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 110px;
  line-height: 50px;
  border-radius: 0px !important;
  background: transparent url("../../../assets/images/head_bg6.png") no-repeat
    center center;
  border-bottom: solid 0px;
  width: 100%;
  background-size: cover;

  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    //padding: 0 10px;
  }
  .hamburger-container_01 {
    line-height: 58px;
    height: 50px;
    //float: left;
    padding: 0 10px;
    height: 20px;
    height: 20px;
  }
  .middle-menu {
    position: absolute;
    height: 100%;

    margin-left: 10px;
    background-size: auto 70%;
    z-index: 222;
    text-align: center;
    line-height: 60px;
    font-size: 28px;
    /* color: #fff; */
    font-weight: bold;
    color: #fff;
    display: inline;
  }

  //.head h1{ color:#fff; text-align: center; font-size: .4rem; line-height:.8rem;}

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }
  }

  .avatar-container {
    margin-right: 30px;

    .avatar-wrapper {
      margin-top: 5px;
      position: relative;

      .user-avatar {
        cursor: pointer;
        width: 40px;
        height: 40px;
      }

      .el-icon-caret-bottom {
        cursor: pointer;
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
}
.white {
  position: absolute;
  width: 1%;
  height: 1%;
  background-color: white;
  box-shadow: 0 0 60px 40px white;
  opacity: 0.1;
  animation: whiteslide 3s linear infinite;
}
.white_01 {
  position: absolute;
  width: 1%;
  height: 1%;
  background-color: white;
  box-shadow: 0 0 60px 40px white;
  opacity: 0.1;
  animation: whiteslide_01 3s linear infinite;
}
@keyframes whiteslide {
  from {
    opacity: 0.1;
    height: 1%;
    margin-left: 0%;
  }
  to {
    opacity: 0.5;
    height: 3%;
    margin-left: 50%;
  }
}
@keyframes whiteslide_01 {
  from {
    opacity: 0.1;
    height: 1%;
    margin-left: 100%;
  }
  to {
    opacity: 0.5;
    height: 3%;
    margin-left: 50%;
  }
}
.navbar_01 {
  height: 70px;
  line-height: 70px;
  background: #3F9EFF;
  border-bottom: solid 0px;
  width: 100%;

  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }
  .hamburger-container_01 {
    line-height: 58px;
    height: 58px;
    padding: 0 10px;
  }
  .middle-menu {
    position: absolute;
    height: 70px;
    margin-left: 26px;
    background-size: auto 70%;
    z-index: 222;
    text-align: center;
    line-height: 70px;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    display: inline;
  }

  //.head h1{ color:#fff; text-align: center; font-size: .4rem; line-height:.8rem;}

  .right-menu {
    float: right;
    line-height: 38px;
    height: 38px;
    margin-top: 20px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;
      z-index: 2;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }
  }

  .avatar-container {
    margin-right: 30px;

    .avatar-wrapper {
      margin-top: 5px;
      position: relative;

      .user-avatar {
        cursor: pointer;
        width: 36px;
        height: 36px;
        top: -3px;
        position: relative;
        margin-left: 10px;
      }

      .el-icon-caret-bottom {
        cursor: pointer;
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
}
</style>
