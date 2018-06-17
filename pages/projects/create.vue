<template>
  <div class="page-container">
    <h2 class="page-header">创建项目</h2>
    <div class="page-content">
      <el-card>
        <el-form label-position="top" label-width="80px" :model="createForm">
          <el-form-item label="项目名称">
            <el-input v-model="createForm.description"></el-input>
          </el-form-item>
          <el-form-item label="最小募资金额（ETH）">
            <el-input v-model="createForm.minInvest"></el-input>
          </el-form-item>
          <el-form-item label="最大募资金额（ETH）">
            <el-input v-model="createForm.maxInvest"></el-input>
          </el-form-item>
          <el-form-item label="募资上限（ETH）">
            <el-input v-model="createForm.goal"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="createProject" :loading="createForm.loading">立即创建</el-button>
          </el-form-item>
          <el-alert v-if="createForm.errmsg" :title="createForm.errmsg" type="error" />
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script>
import web3 from '../../libs/web3';
import Project from '../../libs/project';
import ProjectList from '../../libs/projectList';

export default {
  data() {
    return {
      createForm: {
        description: '',
        minInvest: 0,
        maxInvest: 0,
        goal: 0,
        errmsg: '',
        loading: false,
      },
    };
  },

  async asyncData({ params }) {
    return {};
  },

  methods: {
    setState(values) {
      this.createForm = Object.assign({}, this.createForm, values || {});
    },

    async createProject() {
      this.setState({ errmsg: '' });

      const { description, minInvest, maxInvest, goal } = this.createForm;
      console.log(this.createForm);

      // 字段合规检查
      if (!description) {
        return this.setState({ errmsg: '项目名称不能为空' });
      }
      if (minInvest <= 0) {
        return this.setState({ errmsg: '项目最小投资金额必须大于0' });
      }
      if (maxInvest <= 0) {
        return this.setState({ errmsg: '项目最大投资金额必须大于0' });
      }
      if (maxInvest < minInvest) {
        return this.setState({ errmsg: '项目最小投资金额必须小于最大投资金额' });
      }
      if (goal <= 0) {
        return this.setState({ errmsg: '项目募资上限必须大于0' });
      }

      const minInvestInWei = web3.utils.toWei(minInvest, 'ether');
      const maxInvestInWei = web3.utils.toWei(maxInvest, 'ether');
      const goalInWei = web3.utils.toWei(goal, 'ether');

      try {
        this.setState({ loading: true, errmsg: '' });

        // 获取账户
        const accounts = await web3.eth.getAccounts();
        const owner = accounts[0];

        // 创建项目
        const result = await ProjectList.methods
          .createProject(description, minInvestInWei, maxInvestInWei, goalInWei)
          .send({ from: owner, gas: '5000000' });

        this.setState({ errmsg: '项目创建成功' });
        console.log(result);

        setTimeout(() => {
          location.href = '/';
        }, 1000);
      } catch (err) {
        console.error(err);
        this.setState({ errmsg: err.message || err.toString });
      } finally {
        this.setState({ loading: false });
      }
    },
  },
};
</script>

<style>
</style>
