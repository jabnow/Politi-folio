/**
 * Compliance Service
 * Handles sanctions checks, clawbacks, and regulatory compliance for POL stakes
 */

import { PrismaClient } from '@prisma/client';
import PolTokenService from './polTokenService.js';
import dotenv from 'dotenv';

dotenv.config();

export class ComplianceService {
  private polService: PolTokenService;
  private prisma: PrismaClient;

  constructor() {
    this.polService = new PolTokenService();
    this.prisma = new PrismaClient();
  }

  /**
   * Check if an address is on any sanctions list
   */
  async isSanctioned(address: string): Promise<{
    sanctioned: boolean;
    lists: string[];
    entities: string[];
  }> {
    try {
      // In production, would query comprehensive sanctions databases (OFAC, UN, EU, etc.)
      // For now, using a simple local list
      
      const sanctionedAddresses: Record<string, { lists: string[]; entities: string[] }> = {
        // Example: known sanctioned wallet addresses
        // This would be loaded from a proper database in production
      };

      const record = sanctionedAddresses[address];
      return {
        sanctioned: !!record,
        lists: record?.lists || [],
        entities: record?.entities || [],
      };
    } catch (err) {
      console.error('Error checking sanctions:', err);
      throw err;
    }
  }

  /**
   * Check if a country is under sanctions
   */
  async isCountrySanctioned(country: string): Promise<boolean> {
    const sanctionedCountries = [
      'North Korea',
      'Iran',
      'Syria',
      'Cuba',
      'Belarus', // As of 2024
    ];

    return sanctionedCountries.some(
      (c) => c.toLowerCase() === country.toLowerCase()
    );
  }

  /**
   * Process clawback for sanctions violation
   */
  async clawbackForSanctions(
    userAddress: string,
    amount: string,
    reason: string = 'sanctions_violation'
  ): Promise<{ txHash: string; success: boolean }> {
    try {
      console.log(`Initiating clawback for ${userAddress}: ${amount} POL`);

      // Perform clawback via POL service
      const result = await this.polService.clawback(userAddress, amount, reason);

      // Log to audit trail
      await this.prisma.auditLog.create({
        data: {
          action: 'clawback_executed',
          resourceType: 'PolTransaction',
          resourceId: result.txHash,
          details: JSON.stringify({
            userAddress,
            amount,
            reason,
            timestamp: new Date(),
          }),
        },
      });

      return result;
    } catch (err) {
      console.error('Error performing clawback:', err);
      throw err;
    }
  }

  /**
   * Verify compliance before allowing stake submission
   */
  async verifyStakeCompliance(userAddress: string, countries: string[]): Promise<{
    compliant: boolean;
    violations: string[];
  }> {
    const violations: string[] = [];

    // Check address sanctions
    const sanctionCheck = await this.isSanctioned(userAddress);
    if (sanctionCheck.sanctioned) {
      violations.push(`Address on sanctions list: ${sanctionCheck.lists.join(', ')}`);
    }

    // Check country sanctions
    for (const country of countries) {
      const countryIsSanctioned = await this.isCountrySanctioned(country);
      if (countryIsSanctioned) {
        violations.push(`Country under sanctions: ${country}`);
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * Flag a high-risk report for manual review
   */
  async flagForReview(reportId: string, reason: string): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        action: 'report_flagged_review',
        resourceType: 'IntelligenceReport',
        resourceId: reportId,
        details: JSON.stringify({
          reason,
          timestamp: new Date(),
        }),
      },
    });

    console.log(`Report ${reportId} flagged for review: ${reason}`);
  }

  /**
   * Validate transaction for compliance
   */
  async validateTransaction(
    fromAddress: string,
    toAddress: string,
    amount: string,
    currency: string = 'POL'
  ): Promise<{ valid: boolean; reason?: string }> {
    // Check both addresses
    const fromSanctioned = await this.isSanctioned(fromAddress);
    const toSanctioned = await this.isSanctioned(toAddress);

    if (fromSanctioned.sanctioned) {
      return {
        valid: false,
        reason: `Source address on sanctions list`,
      };
    }

    if (toSanctioned.sanctioned) {
      return {
        valid: false,
        reason: `Destination address on sanctions list`,
      };
    }

    // Check for suspicious patterns (AML)
    // In production: check against known money laundering patterns
    if (parseFloat(amount) > 1000000) {
      // Arbitrary high threshold
      await this.flagForReview(`tx_${fromAddress}`, 'Large transaction amount');
    }

    return { valid: true };
  }
}

export default ComplianceService;
