// Create a utility function in utils/linkUtils.ts for generating Etherscan links

// website/src/utils/linkUtils.ts
export const buildEtherscanLink = (
    type: 'address' | 'tx' | 'token', 
    value: string
  ): string => {
    // Base URL for Sepolia
    const baseUrl = 'https://sepolia.etherscan.io';
    
    // Different URL paths based on type
    switch (type) {
      case 'address':
        return `${baseUrl}/address/${value}`;
      case 'tx':
        return `${baseUrl}/tx/${value}`;
      case 'token':
        return `${baseUrl}/token/${value}`;
      default:
        return baseUrl;
    }
  };
  
  // Example of how to use this in a component:
  // For addresses (such as wallet addresses):
  // <a href={buildEtherscanLink('address', account)}>View on Etherscan</a>
  //
  // For transactions:
  // <a href={buildEtherscanLink('tx', txHash)}>View Transaction</a>