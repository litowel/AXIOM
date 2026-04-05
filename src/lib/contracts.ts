export const SUPPORTED_CHAINS = {
  BASE_SEPOLIA: 84532n,
  MAINNET: 1n,
};

export const ADDRESSES = {
  BASE_SEPOLIA: {
    AAVE_POOL: "0x07eA79F68B2B3df46465C5e9628539001c181120",
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Aave Mock USDC on Base Sepolia
    A_USDC: "0x16008EDa14217D211145b232B258285223011317", // aToken
    V_DEBT_USDC: "0x1A09E5114A51f478aE1725547437887A89069279", // Variable Debt Token
    UNISWAP_V2_ROUTER: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24", // Example router
    WETH: "0x4200000000000000000000000000000000000006",
  }
};

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export const WETH_ABI = [
  ...ERC20_ABI,
  "function deposit() public payable",
  "function withdraw(uint wad) public",
];

export const AAVE_POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)",
  "function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)",
  "function flashLoanSimple(address receiverAddress, address asset, uint256 amount, bytes calldata params, uint16 referralCode)"
];

export const UNISWAP_V2_ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) payable returns (uint[] memory amounts)"
];
