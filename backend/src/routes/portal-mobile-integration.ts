/**
 * Portal & Mobile Integration API Routes
 * "Let your light shine before others" - Matthew 5:16
 */

import express, { Request, Response } from 'express';
import { portalMobileIntegrationService } from '../services/PortalMobileIntegrationService';
import { universityPortalIntegrator } from '../services/UniversityPortalIntegrator';
import { mobileContentCoordinator } from '../services/MobileContentCoordinator';
import { globalDistributionCoordinator } from '../services/GlobalDistributionCoordinator';
import { offlineStorageService } from '../services/OfflineStorageService';
import { logger } from '../utils/productionLogger';

const router = express.Router();

/**
 * Get unified content across platforms
 * POST /api/portal-mobile/content
 */
router.post('/content', async (req: Request, res: Response) => {
    try {
        const { userId, contentId, platform, deviceInfo, networkInfo } = req.body;

        if (!userId || !contentId || !platform) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, contentId, platform'
            });
        }

        const response = await portalMobileIntegrationService.getUnifiedContent({
            userId,
            contentId,
            platform,
            deviceInfo,
            networkInfo
        });

        if (!response) {
            return res.status(404).json({
                success: false,
                error: 'Content not found'
            });
        }

        res.json({
            success: true,
            data: response
        });

    } catch (error: any) {
        logger.error('Failed to get unified content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get portal dashboard
 * GET /api/portal-mobile/portal/dashboard/:userId
 */
router.get('/portal/dashboard/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const dashboard = await universityPortalIntegrator.getPortalDashboard(userId);

        if (!dashboard) {
            return res.status(404).json({
                success: false,
                error: 'Dashboard not found'
            });
        }

        res.json({
            success: true,
            data: dashboard
        });

    } catch (error: any) {
        logger.error('Failed to get portal dashboard', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Search portal content
 * GET /api/portal-mobile/portal/search
 */
router.get('/portal/search', async (req: Request, res: Response) => {
    try {
        const { userId, query, filters } = req.query;

        if (!userId || !query) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: userId, query'
            });
        }

        const results = await universityPortalIntegrator.searchPortalContent(
            userId as string,
            query as string,
            filters ? JSON.parse(filters as string) : undefined
        );

        res.json({
            success: true,
            data: results
        });

    } catch (error: any) {
        logger.error('Failed to search portal content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Update user progress
 * POST /api/portal-mobile/portal/progress
 */
router.post('/portal/progress', async (req: Request, res: Response) => {
    try {
        const { userId, contentId, progress } = req.body;

        if (!userId || !contentId || progress === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, contentId, progress'
            });
        }

        const updated = await universityPortalIntegrator.updateUserProgress(
            userId,
            contentId,
            progress
        );

        res.json({
            success: updated,
            message: updated ? 'Progress updated' : 'Failed to update progress'
        });

    } catch (error: any) {
        logger.error('Failed to update user progress', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get mobile content
 * POST /api/portal-mobile/mobile/content
 */
router.post('/mobile/content', async (req: Request, res: Response) => {
    try {
        const { userId, contentId, deviceInfo, networkInfo, offlineMode } = req.body;

        if (!userId || !contentId || !deviceInfo || !networkInfo) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, contentId, deviceInfo, networkInfo'
            });
        }

        const response = await mobileContentCoordinator.getMobileContent({
            userId,
            contentId,
            deviceInfo,
            networkInfo,
            offlineMode
        });

        if (!response) {
            return res.status(404).json({
                success: false,
                error: 'Content not found'
            });
        }

        res.json({
            success: true,
            data: response
        });

    } catch (error: any) {
        logger.error('Failed to get mobile content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Prepare offline content
 * POST /api/portal-mobile/mobile/offline/prepare
 */
router.post('/mobile/offline/prepare', async (req: Request, res: Response) => {
    try {
        const { userId, contentIds, deviceInfo } = req.body;

        if (!userId || !contentIds || !Array.isArray(contentIds) || !deviceInfo) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, contentIds (array), deviceInfo'
            });
        }

        const offlinePackage = await mobileContentCoordinator.prepareOfflineContent(
            userId,
            contentIds,
            deviceInfo
        );

        if (!offlinePackage) {
            return res.status(500).json({
                success: false,
                error: 'Failed to prepare offline content'
            });
        }

        res.json({
            success: true,
            data: offlinePackage
        });

    } catch (error: any) {
        logger.error('Failed to prepare offline content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Sync mobile content
 * POST /api/portal-mobile/mobile/sync
 */
router.post('/mobile/sync', async (req: Request, res: Response) => {
    try {
        const { userId, deviceInfo, lastSync } = req.body;

        if (!userId || !deviceInfo) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, deviceInfo'
            });
        }

        const syncResult = await mobileContentCoordinator.syncMobileContent(
            userId,
            deviceInfo,
            lastSync ? new Date(lastSync) : new Date(0)
        );

        res.json({
            success: true,
            data: syncResult
        });

    } catch (error: any) {
        logger.error('Failed to sync mobile content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get mobile app configuration
 * GET /api/portal-mobile/mobile/config
 */
router.get('/mobile/config', async (req: Request, res: Response) => {
    try {
        const { platform, appVersion } = req.query;

        if (!platform || !appVersion) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: platform, appVersion'
            });
        }

        const config = await mobileContentCoordinator.getMobileAppConfig(
            platform as string,
            appVersion as string
        );

        res.json({
            success: true,
            data: config
        });

    } catch (error: any) {
        logger.error('Failed to get mobile app config', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Synchronize content globally
 * POST /api/portal-mobile/distribution/sync
 */
router.post('/distribution/sync', async (req: Request, res: Response) => {
    try {
        const { contentId, sourceRegion, targetRegions, priority, immediate } = req.body;

        if (!contentId || !targetRegions || !Array.isArray(targetRegions)) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: contentId, targetRegions (array)'
            });
        }

        const operation = await globalDistributionCoordinator.synchronizeContent({
            contentId,
            sourceRegion: sourceRegion || 'primary',
            targetRegions,
            priority: priority || 1,
            immediate: immediate || false
        });

        res.json({
            success: true,
            data: operation
        });

    } catch (error: any) {
        logger.error('Failed to synchronize content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get global sync status
 * GET /api/portal-mobile/distribution/status
 */
router.get('/distribution/status', async (req: Request, res: Response) => {
    try {
        const status = await globalDistributionCoordinator.getGlobalSyncStatus();

        res.json({
            success: true,
            data: status
        });

    } catch (error: any) {
        logger.error('Failed to get global sync status', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Store offline content
 * POST /api/portal-mobile/offline/store
 */
router.post('/offline/store', async (req: Request, res: Response) => {
    try {
        const { userId, contentId, data } = req.body;

        if (!userId || !contentId || !data) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, contentId, data'
            });
        }

        const stored = await offlineStorageService.storeOfflineContent(userId, contentId, data);

        res.json({
            success: stored,
            message: stored ? 'Content stored for offline access' : 'Failed to store content'
        });

    } catch (error: any) {
        logger.error('Failed to store offline content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get offline content
 * GET /api/portal-mobile/offline/content/:userId/:contentId
 */
router.get('/offline/content/:userId/:contentId', async (req: Request, res: Response) => {
    try {
        const { userId, contentId } = req.params;

        const content = await offlineStorageService.getOfflineContent(userId, contentId);

        if (!content) {
            return res.status(404).json({
                success: false,
                error: 'Offline content not found'
            });
        }

        res.json({
            success: true,
            data: content
        });

    } catch (error: any) {
        logger.error('Failed to get offline content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * List offline content
 * GET /api/portal-mobile/offline/list/:userId
 */
router.get('/offline/list/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const contents = await offlineStorageService.listOfflineContent(userId);

        res.json({
            success: true,
            data: contents
        });

    } catch (error: any) {
        logger.error('Failed to list offline content', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get storage quota
 * GET /api/portal-mobile/offline/quota/:userId
 */
router.get('/offline/quota/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const quota = await offlineStorageService.getStorageQuota(userId);

        res.json({
            success: true,
            data: quota
        });

    } catch (error: any) {
        logger.error('Failed to get storage quota', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Sync offline changes
 * POST /api/portal-mobile/offline/sync/:userId
 */
router.post('/offline/sync/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const results = await offlineStorageService.syncOfflineChanges(userId);

        res.json({
            success: true,
            data: results
        });

    } catch (error: any) {
        logger.error('Failed to sync offline changes', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get cross-platform dashboard
 * GET /api/portal-mobile/dashboard/:userId
 */
router.get('/dashboard/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { platform } = req.query;

        const dashboard = await portalMobileIntegrationService.getCrossPlatformDashboard(
            userId,
            platform as string || 'web'
        );

        res.json({
            success: true,
            data: dashboard
        });

    } catch (error: any) {
        logger.error('Failed to get cross-platform dashboard', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Get integration health
 * GET /api/portal-mobile/health
 */
router.get('/health', async (req: Request, res: Response) => {
    try {
        const health = await portalMobileIntegrationService.getIntegrationHealth();

        res.json({
            success: true,
            data: health
        });

    } catch (error: any) {
        logger.error('Failed to get integration health', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
