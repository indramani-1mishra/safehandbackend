const fs = require('fs');
const path = require('path');

const filesToMerge = [
  'swagger.json',
  'attendance_swagger.json',
  'jobCardsSwagger.json',
  'payments_swagger.json',
  'worker_swagger_postman.json',
  'worker_auth_swagger_postman.json',
  'safehand_ultimate_swagger.json',
  'worker_payout_swagger.json'
];

const master = {
  openapi: "3.0.0",
  info: {
    title: "SafeHand Comprehensive API Documentation",
    version: "1.0.0",
    description: "Unified API documentation for SafeHand Backend."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local Development Server"
    }
  ],
  tags: [],
  components: {
    securitySchemes: {},
    schemas: {}
  },
  paths: {}
};

filesToMerge.forEach(file => {
  const filePath = path.join(__dirname, '..', '..', file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Merge Tags
    if (data.tags) {
      data.tags.forEach(tag => {
        if (!master.tags.find(t => t.name === tag.name)) {
          master.tags.push(tag);
        }
      });
    }

    // Merge Components
    if (data.components) {
      if (data.components.securitySchemes) {
        Object.assign(master.components.securitySchemes, data.components.securitySchemes);
      }
      if (data.components.schemas) {
        Object.assign(master.components.schemas, data.components.schemas);
      }
    }

    // Merge Paths
    if (data.paths) {
      Object.keys(data.paths).forEach(p => {
        let newPath = p;
        // Normalize paths from swagger.json which are missing /api
        if (file === 'swagger.json') {
           if (newPath.startsWith('/admins')) newPath = '/api' + newPath;
           if (newPath.startsWith('/services')) newPath = '/api' + newPath;
           if (newPath.startsWith('/enqueries')) newPath = '/api' + newPath;
        }
        
        if (!master.paths[newPath]) {
          master.paths[newPath] = data.paths[p];
        } else {
          // Merge methods if path exists
          Object.assign(master.paths[newPath], data.paths[p]);
        }
      });
    }
  }
});

fs.writeFileSync(path.join(__dirname, 'master_swagger.json'), JSON.stringify(master, null, 2));
console.log('Master Swagger JSON generated successfully!');
