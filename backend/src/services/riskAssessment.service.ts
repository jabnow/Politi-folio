/**
 * Risk Assessment Service
 * Analyzes geopolitical intelligence reports using multiple data sources and AI
 * Integrates: Dedalus, World News API, Anthropic, sanctions data, and financial market data
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

interface RiskScores {
  geopoliticalScore: number; // 0-100
  economicImpact: number; // 0-100
  militaryRisk: number; // 0-100
  sanctionsHit: boolean;
  sanctionsList: string[]; // Names of entities hit
  overallRisk: string; // low, medium, high, critical
  confidenceLevel: number; // 0-1
}

export class RiskAssessmentService {
  private anthropic: Anthropic;
  private prisma: PrismaClient;
  private dedalusKey: string;
  private newsApiKey: string;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.prisma = new PrismaClient();
    this.dedalusKey = process.env.DEDALUS_API_KEY || '';
    this.newsApiKey = process.env.WORLD_NEWS_API_KEY || '';
  }

  /**
   * Assess risk for an intelligence report
   * Combines multiple data sources and AI analysis
   */
  async assessReport(reportId: string): Promise<RiskScores> {
    // Fetch report
    const report = await this.prisma.intelligenceReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    // Gather data from multiple sources
    const [newsData, sanctionsCheck, aiAnalysis] = await Promise.all([
      this.fetchNewsData(report.description, report.countries),
      this.checkSanctions(report.countries),
      this.runAiAnalysis(report),
    ]);

    // Synthesize scores
    const scores = this.synthesizeScores(newsData, sanctionsCheck, aiAnalysis, report);

    // Save assessment
    await this.prisma.riskAssessment.create({
      data: {
        reportId,
        geopoliticalScore: scores.geopoliticalScore,
        economicImpact: scores.economicImpact,
        militaryRisk: scores.militaryRisk,
        sanctionsHit: scores.sanctionsHit,
        sanctionsList: JSON.stringify(scores.sanctionsList),
        aiAnalysis: aiAnalysis.summary,
        confidenceLevel: scores.confidenceLevel,
      },
    });

    return scores;
  }

  /**
   * Fetch geopolitical news data
   */
  private async fetchNewsData(
    eventDescription: string,
    countries: string
  ): Promise<{ sentiment: number; relevance: number; sources: number }> {
    try {
      // Parse countries
      const countryList = Array.isArray(countries) ? countries : JSON.parse(countries);
      const query = `${eventDescription} ${countryList.join(' ')}`;

      if (!this.newsApiKey) {
        console.warn('World News API key not configured, using default scores');
        return { sentiment: 0, relevance: 0.5, sources: 0 };
      }

      const response = await fetch(
        `https://api.worldnewsapi.com/search-news?api-key=${this.newsApiKey}&q=${encodeURIComponent(query)}&limit=10`
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        news?: Array<{
          title: string;
          text: string;
          sentiment?: number;
          importance?: number;
        }>;
      };

      // Simple sentiment analysis (would be more sophisticated in production)
      const articles = data.news || [];
      const avgSentiment =
        articles.length > 0
          ? articles.reduce((sum, a) => sum + (a.sentiment || 0), 0) / articles.length
          : 0;

      return {
        sentiment: avgSentiment * 100, // Convert to 0-100 scale
        relevance: Math.min(articles.length / 10, 1), // 0-1
        sources: articles.length,
      };
    } catch (err) {
      console.error('Error fetching news data:', err);
      return { sentiment: 0, relevance: 0.5, sources: 0 };
    }
  }

  /**
   * Check sanctions databases
   */
  private async checkSanctions(countries: string): Promise<{
    sanctionsFound: boolean;
    entities: string[];
  }> {
    try {
      // Parse countries
      const countryList = Array.isArray(countries) ? countries : JSON.parse(countries);

      // Read sanctions CSV (simplified - in production would use proper DB)
      const sanctionsPath = process.env.SANCTIONS_CSV_PATH || './data/sanctions.csv';
      
      // Hardcoded sanctions list for now (would load from CSV in production)
      const KNOWN_SANCTIONS: Record<string, string[]> = {
        'North Korea': ['DPRK', 'Kim Jong-un'],
        Iran: ['IRGC', 'Rouhani'],
        Russia: ['Putin', 'Gazprom', 'Sberbank'],
        Syria: ['Assad', 'Syrian Intelligence'],
      };

      const foundEntities: string[] = [];
      for (const country of countryList) {
        if (KNOWN_SANCTIONS[country]) {
          foundEntities.push(...KNOWN_SANCTIONS[country]);
        }
      }

      return {
        sanctionsFound: foundEntities.length > 0,
        entities: foundEntities,
      };
    } catch (err) {
      console.error('Error checking sanctions:', err);
      return { sanctionsFound: false, entities: [] };
    }
  }

  /**
   * Run AI analysis using Anthropic Claude
   */
  private async runAiAnalysis(
    report: Awaited<
      ReturnType<
        typeof this.prisma.intelligenceReport.findUnique
      >
    >
  ): Promise<{ summary: string; geo_score: number; eco_score: number; mil_score: number }> {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('Anthropic API key not configured, using default analysis');
        return {
          summary: 'Analysis unavailable',
          geo_score: 50,
          eco_score: 50,
          mil_score: 50,
        };
      }

      const prompt = `
        Analyze this geopolitical intelligence report and provide risk scores:
        
        Event: ${report?.description}
        Countries: ${report?.countries}
        Impact Type: ${report?.impactType}
        Date: ${report?.eventDate}
        
        Provide your analysis in the following JSON format:
        {
          "summary": "Your brief analysis",
          "geo_score": 0-100,
          "eco_score": 0-100,
          "mil_score": 0-100,
          "confidence": 0-1
        }
      `;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      return {
        summary: analysis.summary || '',
        geo_score: analysis.geo_score || 50,
        eco_score: analysis.eco_score || 50,
        mil_score: analysis.mil_score || 50,
      };
    } catch (err) {
      console.error('Error running AI analysis:', err);
      return {
        summary: 'Analysis failed',
        geo_score: 0,
        eco_score: 0,
        mil_score: 0,
      };
    }
  }

  /**
   * Synthesize multiple data sources into final risk scores
   */
  private synthesizeScores(
    newsData: { sentiment: number; relevance: number; sources: number },
    sanctions: { sanctionsFound: boolean; entities: string[] },
    aiAnalysis: { summary: string; geo_score: number; eco_score: number; mil_score: number },
    report: Awaited<
      ReturnType<
        typeof this.prisma.intelligenceReport.findUnique
      >
    >
  ): RiskScores {
    // Weighted synthesis
    const weights = {
      ai: 0.4,
      news: 0.3,
      sanctions: 0.2,
      baseScore: 0.1,
    };

    // Base score from report
    const baseScore = report?.impactScore || 0;

    // Calculate final geopolitical score
    const geoScore =
      aiAnalysis.geo_score * weights.ai +
      newsData.sentiment * weights.news +
      (sanctions.sanctionsFound ? 80 : 20) * weights.sanctions +
      baseScore * weights.baseScore;

    // Calculate economic impact
    const econScore =
      aiAnalysis.eco_score * weights.ai +
      Math.abs(newsData.sentiment) * weights.news +
      (sanctions.sanctionsFound && sanctions.entities.length > 3 ? 70 : 30) * weights.sanctions;

    // Calculate military risk
    const milScore = aiAnalysis.mil_score * weights.ai + (baseScore * 0.5) * weights.baseScore;

    // Determine overall risk level
    let overallRisk = 'low';
    if (geoScore > 75) overallRisk = 'critical';
    else if (geoScore > 55) overallRisk = 'high';
    else if (geoScore > 35) overallRisk = 'medium';

    // Calculate confidence based on data quality
    const confidence = Math.min(
      (newsData.sources / 5 + (aiAnalysis.summary !== 'Analysis failed' ? 1 : 0)) / 2,
      1
    );

    return {
      geopoliticalScore: Math.round(geoScore),
      economicImpact: Math.round(econScore),
      militaryRisk: Math.round(milScore),
      sanctionsHit: sanctions.sanctionsFound,
      sanctionsList: sanctions.entities,
      overallRisk,
      confidenceLevel: confidence,
    };
  }
}

export default RiskAssessmentService;
