/**
 * Rich, time-distributed demo dataset for showcasing analytics & insights.
 *
 * Safe to re-run: it wipes transactional demo rows (in FK-safe order) and
 * regenerates a fresh 12-month spread. Base users/brands are preserved/created.
 *
 *   npx ts-node prisma/seed-demo.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

// ── helpers ──────────────────────────────────────────────────────────────────
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rnd(0, arr.length - 1)];
const chance = (p: number) => Math.random() < p;
const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000);
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
// A date randomly within the last `months` months
const withinMonths = (months: number) => daysAgo(rnd(0, months * 30));
const money = (min: number, max: number) => Math.round(rnd(min, max) / 1000) * 1000;

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Refusing to run demo seed in production');
    return;
  }
  console.log('🌱 Generating rich demo dataset…');
  const hash = (p: string) => bcrypt.hash(p, 10);

  // ── Base users (upsert) ────────────────────────────────────────────────────
  const baseUsers: {
    email: string; password: string; firstName: string; lastName: string;
    role: any; department?: string;
  }[] = [
    { email: 'admin@maktabi.com', password: 'Admin@123', firstName: 'System', lastName: 'Admin', role: 'ADMIN' },
    { email: 'ceo@maktabi.com', password: 'Ceo@123', firstName: 'Ahmed', lastName: 'Al-Rashid', role: 'CEO' },
    { email: 'legal.manager@maktabi.com', password: 'Legal@123', firstName: 'Sara', lastName: 'Al-Mansouri', role: 'LEGAL_MANAGER', department: 'Legal' },
    { email: 'lawyer@maktabi.com', password: 'Lawyer@123', firstName: 'Khalid', lastName: 'Al-Ghamdi', role: 'INTERNAL_LAWYER', department: 'Legal' },
    { email: 'hr@maktabi.com', password: 'Hr@123', firstName: 'Fatima', lastName: 'Al-Zahra', role: 'HR', department: 'HR' },
    { email: 'finance@maktabi.com', password: 'Finance@123', firstName: 'Omar', lastName: 'Al-Farouq', role: 'FINANCE', department: 'Finance' },
    { email: 'employee@maktabi.com', password: 'Employee@123', firstName: 'Maryam', lastName: 'Al-Hassan', role: 'EMPLOYEE', department: 'Operations' },
    // extra lawyers for workload analytics
    { email: 'noura.lawyer@maktabi.com', password: 'Lawyer@123', firstName: 'Noura', lastName: 'Al-Otaibi', role: 'INTERNAL_LAWYER', department: 'Legal' },
    { email: 'yousef.lawyer@maktabi.com', password: 'Lawyer@123', firstName: 'Yousef', lastName: 'Al-Dossari', role: 'INTERNAL_LAWYER', department: 'Legal' },
    { email: 'layla.lawyer@maktabi.com', password: 'Lawyer@123', firstName: 'Layla', lastName: 'Al-Qahtani', role: 'INTERNAL_LAWYER', department: 'Legal' },
    { email: 'external.counsel@maktabi.com', password: 'Lawyer@123', firstName: 'Tariq', lastName: 'Bin-Saleh', role: 'EXTERNAL_LAWYER', department: 'External Counsel' },
  ];
  const users: Record<string, any> = {};
  for (const u of baseUsers) {
    users[u.email] = await prisma.user.upsert({
      where: { email: u.email },
      update: { firstName: u.firstName, lastName: u.lastName, role: u.role, department: u.department },
      create: { ...u, password: await hash(u.password) },
    });
  }
  const admin = users['admin@maktabi.com'];
  const lawyers = [
    users['lawyer@maktabi.com'], users['noura.lawyer@maktabi.com'],
    users['yousef.lawyer@maktabi.com'], users['layla.lawyer@maktabi.com'],
    users['external.counsel@maktabi.com'],
  ];
  const creators = [admin, users['legal.manager@maktabi.com'], users['hr@maktabi.com'], users['employee@maktabi.com']];

  // ── Brands (upsert) ────────────────────────────────────────────────────────
  const brandDefs = [
    { name: 'IBRAQ', code: 'IBRAQ', description: 'IBRAQ Holding', color: '#3B82F6' },
    { name: 'MATCH', code: 'MATCH', description: 'MATCH Retail', color: '#8B5CF6' },
    { name: 'FEELIN', code: 'FEELIN', description: 'FEELIN Beverages', color: '#10B981' },
    { name: 'SALFA', code: 'SALFA', description: 'SALFA Logistics', color: '#F59E0B' },
    { name: 'NOOR', code: 'NOOR', description: 'NOOR Real Estate', color: '#EC4899' },
  ];
  const brands: any[] = [];
  for (const b of brandDefs) {
    brands.push(await prisma.brand.upsert({ where: { code: b.code }, update: { color: b.color, description: b.description }, create: b }));
  }

  // ── Wipe transactional demo rows (FK-safe order) ───────────────────────────
  console.log('🧹 Clearing previous transactional demo data…');
  await prisma.task.deleteMany({});
  await (prisma as any).message?.deleteMany?.({});
  await (prisma as any).conversationParticipant?.deleteMany?.({});
  await (prisma as any).conversation?.deleteMany?.({});
  await (prisma as any).leave?.deleteMany?.({});
  await (prisma as any).libraryItem?.deleteMany?.({});
  await (prisma as any).treasuryTransaction?.deleteMany?.({});
  await (prisma as any).treasuryAccount?.deleteMany?.({});
  await (prisma as any).invoiceItem?.deleteMany?.({});
  await (prisma as any).invoicePayment?.deleteMany?.({});
  await (prisma as any).invoice?.deleteMany?.({});
  await (prisma as any).estimateItem?.deleteMany?.({});
  await (prisma as any).estimate?.deleteMany?.({});
  await (prisma as any).expense?.deleteMany?.({});
  await (prisma as any).powerOfAttorney?.deleteMany?.({});
  await prisma.contact.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.hearing.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.approvalLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  // WorkflowState has no FK; clear for a clean trail
  await (prisma as any).workflowState.deleteMany({});
  await prisma.financialExecution.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.investigation.deleteMany({});
  await prisma.litigationCase.deleteMany({});

  // ── Litigation cases ───────────────────────────────────────────────────────
  const caseTypes = ['Commercial Dispute', 'Labor Dispute', 'Contract Breach', 'Intellectual Property', 'Debt Recovery', 'Regulatory', 'Real Estate', 'Insurance Claim'];
  const courts = ['Riyadh Commercial Court', 'Jeddah Labor Court', 'Dammam General Court', 'Riyadh Court of Appeal', 'Makkah Commercial Court', 'Board of Grievances'];
  const counterpartiesL = ['Al-Noor Trading', 'Gulf Contractors Co.', 'Former Employee', 'Rawabi Holding', 'Desert Logistics', 'Falcon Media', 'Nadec Supplies', 'Bin Laden Group'];
  const caseStatuses = ['DRAFT', 'PENDING', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'HEARING', 'DECIDED', 'CLOSED', 'ARCHIVED'];
  const risks = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const activeCaseIds: string[] = [];
  let caseSeq = 1;
  for (let i = 0; i < 42; i++) {
    const createdAt = withinMonths(12);
    const status = pick(caseStatuses);
    const risk = pick(risks);
    const closed = ['CLOSED', 'ARCHIVED', 'DECIDED'].includes(status);
    const slaDeadline = chance(0.7) ? new Date(createdAt.getTime() + rnd(20, 75) * 86400000) : null;
    const c = await prisma.litigationCase.create({
      data: {
        caseNumber: `LIT-2026-${String(caseSeq++).padStart(3, '0')}`,
        caseType: pick(caseTypes),
        courtName: pick(courts),
        parties: `Maktabi Corp vs ${pick(counterpartiesL)}`,
        description: 'Auto-generated demo matter for analytics showcase.',
        riskLevel: risk as any,
        financialExposure: money(50000, 4000000),
        currency: 'SAR',
        status: status as any,
        assignedLawyerId: chance(0.85) ? pick(lawyers).id : null,
        createdById: pick(creators).id,
        slaDeadline,
        closedAt: closed ? new Date(createdAt.getTime() + rnd(30, 200) * 86400000) : null,
        brandId: pick(brands).id,
        createdAt,
        updatedAt: createdAt,
      },
    });
    if (!closed) activeCaseIds.push(c.id);
    // Hearings: past (with outcome) + one upcoming for active cases
    const hearingCount = rnd(0, 3);
    for (let h = 0; h < hearingCount; h++) {
      await prisma.hearing.create({
        data: {
          caseId: c.id, court: pick(courts), hearingDate: daysAgo(rnd(5, 180)),
          notes: 'Procedural hearing.', outcome: pick(['Adjourned', 'Evidence submitted', 'Ruling reserved', 'Settlement discussed']),
        },
      });
    }
    if (!closed && chance(0.5)) {
      await prisma.hearing.create({ data: { caseId: c.id, court: pick(courts), hearingDate: daysFromNow(rnd(1, 21)), notes: 'Upcoming hearing.' } });
    }
  }
  console.log(`  ⚖️  42 litigation cases`);

  // ── Contracts (renewal pipeline spread) ────────────────────────────────────
  const contractTitles = ['IT Services Agreement', 'Office Lease', 'Supply Agreement', 'Marketing Retainer', 'Distribution Deal', 'NDA', 'Consultancy Agreement', 'Maintenance Contract', 'Software License', 'Logistics SLA'];
  const counterpartiesC = ['TechSolutions Ltd', 'Al-Rajhi Properties', 'Saudi Supply Co.', 'Blink Agency', 'Aramex', 'Oracle KSA', 'STC Business', 'Almarai', 'Red Sea Global'];
  const contractStatuses = ['DRAFT', 'PENDING_MANAGER', 'PENDING_LEGAL', 'PENDING_LAWYER', 'PENDING_CEO', 'APPROVED', 'ACTIVE', 'EXPIRED', 'TERMINATED'];
  let cntSeq = 1;
  for (let i = 0; i < 30; i++) {
    const createdAt = withinMonths(14);
    const status = i < 18 ? 'ACTIVE' : pick(contractStatuses); // bias to ACTIVE for renewal pipeline
    const startDate = new Date(createdAt);
    // spread end dates: some already expired, some in 7/30/60/90/180 day buckets, some far
    const endOffset = pick([-40, -10, 6, 20, 27, 45, 75, 110, 200, 320]);
    await prisma.contract.create({
      data: {
        contractNumber: `CNT-2026-${String(cntSeq++).padStart(3, '0')}`,
        title: pick(contractTitles),
        description: 'Auto-generated demo contract for renewal analytics.',
        value: money(80000, 3000000),
        currency: 'SAR',
        status: status as any,
        counterparty: pick(counterpartiesC),
        startDate,
        endDate: daysFromNow(endOffset),
        renewalAlertDays: pick([30, 45, 60, 90]),
        riskScore: rnd(10, 95),
        signatureReady: chance(0.4),
        createdById: pick(creators).id,
        brandId: pick(brands).id,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }
  console.log(`  📄 30 contracts`);

  // ── Consultations ──────────────────────────────────────────────────────────
  const consultTitles = ['GDPR compliance review', 'Vendor contract opinion', 'Employment policy question', 'Trademark registration', 'Regulatory filing guidance', 'Data-sharing agreement', 'Franchise terms review', 'Import license query'];
  const tagsPool = ['compliance', 'employment', 'IP', 'data-privacy', 'commercial', 'regulatory', 'tax', 'corporate'];
  const consultStatuses = ['SUBMITTED', 'IN_REVIEW', 'OPINION_PROVIDED', 'CLOSED'];
  for (let i = 0; i < 34; i++) {
    const createdAt = withinMonths(12);
    const status = pick(consultStatuses);
    await prisma.consultation.create({
      data: {
        title: pick(consultTitles),
        description: 'Auto-generated demo consultation request.',
        status: status as any,
        createdById: pick(creators).id,
        legalOpinion: ['OPINION_PROVIDED', 'CLOSED'].includes(status) ? 'Opinion issued per internal policy.' : null,
        tags: [pick(tagsPool), pick(tagsPool)].filter((v, idx, a) => a.indexOf(v) === idx),
        slaDeadline: chance(0.6) ? new Date(createdAt.getTime() + rnd(5, 30) * 86400000) : null,
        closedAt: status === 'CLOSED' ? new Date(createdAt.getTime() + rnd(3, 40) * 86400000) : null,
        brandId: pick(brands).id,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }
  console.log(`  💬 34 consultations`);

  // ── Investigations ─────────────────────────────────────────────────────────
  const invTitles = ['Expense fraud allegation', 'Harassment complaint', 'Data leak inquiry', 'Conflict of interest', 'Procurement irregularity', 'Attendance misconduct', 'Policy violation'];
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const invStatuses = ['SUBMITTED', 'CLASSIFIED', 'IN_PROGRESS', 'COMMITTEE_REVIEW', 'APPEAL', 'CLOSED', 'ARCHIVED'];
  for (let i = 0; i < 22; i++) {
    const createdAt = withinMonths(12);
    const status = pick(invStatuses);
    await prisma.investigation.create({
      data: {
        title: pick(invTitles),
        description: 'Auto-generated demo investigation for HR analytics.',
        severity: pick(severities),
        isConfidential: chance(0.35),
        status: status as any,
        createdById: users['hr@maktabi.com'].id,
        committeeMembers: chance(0.5) ? ['Sara Al-Mansouri', 'Omar Al-Farouq'] : [],
        slaDeadline: chance(0.6) ? new Date(createdAt.getTime() + rnd(10, 45) * 86400000) : null,
        closedAt: ['CLOSED', 'ARCHIVED'].includes(status) ? new Date(createdAt.getTime() + rnd(15, 90) * 86400000) : null,
        brandId: pick(brands).id,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }
  console.log(`  🔍 22 investigations`);

  // ── Financial executions + payments ────────────────────────────────────────
  const finTitles = ['Court Judgment Payment', 'Settlement Disbursement', 'Debt Recovery', 'Penalty Collection', 'Arbitration Award', 'Compensation Payout'];
  for (let i = 0; i < 20; i++) {
    const createdAt = withinMonths(12);
    const total = money(100000, 2500000);
    const type = pick(['AGAINST_COMPANY', 'IN_FAVOR_OF_COMPANY']);
    const paidRatio = pick([0, 0.25, 0.5, 0.75, 1]);
    const paid = Math.round(total * paidRatio);
    const status = paid === 0 ? 'PENDING' : paid >= total ? 'COMPLETED' : 'PARTIAL';
    const fe = await prisma.financialExecution.create({
      data: {
        title: pick(finTitles),
        type: type as any,
        status: status as any,
        totalAmount: total,
        paidAmount: paid,
        currency: 'SAR',
        dueDate: daysFromNow(pick([-30, -5, 15, 45, 90])),
        notes: 'Auto-generated demo execution.',
        brandId: pick(brands).id,
        createdAt,
        updatedAt: createdAt,
      },
    });
    // spread payments over months
    let remaining = paid;
    const installments = paid > 0 ? rnd(1, 3) : 0;
    for (let p = 0; p < installments; p++) {
      const amt = p === installments - 1 ? remaining : Math.round(paid / installments);
      remaining -= amt;
      if (amt <= 0) continue;
      await prisma.payment.create({
        data: { financialExecutionId: fe.id, amount: amt, currency: 'SAR', paymentDate: withinMonths(10), reference: `PAY-${rnd(10000, 99999)}` },
      });
    }
  }
  console.log(`  💰 20 financial executions + payments`);

  // ── Contacts (clients / counterparties / vendors) ──────────────────────────
  const clientNames = ['Al-Noor Trading', 'Rawabi Holding', 'Gulf Contractors Co.', 'Desert Logistics', 'Falcon Media', 'Nadec Supplies', 'Red Sea Global', 'Almarai Group', 'Saudi Telecom', 'Aramex KSA', 'Bin Laden Group', 'Jarir Marketing', 'Mobily', 'Panda Retail', 'Kudu Foods'];
  const cities = ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Medina', 'Khobar'];
  const contactTypes = ['CLIENT', 'CLIENT', 'CLIENT', 'COUNTERPARTY', 'VENDOR', 'EXPERT'];
  const contacts: any[] = [];
  for (let i = 0; i < clientNames.length; i++) {
    const nm = clientNames[i];
    contacts.push(await prisma.contact.create({
      data: {
        name: nm, type: pick(contactTypes) as any, company: nm,
        email: `legal@${nm.toLowerCase().replace(/[^a-z]/g, '')}.sa`,
        phone: `+966 1${rnd(1, 3)} ${rnd(200, 899)} ${rnd(1000, 9999)}`,
        city: pick(cities), country: 'Saudi Arabia',
        nationalId: `${rnd(1000000000, 9999999999)}`,
        isActive: chance(0.9), brandId: pick(brands).id, createdById: pick(creators).id,
        createdAt: withinMonths(14),
      },
    }));
  }
  console.log(`  🤝 ${contacts.length} contacts`);

  // ── Tasks (assignable, some overdue) ───────────────────────────────────────
  const taskTitles = ['Draft response to claim', 'Review contract clauses', 'File court submission', 'Prepare hearing bundle', 'Client call — case update', 'Collect witness statements', 'Renew power of attorney', 'Issue invoice', 'Follow up on payment', 'Research precedent', 'Translate exhibits', 'Board memo on risk'];
  const taskStatuses = ['TODO', 'TODO', 'IN_PROGRESS', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'DONE', 'CANCELLED'];
  const taskPriorities = ['LOW', 'MEDIUM', 'MEDIUM', 'HIGH', 'URGENT'];
  const assignables = lawyers.concat([users['legal.manager@maktabi.com']]);
  let taskCount = 0;
  for (let i = 0; i < 28; i++) {
    const status = pick(taskStatuses);
    const done = status === 'DONE';
    const dueOffset = pick([-14, -5, -1, 0, 1, 3, 7, 14, 30]);
    await prisma.task.create({
      data: {
        title: pick(taskTitles), description: 'Auto-generated demo task.',
        status: status as any, priority: pick(taskPriorities) as any,
        dueDate: chance(0.85) ? daysFromNow(dueOffset) : null,
        assigneeId: chance(0.85) ? pick(assignables).id : null,
        createdById: pick(creators).id,
        contactId: chance(0.5) ? pick(contacts).id : null,
        brandId: pick(brands).id,
        completedAt: done ? daysAgo(rnd(1, 20)) : null,
        createdAt: withinMonths(6),
      },
    });
    taskCount++;
  }
  console.log(`  ✅ ${taskCount} tasks`);

  // ── Invoices (with line items + payments) ──────────────────────────────────
  const clientContacts = contacts.filter((c) => c.type === 'CLIENT');
  const pickClient = () => (clientContacts.length ? pick(clientContacts) : pick(contacts));
  const serviceLines = ['Legal retainer', 'Court representation', 'Contract drafting', 'Due diligence', 'Advisory hours', 'Filing fees', 'Translation services', 'Notarization'];
  const round2 = (v: number) => Math.round(v * 100) / 100;
  let invSeq = 1;
  for (let i = 0; i < 16; i++) {
    const createdAt = withinMonths(10);
    const items = Array.from({ length: rnd(1, 4) }, () => {
      const quantity = rnd(1, 10);
      const unitPrice = money(1500, 40000);
      return { description: pick(serviceLines), quantity, unitPrice, amount: round2(quantity * unitPrice) };
    });
    const subtotal = round2(items.reduce((a, it) => a + it.amount, 0));
    const taxAmount = round2(subtotal * 0.15);
    const total = round2(subtotal + taxAmount);
    const roll = Math.random();
    const status = roll < 0.4 ? 'PAID' : roll < 0.65 ? 'PARTIAL' : roll < 0.8 ? 'SENT' : roll < 0.9 ? 'OVERDUE' : 'DRAFT';
    const paidAmount = status === 'PAID' ? total : status === 'PARTIAL' ? round2(total * pick([0.3, 0.5, 0.7])) : 0;
    const dueOffset = status === 'OVERDUE' ? rnd(-40, -5) : rnd(5, 45);
    const inv = await prisma.invoice.create({
      data: {
        number: `INV-2026-${String(invSeq++).padStart(4, '0')}`, contactId: pickClient().id, status: status as any,
        issueDate: createdAt, dueDate: daysFromNow(dueOffset), currency: 'SAR', taxRate: 15,
        subtotal, taxAmount, total, paidAmount, brandId: pick(brands).id, createdById: pick(creators).id, createdAt,
        items: { create: items },
      },
    });
    if (paidAmount > 0) {
      await prisma.invoicePayment.create({ data: { invoiceId: inv.id, amount: paidAmount, paymentDate: daysAgo(rnd(1, 60)), method: pick(['BANK_TRANSFER', 'CASH', 'CHEQUE']), reference: `RCP-${rnd(10000, 99999)}` } });
    }
  }
  console.log(`  🧾 16 invoices`);

  // ── Estimates ──────────────────────────────────────────────────────────────
  let estSeq = 1;
  for (let i = 0; i < 9; i++) {
    const items = Array.from({ length: rnd(1, 3) }, () => {
      const quantity = rnd(1, 8); const unitPrice = money(2000, 30000);
      return { description: pick(serviceLines), quantity, unitPrice, amount: round2(quantity * unitPrice) };
    });
    const subtotal = round2(items.reduce((a, it) => a + it.amount, 0));
    const taxAmount = round2(subtotal * 0.15);
    await prisma.estimate.create({
      data: {
        number: `EST-2026-${String(estSeq++).padStart(4, '0')}`, contactId: pickClient().id,
        status: pick(['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED']) as any,
        validUntil: daysFromNow(rnd(-10, 40)), currency: 'SAR', taxRate: 15,
        subtotal, taxAmount, total: round2(subtotal + taxAmount), brandId: pick(brands).id,
        createdById: pick(creators).id, createdAt: withinMonths(8), items: { create: items },
      },
    });
  }
  console.log(`  📝 9 estimates`);

  // ── Expenses ───────────────────────────────────────────────────────────────
  const expenseTitles: Record<string, string[]> = {
    COURT_FEES: ['Court filing fee', 'Appeal deposit'], FILING: ['Document filing', 'Registration fee'],
    TRAVEL: ['Client visit - Jeddah', 'Hearing travel - Dammam'], SALARY: ['Paralegal overtime'],
    OFFICE: ['Office supplies', 'Printing & binding'], MARKETING: ['LinkedIn ads', 'Seminar sponsorship'],
    SOFTWARE: ['Legal research subscription', 'Practice software license'], CONSULTANT: ['Expert witness fee'], OTHER: ['Miscellaneous'],
  };
  const expCats = Object.keys(expenseTitles);
  for (let i = 0; i < 24; i++) {
    const category = pick(expCats);
    await prisma.expense.create({
      data: {
        title: pick(expenseTitles[category]), category: category as any, amount: money(500, 45000), currency: 'SAR',
        date: withinMonths(9), vendor: pick(['Ministry of Justice', 'Saudi Post', 'Aramex', 'STC', 'Local Supplier', 'Expert Consultants']),
        contactId: chance(0.3) ? pick(contacts).id : null, brandId: pick(brands).id, createdById: pick(creators).id,
      },
    });
  }
  console.log(`  💸 24 expenses`);

  // ── Treasury ───────────────────────────────────────────────────────────────
  const acctDefs = [
    { name: 'Al-Rajhi Main Account', type: 'BANK', balance: 1850000 },
    { name: 'Petty Cash', type: 'CASH', balance: 25000 },
    { name: 'Corporate Card', type: 'CARD', balance: -14500 },
  ];
  for (const a of acctDefs) {
    const acct = await prisma.treasuryAccount.create({ data: { name: a.name, type: a.type as any, currency: 'SAR', balance: a.balance } });
    for (let j = 0; j < rnd(3, 6); j++) {
      const type = pick(['CREDIT', 'DEBIT']);
      await prisma.treasuryTransaction.create({
        data: { accountId: acct.id, type: type as any, amount: money(2000, 120000), description: type === 'CREDIT' ? pick(['Client payment received', 'Invoice settlement', 'Retainer deposit']) : pick(['Court fee payment', 'Vendor payment', 'Salary disbursement', 'Office rent']), date: withinMonths(6), reference: `TXN-${rnd(10000, 99999)}` },
      });
    }
  }
  console.log(`  🏦 3 treasury accounts`);

  // ── Powers of Attorney ─────────────────────────────────────────────────────
  const scopes = ['Full litigation representation before all courts', 'Contract signing and negotiation', 'Debt collection and settlement', 'Real-estate transactions', 'Government and ministry filings', 'Banking and financial matters'];
  const granteeNames = ['Khalid Al-Ghamdi', 'Noura Al-Otaibi', 'Yousef Al-Dossari', 'Layla Al-Qahtani', 'Tariq Bin-Saleh'];
  let poaSeq = 1;
  for (let i = 0; i < 12; i++) {
    const grantor = pick(contacts);
    const expiryOffset = pick([-60, -10, 15, 45, 120, 365, 730]);
    await prisma.powerOfAttorney.create({
      data: {
        number: `POA-2026-${String(poaSeq++).padStart(4, '0')}`, contactId: grantor.id,
        grantor: grantor.name, grantee: `Maktabi Law Firm — ${pick(granteeNames)}`, scope: pick(scopes),
        issueDate: withinMonths(18), expiryDate: daysFromNow(expiryOffset),
        status: chance(0.12) ? 'REVOKED' : 'ACTIVE', notaryRef: `NOT-${rnd(100000, 999999)}`,
        brandId: pick(brands).id, createdById: pick(creators).id,
      },
    });
  }
  console.log(`  ✍️  12 powers of attorney`);

  // ── Legal Library ──────────────────────────────────────────────────────────
  const libItems = [
    { title: 'Employment Contract Template', type: 'CONTRACT_TEMPLATE', category: 'Labor', tags: ['employment', 'contract'] },
    { title: 'NDA Template (Bilingual)', type: 'TEMPLATE', category: 'Commercial', tags: ['nda', 'confidentiality'] },
    { title: 'Saudi Labor Law — Key Provisions', type: 'REGULATION', category: 'Labor', tags: ['labor', 'ksa'] },
    { title: 'Commercial Courts Law', type: 'REGULATION', category: 'Litigation', tags: ['commercial', 'courts'] },
    { title: 'Power of Attorney Template', type: 'FORM', category: 'Corporate', tags: ['poa'] },
    { title: 'Precedent: Breach of Service Agreement', type: 'PRECEDENT', category: 'Litigation', tags: ['precedent', 'breach'] },
    { title: 'Guide: Filing a Commercial Claim', type: 'GUIDE', category: 'Litigation', tags: ['guide', 'filing'] },
    { title: 'PDPL Compliance Checklist', type: 'GUIDE', category: 'Compliance', tags: ['data-privacy', 'pdpl'] },
    { title: 'Lease Agreement Template', type: 'CONTRACT_TEMPLATE', category: 'Real Estate', tags: ['lease'] },
    { title: 'Board Resolution Form', type: 'FORM', category: 'Corporate', tags: ['governance'] },
    { title: 'Settlement Agreement Template', type: 'TEMPLATE', category: 'Litigation', tags: ['settlement'] },
    { title: 'Arbitration Clause Library', type: 'PRECEDENT', category: 'Commercial', tags: ['arbitration'] },
  ];
  for (const it of libItems) {
    await prisma.libraryItem.create({
      data: { ...it, type: it.type as any, description: `Reference resource: ${it.title}.`, content: 'Sample content for demonstration. Replace with the full document text or attach a file.', isPublic: true, views: rnd(0, 240), createdById: pick(creators).id, createdAt: withinMonths(12) },
    });
  }
  console.log(`  📚 ${libItems.length} library items`);

  // ── Leaves ─────────────────────────────────────────────────────────────────
  const leaveUsers = [users['lawyer@maktabi.com'], users['hr@maktabi.com'], users['finance@maktabi.com'], users['employee@maktabi.com'], users['noura.lawyer@maktabi.com'], users['yousef.lawyer@maktabi.com']];
  const leaveTypes = ['ANNUAL', 'ANNUAL', 'SICK', 'EMERGENCY', 'UNPAID'];
  const leaveStatuses = ['PENDING', 'APPROVED', 'APPROVED', 'REJECTED'];
  for (let i = 0; i < 12; i++) {
    const u = pick(leaveUsers);
    const startOffset = rnd(-40, 40);
    const duration = rnd(1, 7);
    const status = pick(leaveStatuses);
    await prisma.leave.create({
      data: {
        userId: u.id, type: pick(leaveTypes) as any, startDate: daysFromNow(startOffset), endDate: daysFromNow(startOffset + duration),
        days: duration + 1, reason: pick(['Family matters', 'Medical', 'Travel', 'Personal', 'Eid holiday']), status: status as any,
        approverId: status !== 'PENDING' ? users['legal.manager@maktabi.com'].id : null,
        decidedAt: status !== 'PENDING' ? daysAgo(rnd(1, 20)) : null, createdAt: withinMonths(3),
      },
    });
  }
  console.log(`  🌴 12 leave requests`);

  // ── Messages (a few conversations) ─────────────────────────────────────────
  const convoPairs = [
    [admin, users['legal.manager@maktabi.com']],
    [users['legal.manager@maktabi.com'], users['lawyer@maktabi.com']],
    [admin, users['lawyer@maktabi.com']],
  ];
  const sampleMsgs = ['Please review the Al-Noor case file.', 'Sure, I will look at it today.', 'The hearing is scheduled for next week.', 'Noted, I will prepare the bundle.', 'Can you send the latest invoice?', 'Done — sent it over just now.'];
  for (const [a, b] of convoPairs) {
    const conv = await prisma.conversation.create({ data: { isGroup: false, participants: { create: [{ userId: a.id }, { userId: b.id }] } } });
    const count = rnd(3, 6);
    for (let m = 0; m < count; m++) {
      await prisma.message.create({ data: { conversationId: conv.id, senderId: m % 2 === 0 ? a.id : b.id, body: pick(sampleMsgs), createdAt: daysAgo(rnd(0, 6)) } });
    }
    await prisma.conversation.update({ where: { id: conv.id }, data: { updatedAt: daysAgo(rnd(0, 3)) } });
  }
  console.log(`  💬 3 conversations`);

  // ── Notifications for the demo login users ─────────────────────────────────
  const notifUsers = [admin, users['legal.manager@maktabi.com'], users['lawyer@maktabi.com']];
  const notifs = [
    { title: 'New case assigned', message: 'LIT-2026-014 has been assigned to you.', type: 'INFO' },
    { title: 'Contract expiring soon', message: 'Office Lease expires in 7 days.', type: 'WARNING' },
    { title: 'SLA breach risk', message: 'Consultation SLA due in 24h.', type: 'WARNING' },
    { title: 'Hearing tomorrow', message: 'Riyadh Commercial Court at 10:00.', type: 'INFO' },
    { title: 'Payment recorded', message: 'SAR 250,000 recorded against execution.', type: 'SUCCESS' },
  ];
  for (const u of notifUsers) {
    for (const n of notifs) {
      await prisma.notification.create({ data: { ...n, userId: u.id, isRead: chance(0.4), createdAt: daysAgo(rnd(0, 20)) } });
    }
  }
  console.log(`  🔔 notifications`);

  // ── Audit log trail ────────────────────────────────────────────────────────
  const actions = ['CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE', 'LOGIN'];
  const entityTypes = ['LitigationCase', 'Contract', 'Consultation', 'Investigation', 'FinancialExecution', 'User'];
  for (let i = 0; i < 60; i++) {
    await prisma.auditLog.create({
      data: {
        userId: pick(creators).id,
        action: pick(actions),
        entityType: pick(entityTypes),
        entityId: `demo-${rnd(1000, 9999)}`,
        ipAddress: `10.0.${rnd(0, 5)}.${rnd(2, 250)}`,
        userAgent: 'Mozilla/5.0 (demo seed)',
        createdAt: withinMonths(6),
      },
    });
  }
  console.log(`  📜 60 audit entries`);

  console.log('✅ Rich demo dataset ready!');
}

main()
  .catch((err) => { console.error('❌ Demo seed failed:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
