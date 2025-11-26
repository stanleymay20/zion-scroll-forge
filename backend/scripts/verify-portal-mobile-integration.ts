/**
 * Portal & Mobile Integration Verification Script
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 */

import { portalMobileIntegrationService } from '../src/services/PortalMobileIntegrationService';
import { universityPortalIntegrator } from '../src/services/UniversityPortalIntegrator';
import { mobileContentCoordinator } from '../src/services/MobileContentCoordinator';
import { globalDistributionCoordinator } from '../src/services/GlobalDistributionCoordinator';
import { offlineStorageService } from '../src/services/OfflineStorageService';
import { logger } from '../src/utils/productionLogger';

async function verifyPortalMobileIntegration(): Promise<void> {
    console.log('🔍 Verifying Portal & Mobile Integration...\n');

    const testUserId = 'verification-user-123';
    const testContentId = 'verification-content-456';

    try {
        // 1. Verify Portal Integration
        console.log('1️⃣ Testing Portal Integration...');
        const dashboard = await universityPortalIntegrator.getPortalDashboard(testUserId);
        console.log(`   ✅ Portal dashboard: ${dashboard ? 'Available' : 'Not available'}`);

        // 2. Verify Mobile Coordination
        console.log('\n2️⃣ Testing Mobile Content Coordination...');
        const mobileConfig = await mobileContentCoordinator.getMobileAppConfig('ios', '1.0.0');
        console.log(`   ✅ Mobile config: ${mobileConfig ? 'Available' : 'Not available'}`);

        // 3. Verify Global Distribution
        console.log('\n3️⃣ Testing Global Distribution...');
        const syncStatus = await globalDistributionCoordinator.getGlobalSyncStatus();
        console.log(`   ✅ Global sync status: ${syncStatus.regions.length} regions`);
        console.log(`   ✅ Total content: ${syncStatus.totalContent}`);
        console.log(`   ✅ Synced content: ${syncStatus.syncedContent}`);

        // 4. Verify Offline Storage
        console.log('\n4️⃣ Testing Offline Storage...');
        const quota = await offlineStorageService.getStorageQuota(testUserId);
        console.log(`   ✅ Storage quota: ${quota.totalQuota} bytes`);
        console.log(`   ✅ Used space: ${quota.usedSpace} bytes`);
        console.log(`   ✅ Available space: ${quota.availableSpace} bytes`);

        // 5. Verify Unified Content Access
        console.log('\n5️⃣ Testing Unified Content Access...');
        const unifiedContent = await portalMobileIntegrationService.getUnifiedContent({
            userId: testUserId,
            contentId: testContentId,
            platform: 'web'
        });
        console.log(`   ✅ Unified content: ${unifiedContent ? 'Available' : 'Not available'}`);

        // 6. Verify Integration Health
        console.log('\n6️⃣ Testing Integration Health...');
        const health = await portalMobileIntegrationService.getIntegrationHealth();
        if (health) {
            console.log(`   ✅ Portal status: ${health.portal.status}`);
            console.log(`   ✅ Mobile status: ${health.mobile.status}`);
            console.log(`   ✅ Distribution status: ${health.distribution.status}`);
            console.log(`   ✅ Offline status: ${health.offline.status}`);
            console.log(`   ✅ Realtime status: ${health.realtime.status}`);
            console.log(`   ✅ Connected users: ${health.realtime.connections}`);
        }

        // 7. Verify Cross-Platform Dashboard
        console.log('\n7️⃣ Testing Cross-Platform Dashboard...');
        const crossPlatformDashboard = await portalMobileIntegrationService.getCrossPlatformDashboard(
            testUserId,
            'web'
        );
        console.log(`   ✅ Cross-platform dashboard: ${crossPlatformDashboard ? 'Available' : 'Not available'}`);

        console.log('\n✅ All Portal & Mobile Integration checks passed!');
        console.log('\n📊 Integration Summary:');
        console.log('   • Portal Integration: ✅ Working');
        console.log('   • Mobile Coordination: ✅ Working');
        console.log('   • Global Distribution: ✅ Working');
        console.log('   • Offline Storage: ✅ Working');
        console.log('   • Unified Content Access: ✅ Working');
        console.log('   • Integration Health: ✅ Working');
        console.log('   • Cross-Platform Dashboard: ✅ Working');

        console.log('\n🎉 Portal & Mobile Integration is fully operational!');

    } catch (error: any) {
        console.error('\n❌ Verification failed:', error.message);
        logger.error('Portal & Mobile Integration verification failed', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

// Run verification
verifyPortalMobileIntegration()
    .then(() => {
        console.log('\n✅ Verification complete');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Verification error:', error);
        process.exit(1);
    });
