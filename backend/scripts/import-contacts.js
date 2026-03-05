// CSV Import Script for GrowthSphere360 Contacts
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const API_URL = 'http://localhost:1337/api';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

class ContactImporter {
  constructor() {
    this.apiKey = GHL_API_KEY;
    this.locationId = GHL_LOCATION_ID;
    this.baseUrl = 'https://rest.gohighlevel.com/v1';
    this.importResults = {
      total: 0,
      successful: 0,
      failed: 0,
      errors: [],
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Version': '2021-04-15',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`GHL API Error: ${response.status} - ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GrowthSphere360 API Error:', error);
      throw error;
    }
  }

  parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const contacts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const contact = {};
        headers.forEach((header, index) => {
          contact[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });
        contacts.push(contact);
      }
    }

    return contacts;
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  async createContact(contactData) {
    try {
      // Map CSV fields to GHL contact fields
      const ghlContact = {
        name: contactData.name || `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim(),
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.organization || contactData.company,
        address: {
          street: contactData.address || contactData.street,
          city: contactData.city,
          state: contactData.state,
          postalCode: contactData.zipCode || contactData.postalCode,
          country: contactData.country || 'US',
        },
        tags: this.parseTags(contactData.tags || contactData.interests),
        customFields: {
          source: 'CSV Import',
          importDate: new Date().toISOString(),
          // Add any custom fields from your CSV
          ...(contactData.pronouns && { pronouns: contactData.pronouns }),
          ...(contactData.availability && { availability: contactData.availability }),
          ...(contactData.interests && { interests: contactData.interests }),
          ...(contactData.memberType && { member_type: contactData.memberType }),
        },
      };

      // Remove empty fields
      this.removeEmptyFields(ghlContact);

      const response = await this.makeRequest('/contacts/', {
        method: 'POST',
        body: JSON.stringify({
          ...ghlContact,
          locationId: this.locationId,
        }),
      });

      this.importResults.successful++;
      console.log(`✅ Created contact: ${ghlContact.name} (${ghlContact.email})`);
      return response;

    } catch (error) {
      this.importResults.failed++;
      this.importResults.errors.push({
        contact: contactData.email || contactData.name,
        error: error.message,
      });
      console.error(`❌ Failed to create contact: ${contactData.email || contactData.name}`, error.message);
    }
  }

  parseTags(tagsString) {
    if (!tagsString) return [];
    
    // Handle different tag formats
    const tags = tagsString
      .split(/[,;|]/) // Split by comma, semicolon, or pipe
      .map(tag => tag.trim().replace(/["']/g, ''))
      .filter(tag => tag.length > 0);
    
    return tags;
  }

  removeEmptyFields(obj) {
    Object.keys(obj).forEach(key => {
      if (obj[key] === null || obj[key] === undefined || obj[key] === '') {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        this.removeEmptyFields(obj[key]);
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        }
      }
    });
  }

  async importFromCSV(filePath) {
    try {
      console.log(`📁 Reading CSV file: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`CSV file not found: ${filePath}`);
      }

      const csvContent = fs.readFileSync(filePath, 'utf8');
      const contacts = this.parseCSV(csvContent);
      
      this.importResults.total = contacts.length;
      console.log(`📊 Found ${contacts.length} contacts to import`);

      // Process contacts in batches to avoid rate limiting
      const batchSize = 10;
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)}`);
        
        // Add delay between batches to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await Promise.all(batch.map(contact => this.createContact(contact)));
      }

      console.log('\n🎉 Import completed!');
      this.printResults();

    } catch (error) {
      console.error('❌ Import failed:', error.message);
      throw error;
    }
  }

  printResults() {
    console.log('\n📈 Import Results:');
    console.log(`Total contacts: ${this.importResults.total}`);
    console.log(`Successful: ${this.importResults.successful}`);
    console.log(`Failed: ${this.importResults.failed}`);
    
    if (this.importResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.importResults.errors.forEach(error => {
        console.log(`  - ${error.contact}: ${error.error}`);
      });
    }

    const successRate = ((this.importResults.successful / this.importResults.total) * 100).toFixed(1);
    console.log(`\n✅ Success rate: ${successRate}%`);
  }

  async createSampleCSV() {
    const sampleCSV = `name,email,phone,city,state,zipCode,tags,pronouns,memberType,interests
"John Doe","john.doe@example.com","555-0123","Katy","TX","77494","volunteer,ally","he/him","volunteer","Event Planning,Youth Programs"
"Jane Smith","jane.smith@example.com","555-0124","Houston","TX","77002","donor,community-member","she/her","donor",""
"Alex Johnson","alex.johnson@example.com","555-0125","Sugar Land","TX","77478","community-member,youth","they/them","community-member","Youth Support,Education"
"Maria Garcia","maria.garcia@example.com","555-0126","Cypress","TX","77429","volunteer,parent","she/her","volunteer","Community Outreach,Parent Resources"
"Sam Wilson","sam.wilson@example.com","555-0127","Richmond","TX","77406","donor,ally","he/him","donor",""`;

    const samplePath = path.join(__dirname, 'sample-contacts.csv');
    fs.writeFileSync(samplePath, sampleCSV);
    console.log(`📄 Sample CSV created at: ${samplePath}`);
    console.log('\nYou can edit this file with your actual contact data and then run:');
    console.log('node import-contacts.js path/to/your/contacts.csv');
  }
}

// CLI usage
async function main() {
  const importer = new ContactImporter();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🚀 GrowthSphere360 Contact Importer\n');
    console.log('Usage:');
    console.log('  node import-contacts.js <path-to-csv-file>');
    console.log('  node import-contacts.js --create-sample\n');
    console.log('Examples:');
    console.log('  node import-contacts.js ./contacts.csv');
    console.log('  node import-contacts.js --create-sample\n');
    
    // Create sample CSV
    await importer.createSampleCSV();
    return;
  }

  if (args[0] === '--create-sample') {
    await importer.createSampleCSV();
    return;
  }

  const csvPath = args[0];
  
  if (!csvPath.endsWith('.csv')) {
    console.error('❌ Please provide a CSV file');
    process.exit(1);
  }

  try {
    await importer.importFromCSV(csvPath);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = ContactImporter;
