const { db } = require('../src/db/database.js');
const { v4: uuidv4 } = require('uuid');

function seedDatabase() {
    console.log('Seeding database...');

    try {
        // Create funders
        const cabhiId = uuidv4();
        const envisageId = uuidv4();
        const canHealthId = uuidv4();

        db.prepare('INSERT INTO funders (id, name, code, benefit_coverage_rate, expiry_date) VALUES (?, ?, ?, ?, ?)').run(cabhiId, 'CABHI', 'CABHI', 20, '2025-03-31');
        db.prepare('INSERT INTO funders (id, name, code, benefit_coverage_rate, expiry_date) VALUES (?, ?, ?, ?, ?)').run(envisageId, 'envisAGE', 'ENVISAGE', 15, '2025-06-30');
        db.prepare('INSERT INTO funders (id, name, code, benefit_coverage_rate) VALUES (?, ?, ?, ?)').run(canHealthId, 'CAN Health', 'CANHEALTH', 25);

        // Create team members
        const member1Id = uuidv4();
        const member2Id = uuidv4();
        db.prepare("INSERT INTO team_members (id, employee_code, role, org_group, start_date) VALUES (?, ?, ?, ?, ?)").run(member1Id, 'EMP001', 'Developer', 'BH-Innovation', '2024-01-01');
        db.prepare("INSERT INTO team_members (id, employee_code, role, org_group, start_date) VALUES (?, ?, ?, ?, ?)").run(member2Id, 'EMP002', 'Project Manager', 'BH', '2024-01-01');

        // Create projects
        const projectAId = uuidv4();
        const projectBId = uuidv4();
        db.prepare("INSERT INTO projects (id, name, code, funder_id, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)").run(projectAId, 'Project A', 'PROJA', cabhiId, 'active', '2024-04-01', '2025-03-31');
        db.prepare("INSERT INTO projects (id, name, code, funder_id, status, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)").run(projectBId, 'Project B', 'PROJB', envisageId, 'active', '2024-04-01', '2025-03-31');
        
        // Create Pay Rates
        db.prepare("INSERT INTO pay_rates (id, team_member_id, fiscal_year, quarter, hourly_rate, benefit_rate, effective_date) VALUES (?, ?, ?, ?, ?, ?, ?)").run(uuidv4(), member1Id, '2025-26', 3, 50, 0.2, '2025-10-01');
        db.prepare("INSERT INTO pay_rates (id, team_member_id, fiscal_year, quarter, hourly_rate, benefit_rate, effective_date) VALUES (?, ?, ?, ?, ?, ?, ?)").run(uuidv4(), member2Id, '2025-26', 3, 60, 0.2, '2025-10-01');
        
        // Create Allocations
        db.prepare("INSERT INTO allocations (id, team_member_id, project_id, fiscal_year, quarter, planned_hours) VALUES (?, ?, ?, ?, ?, ?)").run(uuidv4(), member1Id, projectAId, '2025-26', 3, 100);
        db.prepare("INSERT INTO allocations (id, team_member_id, project_id, fiscal_year, quarter, planned_hours) VALUES (?, ?, ?, ?, ?, ?)").run(uuidv4(), member2Id, projectAId, '2025-26', 3, 50);
        db.prepare("INSERT INTO allocations (id, team_member_id, project_id, fiscal_year, quarter, planned_hours) VALUES (?, ?, ?, ?, ?, ?)").run(uuidv4(), member1Id, projectBId, '2025-26', 3, 200);

        // Create Actual Hours
        db.prepare("INSERT INTO actual_hours (id, team_member_id, project_id, fiscal_year, quarter, month, hours) VALUES (?, ?, ?, ?, ?, ?, ?)").run(uuidv4(), member1Id, projectAId, '2025-26', 3, 10, 30);
        db.prepare("INSERT INTO actual_hours (id, team_member_id, project_id, fiscal_year, quarter, month, hours) VALUES (?, ?, ?, ?, ?, ?, ?)").run(uuidv4(), member2Id, projectAId, '2025-26', 3, 10, 20);
        db.prepare("INSERT INTO actual_hours (id, team_member_id, project_id, fiscal_year, quarter, month, hours) VALUES (?, ?, ?, ?, ?, ?, ?)").run(uuidv4(), member1Id, projectBId, '2025-26', 3, 10, 80);

        console.log('Database seeded successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase();