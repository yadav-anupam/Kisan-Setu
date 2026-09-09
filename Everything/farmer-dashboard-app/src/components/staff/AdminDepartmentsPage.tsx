import { useState, useEffect } from 'react'
import {
  Building2,
  Phone,
  Mail,
  CheckCircle2,
} from 'lucide-react'
import { navigate } from '../../router'
import {
  getStaffAuthSession,
  isStaffAuthenticated,
  getAllProcurementCentresList,
  fetchAllAppointedStaff,
  fetchProcurementBatchesFromDB,
  type StaffProfile,
  type ProcurementBatchItem,
} from '../../services/staffDataService'
import StaffHeader from './StaffHeader'
import AdminSidebar from './AdminSidebar'
import './StaffQRScannerPage.css'
import './AdminDepartmentsPage.css'

interface DepartmentItem {
  id: string
  code: string
  name: string
  agencyKey: string
  parentMinistry: string
  headOfficerName: string
  headDesignation: string
  headContact: string
  headEmail: string
  assignedMandisCount: number
  activeFieldOfficers: number
  seasonIntakeMT: number
  dbtDisbursedCr: number
  status: 'ACTIVE' | 'AUDIT_REVIEW'
}

const initialDepartments: DepartmentItem[] = [
  {
    id: 'dept-fcs',
    code: 'UP-FCS',
    agencyKey: 'FCS',
    name: 'Food & Civil Supplies Department (खाद्य एवं रसद विभाग)',
    parentMinistry: 'Ministry of Consumer Protection & Civil Supplies, Govt. of UP',
    headOfficerName: 'Dr. Alok Kumar Rai (IAS)',
    headDesignation: 'Principal Secretary / Commissioner Food',
    headContact: '+91 522 2238450',
    headEmail: 'comm-food.up@nic.in',
    assignedMandisCount: 0,
    activeFieldOfficers: 0,
    seasonIntakeMT: 0,
    dbtDisbursedCr: 0,
    status: 'ACTIVE',
  },
  {
    id: 'dept-pcf',
    code: 'UP-PCF',
    agencyKey: 'PCF',
    name: 'UP Cooperative Federation (उत्तर प्रदेश को-ऑपरेटिव फेडरेशन)',
    parentMinistry: 'Department of Cooperation, Govt. of UP',
    headOfficerName: 'Sanjay Srivastava',
    headDesignation: 'Managing Director (MD-PCF)',
    headContact: '+91 522 2287102',
    headEmail: 'md.uppcf@gmail.com',
    assignedMandisCount: 0,
    activeFieldOfficers: 0,
    seasonIntakeMT: 0,
    dbtDisbursedCr: 0,
    status: 'ACTIVE',
  },
  {
    id: 'dept-mandi-parishad',
    code: 'MANDI-SAMITI',
    agencyKey: 'Mandi Samiti',
    name: 'UP Rajya Krishi Utpadan Mandi Parishad (मंडी परिषद)',
    parentMinistry: 'Department of Agricultural Marketing & Foreign Trade, UP',
    headOfficerName: 'Anil Kumar Sagar (IAS)',
    headDesignation: 'Director / Secretary Mandi Parishad',
    headContact: '+91 522 2721832',
    headEmail: 'director.mandi@up.gov.in',
    assignedMandisCount: 0,
    activeFieldOfficers: 0,
    seasonIntakeMT: 0,
    dbtDisbursedCr: 0,
    status: 'ACTIVE',
  },
  {
    id: 'dept-fci',
    code: 'FCI-UP-REGION',
    agencyKey: 'FCI',
    name: 'Food Corporation of India (भारतीय खाद्य निगम - UP Region)',
    parentMinistry: 'Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India',
    headOfficerName: 'Rajeev Sharma',
    headDesignation: 'Executive Director (North & UP Regional Office)',
    headContact: '+91 522 2286901',
    headEmail: 'gmup.fci@gov.in',
    assignedMandisCount: 0,
    activeFieldOfficers: 0,
    seasonIntakeMT: 0,
    dbtDisbursedCr: 0,
    status: 'ACTIVE',
  },
  {
    id: 'dept-wmd',
    code: 'WMD-LEGAL-MET',
    agencyKey: 'WMD',
    name: 'Weights & Measures Dept. (विधिक माप विज्ञान - Legal Metrology)',
    parentMinistry: 'Controller Legal Metrology Department, Govt. of UP',
    headOfficerName: 'V. K. Mishra',
    headDesignation: 'Controller of Legal Metrology',
    headContact: '+91 522 2237890',
    headEmail: 'clm-up@nic.in',
    assignedMandisCount: 0,
    activeFieldOfficers: 0,
    seasonIntakeMT: 0,
    dbtDisbursedCr: 0,
    status: 'ACTIVE',
  },
]

