<template>
  <div class="page-container">
    <h2 class="page-header">项目详情</h2>
    <div class="page-content">
      <el-card class="project-card">
        <div slot="header" class="clearfix">
          <strong>{{project.description}}</strong>
        </div>
        <div class="progress-container">
          <el-progress :text-inside="true" :stroke-width="18" :percentage="project.progress"></el-progress>
        </div>
        <el-row :gutter="16" class="info-blocks">
          <el-col :span="8">
            <div class="info-block">
              <p class="info-block-title">{{project.goal}} ETH</p>
              <p class="info-block-description">募资上限</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-block">
              <p class="info-block-title">{{project.minInvest}} ETH</p>
              <p class="info-block-description">最小投资金额</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-block">
              <p class="info-block-title">{{project.maxInvest}} ETH</p>
              <p class="info-block-description">最大投资金额</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-block">
              <p class="info-block-title">{{project.investorCount}} 人</p>
              <p class="info-block-description">参投人数</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-block">
              <p class="info-block-title">{{project.balance}} ETH</p>
              <p class="info-block-description">募资金额</p>
            </div>
          </el-col>
        </el-row>
        <el-form :inline="true" :model="contributeForm" class="contribute-form">
          <el-form-item label="">
            <el-input v-model="contributeForm.amount" placeholder="投资金额"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="contributeProject" :loading="contributeForm.loading">立即投资</el-button>
          </el-form-item>
          <el-alert v-if="contributeForm.errmsg" :title="contributeForm.errmsg" type="error" />
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
  watchQuery: ['page'],

  data() {
    return {
      contributeForm: {
        amount: 0,
        errmsg: '',
        loading: false,
      },
    };
  },

  async asyncData({ params }) {
    const contract = Project(params.address);

    const summary = await contract.methods.getSummary().call();
    console.log({ params, summary });
    const [description, minInvest, maxInvest, goal, balance, investorCount, paymentCount, owner] = Object.values(
      summary
    );

    const tasks = [];
    for (let i = 0; i < paymentCount; i++) {
      tasks.push(contract.methods.payments(i).call());
    }
    const payments = await Promise.all(tasks);

    const project = {
      address: params.address,
      description,
      minInvest: web3.utils.fromWei(minInvest, 'ether'),
      maxInvest: web3.utils.fromWei(maxInvest, 'ether'),
      goal: web3.utils.fromWei(goal, 'ether'),
      balance: web3.utils.fromWei(balance, 'ether'),
      investorCount,
      paymentCount,
      owner,
      progress: Math.ceil(balance / goal * 100),
      payments,
    };

    console.log(project);

    return { project };
  },

  methods: {
    setState(key, values) {
      this[key] = Object.assign({}, this[key], values || {});
    },

    async contributeProject() {
      console.log('contributeProject', this.contributeForm);

      const { amount } = this.contributeForm;
      const { minInvest, maxInvest, address } = this.project;

      console.log({ amount, minInvest, maxInvest });

      // 字段合规检查
      if (amount <= 0) {
        this.setState('contributeForm', { errmsg: '投资金额必须大于0' });
        return;
      }
      if (amount < minInvest) {
        this.setState('contributeForm', { errmsg: '投资金额必须大于最小投资金额' });
        return;
      }
      if (amount > maxInvest) {
        this.setState('contributeForm', { errmsg: '投资金额必须小于最大投资金额' });
        return;
      }

      try {
        this.setState('contributeForm', { errmsg: '', loading: true });

        // 获取账户
        const accounts = await web3.eth.getAccounts();
        const owner = accounts[0];

        // 发起转账
        const contract = Project(address);
        const result = await contract.methods
          .contribute()
          .send({ from: owner, value: web3.utils.toWei(amount, 'ether'), gas: '5000000' });

        this.setState('contributeForm', { errmsg: '投资成功', amount: 0, loading: false });
        console.log(result);

        setTimeout(() => {
          location.reload();
        }, 1000);
      } catch (err) {
        console.error(err);
        this.setState('contributeForm', {
          errmsg: err.message || err.toString,
          loading: false,
        });
      }
    },
  },
};
</script>

<style>
.project-card {
  margin-bottom: 24px;
}

.info-block {
  padding: 0.5em 1em;
  border: 1px dotted #aaa;
  height: 80px;
  min-height: 80px;
  margin-bottom: 16px;
  border-radius: 5px;
}
.info-block-title {
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}
.info-block-description {
  margin: 0;
  color: #666;
}

.progress-container {
  margin-bottom: 16px;
}
</style>
