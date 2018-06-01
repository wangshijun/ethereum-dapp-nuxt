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
      </el-card>
    </div>
  </div>
</template>

<script>
import web3 from '../../libs/web3';
import Project from '../../libs/project';
import ProjectList from '../../libs/projectList';

export default {
  async asyncData({ params }) {
    const contract = Project(params.address);

    const summary = await contract.methods.getSummary().call();
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
  }
}
</script>

<style>
.project-card {
  margin-bottom: 24px;
}

.info-block {
  padding: 0.5em 1em;
  border: 1px dotted #AAA;
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
