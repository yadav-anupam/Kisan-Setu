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

        <main style={{ padding: '24px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Top Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              color: '#ffffff',
              marginBottom: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
                <Building2 size={14} color="#38bdf8" /> Inter-Agency Administrative Hierarchy
              </div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0' }}>
                Nodal Procurement Departments &amp; Statutory Agencies
              </h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '650px' }}>
                Unified coordination directory across Food &amp; Civil Supplies (FCS), Cooperative Federation (PCF), Mandi Parishad, FCI, and Legal Metrology for KMS 2026-27.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px 18px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{totalStaff}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Field Officers</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px 18px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 800 }}>{totalDisbursedCr > 0 ? `₹${totalDisbursedCr} Cr` : '₹0.00 Cr'}</div>
                <div style={{ fontSize: '11px', color: '#34d399' }}>Disbursed DBT</div>
              </div>
            </div>
          </div>

          {/* Department Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {departments.map((dept) => (
              <div
                key={dept.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '22px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 800,
                      }}
                    >
                      {dept.code}
                    </span>
                    <span
                      style={{
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} /> {dept.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: '1.3' }}>
                    {dept.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
                    {dept.parentMinistry}
                  </p>

                  {/* Officer In-Charge Box */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '16px',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Nodal Department Head
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      {dept.headOfficerName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                      {dept.headDesignation}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={13} color="#2563eb" /> {dept.headContact}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={13} color="#2563eb" /> {dept.headEmail}
                      </span>
                    </div>
                  </div>

                  {/* Department Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12px' }}>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ color: '#64748b' }}>Assigned Mandis:</span>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{dept.assignedMandisCount}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ color: '#64748b' }}>Active Field Staff:</span>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{dept.activeFieldOfficers}</div>
                    </div>
                    {dept.seasonIntakeMT > 0 && (
                      <>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                          <span style={{ color: '#64748b' }}>Season Intake:</span>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>
                            {(dept.seasonIntakeMT / 1000).toFixed(1)}k MT
                          </div>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                          <span style={{ color: '#64748b' }}>DBT Released:</span>
                          <div style={{ fontWeight: 800, color: '#059669', fontSize: '14px' }}>
                            ₹{dept.dbtDisbursedCr.toFixed(1)} Cr
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => navigate('/admin/staff')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
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
