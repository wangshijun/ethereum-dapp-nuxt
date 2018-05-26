const assert = require('assert');
const path = require('path');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const web3 = new Web3(ganache.provider());
const ProjectList = require(path.resolve(__dirname, '../compiled/ProjectList.json'));
const Project = require(path.resolve(__dirname, '../compiled/Project.json'));

let accounts;
let projectList;
let project;

describe.only('Project Contract', () => {
    // 1. 每次跑单测时需要部署全新的合约实例，起到隔离的作用
    beforeEach(async () => {
        // 1.1 拿到 ganache 本地测试网络的账号
        accounts = await web3.eth.getAccounts();

        // 1.2 部署 ProjectList 合约
        projectList = await new web3.eth.Contract(JSON.parse(ProjectList.interface))
            .deploy({ data: ProjectList.bytecode })
            .send({ from: accounts[0], gas: '1000000' });

        // 1.3 调用 ProjectList 的 createProject 方法
        await projectList.methods.createProject('Ethereum DApp Tutorial', 100, 10000, 1000000).send({
            from: accounts[0],
            gas: '1000000',
        });

        // 1.4 获取刚创建的 Project 实例的地址
        const [address] = await projectList.methods.getProjects().call();

        // 1.5 生成可用的 Project 合约对象
        project = await new web3.eth.Contract(JSON.parse(Project.interface), address);
    });

    it('should deploy ProjectList and Project', async () => {
        assert.ok(projectList.options.address);
        assert.ok(project.options.address);
    });

    it('should save correct project properties', async () => {
        const owner = await project.methods.owner().call();
        const description = await project.methods.description().call();
        const minInvest = await project.methods.minInvest().call();
        const maxInvest = await project.methods.maxInvest().call();
        const goal = await project.methods.goal().call();

        assert.equal(owner, accounts[0]);
        assert.equal(description, 'Ethereum DApp Tutorial');
        assert.equal(minInvest, 100);
        assert.equal(maxInvest, 10000);
        assert.equal(goal, 1000000);
    });
});
