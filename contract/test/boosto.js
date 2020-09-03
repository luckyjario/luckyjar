const WinnerToken = artifacts.require('./WinToken.sol');

const toWei = (number) => number * Math.pow(10, 18);

const transaction = (address, wei) => ({
    from: address,
    value: wei
});

const fail = (msg) => (error) => assert(false, error ?
    `${msg}, but got error: ${error.message}` : msg);

const revertExpectedError = async(promise) => {
    try {
        await promise;
        fail('expected to fail')();
    } catch (error) {
        assert(error.message.indexOf('revert') >= 0 || error.message.indexOf('invalid opcode') >= 0,
            `Expected revert, but got: ${error.message}`);
    }
}

const timeController = (() => {

    const addSeconds = (seconds) => new Promise((resolve, reject) =>
        web3.currentProvider.sendAsync({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [seconds],
            id: new Date().getTime()
        }, (error, result) => error ? reject(error) : resolve(result.result)));

    const addDays = (days) => addSeconds(days * 24 * 60 * 60);
    const addHours = (hours) => addSeconds(hours * 60 * 60);

    const currentTimestamp = () => web3.eth.getBlock(web3.eth.blockNumber).timestamp;

    return {
        addSeconds,
        addDays,
        addHours,
        currentTimestamp
    };
})();

const ethBalance = (address) => web3.eth.getBalance(address).toNumber();

contract('WinnerToken', accounts => {

    const admin = accounts[1];
    const account1 = accounts[2];
    const account2 = accounts[3];

    const account3 = accounts[4];

    const oneEth = toWei(1);

    const supply = toWei(1000000000);
    const maxCap = toWei(4);
    const minAmount = toWei(0.1);

    const oneMonth = 30 * 24 * 60 * 60;
    const coinsPerETH = 100;

    const rewardHours = [10, 24, 48, 100];
    const rewardPerents = [20, 10, 5, 0];

    const testAsync = async() => {
        const response = await new Promise(resolve => {
            setTimeout(() => {
                //resolve("async await test...");
            }, 1000);
        });
        //console.log(response);
    }

    const adminUpdateWhiteList = (boosto) => (address, value) => boosto.adminUpdateWhiteList(address, value, { from: admin });

    const test = (a) => (b) => {
        //console.log('jiashunran test', a, b);
    }
    const createToken = () => WinnerToken.new({ from: admin });

    const addPublicICO = (boosto) => boosto.adminAddICO(
        timeController.currentTimestamp(),
        oneMonth,
        coinsPerETH,
        maxCap,
        minAmount,
        rewardHours,
        rewardPerents,
        true, //isPublic
        { from: admin }
    );

    const addPrivateICO = (boosto) => boosto.adminAddICO(
        timeController.currentTimestamp(),
        oneMonth,
        coinsPerETH,
        maxCap,
        minAmount,
        rewardHours,
        rewardPerents,
        false, //isPublic
        { from: admin }
    )

    it('jiashunran test', async() => {
        test(1)(2)
        testAsync()
        const boosto = await createToken();
    })

    it('test total supply, minAmount, admin balance', async() => {
        const boosto = await createToken();
        await boosto.sendTransaction(transaction(account1, oneEth));
        await boosto.sendTransaction(transaction(account1, oneEth));
        await boosto.sendTransaction(transaction(account1, oneEth));
        await boosto.sendTransaction(transaction(account1, oneEth));
        await boosto.sendTransaction(transaction(account1, oneEth));
        await boosto.sendTransaction(transaction(account1, oneEth));
        await boosto.sendTransaction(transaction(account1, oneEth));

        await boosto.sendTransaction(transaction(account1, oneEth));
        
        console.log(await boosto.totalSupply(), await boosto.ethBalance());
    });

});