import axios from 'axios';
import middleware from './_common/middleware.js';

const checkPath = async (baseUrl, path) => {
  try {
    const response = await axios.get(`${baseUrl}${path}`, {
      validateStatus: () => true,
      timeout: 5000,
    });
    return {
      path,
      status: response.status,
      size: response.headers['content-length'],
      contentType: response.headers['content-type'],
      exposed: response.status === 200 && !response.data.toString().includes('<!DOCTYPE html'), // Simple check to see if it's a file download or raw text, not a 404 page disguised as 200
    };
  } catch (error) {
    return { path, status: 'Error', error: error.message };
  }
};

const cmsDiagnosticsHandler = async (url) => {
  const results = {
    cms: 'Unknown',
    exposedFiles: [],
    errorsFound: [],
    debugMode: false,
  };

  // 1. Basic CMS Detection & Error Scanning
  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
      timeout: 10000,
    });
    
    const body = response.data.toString().toLowerCase();

    // CMS Detection (Simple)
    if (body.includes('wp-content') || body.includes('wp-includes')) {
      results.cms = 'WordPress';
    } else if (body.includes('joomla')) {
      results.cms = 'Joomla';
    } else if (body.includes('drupal')) {
      results.cms = 'Drupal';
    } else if (body.includes('shopify')) {
      results.cms = 'Shopify';
    }

    // Common Error Strings
    if (body.includes('error establishing a database connection')) {
      results.errorsFound.push('WordPress Database Connection Error');
    }
    if (body.includes('there has been a critical error on this website')) {
      results.errorsFound.push('WordPress Critical Error');
    }
    if (body.includes('fatal error:')) {
      results.errorsFound.push('PHP Fatal Error exposed');
    }
    if (body.includes('syntax error')) {
      results.errorsFound.push('PHP Syntax Error exposed');
    }

  } catch (error) {
    results.errorsFound.push(`Main site unreachable: ${error.message}`);
  }

  // 2. Check for Exposed Files based on CMS
  const baseUrl = url.replace(/\/$/, ''); // Remove trailing slash
  const checks = [];

  // Generic Checks
  checks.push(checkPath(baseUrl, '/.env'));
  checks.push(checkPath(baseUrl, '/error_log'));

  // CMS Specific Checks
  if (results.cms === 'WordPress' || results.cms === 'Unknown') {
    checks.push(checkPath(baseUrl, '/wp-config.php.bak'));
    checks.push(checkPath(baseUrl, '/wp-config.php.save'));
    checks.push(checkPath(baseUrl, '/wp-content/debug.log'));
    checks.push(checkPath(baseUrl, '/debug.log'));
  }

  const checkResults = await Promise.all(checks);

  checkResults.forEach(check => {
    if (check.exposed) {
      results.exposedFiles.push(check.path);
      if (check.path.includes('debug.log') || check.path.includes('error_log')) {
        results.debugMode = true;
      }
    }
  });

  return results;
};

export const handler = middleware(cmsDiagnosticsHandler);
export default handler;
