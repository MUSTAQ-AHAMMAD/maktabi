"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const hash = async (p) => bcrypt.hash(p, 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@maktabi.com' },
        update: {},
        create: { email: 'admin@maktabi.com', password: await hash('Admin@123'), firstName: 'System', lastName: 'Admin', role: 'ADMIN' },
    });
    await prisma.user.upsert({
        where: { email: 'ceo@maktabi.com' },
        update: {},
        create: { email: 'ceo@maktabi.com', password: await hash('Ceo@123'), firstName: 'Ahmed', lastName: 'Al-Rashid', role: 'CEO' },
    });
    await prisma.user.upsert({
        where: { email: 'legal.manager@maktabi.com' },
        update: {},
        create: { email: 'legal.manager@maktabi.com', password: await hash('Legal@123'), firstName: 'Sara', lastName: 'Al-Mansouri', role: 'LEGAL_MANAGER', department: 'Legal' },
    });
    const lawyer = await prisma.user.upsert({
        where: { email: 'lawyer@maktabi.com' },
        update: {},
        create: { email: 'lawyer@maktabi.com', password: await hash('Lawyer@123'), firstName: 'Khalid', lastName: 'Al-Ghamdi', role: 'INTERNAL_LAWYER', department: 'Legal' },
    });
    await prisma.user.upsert({
        where: { email: 'hr@maktabi.com' },
        update: {},
        create: { email: 'hr@maktabi.com', password: await hash('Hr@123'), firstName: 'Fatima', lastName: 'Al-Zahra', role: 'HR', department: 'HR' },
    });
    await prisma.user.upsert({
        where: { email: 'finance@maktabi.com' },
        update: {},
        create: { email: 'finance@maktabi.com', password: await hash('Finance@123'), firstName: 'Omar', lastName: 'Al-Farouq', role: 'FINANCE', department: 'Finance' },
    });
    await prisma.user.upsert({
        where: { email: 'employee@maktabi.com' },
        update: {},
        create: { email: 'employee@maktabi.com', password: await hash('Employee@123'), firstName: 'Maryam', lastName: 'Al-Hassan', role: 'EMPLOYEE', department: 'Operations' },
    });
    const case1 = await prisma.litigationCase.upsert({
        where: { caseNumber: 'LIT-2024-001' },
        update: {},
        create: {
            caseNumber: 'LIT-2024-001',
            caseType: 'Commercial Dispute',
            courtName: 'Riyadh Commercial Court',
            parties: 'Maktabi Corp vs Al-Noor Trading',
            description: 'Breach of contract claim regarding service agreement',
            riskLevel: 'HIGH',
            financialExposure: 500000,
            status: 'IN_PROGRESS',
            assignedLawyerId: lawyer.id,
            createdById: admin.id,
            slaDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    await prisma.litigationCase.upsert({
        where: { caseNumber: 'LIT-2024-002' },
        update: {},
        create: {
            caseNumber: 'LIT-2024-002',
            caseType: 'Labor Dispute',
            courtName: 'Jeddah Labor Court',
            parties: 'Maktabi Corp vs Former Employee',
            description: 'Wrongful termination claim',
            riskLevel: 'MEDIUM',
            financialExposure: 120000,
            status: 'HEARING',
            assignedLawyerId: lawyer.id,
            createdById: admin.id,
        },
    });
    await prisma.contract.upsert({
        where: { contractNumber: 'CNT-2024-001' },
        update: {},
        create: {
            contractNumber: 'CNT-2024-001',
            title: 'IT Services Agreement',
            description: 'Annual IT maintenance and support services',
            value: 250000,
            status: 'ACTIVE',
            counterparty: 'TechSolutions Ltd',
            startDate: new Date('2024-01-01'),
            endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
            createdById: admin.id,
        },
    });
    await prisma.financialExecution.create({
        data: {
            title: 'Court Judgment Payment',
            type: 'AGAINST_COMPANY',
            status: 'PARTIAL',
            totalAmount: 150000,
            paidAmount: 50000,
            currency: 'SAR',
            caseId: case1.id,
        },
    });
    console.log('Seed data created successfully!');
    console.log('\nDemo accounts:');
    console.log('  admin@maktabi.com / Admin@123');
    console.log('  ceo@maktabi.com / Ceo@123');
    console.log('  legal.manager@maktabi.com / Legal@123');
    console.log('  lawyer@maktabi.com / Lawyer@123');
    console.log('  hr@maktabi.com / Hr@123');
    console.log('  finance@maktabi.com / Finance@123');
    console.log('  employee@maktabi.com / Employee@123');
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map