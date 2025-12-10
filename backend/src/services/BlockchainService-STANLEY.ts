/**
 * Blockchain Service
 * Manages ScrollGold smart contract interactions
 */

import { ethers } from 'ethers';
import ScrollGoldABI from '../contracts/ScrollGold.json';

export default class BlockchainService {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;
  private signer?: ethers.Signer;

  constructor() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-rpc.com';
    const contractAddress = process.env.SCROLLGOLD_CONTRACT_ADDRESS || '';
    
    if (!contractAddress) {
      throw new Error('SCROLLGOLD_CONTRACT_ADDRESS not configured');
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(contractAddress, ScrollGoldABI, this.provider);

    // Initialize signer if private key is available
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.contract = this.contract.connect(this.signer);
    }
  }

  /**
   * Get ScrollGold balance for an address
   */
  async getBalance(address: string): Promise<number> {
    try {
      const balance = await this.contract.balanceOf(address);
      return parseFloat(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  /**
   * Award ScrollGold reward on-chain
   */
  async awardReward(
    recipient: string,
    amount: number,
    reason: string
  ): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Signer not configured');
      }

      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await this.contract.awardReward(recipient, amountWei, reason);
      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error) {
      console.error('Error awarding reward:', error);
      throw error;
    }
  }

  /**
   * Grant scholarship on-chain
   */
  async grantScholarship(
    recipient: string,
    amount: number,
    program: string
  ): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Signer not configured');
      }

      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await this.contract.grantScholarship(recipient, amountWei, program);
      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error) {
      console.error('Error granting scholarship:', error);
      throw error;
    }
  }

  /**
   * Process tuition payment on-chain
   */
  async payTuition(
    amount: number,
    courseId: string
  ): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Signer not configured');
      }

      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await this.contract.payTuition(amountWei, courseId);
      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error) {
      console.error('Error paying tuition:', error);
      throw error;
    }
  }

  /**
   * Transfer ScrollGold between addresses
   */
  async transfer(
    to: string,
    amount: number
  ): Promise<string> {
    try {
      if (!this.signer) {
        throw new Error('Signer not configured');
      }

      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await this.contract.transfer(to, amountWei);
      const receipt = await tx.wait();

      return receipt.transactionHash;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  /**
   * Get pool balances
   */
  async getPoolBalances(): Promise<{
    reward: number;
    scholarship: number;
    reserve: number;
    burned: number;
  }> {
    try {
      const pools = await this.contract.getPoolBalances();
      
      return {
        reward: parseFloat(ethers.utils.formatEther(pools.reward)),
        scholarship: parseFloat(ethers.utils.formatEther(pools.scholarship)),
        reserve: parseFloat(ethers.utils.formatEther(pools.reserve)),
        burned: parseFloat(ethers.utils.formatEther(pools.burned))
      };
    } catch (error) {
      console.error('Error getting pool balances:', error);
      throw error;
    }
  }

  /**
   * Get user statistics from blockchain
   */
  async getUserStats(address: string): Promise<{
    balance: number;
    earned: number;
    spent: number;
  }> {
    try {
      const stats = await this.contract.getUserStats(address);
      
      return {
        balance: parseFloat(ethers.utils.formatEther(stats.balance)),
        earned: parseFloat(ethers.utils.formatEther(stats.earned)),
        spent: parseFloat(ethers.utils.formatEther(stats.spent))
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Get total supply
   */
  async getTotalSupply(): Promise<number> {
    try {
      const supply = await this.contract.totalSupply();
      return parseFloat(ethers.utils.formatEther(supply));
    } catch (error) {
      console.error('Error getting total supply:', error);
      throw error;
    }
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt && receipt.status === 1;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash: string): Promise<any> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        transaction: tx,
        receipt: receipt,
        confirmed: receipt && receipt.status === 1
      };
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(
    method: string,
    params: any[]
  ): Promise<string> {
    try {
      const gasEstimate = await this.contract.estimateGas[method](...params);
      const gasPrice = await this.provider.getGasPrice();
      const cost = gasEstimate.mul(gasPrice);
      
      return ethers.utils.formatEther(cost);
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }
}
