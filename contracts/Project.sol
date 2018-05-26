pragma solidity ^0.4.17;

contract Project {
    struct Payment {
        string description;
        uint amount;
        address receiver;
        bool completed;
        address[] voters;
    }

    address public owner;
    string public description;
    uint public minInvest;
    uint public maxInvest;
    uint public goal;
    address[] public investors;
    Payment[] public payments;

    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    constructor(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
        owner = msg.sender;
        description = _description;
        minInvest = _minInvest;
        maxInvest = _maxInvest;
        goal = _goal;
    }

    function contribute() public payable {
        require(msg.value >= minInvest);
        require(msg.value <= maxInvest);
        require(address(this).balance + msg.value <= goal);

        investors.push(msg.sender);
    }

    function createPayment(string _description, uint _amount, address _receiver) ownerOnly public {
        Payment memory newPayment = Payment({
            description: _description,
            amount: _amount,
            receiver: _receiver,
            completed: false,
            voters: new address[](0)
        });

        payments.push(newPayment);
    }

    function approvePayment(uint index) public {
        Payment storage payment = payments[index];

        // must be investor to vote
        bool isInvestor = false;
        for (uint i = 0; i < investors.length; i++) {
            isInvestor = investors[i] == msg.sender;
            if (isInvestor) {
                break;
            }
        }
        require(isInvestor);

        // can not vote twice
        bool hasVoted = false;
        for (uint j = 0; j < payment.voters.length; j++) {
            hasVoted = payment.voters[j] == msg.sender;
            if (hasVoted) {
                break;
            }
        }
        require(!hasVoted);

        payment.voters.push(msg.sender);
    }

    function doPayment(uint index) ownerOnly public {
        Payment storage payment = payments[index];

        require(!payment.completed);
        require(address(this).balance >= payment.amount);
        require(payment.voters.length > (investors.length / 2));

        payment.receiver.transfer(payment.amount);
        payment.completed = true;
    }
}
