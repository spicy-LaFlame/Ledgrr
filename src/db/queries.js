const { db } = require('./database.js');

function getDashboardMetrics(fiscalYear, quarter) {
    const budgetSummaryStmt = db.prepare(`
        SELECT
            SUM(planned_salary) as totalBudget,
            SUM(funded_benefits) as totalFundedBenefits
        FROM v_budget_summary
        WHERE fiscal_year = ? AND quarter = ?
    `);

    const actualsStmt = db.prepare(`
        SELECT
            SUM(actual_salary) as totalSpent
        FROM v_actual_vs_budget
        WHERE fiscal_year = ? AND quarter = ?
    `);

    const projectCountStmt = db.prepare(`
        SELECT status, COUNT(*) as count
        FROM projects
        WHERE status IN ('active', 'pipeline')
        GROUP BY status
    `);

    const budget = budgetSummaryStmt.get(fiscalYear, quarter) || { totalBudget: 0, totalFundedBenefits: 0 };
    const actuals = actualsStmt.get(fiscalYear, quarter) || { totalSpent: 0 };
    console.log('Budget:', budget);
    console.log('Actuals:', actuals);
    const projectCounts = projectCountStmt.all();

    const totalBudget = (budget.totalBudget || 0) + (budget.totalFundedBenefits || 0);
    const totalSpent = actuals.totalSpent || 0;
    const totalRemaining = totalBudget - totalSpent;
    const spendingPace = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const activeProjects = projectCounts.find(p => p.status === 'active')?.count || 0;
    const pipelineProjects = projectCounts.find(p => p.status === 'pipeline')?.count || 0;

    // These are just placeholders for now, we will implement them later
    const alerts = [];

    const metrics = {
        totalBudget,
        totalSpent,
        totalRemaining,
        spendingPace,
        activeProjects,
        pipelineProjects,
        alerts,
    };
    console.log('Metrics:', metrics);
    return metrics;
}

function getProjectSpending(fiscalYear, quarter) {
    const stmt = db.prepare(`
        SELECT
            p.name,
            SUM(a.planned_hours * pr.hourly_rate) as planned,
            SUM(ah.hours * pr.hourly_rate) as actual
        FROM projects p
        LEFT JOIN allocations a ON p.id = a.project_id
        LEFT JOIN actual_hours ah ON p.id = ah.project_id AND a.team_member_id = ah.team_member_id AND a.fiscal_year = ah.fiscal_year AND a.quarter = ah.quarter
        LEFT JOIN pay_rates pr ON a.team_member_id = pr.team_member_id AND a.fiscal_year = pr.fiscal_year AND a.quarter = pr.quarter
        WHERE a.fiscal_year = ? AND a.quarter = ?
        GROUP BY p.name
    `);
    return stmt.all(fiscalYear, quarter);
}

function getOrgBreakdown(fiscalYear, quarter) {
    const stmt = db.prepare(`
        SELECT
            tm.org_group as name,
            SUM(ah.hours * pr.hourly_rate) as value
        FROM actual_hours ah
        JOIN team_members tm ON ah.team_member_id = tm.id
        JOIN pay_rates pr ON ah.team_member_id = pr.team_member_id AND ah.fiscal_year = pr.fiscal_year AND ah.quarter = pr.quarter
        WHERE ah.fiscal_year = ? AND ah.quarter = ?
        GROUP BY tm.org_group
    `);
    const results = stmt.all(fiscalYear, quarter);
    const colorMapping = {
        'BH-Innovation': '#3B82F6',
        'BH': '#10B981',
        'BHRI': '#F59E0B',
    };
    return results.map(row => ({ ...row, color: colorMapping[row.name] }));
}

function getFundingExpiryStatus() {
    const stmt = db.prepare(`SELECT * FROM v_funding_expiry`);
    return stmt.all();
}

function getProjects() {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    return stmt.all();
}

module.exports = {
    getDashboardMetrics,
    getProjectSpending,
    getOrgBreakdown,
    getFundingExpiryStatus,
    getProjects,
};
