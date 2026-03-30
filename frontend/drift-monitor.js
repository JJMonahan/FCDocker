/**
 * PactFlow Drift Detection for Full Contact API
 * Monitors API changes and generates drift reports
 * Works with existing Pact contract testing workflow
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DriftMonitor {
  constructor() {
    this.configPath = './drift-config.yaml';
    this.reportsDir = './drift-reports';
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
  }

  /**
   * Initialize drift monitoring setup
   */
  async initialize() {
    console.log('🔧 Initializing PactFlow Drift Monitor...');
    
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    // Check if drift CLI is available
    try {
      execSync('npx drift --version', { stdio: 'pipe' });
      console.log('✅ PactFlow Drift CLI is available');
      return true;
    } catch (error) {
      console.warn('⚠️  PactFlow Drift CLI not installed');
      console.log('Install with: npm install @pactflow/drift --save-dev');
      return false;
    }
  }

  /**
   * Capture current API state as baseline
   */
  async captureBaseline() {
    console.log('📸 Capturing API baseline...');
    
    try {
      // Fetch OpenAPI spec from Django backend
      const response = await fetch(`${this.baseUrl}/schema/`);
      const openApiSpec = await response.json();
      
      // Save as baseline
      const baselinePath = path.join(this.reportsDir, 'baseline-openapi.json');
      fs.writeFileSync(baselinePath, JSON.stringify(openApiSpec, null, 2));
      
      console.log(`✅ Baseline saved to ${baselinePath}`);
      return baselinePath;
    } catch (error) {
      console.error('❌ Failed to capture baseline:', error.message);
      throw error;
    }
  }

  /**
   * Detect drift against baseline
   */
  async detectDrift() {
    console.log('🔍 Detecting API drift...');
    
    try {
      // Use drift CLI if available
      const command = `npx drift detect --config ${this.configPath}`;
      const result = execSync(command, { encoding: 'utf8' });
      
      console.log('Drift detection completed');
      return result;
    } catch (error) {
      console.warn('⚠️  Using fallback drift detection');
      return await this.fallbackDriftDetection();
    }
  }

  /**
   * Fallback drift detection without CLI
   */
  async fallbackDriftDetection() {
    console.log('🔄 Running fallback drift detection...');
    
    const baselinePath = path.join(this.reportsDir, 'baseline-openapi.json');
    
    if (!fs.existsSync(baselinePath)) {
      console.log('No baseline found, capturing current state as baseline');
      return await this.captureBaseline();
    }

    try {
      // Get current API spec
      const response = await fetch(`${this.baseUrl}/schema/`);
      const currentSpec = await response.json();
      
      // Load baseline
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      
      // Simple drift comparison
      const driftReport = this.compareSpecs(baseline, currentSpec);
      
      // Save drift report
      const reportPath = path.join(this.reportsDir, `drift-report-${Date.now()}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(driftReport, null, 2));
      
      console.log(`📊 Drift report saved to ${reportPath}`);
      
      if (driftReport.changes.length > 0) {
        console.log(`⚠️  Detected ${driftReport.changes.length} changes`);
        driftReport.changes.forEach(change => {
          console.log(`  - ${change.type}: ${change.path} - ${change.description}`);
        });
      } else {
        console.log('✅ No API drift detected');
      }
      
      return driftReport;
    } catch (error) {
      console.error('❌ Drift detection failed:', error.message);
      throw error;
    }
  }

  /**
   * Simple spec comparison for fallback
   */
  compareSpecs(baseline, current) {
    const changes = [];
    
    // Compare paths
    const baselinePaths = Object.keys(baseline.paths || {});
    const currentPaths = Object.keys(current.paths || {});
    
    // New endpoints
    currentPaths.filter(path => !baselinePaths.includes(path))
      .forEach(path => {
        changes.push({
          type: 'endpoint_added',
          path: path,
          description: `New endpoint added: ${path}`
        });
      });
    
    // Removed endpoints  
    baselinePaths.filter(path => !currentPaths.includes(path))
      .forEach(path => {
        changes.push({
          type: 'endpoint_removed', 
          path: path,
          description: `Endpoint removed: ${path}`
        });
      });

    // Version changes
    if (baseline.info?.version !== current.info?.version) {
      changes.push({
        type: 'version_change',
        path: 'info.version',
        description: `API version changed from ${baseline.info?.version} to ${current.info?.version}`
      });
    }

    return {
      timestamp: new Date().toISOString(),
      baseline_version: baseline.info?.version,
      current_version: current.info?.version,
      changes: changes,
      summary: {
        total_changes: changes.length,
        breaking_changes: changes.filter(c => c.type === 'endpoint_removed').length,
        new_features: changes.filter(c => c.type === 'endpoint_added').length
      }
    };
  }

  /**
   * Generate drift report for integration with Pact workflow
   */
  async generatePactIntegratedReport() {
    console.log('📋 Generating Pact-integrated drift report...');
    
    const driftResult = await this.detectDrift();
    
    // Integrate with existing Pact data if available
    const pactDir = './pacts';
    const isPactAvailable = fs.existsSync(pactDir);
    
    const integratedReport = {
      drift: driftResult,
      pact_integration: {
        available: isPactAvailable,
        message: isPactAvailable 
          ? 'Drift monitoring complements Pact contract testing' 
          : 'Consider adding Pact contracts for comprehensive API testing'
      },
      recommendations: this.generateRecommendations(driftResult)
    };

    const reportPath = path.join(this.reportsDir, 'integrated-drift-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(integratedReport, null, 2));
    
    console.log(`📄 Integrated report saved to ${reportPath}`);
    return integratedReport;
  }

  /**
   * Generate recommendations based on drift results
   */
  generateRecommendations(driftResult) {
    const recommendations = [];
    
    if (!driftResult.changes || driftResult.changes.length === 0) {
      recommendations.push('✅ No drift detected. API is stable.');
      return recommendations;
    }

    const breakingChanges = driftResult.changes?.filter(c => c.type === 'endpoint_removed').length || 0;
    const newFeatures = driftResult.changes?.filter(c => c.type === 'endpoint_added').length || 0;

    if (breakingChanges > 0) {
      recommendations.push('⚠️  Breaking changes detected. Update consumer contracts.');
      recommendations.push('🔄 Run Pact verification to ensure compatibility.');
    }

    if (newFeatures > 0) {
      recommendations.push('✨ New endpoints available. Consider extending consumer contracts.');
      recommendations.push('📝 Update API documentation for new features.');
    }

    recommendations.push('🔍 Review drift report details for comprehensive analysis.');
    
    return recommendations;
  }
}

// CLI interface
async function main() {
  const monitor = new DriftMonitor();
  
  const command = process.argv[2] || 'detect';
  
  try {
    await monitor.initialize();
    
    switch (command) {
      case 'baseline':
        await monitor.captureBaseline();
        break;
      case 'detect':
        await monitor.detectDrift();
        break;
      case 'report':
        await monitor.generatePactIntegratedReport();
        break;
      default:
        console.log('Usage: node drift-monitor.js [baseline|detect|report]');
    }
  } catch (error) {
    console.error('❌ Drift monitoring failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DriftMonitor;