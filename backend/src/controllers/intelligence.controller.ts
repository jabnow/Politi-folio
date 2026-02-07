/**
 * Intelligence Report Controller
 * Handles submission, validation, voting, and reward distribution for geopolitical intelligence reports
 */

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import RiskAssessmentService from '../services/riskAssessment.service.js';
import PolTokenService from '../services/polTokenService.js';
import ComplianceService from '../services/complianceService.js';
import { Wallet } from 'xrpl';

const prisma = new PrismaClient();
const riskService = new RiskAssessmentService();
const polService = new PolTokenService();
const complianceService = new ComplianceService();

// ─────────────────────────────────────────────────────────────────
// Validation Schemas
// ─────────────────────────────────────────────────────────────────

const submitReportSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  eventDate: z.string().datetime(),
  countries: z.array(z.string()).min(1).max(10),
  impactType: z.enum(['political', 'economic', 'military', 'social', 'unknown']),
  stakeAmount: z.number().positive().min(1),
  userWallet: z.string().regex(/^r[a-zA-Z0-9]{24,34}$/), // XRPL address format
  walletSeed: z.string().optional(), // Only for testing
});

const voteSchema = z.object({
  reportId: z.string().uuid(),
  vote: z.enum(['support', 'challenge', 'abstain']),
  userWallet: z.string().regex(/^r[a-zA-Z0-9]{24,34}$/),
  walletSeed: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────
// Controllers
// ─────────────────────────────────────────────────────────────────

/**
 * POST /api/reports/submit
 * Submit a new geopolitical intelligence report with POL stake
 */
export async function submitReport(req: Request, res: Response) {
  try {
    const validated = submitReportSchema.parse(req.body);

    // 1. Compliance check
    const complianceCheck = await complianceService.verifyStakeCompliance(
      validated.userWallet,
      validated.countries
    );

    if (!complianceCheck.compliant) {
      return res.status(403).json({
        error: 'Compliance violation',
        violations: complianceCheck.violations,
      });
    }

    // 2. Ensure user exists or create
    const user = await prisma.user.upsert({
      where: { walletAddress: validated.userWallet },
      update: {},
      create: {
        walletAddress: validated.userWallet,
        polBalance: 0,
      },
    });

    // 3. Check user has sufficient POL balance
    const polBalance = await polService.getBalance(validated.userWallet);
    if (parseFloat(polBalance) < validated.stakeAmount) {
      return res.status(400).json({
        error: 'Insufficient POL balance',
        required: validated.stakeAmount,
        available: polBalance,
      });
    }

    // 4. Create report
    const report = await prisma.intelligenceReport.create({
      data: {
        title: validated.title,
        description: validated.description,
        eventDate: new Date(validated.eventDate),
        countries: JSON.stringify(validated.countries),
        impactType: validated.impactType,
        stakedPol: validated.stakeAmount,
        stakeCount: 1,
        status: 'pending',
        createdBy: user.id,
        tags: JSON.stringify(['submitted']),
      },
    });

    // 5. Record stake transaction
    let stakeHash = 'demo';
    try {
      const stakeWallet = validated.walletSeed
        ? Wallet.fromSeed(validated.walletSeed)
        : undefined;

      if (stakeWallet) {
        const stakeResult = await polService.transfer(
          stakeWallet,
          polService.getIssuer(),
          validated.stakeAmount.toString(),
          `stake_for_report_${report.id}`
        );
        stakeHash = stakeResult.txHash;
      }
    } catch (err) {
      console.error('Warning: Could not transfer stake on-chain:', err);
      // Continue anyway - stake is recorded in DB
    }

    // 6. Record stake in database
    await prisma.stake.create({
      data: {
        userId: user.id,
        reportId: report.id,
        amount: validated.stakeAmount,
        direction: 'support',
        votingPower: validated.stakeAmount * (user.reputation || 1),
        txHash: stakeHash,
      },
    });

    // 7. Start risk assessment asynchronously
    // In production, would queue this task
    riskService
      .assessReport(report.id)
      .catch((err) => console.error('Risk assessment error:', err));

    return res.status(201).json({
      success: true,
      reportId: report.id,
      stakeHash,
      message: 'Report submitted successfully. Assessment in progress...',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    }
    console.error('Error submitting report:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/reports
 * Get all intelligence reports with filtering
 */
export async function listReports(req: Request, res: Response) {
  try {
    const { status, limit = '20', offset = '0' } = req.query;

    const reports = await prisma.intelligenceReport.findMany({
      where: status ? { status: status as string } : undefined,
      include: {
        user: { select: { walletAddress: true, reputation: true } },
        riskAssessment: true,
        stakes: { select: { amount: true, direction: true } },
      },
      skip: parseInt(offset as string),
      take: Math.min(parseInt(limit as string), 100),
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      count: reports.length,
      reports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        eventDate: r.eventDate.toISOString(),
        countries: JSON.parse(r.countries),
        impactType: r.impactType,
        status: r.status as 'pending' | 'verified' | 'disputed',
        stakedPol: r.stakedPol,
        createdAt: r.createdAt.toISOString(),
        creator: r.user ? {
          walletAddress: r.user.walletAddress,
          reputation: r.user.reputation,
          verifiedAnalyst: false,
        } : undefined,
        riskAssessment: r.riskAssessment ? {
          geopoliticalScore: r.riskAssessment.geopoliticalScore,
          economicImpact: r.riskAssessment.economicImpact,
          militaryRisk: r.riskAssessment.militaryRisk,
          sanctionsHit: r.riskAssessment.sanctionsHit,
          confidenceLevel: r.riskAssessment.confidenceLevel,
        } : undefined,
      })),
    });
  } catch (err) {
    console.error('Error listing reports:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/reports/:id
 * Get detailed report with assessment
 */
export async function getReport(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const report = await prisma.intelligenceReport.findUnique({
      where: { id },
      include: {
        user: { select: { walletAddress: true, reputation: true, verifiedAnalyst: true } },
        riskAssessment: true,
        stakes: { include: { user: { select: { walletAddress: true, reputation: true } } } },
        votes: { include: { user: { select: { walletAddress: true } } } },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json({
      success: true,
      id: report.id,
      title: report.title,
      description: report.description,
      eventDate: report.eventDate.toISOString(),
      countries: JSON.parse(report.countries),
      impactType: report.impactType,
      status: report.status as 'pending' | 'verified' | 'disputed',
      creator: report.user ? {
        walletAddress: report.user.walletAddress,
        reputation: report.user.reputation,
        verifiedAnalyst: report.user.verifiedAnalyst,
      } : undefined,
      stakedPol: report.stakedPol,
      riskAssessment: report.riskAssessment
        ? {
            geopoliticalScore: report.riskAssessment.geopoliticalScore,
            economicImpact: report.riskAssessment.economicImpact,
            militaryRisk: report.riskAssessment.militaryRisk,
            sanctionsHit: report.riskAssessment.sanctionsHit,
            confidenceLevel: report.riskAssessment.confidenceLevel,
          }
        : undefined,
      createdAt: report.createdAt.toISOString(),
      analyzedAt: report.riskAssessment?.analyzedAt,
    });
  } catch (err) {
    console.error('Error fetching report:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/reports/:id/vote
 * Vote to support or challenge a report
 */
export async function voteOnReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validated = voteSchema.parse(req.body);

    // Verify report exists
    const report = await prisma.intelligenceReport.findUnique({
      where: { id: validated.reportId },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { walletAddress: validated.userWallet },
      update: {},
      create: { walletAddress: validated.userWallet },
    });

    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: { userId_reportId: { userId: user.id, reportId: validated.reportId } },
    });

    if (existingVote) {
      return res.status(400).json({ error: 'Already voted on this report' });
    }

    // Create vote
    const vote = await prisma.vote.create({
      data: {
        userId: user.id,
        reportId: validated.reportId,
        vote: validated.vote,
        weight: user.reputation || 1,
      },
    });

    // Update report status if supermajority reached
    const allVotes = await prisma.vote.findMany({
      where: { reportId: validated.reportId },
    });

    const supportVotes = allVotes.filter((v) => v.vote === 'support').length;
    const challengeVotes = allVotes.filter((v) => v.vote === 'challenge').length;
    const totalVotes = allVotes.length;

    if (supportVotes > totalVotes * 0.66) {
      await prisma.intelligenceReport.update({
        where: { id: validated.reportId },
        data: { status: 'verified' },
      });
    } else if (challengeVotes > totalVotes * 0.5) {
      await prisma.intelligenceReport.update({
        where: { id: validated.reportId },
        data: { status: 'disputed' },
      });
    }

    return res.json({
      success: true,
      voteId: vote.id,
      message: 'Vote recorded',
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    }
    console.error('Error voting:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/reports/:id/rewards/claim
 * Claim POL rewards for verified report
 */
export async function claimRewards(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userWallet } = req.body;

    const report = await prisma.intelligenceReport.findUnique({
      where: { id },
      include: { stakes: true },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.status !== 'verified') {
      return res.status(400).json({
        error: 'Report not verified',
        status: report.status,
      });
    }

    // Check if user has stake in this report
    const userStake = report.stakes.find((s) => s.userId === userWallet);
    if (!userStake) {
      return res.status(400).json({ error: 'No stake found for user on this report' });
    }

    // Calculate reward
    const reward = report.stakedPol * 0.1; // 10% reward for supporting verified reports

    // Transfer reward (would be on-chain in production)
    try {
      const polIssuer = polService.getIssuer();
      // In production: await polService.transfer(issuerWallet, userWallet, reward);
    } catch (err) {
      console.error('Error transferring reward:', err);
    }

    // Mark reward as distributed
    await prisma.stake.update({
      where: { id: userStake.id },
      data: { status: 'released', releasedAt: new Date() },
    });

    return res.json({
      success: true,
      message: 'Reward claimed',
      amount: reward,
      currency: 'POL',
    });
  } catch (err) {
    console.error('Error claiming rewards:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default {
  submitReport,
  listReports,
  getReport,
  voteOnReport,
  claimRewards,
};
