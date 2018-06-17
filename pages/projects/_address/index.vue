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
            <info-block :title="project.goal + ' ETH'" description="募资上限"></info-block>
          </el-col>
          <el-col :span="8">
            <info-block :title="project.minInvest + ' ETH'" description="最小投资金额"></info-block>
          </el-col>
          <el-col :span="8">
            <info-block :title="project.maxInvest + ' ETH'" description="最大投资金额"></info-block>
          </el-col>
          <el-col :span="8">
            <info-block :title="project.investorCount + ' 人'" description="参投人数"></info-block>
          </el-col>
          <el-col :span="8">
            <info-block :title="project.investorCount + ' ETH'" description="已募资金额"></info-block>
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
    <h2 class="page-header">资金支出列表</h2>
    <div class="page-content">
      <el-card class="project-card">
        <el-table :data="project.payments" stripe style="width: 100%">
          <el-table-column
            prop="description"
            label="支出理由"
            width="200">
          </el-table-column>
          <el-table-column
            prop="amount"
            label="支出金额"
            width="100">
          </el-table-column>
          <el-table-column
            prop="receiver"
            label="收款人"
            width="400">
          </el-table-column>
          <el-table-column
            prop="completedText"
            label="已完成"
            width="100">
          </el-table-column>
          <el-table-column
            prop="voteStatus"
            label="投票状态"
            width="100">
          </el-table-column>
           <el-table-column
            fixed="right"
            label="操作"
            width="200">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.canApprove"
                @click="approvePayment(scope.$index)"
                :loading="approveState.loading === scope.$index"
                type="text"
                size="small">投赞成票</el-button>
              <el-button
                v-if="scope.row.canDoPayment"
                @click="doPayment(scope.$index)"
                :loading="doPaymentState.loading === scope.$index"
                type="text"
                size="small">资金划转</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <nuxt-link :to="'/projects/' + project.address + '/payments/create'">
        <el-button type="primary">创建资金支出请求</el-button>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import web3 from '../../../libs/web3';
import Project from '../../../libs/project';
import InfoBlock from '../../../components/InfoBlock';

export default {
  watchQuery: ['page'],
  components: {
    'info-block': InfoBlock,
  },

  data() {
    return {
      contributeForm: {
        amount: 0,
        errmsg: '',
        loading: false,
      },
      approveState: {
        loading: false,
        errmsg: false,
      },
      doPaymentState: {
        loading: false,
        errmsg: false,
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
    console.log('tasks', tasks)
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
      payments: payments.map(x => {
        x.amount = `${web3.utils.fromWei(x.amount, 'ether')} ETH`;
        x.voteStatus = `${x.voterCount}/${investorCount}`;
        x.canApprove = !x.completed;
        x.canDoPayment = !x.completed && x.voterCount / investorCount > 0.5;
        x.completedText = x.completed ? '是' : '否';
        return x;
      }),
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

    async approvePayment(i) {
      try {
        this.setState('approveState', { loading: true });

        const accounts = await web3.eth.getAccounts();
        const sender = accounts[0];

        const contract = Project(this.project.address);
        const isInvestor = await contract.methods.investors(sender).call();
        if (!isInvestor) {
          return window.alert('只有投资人才有权投票');
        }

        const result = await contract.methods.approvePayment(i).send({ from: sender, gas: '5000000' });

        window.alert('投票成功');

        setTimeout(() => {
          location.reload();
        }, 1000);
      } catch (err) {
        console.error(err);
        window.alert(err.message || err.toString());
      } finally {
        this.setState('approveState', { loading: false });
      }
    },

    async doPayment(i) {
      try {
        this.setState('doPaymentState', { loading: true });

        const accounts = await web3.eth.getAccounts();
        const sender = accounts[0];

        // 检查账户
        if (sender !== this.project.owner) {
          return window.alert('只有管理员能发起资金支出请求');
        }

        const contract = Project(this.project.address);
        const result = await contract.methods.doPayment(i).send({ from: sender, gas: '5000000' });

        window.alert('资金划转成功');

        setTimeout(() => {
          location.reload();
        }, 1000);
      } catch (err) {
        console.error(err);
        window.alert(err.message || err.toString());
      } finally {
        this.setState('doPaymentState', { loading: false });
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
