import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

const ABI = [
  "function recordSale(string memory _numeroVenta, string memory _saleHash) public",
  "function getSaleHash(string memory _numeroVenta) public view returns (string memory)"
];

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeBlockchain();
  }

  private initializeBlockchain() {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

    if (!rpcUrl || !privateKey || !contractAddress) {
      this.logger.warn('Blockchain credentials are not fully configured. Blockchain integration is disabled.');
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(contractAddress, ABI, this.wallet);
      this.logger.log(`Blockchain initialized successfully with contract ${contractAddress}`);
    } catch (error) {
      this.logger.error('Failed to initialize blockchain configuration', error);
    }
  }

  /**
   * Registers a sale on the blockchain by hashing its details.
   * @param numeroVenta The unique ID of the sale
   * @param saleData The stringified JSON of the sale's details
   * @returns The transaction hash if successful, or null if failed/disabled
   */
  async registerSaleOnChain(numeroVenta: string, saleData: string): Promise<string | null> {
    if (!this.contract) {
      this.logger.warn('Blockchain is not initialized, skipping sale registration');
      return null;
    }

    try {
      // 1. Generate SHA-256 hash of the sale data
      const dataBytes = ethers.toUtf8Bytes(saleData);
      const saleHash = ethers.keccak256(dataBytes);

      this.logger.log(`Registering sale ${numeroVenta} on blockchain with hash ${saleHash}`);

      // 2. Send transaction
      const tx = await this.contract.recordSale(numeroVenta, saleHash);
      this.logger.log(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);

      // 3. Wait for the transaction to be mined
      const receipt = await tx.wait();
      this.logger.log(`Transaction mined in block ${receipt.blockNumber}`);

      return tx.hash;
    } catch (error) {
      this.logger.error(`Error registering sale ${numeroVenta} on blockchain`, error);
      return null;
    }
  }
  /**
   * Fetches the recorded hash of a sale from the blockchain.
   * @param numeroVenta The unique ID of the sale
   * @returns The cryptographic hash of the sale or null if not found/disabled
   */
  async getSaleHashOnChain(numeroVenta: string): Promise<string | null> {
    if (!this.contract) {
      this.logger.warn('Blockchain is not initialized, skipping hash verification');
      return null;
    }

    try {
      this.logger.log(`Fetching sale hash for ${numeroVenta} from blockchain...`);
      const hash = await this.contract.getSaleHash(numeroVenta);
      if (!hash || hash === '') {
        return null;
      }
      return hash;
    } catch (error) {
      this.logger.error(`Error fetching sale hash for ${numeroVenta}`, error);
      return null;
    }
  }
}
