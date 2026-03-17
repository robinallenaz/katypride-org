#!/usr/bin/env node

/**
 * Script to get the API token from the deployed Strapi instance
 * Run this after updating the NEXT_PUBLIC_STRAPI_URL to the production URL
 */

const https = require('https');

async function getStrapiToken() {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://katypride-strapi.onrender.com';
  
  console.log(`Connecting to Strapi at: ${strapiUrl}`);
  
  try {
    // Try to get the admin user to get the token
    const response = await https(`${strapiUrl}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('No admin users found. Please create an admin user in Strapi first.');
    }
    
    const adminUser = data[0];
    console.log(`Found admin user: ${adminUser.email}`);
    console.log(`User ID: ${adminUser.id}`);
    
    // Get the user's API token
    const tokenResponse = await https(`${strapiUrl}/api/admin/users/${adminUser.id}/personal-access-tokens`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`HTTP ${tokenResponse.status}: ${tokenResponse.statusText}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.length === 0) {
      throw new Error('No access tokens found. Please generate an access token in Strapi admin panel.');
    }
    
    const token = tokenData[0];
    console.log(`Generated API token: ${token.accessKey}`);
    console.log('\nAdd this to your .env.local file:');
    console.log(`STRAPI_API_TOKEN="${token.accessKey}"`);
    console.log('\nThen restart your development server.');
    
  } catch (error) {
    console.error('Error getting Strapi token:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure the Strapi backend is deployed and running');
    console.log('2. Check that NEXT_PUBLIC_STRAPI_URL is correct');
    console.log('3. Ensure there are admin users in the Strapi database');
    console.log('4. Generate an API token in the Strapi admin panel');
    console.log('\nStrapi Admin URL: https://katypride-strapi.onrender.com/admin');
  }
}

getStrapiToken();
