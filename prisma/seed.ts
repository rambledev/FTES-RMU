import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function main() {
  console.log('🌱 Starting seed...')

  await prisma.answer.deleteMany()
  await prisma.response.deleteMany()
  await prisma.instructorEvaluationSummary.deleteMany()
  await prisma.enrollment.deleteMany()
  await prisma.question.deleteMany()
  await prisma.section.deleteMany()
  await prisma.evaluationForm.deleteMany()
  await prisma.teachingAssignment.deleteMany()
  await prisma.student.deleteMany()
  await prisma.instructor.deleteMany()
  await prisma.user.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.department.deleteMany()
  await prisma.faculty.deleteMany()
  await prisma.term.deleteMany()

  // ─── คณะ ─────────────────────────────────────────────────────
  const [facST, facEDU, facHSS, facMS, facAGR, facENG, facLAW, facPS] = await Promise.all([
    prisma.faculty.create({ data: { name: 'คณะวิทยาศาสตร์และเทคโนโลยี', nameEn: 'Faculty of Science and Technology', code: 'FST' } }),
    prisma.faculty.create({ data: { name: 'คณะครุศาสตร์', nameEn: 'Faculty of Education', code: 'FED' } }),
    prisma.faculty.create({ data: { name: 'คณะมนุษยศาสตร์และสังคมศาสตร์', nameEn: 'Faculty of Humanities and Social Sciences', code: 'FHS' } }),
    prisma.faculty.create({ data: { name: 'คณะวิทยาการจัดการ', nameEn: 'Faculty of Management Sciences', code: 'FMS' } }),
    prisma.faculty.create({ data: { name: 'คณะเทคโนโลยีการเกษตร', nameEn: 'Faculty of Agricultural Technology', code: 'FAT' } }),
    prisma.faculty.create({ data: { name: 'คณะวิศวกรรมศาสตร์', nameEn: 'Faculty of Engineering', code: 'FEN' } }),
    prisma.faculty.create({ data: { name: 'คณะนิติศาสตร์', nameEn: 'Faculty of Law', code: 'FLW' } }),
    prisma.faculty.create({ data: { name: 'คณะรัฐศาสตร์และรัฐประศาสนศาสตร์', nameEn: 'Faculty of Political Science and Public Administration', code: 'FPS' } }),
  ])

  // ─── สาขาวิชา ────────────────────────────────────────────────
  const [deptCS, deptIT, deptANIM, deptDC] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาวิทยาการคอมพิวเตอร์', nameEn: 'Computer Science', code: 'CS', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาเทคโนโลยีสารสนเทศ', nameEn: 'Information Technology', code: 'IT', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาแอนิเมชันและเกม', nameEn: 'Animation and Game', code: 'ANIM', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาดิจิทัลคอนเทนต์', nameEn: 'Digital Content', code: 'DC', facultyId: facST.id } }),
  ])
  const [deptCHEM, deptPHYS, deptBIO, deptMATH] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาเคมี', nameEn: 'Chemistry', code: 'CHEM', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาฟิสิกส์', nameEn: 'Physics', code: 'PHYS', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาชีววิทยา', nameEn: 'Biology', code: 'BIO', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาคณิตศาสตร์', nameEn: 'Mathematics', code: 'MATH', facultyId: facST.id } }),
  ])
  const [deptSTAT, deptENV, deptPH, deptTM] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาสถิติประยุกต์', nameEn: 'Applied Statistics', code: 'STAT', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาวิทยาศาสตร์สิ่งแวดล้อม', nameEn: 'Environmental Science', code: 'ENV', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาสาธารณสุขศาสตร์', nameEn: 'Public Health', code: 'PH', facultyId: facST.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาการแพทย์แผนไทย', nameEn: 'Traditional Thai Medicine', code: 'TM', facultyId: facST.id } }),
  ])

  const [deptECE, deptELEM, deptSPED, deptGUID] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาการศึกษาปฐมวัย', nameEn: 'Early Childhood Education', code: 'ECE', facultyId: facEDU.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาการประถมศึกษา', nameEn: 'Elementary Education', code: 'ELEM', facultyId: facEDU.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาการศึกษาพิเศษ', nameEn: 'Special Education', code: 'SPED', facultyId: facEDU.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาจิตวิทยาการแนะแนว', nameEn: 'Guidance Psychology', code: 'GUID', facultyId: facEDU.id } }),
  ])
  const [deptTHAIED, deptENGED, deptSCIED, deptCOMPED, deptPED] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาภาษาไทย (ครุศาสตร์)', nameEn: 'Thai Language Education', code: 'THAIED', facultyId: facEDU.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาภาษาอังกฤษ (ครุศาสตร์)', nameEn: 'English Education', code: 'ENGED', facultyId: facEDU.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาวิทยาศาสตร์ทั่วไป (ครุศาสตร์)', nameEn: 'General Science Education', code: 'SCIED', facultyId: facEDU.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาคอมพิวเตอร์ศึกษา', nameEn: 'Computer Education', code: 'COMPED', facultyId: facEDU.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาพลศึกษา', nameEn: 'Physical Education', code: 'PED', facultyId: facEDU.id } }),
  ])

  const [deptTHAI, deptENG, deptTHAICOM] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาภาษาไทย', nameEn: 'Thai Language', code: 'THAI', facultyId: facHSS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาภาษาอังกฤษ', nameEn: 'English', code: 'ENG', facultyId: facHSS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาภาษาไทยเพื่อการสื่อสาร', nameEn: 'Thai for Communication', code: 'THAICOM', facultyId: facHSS.id } }),
  ])
  const [deptCD, deptSW, deptLIB, deptMUS, deptFA, deptGD] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาการพัฒนาชุมชน', nameEn: 'Community Development', code: 'CD', facultyId: facHSS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาสังคมสงเคราะห์ศาสตร์', nameEn: 'Social Work', code: 'SW', facultyId: facHSS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาบรรณารักษศาสตร์', nameEn: 'Library Science', code: 'LIB', facultyId: facHSS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาดนตรีศึกษา', nameEn: 'Music Education', code: 'MUS', facultyId: facHSS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาศิลปกรรม', nameEn: 'Fine Arts', code: 'FA', facultyId: facHSS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาออกแบบกราฟิก', nameEn: 'Graphic Design', code: 'GD', facultyId: facHSS.id } }),
  ])

  const [deptACC, deptMKT, deptMGT, deptBCS, deptECON] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาการบัญชี', nameEn: 'Accounting', code: 'ACC', facultyId: facMS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาการตลาด', nameEn: 'Marketing', code: 'MKT', facultyId: facMS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาการจัดการ', nameEn: 'Management', code: 'MGT', facultyId: facMS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาคอมพิวเตอร์ธุรกิจ', nameEn: 'Business Computer', code: 'BCS', facultyId: facMS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาเศรษฐศาสตร์ธุรกิจ', nameEn: 'Business Economics', code: 'ECON', facultyId: facMS.id } }),
  ])
  const [deptHOSP, deptCOM] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาการจัดการโรงแรมและการท่องเที่ยว', nameEn: 'Hotel and Tourism Management', code: 'HOSP', facultyId: facMS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชานิเทศศาสตร์', nameEn: 'Communication Arts', code: 'COM', facultyId: facMS.id } }),
  ])

  const [deptAGR, deptANS, deptFISH, deptFT, deptVET, deptVN] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาเกษตรศาสตร์', nameEn: 'Agriculture', code: 'AGR', facultyId: facAGR.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาสัตวศาสตร์', nameEn: 'Animal Science', code: 'ANS', facultyId: facAGR.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาประมง', nameEn: 'Fisheries', code: 'FISH', facultyId: facAGR.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาเทคโนโลยีการอาหาร', nameEn: 'Food Technology', code: 'FT', facultyId: facAGR.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาเทคนิคการสัตวแพทย์', nameEn: 'Veterinary Technology', code: 'VET', facultyId: facAGR.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาการพยาบาลสัตว์', nameEn: 'Veterinary Nursing', code: 'VN', facultyId: facAGR.id } }),
  ])

  const [deptCPE, deptIEM, deptEET, deptIPT] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชาวิศวกรรมคอมพิวเตอร์', nameEn: 'Computer Engineering', code: 'CPE', facultyId: facENG.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาวิศวกรรมการจัดการ', nameEn: 'Engineering Management', code: 'IEM', facultyId: facENG.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาเทคโนโลยีไฟฟ้า', nameEn: 'Electrical Technology', code: 'EET', facultyId: facENG.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชาเทคโนโลยีอุตสาหกรรมการผลิต', nameEn: 'Industrial Production Technology', code: 'IPT', facultyId: facENG.id } }),
  ])

  const [deptLAW] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชานิติศาสตร์', nameEn: 'Law', code: 'LAW', facultyId: facLAW.id } }),
  ])

  const [deptPOL, deptPA] = await Promise.all([
    prisma.department.create({ data: { name: 'สาขาวิชารัฐศาสตร์', nameEn: 'Political Science', code: 'POL', facultyId: facPS.id } }),
    prisma.department.create({ data: { name: 'สาขาวิชารัฐประศาสนศาสตร์', nameEn: 'Public Administration', code: 'PA', facultyId: facPS.id } }),
  ])

  // ─── ผู้ใช้งาน: Admin และ Executive ──────────────────────────
  const userAdmin = await prisma.user.create({
    data: { email: 'admin@rmu.ac.th', name: 'ผู้ดูแลระบบ', role: 'ADMIN' },
  })
  const userDean = await prisma.user.create({
    data: { email: 'dean.fst@rmu.ac.th', name: 'รศ.ดร. สมศักดิ์ วิทยาการ', role: 'EXECUTIVE_DEAN', facultyId: facST.id },
  })
  const userHead = await prisma.user.create({
    data: { email: 'head.it@rmu.ac.th', name: 'ผศ.ดร. วิไล เทคโนโลยี', role: 'EXECUTIVE_HEAD', departmentId: deptIT.id },
  })

  // ─── อาจารย์ (10 คน — สร้าง User ควบคู่) ────────────────────
  const instructorData = [
    { name: 'ผศ.ดร. วิชัย สมาร์ท',     title: 'ผศ.ดร.', email: 'wichai@rmu.ac.th',    departmentId: deptCS.id   },
    { name: 'อ.ดร. สุดา เก่งกาจ',       title: 'อ.ดร.',  email: 'suda@rmu.ac.th',      departmentId: deptIT.id   },
    { name: 'รศ.ดร. ประเสริฐ มั่นคง',   title: 'รศ.ดร.', email: 'prasert@rmu.ac.th',   departmentId: deptCPE.id  },
    { name: 'อ. จิรา พัฒนา',            title: 'อ.',     email: 'jira@rmu.ac.th',       departmentId: deptMGT.id  },
    { name: 'ผศ. นภา สุขใจ',            title: 'ผศ.',    email: 'napa@rmu.ac.th',       departmentId: deptMATH.id },
    { name: 'อ.ดร. ธีรวุฒิ รักดี',      title: 'อ.ดร.',  email: 'teerawut@rmu.ac.th',   departmentId: deptACC.id  },
    { name: 'รศ. สุพรรณี ศรีทอง',       title: 'รศ.',    email: 'supannee@rmu.ac.th',   departmentId: deptENG.id  },
    { name: 'ผศ.ดร. กิตติ วงศ์วิวัฒน์', title: 'ผศ.ดร.', email: 'kitti@rmu.ac.th',      departmentId: deptAGR.id  },
    { name: 'อ. มานพ ดีงาม',             title: 'อ.',     email: 'manop@rmu.ac.th',      departmentId: deptLAW.id  },
    { name: 'ผศ. รัตนา เจริญสุข',        title: 'ผศ.',    email: 'rattana@rmu.ac.th',    departmentId: deptPA.id   },
  ]

  const instructors = await Promise.all(
    instructorData.map(async (d) => {
      const user = await prisma.user.create({
        data: { email: d.email, name: d.name, role: 'TEACHER', departmentId: d.departmentId },
      })
      return prisma.instructor.create({
        data: { name: d.name, title: d.title, email: d.email, departmentId: d.departmentId, userId: user.id },
      })
    })
  )

  const [inst1, inst2, inst3, inst4, inst5, inst6, inst7, inst8, inst9, inst10] = instructors

  // ─── นักศึกษา (10 คน — สร้าง User ควบคู่) ───────────────────
  const studentData = [
    { studentId: '6501001', name: 'สมชาย ใจดี',        email: 'somchai@student.rmu.ac.th',   userEmail: 'somchai@rmu.ac.th',   departmentId: deptCS.id   },
    { studentId: '6501002', name: 'สมหญิง รักเรียน',    email: 'somying@student.rmu.ac.th',   userEmail: 'somying@rmu.ac.th',   departmentId: deptIT.id   },
    { studentId: '6501003', name: 'ธนาวัฒน์ แสงทอง',   email: 'thanawat@student.rmu.ac.th',  userEmail: 'thanawat@rmu.ac.th',  departmentId: deptCPE.id  },
    { studentId: '6501004', name: 'พิมพ์ใจ วงศ์งาม',   email: 'pimjai@student.rmu.ac.th',    userEmail: 'pimjai@rmu.ac.th',    departmentId: deptMGT.id  },
    { studentId: '6501005', name: 'ณัฐพล ศรีสวัสดิ์',  email: 'nattapon@student.rmu.ac.th',  userEmail: 'nattapon@rmu.ac.th',  departmentId: deptACC.id  },
    { studentId: '6501006', name: 'กมลวรรณ ทองดี',      email: 'kamonwan@student.rmu.ac.th',  userEmail: 'kamonwan@rmu.ac.th',  departmentId: deptENG.id  },
    { studentId: '6501007', name: 'อภิชาติ พรหมบุตร',  email: 'apichat@student.rmu.ac.th',   userEmail: 'apichat@rmu.ac.th',   departmentId: deptAGR.id  },
    { studentId: '6501008', name: 'วรรณา ลือชา',        email: 'wanna@student.rmu.ac.th',     userEmail: 'wanna@rmu.ac.th',     departmentId: deptLAW.id  },
    { studentId: '6501009', name: 'ปิยะ สกุลทอง',       email: 'piya@student.rmu.ac.th',      userEmail: 'piya@rmu.ac.th',      departmentId: deptPA.id   },
    { studentId: '6501010', name: 'นลินี อุดมศักดิ์',   email: 'nalinee@student.rmu.ac.th',   userEmail: 'nalinee@rmu.ac.th',   departmentId: deptMATH.id },
  ]

  const students = await Promise.all(
    studentData.map(async (d) => {
      const user = await prisma.user.create({
        data: { email: d.userEmail, name: d.name, role: 'STUDENT', departmentId: d.departmentId },
      })
      return prisma.student.create({
        data: { studentId: d.studentId, name: d.name, email: d.email, departmentId: d.departmentId, userId: user.id },
      })
    })
  )

  console.log('✅ ข้อมูลพื้นฐาน: 8 คณะ, 43 สาขา, 10 อาจารย์, 10 นักศึกษา, 3 ผู้บริหาร/แอดมิน')

  // ─── รายวิชา ──────────────────────────────────────────────────
  const subjects = await Promise.all([
    prisma.subject.create({ data: { code: 'CS101',   name: 'การเขียนโปรแกรมเบื้องต้น', nameEn: 'Introduction to Programming',  credits: 3, departmentId: deptCS.id   } }),
    prisma.subject.create({ data: { code: 'IT201',   name: 'ระบบฐานข้อมูล',            nameEn: 'Database Systems',             credits: 3, departmentId: deptIT.id   } }),
    prisma.subject.create({ data: { code: 'MATH101', name: 'แคลคูลัส 1',               nameEn: 'Calculus 1',                   credits: 3, departmentId: deptMATH.id } }),
    prisma.subject.create({ data: { code: 'CPE201',  name: 'วิศวกรรมซอฟต์แวร์',       nameEn: 'Software Engineering',         credits: 3, departmentId: deptCPE.id  } }),
    prisma.subject.create({ data: { code: 'EET101',  name: 'วงจรไฟฟ้า',                nameEn: 'Electric Circuits',            credits: 3, departmentId: deptEET.id  } }),
    prisma.subject.create({ data: { code: 'ACC101',  name: 'การบัญชีการเงิน',          nameEn: 'Financial Accounting',         credits: 3, departmentId: deptACC.id  } }),
    prisma.subject.create({ data: { code: 'MGT201',  name: 'หลักการจัดการ',            nameEn: 'Principles of Management',     credits: 3, departmentId: deptMGT.id  } }),
    prisma.subject.create({ data: { code: 'ENG101',  name: 'ภาษาอังกฤษเพื่อการสื่อสาร', nameEn: 'English for Communication',  credits: 3, departmentId: deptENG.id  } }),
    prisma.subject.create({ data: { code: 'AGR101',  name: 'หลักการเกษตร',             nameEn: 'Principles of Agriculture',    credits: 3, departmentId: deptAGR.id  } }),
    prisma.subject.create({ data: { code: 'PA201',   name: 'การบริหารภาครัฐ',          nameEn: 'Public Administration',        credits: 3, departmentId: deptPA.id   } }),
    prisma.subject.create({ data: { code: 'LAW101',  name: 'กฎหมายแพ่งและพาณิชย์',    nameEn: 'Civil and Commercial Law',     credits: 3, departmentId: deptLAW.id  } }),
  ])

  const [subCS101, subIT201, subMATH101, subCPE201, subEET101, subACC101, subMGT201, subENG101, subAGR101, subPA201, subLAW101] = subjects

  // ─── ภาคการศึกษา ─────────────────────────────────────────────
  const [term1, term2] = await Promise.all([
    prisma.term.create({ data: { year: 2568, semester: 1, label: '1/2568', isActive: false } }),
    prisma.term.create({ data: { year: 2568, semester: 2, label: '2/2568', isActive: true  } }),
  ])

  // ─── การมอบหมายการสอน ─────────────────────────────────────────
  const assignmentsT1 = await Promise.all([
    prisma.teachingAssignment.create({ data: { subjectId: subCS101.id,   instructorId: inst1.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subIT201.id,   instructorId: inst2.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subMATH101.id, instructorId: inst5.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subCPE201.id,  instructorId: inst3.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subEET101.id,  instructorId: inst3.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subACC101.id,  instructorId: inst6.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subMGT201.id,  instructorId: inst4.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subENG101.id,  instructorId: inst7.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subAGR101.id,  instructorId: inst8.id,  termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subPA201.id,   instructorId: inst10.id, termId: term1.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subLAW101.id,  instructorId: inst9.id,  termId: term1.id } }),
  ])

  const assignmentsT2 = await Promise.all([
    prisma.teachingAssignment.create({ data: { subjectId: subCS101.id,   instructorId: inst1.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subIT201.id,   instructorId: inst2.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subMATH101.id, instructorId: inst5.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subCPE201.id,  instructorId: inst3.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subEET101.id,  instructorId: inst3.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subACC101.id,  instructorId: inst6.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subMGT201.id,  instructorId: inst4.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subENG101.id,  instructorId: inst7.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subAGR101.id,  instructorId: inst8.id,  termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subPA201.id,   instructorId: inst10.id, termId: term2.id } }),
    prisma.teachingAssignment.create({ data: { subjectId: subLAW101.id,  instructorId: inst9.id,  termId: term2.id } }),
  ])

  // ─── การลงทะเบียน (Enrollment) ────────────────────────────────
  // นักศึกษาทุกคนลงทะเบียนทุกวิชาในภาค 2/2568
  for (const student of students) {
    for (const assignment of assignmentsT2) {
      await prisma.enrollment.create({
        data: { studentId: student.id, teachingAssignmentId: assignment.id },
      })
    }
  }
  console.log(`✅ การลงทะเบียน: ${students.length * assignmentsT2.length} รายการ`)

  // ─── แบบประเมิน ───────────────────────────────────────────────
  const form = await prisma.evaluationForm.create({
    data: {
      title: 'แบบประเมินการสอนของอาจารย์',
      description: 'แบบประเมินสำหรับนักศึกษาประเมินประสิทธิภาพการสอนของอาจารย์ผู้สอนในแต่ละภาคการศึกษา',
      isActive: true,
    },
  })

  const sec1 = await prisma.section.create({ data: { title: 'ด้านการสอนและการถ่ายทอดความรู้', order: 1, formId: form.id } })
  const sec1Questions = await Promise.all([
    prisma.question.create({ data: { text: 'อาจารย์มีการเตรียมการสอนที่ดี มีความพร้อมในการสอน', type: 'rating', order: 1, sectionId: sec1.id } }),
    prisma.question.create({ data: { text: 'อาจารย์อธิบายเนื้อหาได้ชัดเจน เข้าใจง่าย', type: 'rating', order: 2, sectionId: sec1.id } }),
    prisma.question.create({ data: { text: 'อาจารย์ใช้สื่อการสอนที่เหมาะสมและหลากหลาย', type: 'rating', order: 3, sectionId: sec1.id } }),
    prisma.question.create({ data: { text: 'อาจารย์เชื่อมโยงเนื้อหากับการใช้งานจริงได้ดี', type: 'rating', order: 4, sectionId: sec1.id } }),
  ])

  const sec2 = await prisma.section.create({ data: { title: 'ด้านการมีส่วนร่วมและการกระตุ้นผู้เรียน', order: 2, formId: form.id } })
  const sec2Questions = await Promise.all([
    prisma.question.create({ data: { text: 'อาจารย์กระตุ้นให้นักศึกษามีส่วนร่วมในชั้นเรียน', type: 'rating', order: 1, sectionId: sec2.id } }),
    prisma.question.create({ data: { text: 'อาจารย์เปิดโอกาสให้นักศึกษาซักถามและแสดงความคิดเห็น', type: 'rating', order: 2, sectionId: sec2.id } }),
    prisma.question.create({ data: { text: 'อาจารย์ให้ข้อมูลป้อนกลับที่เป็นประโยชน์ต่อการพัฒนา', type: 'rating', order: 3, sectionId: sec2.id } }),
  ])

  const sec3 = await prisma.section.create({ data: { title: 'ด้านคุณธรรม จริยธรรม และความรับผิดชอบ', order: 3, formId: form.id } })
  const sec3Questions = await Promise.all([
    prisma.question.create({ data: { text: 'อาจารย์มีความรับผิดชอบ ตรงต่อเวลาในการสอน', type: 'rating', order: 1, sectionId: sec3.id } }),
    prisma.question.create({ data: { text: 'อาจารย์แสดงความยุติธรรมต่อนักศึกษาทุกคน', type: 'rating', order: 2, sectionId: sec3.id } }),
    prisma.question.create({ data: { text: 'อาจารย์เป็นแบบอย่างที่ดีด้านคุณธรรมและจรรยาบรรณ', type: 'rating', order: 3, sectionId: sec3.id } }),
  ])

  const sec4 = await prisma.section.create({ data: { title: 'ด้านภาพรวมและข้อเสนอแนะ', order: 4, formId: form.id } })
  const sec4Questions = await Promise.all([
    prisma.question.create({ data: { text: 'ภาพรวมความพึงพอใจต่อการสอนของอาจารย์', type: 'rating', order: 1, sectionId: sec4.id } }),
    prisma.question.create({ data: { text: 'ข้อเสนอแนะเพิ่มเติม (ถ้ามี)', type: 'text', order: 2, required: false, sectionId: sec4.id } }),
  ])

  const allRatingQuestions = [...sec1Questions, ...sec2Questions, ...sec3Questions, sec4Questions[0]]
  const textQuestion = sec4Questions[1]
  console.log('✅ แบบประเมิน 4 ด้าน 11 ข้อ สร้างเรียบร้อย')

  // ─── ข้อมูลการประเมิน ─────────────────────────────────────────
  const comments = [
    'อาจารย์สอนดีมากครับ เข้าใจง่าย',
    'ชอบวิธีการสอนของอาจารย์มาก',
    'อาจารย์ให้คำแนะนำที่เป็นประโยชน์',
    'เนื้อหาน่าสนใจ อาจารย์มีความรู้ดีมาก',
    'อยากให้มีเวลาฝึกปฏิบัติมากขึ้น',
    'อาจารย์ใจดี พร้อมให้คำปรึกษาเสมอ',
    null, null, null,
  ]

  // ภาค 1/2568 — นักศึกษาทุกคนประเมินครบ
  let t1Count = 0
  for (const student of students) {
    for (const assignment of assignmentsT1) {
      const response = await prisma.response.create({
        data: { studentId: student.id, teachingAssignmentId: assignment.id, formId: form.id, termId: term1.id },
      })
      t1Count++
      for (const q of allRatingQuestions) {
        await prisma.answer.create({ data: { responseId: response.id, questionId: q.id, valueInt: randomInt(3, 5) } })
      }
      const comment = comments[randomInt(0, comments.length - 1)]
      if (comment) await prisma.answer.create({ data: { responseId: response.id, questionId: textQuestion.id, valueText: comment } })
    }
  }
  console.log(`✅ ภาค 1/2568: ${t1Count} การประเมิน`)

  // ภาค 2/2568 — นักศึกษา index 1-8 ประเมินแล้ว / index 0 (สมชาย 6501001) ยังไม่ประเมิน
  let t2Count = 0
  for (const student of students.slice(1, 9)) {
    for (const assignment of assignmentsT2) {
      const response = await prisma.response.create({
        data: { studentId: student.id, teachingAssignmentId: assignment.id, formId: form.id, termId: term2.id },
      })
      t2Count++
      for (const q of allRatingQuestions) {
        await prisma.answer.create({ data: { responseId: response.id, questionId: q.id, valueInt: randomInt(3, 5) } })
      }
      const comment = comments[randomInt(0, comments.length - 1)]
      if (comment) await prisma.answer.create({ data: { responseId: response.id, questionId: textQuestion.id, valueText: comment } })
    }
  }
  console.log(`✅ ภาค 2/2568: ${t2Count} การประเมิน`)

  // ─── สรุปคะแนนอาจารย์ ────────────────────────────────────────
  for (const instructor of instructors) {
    for (const term of [term1, term2]) {
      const responses = await prisma.response.findMany({
        where: { termId: term.id, teachingAssignment: { instructorId: instructor.id } },
        include: { answers: { where: { question: { type: 'rating' } }, include: { question: true } } },
      })
      if (responses.length === 0) continue
      let totalScore = 0, totalAnswers = 0
      for (const resp of responses)
        for (const ans of resp.answers)
          if (ans.valueInt !== null) { totalScore += ans.valueInt; totalAnswers++ }
      const avgScore = totalAnswers > 0 ? Math.round((totalScore / totalAnswers) * 100) / 100 : 0
      await prisma.instructorEvaluationSummary.upsert({
        where: { instructorId_termId: { instructorId: instructor.id, termId: term.id } },
        update: { avgScore, responseCount: responses.length },
        create: { instructorId: instructor.id, termId: term.id, avgScore, responseCount: responses.length },
      })
    }
  }

  console.log('✅ สรุปคะแนนอาจารย์เสร็จสิ้น')
  console.log(`🎉 Seed สำเร็จ! รวม ${t1Count + t2Count} การประเมิน`)
  console.log('')
  console.log('📧 บัญชีผู้ใช้สำหรับทดสอบ:')
  console.log('  ADMIN:          admin@rmu.ac.th')
  console.log('  คณบดี FST:      dean.fst@rmu.ac.th')
  console.log('  หัวหน้าสาขา IT: head.it@rmu.ac.th')
  console.log('  อาจารย์ (CS):   wichai@rmu.ac.th')
  console.log('  อาจารย์ (IT):   suda@rmu.ac.th')
  console.log('  นักศึกษา (CS):  somchai@rmu.ac.th')
  console.log('  นักศึกษา (IT):  somying@rmu.ac.th')
}

main()
  .catch((e) => { console.error('❌ Seed ล้มเหลว:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
