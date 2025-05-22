import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertCampaignMetricsSchema } from "@shared/schema";
import { subDays, format, parseISO } from "date-fns";

export function setupMetricsRoutes(app: Express, requireAuth: any) {
  // Get metrics summary
  app.get("/api/metrics/summary", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { startDate, endDate, platform } = req.query;
      
      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : subDays(end, 30);
      
      // Get previous period for comparison
      const daysDiff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const prevEnd = subDays(start, 1);
      const prevStart = subDays(prevEnd, daysDiff);
      
      // Get metrics for current period
      const metrics = await storage.getMetricsSummary(userId, start, end, platform as string | undefined);
      
      // Get metrics for previous period for comparison
      const prevMetrics = await storage.getMetricsSummary(userId, prevStart, prevEnd, platform as string | undefined);
      
      // Calculate percentage changes
      const spendChange = prevMetrics.totalSpend ? 
        ((metrics.totalSpend - prevMetrics.totalSpend) / prevMetrics.totalSpend) * 100 : 0;
      
      const roasChange = prevMetrics.overallRoas ? 
        ((metrics.overallRoas - prevMetrics.overallRoas) / prevMetrics.overallRoas) * 100 : 0;
      
      const conversionsChange = prevMetrics.totalConversions ? 
        ((metrics.totalConversions - prevMetrics.totalConversions) / prevMetrics.totalConversions) * 100 : 0;
      
      const costPerConversionChange = prevMetrics.averageCostPerConversion ? 
        ((metrics.averageCostPerConversion - prevMetrics.averageCostPerConversion) / prevMetrics.averageCostPerConversion) * 100 : 0;
      
      res.json({
        ...metrics,
        spendChange,
        roasChange,
        conversionsChange,
        costPerConversionChange
      });
    } catch (error) {
      console.error("Error fetching metrics summary:", error);
      res.status(500).json({ message: "Failed to fetch metrics summary" });
    }
  });

  // Get platform performance
  app.get("/api/metrics/platforms", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { startDate, endDate } = req.query;
      
      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : subDays(end, 30);
      
      const platformPerformance = await storage.getPlatformPerformance(userId, start, end);
      
      res.json(platformPerformance);
    } catch (error) {
      console.error("Error fetching platform performance:", error);
      res.status(500).json({ message: "Failed to fetch platform performance" });
    }
  });

  // Get spend distribution
  app.get("/api/metrics/spend-distribution", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { startDate, endDate } = req.query;
      
      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : subDays(end, 30);
      
      const spendDistribution = await storage.getSpendDistribution(userId, start, end);
      
      res.json(spendDistribution);
    } catch (error) {
      console.error("Error fetching spend distribution:", error);
      res.status(500).json({ message: "Failed to fetch spend distribution" });
    }
  });

  // Get top campaigns
  app.get("/api/metrics/top-campaigns", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { startDate, endDate, limit = "5", platform } = req.query;
      
      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : subDays(end, 30);
      
      const topCampaigns = await storage.getTopCampaigns(
        userId, 
        start, 
        end, 
        parseInt(limit as string), 
        platform as string | undefined
      );
      
      res.json(topCampaigns);
    } catch (error) {
      console.error("Error fetching top campaigns:", error);
      res.status(500).json({ message: "Failed to fetch top campaigns" });
    }
  });

  // Get performance timeseries data
  app.get("/api/metrics/performance", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { startDate, endDate, metric = "spend", platform } = req.query;
      
      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : subDays(end, 30);
      
      // Validate metric
      const validMetrics = ["spend", "roas", "conversions", "ctr"];
      if (!validMetrics.includes(metric as string)) {
        return res.status(400).json({ message: "Invalid metric" });
      }
      
      const performanceData = await storage.getPerformanceTimeseries(
        userId, 
        start, 
        end, 
        metric as string, 
        platform as string | undefined
      );
      
      res.json(performanceData);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      res.status(500).json({ message: "Failed to fetch performance data" });
    }
  });

  // Get insights and alerts
  app.get("/api/metrics/insights", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const insights = await storage.getMetricInsights(userId);
      
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  // Fetch data from platforms (manual trigger)
  app.post("/api/metrics/fetch", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { platform } = req.body;
      
      // Validate platform
      const validPlatforms = ["google_ads", "facebook_ads", "tiktok_ads"];
      if (platform && !validPlatforms.includes(platform)) {
        return res.status(400).json({ message: "Invalid platform" });
      }
      
      // This would trigger the fetch from external APIs
      // In a real implementation, this might be a background job
      // For now, we'll just return a success message
      
      res.json({ success: true, message: "Data fetch initiated" });
    } catch (error) {
      console.error("Error triggering data fetch:", error);
      res.status(500).json({ message: "Failed to trigger data fetch" });
    }
  });
}
