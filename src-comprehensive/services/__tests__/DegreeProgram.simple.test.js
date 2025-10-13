/**
 * Simple test to verify Degree Program Architecture implementation
 */

const { DegreeTemplateService } = require('../DegreeTemplateService');

describe('Degree Program Simple Test', () => {
  test('should create degree template service', () => {
    const service = new DegreeTemplateService();
    expect(service).toBeDefined();
  });

  test('should get all degree templates', () => {
    const service = new DegreeTemplateService();
    const templates = service.getAllDegreeTemplates();
    
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBe(4);
  });

  test('should get specific degree template', () => {
    const service = new DegreeTemplateService();
    const template = service.getDegreeTemplate('BA_PROPHETIC_GOVERNANCE');
    
    expect(template).toBeDefined();
    expect(template.title).toBe('Bachelor of Arts in Prophetic Governance');
    expect(template.totalCredits).toBe(120);
  });
});