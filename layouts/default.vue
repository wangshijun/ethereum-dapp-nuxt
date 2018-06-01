<template>
  <el-container>
    <el-header class="header">
      <div class="wrapper">
        <el-menu
          :default-active="activeIndex"
          class="el-menu-demo"
          mode="horizontal"
          @select="onSelect"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b">
          <el-menu-item index="3" class="pull-right">
            <a href="/projects/create">
              <el-button type="primary">发起项目</el-button>
            </a>
          </el-menu-item>
          <el-menu-item index="1"><a href="/">众筹 DApp</a></el-menu-item>
          <el-menu-item index="2"><a href="/">项目列表</a></el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main>
      <div class="wrapper">
        <nuxt/>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  export default {
    data() {
      return {
        activeIndex: '1',
      };
    },
    methods: {
      onSelect(key, keyPath) {
        console.log(key, keyPath);
      }
    }
  }
</script>

<style>
body {
  padding: 0;
  margin: 0;
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
}

.header {
  background-color: #545c64;

}

.header a {
  text-decoration: none;
}

.wrapper {
  width: 80%;
  max-width: 1200px;
  min-width: 960px;
  margin: 0 auto;
}

.el-menu--horizontal>.el-menu-item.pull-right {
  float: right;
}
</style>
