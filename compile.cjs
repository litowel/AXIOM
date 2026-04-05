const solc = require('solc');
const fs = require('fs');

const source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAavePool {
    function flashLoanSimple(
        address receiver,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 referralCode
    ) external;
}

contract FlashLoanExecutor {
    address public owner;
    IAavePool public pool;

    enum Strategy {
        Arbitrage,
        CollateralSwap,
        Liquidation,
        Refinance
    }

    constructor(address _pool) {
        owner = msg.sender;
        pool = IAavePool(_pool);
    }

    function executeFlashLoan(
        address asset,
        uint256 amount,
        Strategy strategy,
        bytes calldata data
    ) external {
        pool.flashLoanSimple(
            address(this),
            asset,
            amount,
            abi.encode(strategy, data),
            0
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address,
        bytes calldata params
    ) external returns (bool) {
        (Strategy strategy, bytes memory data) =
            abi.decode(params, (Strategy, bytes));

        if (strategy == Strategy.Arbitrage) {
            _arbitrage(asset, amount, data);
        } 
        else if (strategy == Strategy.CollateralSwap) {
            _collateralSwap(asset, amount, data);
        }
        else if (strategy == Strategy.Liquidation) {
            _liquidation(asset, amount, data);
        }
        else if (strategy == Strategy.Refinance) {
            _refinance(asset, amount, data);
        }

        uint totalDebt = amount + premium;
        IERC20(asset).approve(address(pool), totalDebt);

        return true;
    }

    function _arbitrage(address asset, uint amount, bytes memory data) internal {
        // DEX swaps here
    }

    function _collateralSwap(address asset, uint amount, bytes memory data) internal {
        // repay + swap + redeposit
    }

    function _liquidation(address asset, uint amount, bytes memory data) internal {
        // call liquidation function
    }

    function _refinance(address asset, uint amount, bytes memory data) internal {
        // move loan between protocols
    }

    function withdraw(address token) external {
        require(msg.sender == owner, "Not owner");
        uint balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(owner, balance);
    }
}

interface IERC20 {
    function approve(address spender, uint amount) external returns (bool);
    function balanceOf(address account) external view returns (uint);
    function transfer(address recipient, uint amount) external returns (bool);
}
`;

const input = {
  language: 'Solidity',
  sources: {
    'FlashLoanExecutor.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts['FlashLoanExecutor.sol']['FlashLoanExecutor'];

fs.writeFileSync('src/lib/FlashLoanExecutorContract.ts', `
export const FLASHLOAN_EXECUTOR_ABI = ${JSON.stringify(contract.abi, null, 2)};
export const FLASHLOAN_EXECUTOR_BYTECODE = "0x${contract.evm.bytecode.object}";
`);
console.log('Compiled successfully');