export default function AdminDepartmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [, setStaff] = useState<StaffProfile>(getStaffAuthSession)
  const [departments, setDepartments] = useState<DepartmentItem[]>(initialDepartments)
  const [totalStaff, setTotalStaff] = useState(0)
  const [totalDisbursedCr, setTotalDisbursedCr] = useState(0)

  useEffect(() => {
    if (!isStaffAuthenticated()) {
      sessionStorage.setItem('kisan_setu_staff_redirect', '/admin/departments')
      navigate('/admin/login')
      return
    }
    setStaff(getStaffAuthSession())

    async function computeRealStats() {
      const allCentres = getAllProcurementCentresList()
      const allStaffMembers = await fetchAllAppointedStaff()
      const allBatches: ProcurementBatchItem[] = await fetchProcurementBatchesFromDB()

      const totalDisbursed = allBatches
        .filter((b: ProcurementBatchItem) => b.payment_status === 'PAID_DBT')
        .reduce((sum: number, b: ProcurementBatchItem) => sum + (Number(b.net_amount) || 0), 0)

      setTotalStaff(allStaffMembers.length)
      setTotalDisbursedCr(Math.round((totalDisbursed / 10000000) * 10) / 10)

      const updated = initialDepartments.map((dept) => {
        let assignedCentres = 0
        let staffInDept = 0
        let intakeQtl = 0
        let dbtINR = 0

        if (dept.agencyKey === 'WMD') {
          assignedCentres = allCentres.length
          staffInDept = allStaffMembers.filter((s) => s.section === 'WEIGHMENT_ASSAY').length || 4
          intakeQtl = 0
          dbtINR = 0
        } else {
          const matchingCentres = allCentres.filter((c) => c.agency.toLowerCase().includes(dept.agencyKey.toLowerCase()))
          assignedCentres = matchingCentres.length
          const centreNames = matchingCentres.map((c) => c.centreName.toLowerCase())

          staffInDept = allStaffMembers.filter((s) =>
            centreNames.some((cName) => s.centre_name.toLowerCase().includes(cName) || cName.includes(s.centre_name.toLowerCase()))
          ).length

          const deptBatches = allBatches.filter((b: ProcurementBatchItem) =>
            centreNames.some((cName) => b.centre_name.toLowerCase().includes(cName) || cName.includes(b.centre_name.toLowerCase()))
          )

          intakeQtl = deptBatches.reduce((sum: number, b: ProcurementBatchItem) => sum + (Number(b.net_weight_qtl) || 0), 0)
          dbtINR = deptBatches
            .filter((b: ProcurementBatchItem) => b.payment_status === 'PAID_DBT')
            .reduce((sum: number, b: ProcurementBatchItem) => sum + (Number(b.net_amount) || 0), 0)
        }

        return {
          ...dept,
          assignedMandisCount: assignedCentres,
          activeFieldOfficers: staffInDept,
          seasonIntakeMT: Math.round((intakeQtl / 10) * 10) / 10,
          dbtDisbursedCr: Math.round((dbtINR / 10000000) * 10) / 10,
        }
      })

      setDepartments(updated)
    }

    computeRealStats()
  }, [])

  return (
    <div className="farmer-dashboard-layout" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <AdminSidebar
        activeTab="staff"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="fd-main-content">
        <StaffHeader
          onToggleSidebar={() => setSidebarOpen(true)}
          pageTitle="Inter-Agency Nodal Departments &amp; Governance"
        />

        <main className="admin-dept-container">
          {/* Top Banner */}
          <div className="admin-dept-hero">
            <div className="admin-dept-hero-left">
              <div className="admin-dept-hierarchy-pill">
                <Building2 size={14} color="#38bdf8" /> Inter-Agency Administrative Hierarchy
              </div>
              <h1 className="admin-dept-hero-title">
                Nodal Procurement Departments &amp; Statutory Agencies
              </h1>
              <p className="admin-dept-hero-desc">
                Unified coordination directory across Food &amp; Civil Supplies (FCS), Cooperative Federation (PCF), Mandi Parishad, FCI, and Legal Metrology for KMS 2026-27.
              </p>
            </div>

            <div className="admin-dept-stats-row">
              <div className="admin-dept-stat-card">
                <div className="admin-dept-stat-num">{totalStaff}</div>
                <div className="admin-dept-stat-sub">Field Officers</div>
              </div>
              <div className="admin-dept-stat-card">
                <div className="admin-dept-stat-num" style={{ color: '#34d399' }}>{totalDisbursedCr > 0 ? `₹${totalDisbursedCr} Cr` : '₹0.00 Cr'}</div>
                <div className="admin-dept-stat-sub" style={{ color: '#34d399' }}>Disbursed DBT</div>
              </div>
            </div>
          </div>

          {/* Department Cards Grid */}
          <div className="admin-dept-grid">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="admin-dept-card"
              >
                <div>
                  <div className="admin-dept-card-header">
                    <span className="admin-dept-code-badge">
                      {dept.code}
                    </span>
                    <span className="admin-dept-status-badge">
                      <CheckCircle2 size={12} /> {dept.status}
                    </span>
                  </div>

                  <h3 className="admin-dept-card-name">
                    {dept.name}
                  </h3>
                  <p className="admin-dept-card-parent">
                    {dept.parentMinistry}
                  </p>

                  {/* Officer In-Charge Box */}
                  <div className="admin-dept-head-box">
                    <div className="admin-dept-head-title">
                      Nodal Department Head
                    </div>
                    <div className="admin-dept-head-name">
                      {dept.headOfficerName}
                    </div>
                    <div className="admin-dept-head-desig">
                      {dept.headDesignation}
                    </div>

                    <div className="admin-dept-contact-row">
                      <a href={`tel:${dept.headContact}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none' }}>
                        <Phone size={13} /> {dept.headContact}
                      </a>
                      <a href={`mailto:${dept.headEmail}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', textDecoration: 'none' }}>
                        <Mail size={13} /> {dept.headEmail}
                      </a>
                    </div>
                  </div>

                  {/* Department Stats */}
                  <div className="admin-dept-stats-grid">
                    <div className="admin-dept-stat-tile">
                      <span className="admin-dept-stat-label">Assigned Mandis:</span>
                      <div className="admin-dept-stat-val">{dept.assignedMandisCount}</div>
                    </div>
                    <div className="admin-dept-stat-tile">
                      <span className="admin-dept-stat-label">Active Field Staff:</span>
                      <div className="admin-dept-stat-val">{dept.activeFieldOfficers}</div>
                    </div>
                    {dept.seasonIntakeMT > 0 && (
                      <>
                        <div className="admin-dept-stat-tile">
                          <span className="admin-dept-stat-label">Season Intake:</span>
                          <div className="admin-dept-stat-val">
                            {(dept.seasonIntakeMT / 1000).toFixed(1)}k MT
                          </div>
                        </div>
                        <div className="admin-dept-stat-tile">
                          <span className="admin-dept-stat-label">DBT Released:</span>
                          <div className="admin-dept-stat-val" style={{ color: '#059669' }}>
                            ₹{dept.dbtDisbursedCr.toFixed(1)} Cr
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="admin-dept-card-footer">
                  <button
                    onClick={() => navigate('/admin/staff')}
                    className="admin-dept-view-btn"
                  >
                    View Assigned Staff &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
