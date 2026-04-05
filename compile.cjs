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

contract FlashLoanArb {
    address public owner;
    IAavePool public pool;

    constructor(address _pool) {
        owner = msg.sender;
        pool = IAavePool(_pool);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    function startArbitrage(address asset, uint256 amount) external onlyOwner {
        pool.flashLoanSimple(
            address(this),
            asset,
            amount,
            "",
            0
        );
    }

    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address,
        bytes calldata
    ) external returns (bool) {

        // --- Arbitrage Logic Placeholder ---
        // 1. Swap on DEX A
        // 2. Swap back on DEX B

        uint256 totalDebt = amount + premium;

        // approve repayment
        IERC20(asset).approve(address(pool), totalDebt);

        return true;
    }

    function withdraw(address token) external onlyOwner {
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
    'FlashLoanArb.sol': {
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
const contract = output.contracts['FlashLoanArb.sol']['FlashLoanArb'];

fs.writeFileSync('src/lib/FlashLoanArbContract.ts', `
export const FLASHLOAN_ARB_ABI = ${JSON.stringify(contract.abi, null, 2)};
export const FLASHLOAN_ARB_BYTECODE = "0x${contract.evm.bytecode.object}";
`);
console.log('Compiled successfully');
