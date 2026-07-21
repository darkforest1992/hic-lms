import React, { useState, useMemo, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { 
  Users, GraduationCap, UserCheck, Search, Plus, Edit, Trash2, Lock, LogOut, 
  User, Shield, BookOpen, CheckCircle, AlertCircle, Menu, X, Key, Filter, 
  Mail, Phone, Briefcase, Calendar, Layers, Award, ClipboardList, ChevronRight, 
  Download, Upload, Printer
} from 'lucide-react';

// === KẾT NỐI FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyAWXxyVfseHCDUWOUcZjE2mDFEwOOR5xdc",
  authDomain: "hic-lms-portal.firebaseapp.com",
  projectId: "hic-lms-portal",
  storageBucket: "hic-lms-portal.firebasestorage.app",
  messagingSenderId: "496254550829",
  appId: "1:496254550829:web:e971d89d78025e197089a4",
  measurementId: "G-S92GK56QK3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === DỮ LIỆU MẪU ĐỂ SEED VÀO FIREBASE NẾU TRỐNG ===
const INITIAL_COURSES = [
  { id: 'KH001', name: 'Công nghệ thông tin' },
  { id: 'KH002', name: 'Chăm sóc sắc đẹp' },
  { id: 'KH003', name: 'Kỹ thuật pha chế đồ uống' },
  { id: 'KH004', name: 'Kỹ thuật chế biến món ăn' },
  { id: 'KH005', name: 'Hướng dẫn du lịch' },
  { id: 'KH006', name: 'Kỹ thuật làm bánh' },
  { id: 'KH007', name: 'May thời trang' },
  { id: 'KH008', name: 'Kỹ thuật máy lạnh và điều hoà không khí' },
  { id: 'KH009', name: 'Tạo mẫu và chăm sóc sắc đẹp' },
  { id: 'KH010', name: 'Kỹ thuật pha chế và phục vụ đồ uống' },
  { id: 'KH011', name: 'Tiếng Nhật' },
  { id: 'KH012', name: 'Tiếng Trung Quốc' }
];

const INITIAL_SUBJECTS = [
  { id: 'MH01', name: 'Tiếng Anh', credits: 3, hours: 90, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH02', name: 'Tin học', credits: 2, hours: 45, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH03', name: 'Giáo dục chính trị', credits: 2, hours: 30, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH04', name: 'Pháp luật', credits: 1, hours: 15, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH05', name: 'Giáo dục QP-AN', credits: 2, hours: 45, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH06', name: 'Giáo dục Thể chất', credits: 1, hours: 30, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH07', name: 'Kỹ năng làm việc nhóm', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH08', name: 'Lập trình cơ bản', credits: 2, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH09', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH10', name: 'Cơ sở dữ liệu', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' }
];

const INITIAL_CLASSES = [
  { id: 'LH001', name: 'Kỹ thuật chế biến món ăn K15', courseId: 'KH004', major: 'Kỹ thuật chế biến món ăn', teacherId: 'GV004', startDate: '2026-02-15', endDate: '2026-06-30', location: 'Cơ sở chính - HIC', quota: 40, term: 'Học kỳ I' },
  { id: 'LH002', name: 'Lập trình ứng dụng CNTT-K15', courseId: 'KH001', major: 'Công nghệ thông tin', teacherId: 'GV001', startDate: '2026-02-20', endDate: '2026-06-25', location: 'Tòa nhà Công nghệ cao - HIC', quota: 45, term: 'Học kỳ I' }
];

const INITIAL_STUDENTS = [
  { id: 'HV001', name: 'Nguyễn Văn Anh', dob: '2002-05-15', gender: 'Nam', cccd: '012345678912', phone: '0912345678', email: 'vananh.nguyen@gmail.com', status: 'Đang học', class: 'CNTT-K15', major: 'Công nghệ thông tin' },
  { id: 'HV002', name: 'Trần Thị Bình', dob: '2001-09-20', gender: 'Nữ', cccd: '012345678913', phone: '0987654321', email: 'thibinh.tran@gmail.com', status: 'Đang học', class: 'CBMA-K15', major: 'Kỹ thuật chế biến món ăn' }
];

const INITIAL_TEACHERS = [
  { id: 'GV001', name: 'PGS. TS. Nguyễn Tiến Dũng', specialty: 'Trí tuệ nhân tạo & Học máy', department: 'Khoa Kỹ thuật - Công nghệ', phone: '0911223344', email: 'dung.nt@tms-edu.vn', degree: 'Phó Giáo sư, Tiến sĩ' },
  { id: 'GV002', name: 'TS. Lê Thị Hoài', specialty: 'Ngôn ngữ học ứng dụng', department: 'Khoa Ngôn ngữ', phone: '0922334455', email: 'hoai.lt@tms-edu.vn', degree: 'Tiến sĩ' }
];

const USERS_ACCOUNTS = [
  { username: 'admin', password: '123', name: 'Superadmin-HIC (Admin)', role: 'admin', email: 'admin@tms-edu.vn' },
  { username: 'cbdt', password: '123', name: 'Nguyễn Yến Đường (Cán bộ)', role: 'staff', email: 'minh.nt@tms-edu.vn' }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // States dữ liệu từ Firebase
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [accounts, setAccounts] = useState([]);

  // Bộ lọc
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilterStatus, setStudentFilterStatus] = useState('All');
  const [studentFilterMajor, setStudentFilterMajor] = useState('Công nghệ thông tin');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherFilterDept, setTeacherFilterDept] = useState('All');
  const [classFilterMajor, setClassFilterMajor] = useState('All');
  const [classSearch, setClassSearch] = useState('');
  
  // Bổ sung State tìm kiếm cho Môn học
  const [subjectSearch, setSubjectSearch] = useState('');
  
  const [selectedMajorForGrades, setSelectedMajorForGrades] = useState('Công nghệ thông tin');
  const [selectedClassIdForAttendance, setSelectedClassIdForAttendance] = useState('');
  const [gradeSearchText, setGradeSearchText] = useState('');
  const [gradeViewMode, setGradeViewMode] = useState('edit');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentFormMode, setStudentFormMode] = useState('add');
  const [currentStudentData, setCurrentStudentData] = useState({ id: '', name: '', dob: '', gender: 'Nam', cccd: '', phone: '', email: '', status: 'Đang học', class: 'CNTT-K15', major: 'Công nghệ thông tin', password: '123' });

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [teacherFormMode, setTeacherFormMode] = useState('add');
  const [currentTeacherData, setCurrentTeacherData] = useState({ id: '', name: '', specialty: '', department: 'Khoa Kỹ thuật - Công nghệ', phone: '', email: '', degree: 'Thạc sĩ', password: '123' });

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classFormMode, setClassFormMode] = useState('add');
  const [currentClassData, setCurrentClassData] = useState({ id: '', name: '', courseId: 'KH001', major: 'Công nghệ thông tin', teacherId: '', startDate: '', endDate: '', location: '', quota: 40, term: 'Học kỳ I' });

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectFormMode, setSubjectFormMode] = useState('add');
  const [currentSubjectData, setCurrentSubjectData] = useState({ id: '', name: '', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' });

  const [isGradeEditModalOpen, setIsGradeEditModalOpen] = useState(false);
  const [studentIdForGradeEdit, setStudentIdForGradeEdit] = useState('');
  const [tempGradeEditScores, setTempGradeEditScores] = useState({});

  const [isChangePassModalOpen, setIsChangePassModalOpen] = useState(false);
  const [changePassForm, setChangePassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changePassError, setChangePassError] = useState('');

  const [isEnrollStudentModalOpen, setIsEnrollStudentModalOpen] = useState(false);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [newScheduleForm, setNewScheduleForm] = useState({ date: '', topic: '' });
  const [activeScheduleIdForAttendance, setActiveScheduleIdForAttendance] = useState(null);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  useEffect(() => {
    // 1. Đồng bộ Accounts (Bao gồm dữ liệu tĩnh và dữ liệu động)
    const unsubAccounts = onSnapshot(collection(db, 'accounts'), (snap) => {
      if (snap.empty) {
        // Seed initial accounts
        const batch = writeBatch(db);
        USERS_ACCOUNTS.forEach(acc => {
          batch.set(doc(collection(db, 'accounts'), acc.username), acc);
        });
        batch.commit();
      } else {
        setAccounts(snap.docs.map(d => d.data()));
      }
    });

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      setStudents(snap.docs.map(d => d.data()));
    });
    
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snap) => {
      setTeachers(snap.docs.map(d => d.data()));
    });
    
    const unsubClasses = onSnapshot(collection(db, 'classes'), (snap) => {
      const cls = snap.docs.map(d => d.data());
      setClasses(cls);
      if (cls.length > 0 && !selectedClassIdForAttendance) {
        setSelectedClassIdForAttendance(cls[0].id);
      }
    });

    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      if (snap.empty) {
        // Tự động Seed môn học nếu trống
        const batch = writeBatch(db);
        INITIAL_SUBJECTS.forEach(sub => {
          batch.set(doc(collection(db, 'subjects'), sub.id), sub);
        });
        batch.commit();
      } else {
        setSubjects(snap.docs.map(d => d.data()));
      }
    });

    const unsubGrades = onSnapshot(collection(db, 'grades'), (snap) => {
      setGrades(snap.docs.map(d => {
        const data = d.data();
        data.id = d.id;
        return data;
      }));
    });

    const unsubEnrollments = onSnapshot(collection(db, 'enrollments'), (snap) => {
      setEnrollments(snap.docs.map(d => {
        const data = d.data();
        data.id = d.id;
        return data;
      }));
    });

    const unsubSchedules = onSnapshot(collection(db, 'schedules'), (snap) => {
      setSchedules(snap.docs.map(d => d.data()));
    });

    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      let att = {};
      snap.docs.forEach(d => { att[d.id] = d.data(); });
      setAttendance(att);
    });

    // Auto-load SheetJS
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      unsubAccounts(); unsubStudents(); unsubTeachers(); unsubClasses(); 
      unsubSubjects(); unsubGrades(); unsubEnrollments(); unsubSchedules(); unsubAttendance();
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && currentUser?.role === 'student' && currentUser?.studentId) {
      const studentObj = students.find(s => s.id === currentUser.studentId);
      if (studentObj) {
        setSelectedMajorForGrades(studentObj.major);
        setGradeViewMode('scoreboard');
      }
    }
  }, [isLoggedIn, currentUser, students]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const triggerConfirm = (title, message, callback) => {
    setConfirmModal({
      isOpen: true, title, message,
      onConfirm: () => {
        callback();
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const convertScoreToGrade = (score10) => {
    if (score10 === undefined || score10 === null || score10 === '') return { letter: '-', scale4: 0, label: 'Chưa có điểm' };
    const score = parseFloat(score10);
    if (score >= 8.5) return { letter: 'A', scale4: 4, label: 'Xuất sắc' };
    if (score >= 7.0) return { letter: 'B', scale4: 3, label: 'Giỏi' };
    if (score >= 5.5) return { letter: 'C', scale4: 2, label: 'Khá' };
    if (score >= 4.0) return { letter: 'D', scale4: 1, label: 'Trung bình' };
    return { letter: 'F', scale4: 0, label: 'Yếu - Trượt' };
  };

  const getTermGPAOfStudent = (studentId, studentMajor, gradeList, subjectList) => {
    let totalCredits = 0;
    let weightedScale4Sum = 0;
    let totalScore10 = 0;
    let countSubjects10 = 0;

    const majorSubjects = subjectList.filter(s => s.major === studentMajor);
    
    majorSubjects.forEach(sub => {
      const nameLower = sub.name.toLowerCase();
      const isExcluded = nameLower.includes("thể chất") || nameLower.includes("quốc phòng") || nameLower.includes("qp-an");

      const grade = gradeList.find(g => g.studentId === studentId && g.subjectId === sub.id);
      if (grade && grade.score !== undefined && grade.score !== null && grade.score !== '') {
        const final10 = parseFloat(grade.score);
        const { scale4 } = convertScoreToGrade(final10);
        
        if (!isExcluded) {
          totalCredits += sub.credits;
          weightedScale4Sum += scale4 * sub.credits;
          totalScore10 += final10;
          countSubjects10 += 1;
        }
      }
    });

    if (totalCredits === 0) return { gpa: 0, avg10: 0, credits: 0, label: 'Không có điểm' };
    const gpa = Math.round((weightedScale4Sum / totalCredits) * 100) / 100;
    const avg10 = countSubjects10 > 0 ? (totalScore10 / countSubjects10).toFixed(1) : 0;
    
    let classification = 'Yếu';
    if (gpa >= 3.50) classification = 'Xuất sắc';
    else if (gpa >= 3.00) classification = 'Giỏi';
    else if (gpa >= 2.50) classification = 'Khá';
    else if (gpa >= 2.00) classification = 'Trung bình';

    return { gpa, avg10, credits: totalCredits, label: classification };
  };

  const hasAccess = (allowedRoles) => allowedRoles.includes(currentUser?.role);

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return { text: 'Quản trị viên', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'staff': return { text: 'Cán bộ đào tạo', color: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'teacher': return { text: 'Giảng viên', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'student': return { text: 'Học viên', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      default: return { text: 'Khách', color: 'bg-slate-100 text-slate-800' };
    }
  };

  // Auth Handling
  const handleLogin = (e) => {
    e.preventDefault();
    const user = accounts.find((u) => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user); setIsLoggedIn(true); setLoginError(''); setActiveTab('dashboard');
      showToast(`Chào mừng ${user.name} đến với HIC LMS!`, 'success');
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setCurrentUser(null); setLoginForm({ username: '', password: '' });
    showToast('Đăng xuất thành công!', 'info');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (changePassForm.oldPassword !== currentUser.password) return setChangePassError('Mật khẩu hiện tại không khớp.');
    if (changePassForm.newPassword.length < 3) return setChangePassError('Mật khẩu mới phải từ 3 ký tự.');
    if (changePassForm.newPassword !== changePassForm.confirmPassword) return setChangePassError('Nhập lại mật khẩu mới không chính xác.');

    try {
      const updatedUser = { ...currentUser, password: changePassForm.newPassword };
      await setDoc(doc(db, 'accounts', currentUser.username), updatedUser);
      setCurrentUser(updatedUser);
      setIsChangePassModalOpen(false);
      setChangePassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setChangePassError('');
      showToast('Đổi mật khẩu bảo mật thành công!', 'success');
    } catch(e) {
      showToast('Lỗi cập nhật mật khẩu!', 'error');
    }
  };

  const handleOpenSubjectModal = (mode, subject = null) => {
    setSubjectFormMode(mode);
    if (mode === 'edit' && subject) {
      setCurrentSubjectData({ ...subject });
    } else {
      setCurrentSubjectData({ id: '', name: '', credits: 3, hours: 45, major: studentFilterMajor, type: 'Môn học, mô đun chuyên môn' });
    }
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    try {
      if (subjectFormMode === 'add') {
        const isDuplicate = subjects.some(s => s.id === currentSubjectData.id && s.major === currentSubjectData.major);
        if (isDuplicate) return showToast('Mã môn học đã tồn tại trong chương trình ngành này!', 'error');
      }
      
      const docId = `${currentSubjectData.major}_${currentSubjectData.id}`.replace(/\s+/g, '');
      await setDoc(doc(db, 'subjects', docId), currentSubjectData);
      showToast(`Đã lưu thành công môn học "${currentSubjectData.name}"`, 'success');
      setIsSubjectModalOpen(false);
    } catch(err) {
      showToast('Lỗi lưu Firebase: ' + err.message, 'error');
    }
  };

  const handleDeleteSubject = (id, name, major) => {
    const isUsedInClasses = classes.some(c => c.subjectId === id && c.major === major);
    if (isUsedInClasses) return showToast(`Không thể xóa! Môn học "${name}" đang được dạy ở ít nhất một lớp học phần.`, 'error');

    triggerConfirm('Xóa môn học', `Xóa môn học "${name}" (${id}) thuộc ngành đào tạo ${major}?`, async () => {
      try {
        const docId = `${major}_${id}`.replace(/\s+/g, '');
        await deleteDoc(doc(db, 'subjects', docId));
        showToast(`Đã xóa thành công môn học "${name}".`, 'warning');
      } catch(err) {
        showToast('Lỗi xóa Firebase: ' + err.message, 'error');
      }
    });
  };

  const handleOpenStudentModal = (mode, student = null) => {
    setStudentFormMode(mode);
    if (mode === 'edit' && student) {
      const acc = accounts.find(a => a.username === student.id);
      setCurrentStudentData({ ...student, password: acc ? acc.password : '123' });
    } else {
      const lastIdNum = students.length > 0 ? Math.max(...students.map(s => parseInt(s.id.replace(/\D/g, '') || '0', 10))) : 0;
      setCurrentStudentData({ id: `HV${String(lastIdNum + 1).padStart(3, '0')}`, name: '', dob: '', gender: 'Nam', cccd: '', phone: '', email: '', status: 'Đang học', class: 'CNTT-K15', major: 'Công nghệ thông tin', password: '123' });
    }
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const associatedAccount = accounts.find(acc => acc.username === currentStudentData.id);
    if (associatedAccount && associatedAccount.role === 'admin' && currentUser.role !== 'admin') {
      return showToast('Không có quyền chỉnh sửa Quản trị viên (Admin)!', 'error');
    }

    try {
      const stData = { ...currentStudentData };
      delete stData.password; // không lưu pw vào collection students
      
      const accData = {
        username: currentStudentData.id,
        password: currentStudentData.password || '123',
        name: currentStudentData.name,
        role: 'student',
        email: currentStudentData.email || '',
        studentId: currentStudentData.id
      };

      await setDoc(doc(db, 'students', currentStudentData.id), stData);
      await setDoc(doc(db, 'accounts', currentStudentData.id), accData);
      
      showToast(`Lưu hồ sơ học viên ${currentStudentData.name} thành công.`, 'success');
      setIsStudentModalOpen(false);
    } catch(err) {
      showToast('Lỗi lưu Firebase: ' + err.message, 'error');
    }
  };

  const handleDeleteStudent = (id, name) => {
    triggerConfirm('Xóa Hồ sơ Học viên', `Xóa vĩnh viễn học viên ${name} (${id})?`, async () => {
      try {
        await deleteDoc(doc(db, 'students', id));
        await deleteDoc(doc(db, 'accounts', id));
        showToast(`Đã xóa hồ sơ học viên ${name}.`, 'warning');
      } catch(err) { showToast('Lỗi xóa Firebase.', 'error'); }
    });
  };

  const handleOpenTeacherModal = (mode, teacher = null) => {
    setTeacherFormMode(mode);
    if (mode === 'edit' && teacher) {
      const acc = accounts.find(a => a.username === teacher.id);
      setCurrentTeacherData({ ...teacher, password: acc ? acc.password : '123' });
    } else {
      const lastIdNum = teachers.length > 0 ? Math.max(...teachers.map(t => parseInt(t.id.replace(/\D/g, '') || '0', 10))) : 0;
      setCurrentTeacherData({ id: `GV${String(lastIdNum + 1).padStart(3, '0')}`, name: '', specialty: '', department: 'Khoa Kỹ thuật - Công nghệ', phone: '', email: '', degree: 'Thạc sĩ', password: '123' });
    }
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    try {
      const tData = { ...currentTeacherData };
      delete tData.password;
      
      const accData = {
        username: currentTeacherData.id,
        password: currentTeacherData.password || '123',
        name: currentTeacherData.name,
        role: 'teacher',
        email: currentTeacherData.email || '',
        teacherId: currentTeacherData.id
      };

      await setDoc(doc(db, 'teachers', currentTeacherData.id), tData);
      await setDoc(doc(db, 'accounts', currentTeacherData.id), accData);
      
      showToast(`Lưu hồ sơ giảng viên ${currentTeacherData.name} thành công.`, 'success');
      setIsTeacherModalOpen(false);
    } catch(err) { showToast('Lỗi lưu Firebase.', 'error'); }
  };

  const handleDeleteTeacher = (id, name) => {
    triggerConfirm('Xóa Hồ sơ Giáo viên', `Loại bỏ giáo viên ${name} (${id})?`, async () => {
      try {
        await deleteDoc(doc(db, 'teachers', id));
        await deleteDoc(doc(db, 'accounts', id));
        showToast(`Đã gỡ bỏ giáo viên ${name}.`, 'warning');
      } catch(err) { showToast('Lỗi xóa Firebase.', 'error'); }
    });
  };

  const handleOpenClassModal = (mode, cls = null) => {
    setClassFormMode(mode);
    if (mode === 'edit' && cls) {
      setCurrentClassData({ ...cls });
    } else {
      const lastIdNum = classes.length > 0 ? Math.max(...classes.map(c => parseInt(c.id.replace(/\D/g, '') || '0', 10))) : 0;
      setCurrentClassData({ id: `LH${String(lastIdNum + 1).padStart(3, '0')}`, name: '', courseId: 'KH001', major: 'Công nghệ thông tin', teacherId: teachers[0]?.id || 'GV001', startDate: '', endDate: '', location: '', quota: 40, term: 'Học kỳ I' });
    }
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'classes', currentClassData.id), currentClassData);
      showToast(`Lưu lớp học ${currentClassData.name} thành công.`, 'success');
      setIsClassModalOpen(false);
    } catch(err) { showToast('Lỗi lưu Firebase.', 'error'); }
  };

  const handleDeleteClass = (id, name) => {
    triggerConfirm('Hủy Lớp học', `Hủy lớp học ${name} (${id})?`, async () => {
      try {
        await deleteDoc(doc(db, 'classes', id));
        showToast(`Hủy hoàn toàn lớp học ${name}.`, 'warning');
      } catch(err) { showToast('Lỗi xóa Firebase.', 'error'); }
    });
  };

  // Grade CRUD
  const handleUpdateGradeDirectly = async (studentId, subjectId, val) => {
    const docId = `${studentId}_${subjectId}`;
    if (val === '') {
      try { await deleteDoc(doc(db, 'grades', docId)); showToast('Đã xóa điểm môn học.', 'info'); } catch(e){}
      return;
    }
    let numVal = parseFloat(val);
    if (isNaN(numVal) || numVal < 0 || numVal > 10) return showToast('Điểm số phải từ 0 đến 10!', 'error');
    
    try {
      await setDoc(doc(db, 'grades', docId), { studentId, subjectId, score: Math.round(numVal * 10) / 10 });
    } catch(e){ showToast('Lỗi cập nhật điểm.', 'error'); }
  };

  const handleSaveStudentGrades = async (e) => {
    e.preventDefault();
    const batch = writeBatch(db);
    Object.entries(tempGradeEditScores).forEach(([subId, scoreStr]) => {
      const docId = `${studentIdForGradeEdit}_${subId}`;
      const docRef = doc(db, 'grades', docId);
      if (scoreStr === '' || scoreStr === null) {
        batch.delete(docRef);
      } else {
        const numScore = parseFloat(scoreStr);
        if (!isNaN(numScore) && numScore >= 0 && numScore <= 10) {
          batch.set(docRef, { studentId: studentIdForGradeEdit, subjectId: subId, score: Math.round(numScore * 10) / 10 });
        }
      }
    });
    try {
      await batch.commit();
      setIsGradeEditModalOpen(false);
      showToast('Cập nhật toàn bộ điểm học viên thành công!', 'success');
    } catch(e) { showToast('Lỗi cập nhật điểm Firebase.', 'error'); }
  };

  const handleOpenGradeEditModal = (studentId) => {
    setStudentIdForGradeEdit(studentId);
    const studentGrades = {};
    subjectsOfSelectedMajorForGrades.forEach(sub => {
      const grade = grades.find(g => g.studentId === studentId && g.subjectId === sub.id);
      studentGrades[sub.id] = grade ? grade.score : '';
    });
    setTempGradeEditScores(studentGrades);
    setIsGradeEditModalOpen(true);
  };

  // --- TÍNH NĂNG NHẬP / XUẤT EXCEL TÍCH HỢP FIREBASE ---
  const downloadExcelTemplate = (type) => {
    if (!window.XLSX) return showToast('Trình duyệt đang tải thư viện Excel, vui lòng thử lại sau giây lát!', 'warning');
    let headers = [], sampleData = [], filename = '';

    if (type === 'students') {
      headers = [["Mã HV", "Họ Tên", "Ngày Sinh (YYYY-MM-DD)", "Giới Tính", "CCCD", "Điện Thoại", "Email", "Lớp", "Ngành", "Trạng Thái"]];
      sampleData = [["HV999", "Nguyễn Văn A", "2002-05-15", "Nam", "012345678912", "0909123456", "a@gmail.com", "CNTT-K15", "Công nghệ thông tin", "Đang học"]];
      filename = "Mau_Hoc_Vien.xlsx";
    } else if (type === 'classes') {
      headers = [["Mã Lớp", "Tên Lớp", "Ngành", "Mã GV", "Sĩ Số", "Địa Điểm", "Học Kỳ", "Bắt Đầu (YYYY-MM-DD)", "Kết Thúc (YYYY-MM-DD)"]];
      sampleData = [["LH999", "Lớp CNTT K15", "Công nghệ thông tin", "GV001", "40", "Cơ sở chính", "Học kỳ I", "2026-09-01", "2027-01-01"]];
      filename = "Mau_Lop_Hoc.xlsx";
    } else if (type === 'subjects') {
      headers = [["Mã Môn", "Tên Môn", "Loại Môn", "Tín Chỉ", "Giờ Học", "Ngành"]];
      sampleData = [["MH99", "Lập trình Web", "Môn học, mô đun chuyên môn", "3", "45", "Công nghệ thông tin"]];
      filename = "Mau_Mon_Hoc.xlsx";
    } else if (type === 'grades') {
      const majorSubjects = subjects.filter(s => s.major === selectedMajorForGrades);
      headers = [["Mã HV", "Họ Tên", ...majorSubjects.map(s => `${s.id} - ${s.name}`)]];
      sampleData = [["HV001", "Nguyễn Văn Anh", ...majorSubjects.map(() => "8.5")]];
      filename = `Mau_Diem_${selectedMajorForGrades}.xlsx`;
    }
    
    const ws = window.XLSX.utils.aoa_to_sheet([...headers, ...sampleData]);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Data");
    window.XLSX.writeFile(wb, filename);
    showToast('Tải file mẫu thành công!', 'success');
  };

  const handleExcelImport = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rawData.length < 2) return showToast('File trống hoặc không hợp lệ.', 'error');
        
        const batch = writeBatch(db);
        let count = 0;
        
        rawData.slice(1).forEach(row => {
          if (!row[0]) return;
          const id = String(row[0]).trim().toUpperCase();
          if (type === 'students') {
             const docRef = doc(db, 'students', id);
             batch.set(docRef, { id, name: String(row[1]||''), dob: String(row[2]||''), gender: String(row[3]||'Nam'), cccd: String(row[4]||''), phone: String(row[5]||''), email: String(row[6]||''), class: String(row[7]||''), major: String(row[8]||'Công nghệ thông tin'), status: String(row[9]||'Đang học') });
             const accRef = doc(db, 'accounts', id);
             batch.set(accRef, { username: id, password: '123', name: String(row[1]||''), role: 'student', email: String(row[6]||''), studentId: id });
             count++;
          } else if (type === 'classes') {
             const docRef = doc(db, 'classes', id);
             batch.set(docRef, { id, name: String(row[1]||''), major: String(row[2]||'Công nghệ thông tin'), teacherId: String(row[3]||'GV001'), quota: parseInt(row[4]||40), location: String(row[5]||''), term: String(row[6]||'Học kỳ I'), startDate: String(row[7]||''), endDate: String(row[8]||''), courseId: 'KH001' });
             count++;
          } else if (type === 'subjects') {
             const major = String(row[5]||'Công nghệ thông tin');
             const docId = `${major}_${id}`.replace(/\s+/g, '');
             const docRef = doc(db, 'subjects', docId);
             batch.set(docRef, { id, name: String(row[1]||''), type: String(row[2]||'Môn học, mô đun chuyên môn'), credits: parseFloat(row[3]||3), hours: parseInt(row[4]||45), major });
             count++;
          }
        });
        
        await batch.commit();
        showToast(`Nhập dữ liệu thành công ${count} bản ghi và đồng bộ lên Cloud!`, 'success');
      } catch (error) {
        showToast('Lỗi khi đọc file Excel hoặc đẩy lên Firebase.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleGradeExcelImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rawData.length < 2) return;
        
        const headers = rawData[0].map(h => String(h || '').trim());
        const idColIdx = 0;
        
        const majorSubjects = subjects.filter(s => s.major === selectedMajorForGrades);
        const colToSubj = {};
        headers.forEach((h, idx) => {
          if (idx === 0) return;
          const match = majorSubjects.find(s => h.includes(s.id) || h.includes(s.name));
          if (match) colToSubj[idx] = match.id;
        });
        
        const batch = writeBatch(db);
        let count = 0;
        
        rawData.slice(1).forEach(row => {
          const studentId = String(row[idColIdx]||'').trim().toUpperCase();
          if (!studentId) return;
          
          Object.entries(colToSubj).forEach(([colIdx, subjId]) => {
            const val = row[colIdx];
            if (val !== undefined && val !== null && val !== '') {
              const score = parseFloat(val);
              if (!isNaN(score) && score >= 0 && score <= 10) {
                const docRef = doc(db, 'grades', `${studentId}_${subjId}`);
                batch.set(docRef, { studentId, subjectId: subjId, score });
                count++;
              }
            }
          });
        });
        
        await batch.commit();
        showToast(`Đã đồng bộ ${count} đầu điểm trực tiếp lên Firebase!`, 'success');
      } catch (error) {
        showToast('Lỗi nhập điểm từ Excel.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Memoized filters
  const subjectsOfSelectedMajorForGrades = useMemo(() => subjects.filter(s => s.major === selectedMajorForGrades), [subjects, selectedMajorForGrades]);
  
  const studentsOfSelectedMajorForGrades = useMemo(() => {
    return students.filter(st => {
      if (currentUser?.role === 'student') return st.id === currentUser.studentId;
      return st.major === selectedMajorForGrades && (st.id.toLowerCase().includes(gradeSearchText.toLowerCase()) || st.name.toLowerCase().includes(gradeSearchText.toLowerCase()));
    });
  }, [students, selectedMajorForGrades, gradeSearchText, currentUser]);

  const schedulesOfSelectedClass = useMemo(() => schedules.filter(s => s.classId === selectedClassIdForAttendance), [schedules, selectedClassIdForAttendance]);

  const filteredStudents = useMemo(() => students.filter(st => {
    const matchesSearch = st.id.toLowerCase().includes(studentSearch.toLowerCase()) || st.name.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesStatus = studentFilterStatus === 'All' || st.status === studentFilterStatus;
    const matchesMajor = st.major === studentFilterMajor;
    return matchesSearch && matchesStatus && matchesMajor;
  }), [students, studentSearch, studentFilterStatus, studentFilterMajor]);

  const filteredTeachers = useMemo(() => teachers.filter(tc => {
    const matchesSearch = tc.id.toLowerCase().includes(teacherSearch.toLowerCase()) || tc.name.toLowerCase().includes(teacherSearch.toLowerCase());
    const matchesDept = teacherFilterDept === 'All' || tc.department === teacherFilterDept;
    return matchesSearch && matchesDept;
  }), [teachers, teacherSearch, teacherFilterDept]);

  const filteredClasses = useMemo(() => classes.filter(cl => {
    const matchesSearch = cl.id.toLowerCase().includes(classSearch.toLowerCase()) || cl.name.toLowerCase().includes(classSearch.toLowerCase());
    const matchesMajor = classFilterMajor === 'All' || cl.major === classFilterMajor;
    return matchesSearch && matchesMajor;
  }), [classes, classSearch, classFilterMajor]);

  // Bộ lọc Môn học với chức năng Tìm kiếm
  const filteredSubjects = useMemo(() => subjects.filter(s => {
    const matchesMajor = s.major === studentFilterMajor;
    const matchesSearch = s.id.toLowerCase().includes(subjectSearch.toLowerCase()) || s.name.toLowerCase().includes(subjectSearch.toLowerCase());
    return matchesMajor && matchesSearch;
  }), [subjects, studentFilterMajor, subjectSearch]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-slate-100 font-sans">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-650 text-white rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Hệ thống HIC LMS</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Đăng nhập tài khoản</p>
          </div>
          {loginError && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-750 text-xs rounded-xl flex items-center">
              <AlertCircle className="w-4 h-4 mr-2.5 shrink-0" /><span>{loginError}</span>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Tên đăng nhập</label>
              <input type="text" required value={loginForm.username} onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Nhập mã tài khoản" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Mật khẩu</label>
              <input type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Mật khẩu" />
            </div>
            <button type="submit" className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md">Đăng nhập</button>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Tài khoản demo (Click để điền)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {accounts.slice(0, 4).map((acc, idx) => (
                <button key={idx} onClick={() => { setLoginForm({ username: acc.username, password: acc.password }); setLoginError(''); }} className="p-2 border border-slate-150 hover:bg-indigo-50 rounded-lg text-left">
                  <span className="font-semibold block truncate text-slate-800">{acc.name}</span>
                  <span className="text-slate-500">ID: {acc.username} (pw: 123)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* Cảnh báo nổi */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-2xl shadow-xl border animate-bounce ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" /> : <AlertCircle className="w-5 h-5 mr-3 text-rose-500" />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-950 flex items-center"><AlertCircle className="w-5 h-5 text-rose-500 mr-2" /> {confirmModal.title}</h3>
            <p className="text-xs text-slate-600">{confirmModal.message}</p>
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })} className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl">Hủy bỏ</button>
              <button onClick={confirmModal.onConfirm} className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
        {/* SIDEBAR PC */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-850 shrink-0 h-full">
          <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white"><GraduationCap className="w-6 h-6" /></div>
            <div><h1 className="font-bold text-white text-base">HIC LMS</h1><span className="text-[10px] text-indigo-400 font-semibold uppercase">Cloud Database</span></div>
          </div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Layers className="w-4 h-4 mr-3" /> Dashboard</button>
            {hasAccess(['admin', 'staff']) && <button onClick={() => setActiveTab('students')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Users className="w-4 h-4 mr-3" /> Quản lý học viên</button>}
            {hasAccess(['admin', 'staff']) && <button onClick={() => setActiveTab('teachers')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'teachers' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><UserCheck className="w-4 h-4 mr-3" /> Hồ sơ giảng viên</button>}
            {hasAccess(['admin', 'staff']) && <button onClick={() => setActiveTab('classes')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'classes' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><ClipboardList className="w-4 h-4 mr-3" /> Quản lý lớp học</button>}
            <button onClick={() => setActiveTab('grades')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'grades' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Award className="w-4 h-4 mr-3" /> Quản lý điểm số</button>
            <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Calendar className="w-4 h-4 mr-3" /> Lịch học & Điểm danh</button>
            <button onClick={() => setActiveTab('curriculum')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><BookOpen className="w-4 h-4 mr-3" /> QL Môn học / Mô-đun</button>
          </nav>
          <div className="p-4 border-t border-slate-800 text-xs">
            <button onClick={() => setIsChangePassModalOpen(true)} className="w-full flex items-center p-2 hover:bg-slate-800 rounded-lg"><Key className="w-4 h-4 mr-2" /> Đổi mật khẩu</button>
            <button onClick={handleLogout} className="w-full flex items-center p-2 text-rose-400 hover:bg-rose-900 rounded-lg mt-1"><LogOut className="w-4 h-4 mr-2" /> Đăng xuất</button>
          </div>
        </aside>

        {/* HEADER MOBILE */}
        <header className="md:hidden bg-slate-900 text-slate-200 flex items-center justify-between p-4 shrink-0">
          <div className="font-bold text-white flex items-center"><GraduationCap className="w-5 h-5 mr-2" /> HIC LMS</div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 p-4 space-y-2 text-slate-300 absolute z-40 w-full top-16 shadow-lg border-b border-slate-800">
            <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className="w-full flex items-center p-3 rounded-xl text-sm"><Layers className="w-4 h-4 mr-3" /> Dashboard</button>
            <button onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }} className="w-full flex items-center p-3 rounded-xl text-sm"><Users className="w-4 h-4 mr-3" /> Học viên</button>
            <button onClick={() => { setActiveTab('classes'); setMobileMenuOpen(false); }} className="w-full flex items-center p-3 rounded-xl text-sm"><ClipboardList className="w-4 h-4 mr-3" /> Lớp học</button>
            <button onClick={() => { setActiveTab('grades'); setMobileMenuOpen(false); }} className="w-full flex items-center p-3 rounded-xl text-sm"><Award className="w-4 h-4 mr-3" /> Điểm số</button>
            <button onClick={() => { setActiveTab('curriculum'); setMobileMenuOpen(false); }} className="w-full flex items-center p-3 rounded-xl text-sm"><BookOpen className="w-4 h-4 mr-3" /> QL Môn học / Mô-đun</button>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full relative">
          
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {activeTab === 'dashboard' && 'Bảng điều khiển hệ thống'}
                {activeTab === 'students' && 'Quản lý Hồ sơ Học viên'}
                {activeTab === 'teachers' && 'Danh mục hồ sơ Giảng viên'}
                {activeTab === 'classes' && 'Đăng ký học & Lớp học phần'}
                {activeTab === 'grades' && 'Quản lý điểm số học tập tích lũy'}
                {activeTab === 'schedule' && 'Sổ quản lý Lịch học & Điểm danh'}
                {activeTab === 'curriculum' && 'Quản lý Môn học / Mô-đun'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">Trường Trung cấp Quốc tế Hà Nội (HIC)</p>
            </div>
            <div className="flex items-center space-x-3 bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-500">Người dùng: <strong className="text-indigo-800 uppercase">{currentUser?.name}</strong></span>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Users className="w-6 h-6" /></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Học viên</p><h3 className="text-2xl font-bold text-slate-800">{students.length}</h3></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><UserCheck className="w-6 h-6" /></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Giảng viên</p><h3 className="text-2xl font-bold text-slate-800">{teachers.length}</h3></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><ClipboardList className="w-6 h-6" /></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Lớp học phần</p><h3 className="text-2xl font-bold text-slate-800">{classes.length}</h3></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><BookOpen className="w-6 h-6" /></div>
                <div><p className="text-xs font-semibold text-slate-500 uppercase">Môn đào tạo</p><h3 className="text-2xl font-bold text-slate-800">{subjects.length}</h3></div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs" placeholder="Tìm kiếm tên, mã học viên..." />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={studentFilterMajor} onChange={(e) => setStudentFilterMajor(e.target.value)} className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5">
                    {INITIAL_COURSES.map(course => <option key={course.id} value={course.name}>{course.name}</option>)}
                  </select>
                  <button onClick={() => downloadExcelTemplate('students')} className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center transition-all">
                    <Download className="w-4 h-4 mr-1.5" /> File mẫu
                  </button>
                  {hasAccess(['admin', 'staff']) && (
                    <>
                      <label className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 text-xs font-bold rounded-xl flex items-center cursor-pointer transition-all">
                        <Upload className="w-4 h-4 mr-1.5" /> Nhập Excel
                        <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, 'students')} className="hidden" />
                      </label>
                      <button onClick={() => handleOpenStudentModal('add')} className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> Thêm
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="py-3 px-4">Mã HV</th>
                        <th className="py-3 px-4">Họ và Tên</th>
                        <th className="py-3 px-4">Ngày sinh</th>
                        <th className="py-3 px-4">Lớp / Ngành nghề</th>
                        <th className="py-3 px-4 text-center">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{st.id}</td>
                          <td className="py-3 px-4 font-semibold">{st.name}</td>
                          <td className="py-3 px-4">{st.dob} ({st.gender})</td>
                          <td className="py-3 px-4"><span className="block font-semibold text-indigo-600">{st.class}</span><span className="text-[10px] text-slate-400">{st.major}</span></td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">{st.status}</span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            {hasAccess(['admin', 'staff']) && (
                              <>
                                <button onClick={() => handleOpenStudentModal('edit', st)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteStudent(st.id, st.name)} className="p-1 text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input type="text" value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs" placeholder="Tìm kiếm giảng viên..." />
                </div>
                {hasAccess(['admin', 'staff']) && (
                  <button onClick={() => handleOpenTeacherModal('add')} className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center">
                    <Plus className="w-4 h-4 mr-1" /> Thêm GV
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTeachers.map((tc) => (
                  <div key={tc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">{tc.id}</span>
                        <span className="text-[10px] font-bold text-teal-600 uppercase">{tc.degree}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm">{tc.name}</h3>
                      <p className="text-xs text-slate-500 mb-2">{tc.department}</p>
                      <div className="text-xs text-slate-600 space-y-1">
                        <p><Briefcase className="w-3.5 h-3.5 inline mr-1 text-slate-400"/>{tc.specialty}</p>
                        <p><Mail className="w-3.5 h-3.5 inline mr-1 text-slate-400"/>{tc.email}</p>
                      </div>
                    </div>
                    {hasAccess(['admin', 'staff']) && (
                      <div className="flex justify-end space-x-1.5 pt-3 border-t border-slate-50 mt-3">
                        <button onClick={() => handleOpenTeacherModal('edit', tc)} className="p-1 text-indigo-600 rounded"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteTeacher(tc.id, tc.name)} className="p-1 text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input type="text" value={classSearch} onChange={(e) => setClassSearch(e.target.value)} className="w-full pl-9 py-2.5 border border-slate-200 rounded-xl text-xs" placeholder="Tìm lớp..." />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={classFilterMajor} onChange={(e) => setClassFilterMajor(e.target.value)} className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2.5">
                    <option value="All">Tất cả Ngành</option>
                    {INITIAL_COURSES.map(course => <option key={course.id} value={course.name}>{course.name}</option>)}
                  </select>
                  <button onClick={() => downloadExcelTemplate('classes')} className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center transition-all">
                    <Download className="w-4 h-4 mr-1.5" /> File mẫu
                  </button>
                  {hasAccess(['admin', 'staff']) && (
                    <>
                      <label className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 text-xs font-bold rounded-xl flex items-center cursor-pointer transition-all">
                        <Upload className="w-4 h-4 mr-1.5" /> Nhập Excel
                        <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, 'classes')} className="hidden" />
                      </label>
                      <button onClick={() => handleOpenClassModal('add')} className="py-2.5 px-4 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> Thêm Lớp
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="py-3 px-4 w-24">Mã lớp</th>
                        <th className="py-3 px-4">Tên lớp</th>
                        <th className="py-3 px-4">Khóa / Ngành</th>
                        <th className="py-3 px-4">Giáo viên phụ trách</th>
                        <th className="py-3 px-4 text-center">Bắt đầu</th>
                        <th className="py-3 px-4 text-center">Kết thúc</th>
                        <th className="py-3 px-4">Địa điểm đào tạo</th>
                        <th className="py-3 px-4 text-center">Sĩ số</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredClasses.map((cl) => {
                        const teacher = teachers.find(t => t.id === cl.teacherId);
                        const enrolledCount = enrollments.filter(e => e.classId === cl.id).length;
                        return (
                          <tr key={cl.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">{cl.id}</td>
                            <td className="py-3 px-4 font-bold text-slate-800">{cl.name}</td>
                            <td className="py-3 px-4 font-semibold text-slate-600">{cl.major}</td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{teacher?.name || 'Chưa PC'}</td>
                            <td className="py-3 px-4 text-center">{cl.startDate}</td>
                            <td className="py-3 px-4 text-center">{cl.endDate}</td>
                            <td className="py-3 px-4 font-medium text-indigo-650">{cl.location}</td>
                            <td className="py-3 px-4 text-center font-bold text-slate-950">{enrolledCount} / {cl.quota}</td>
                            <td className="py-3 px-4 text-right">
                              {hasAccess(['admin', 'staff']) && (
                                <>
                                  <button onClick={() => handleOpenClassModal('edit', cl)} className="p-1.5 text-indigo-600 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeleteClass(cl.id, cl.name)} className="p-1.5 text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Chọn ngành:</span>
                    <select disabled={currentUser.role === 'student'} value={selectedMajorForGrades} onChange={(e) => setSelectedMajorForGrades(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2.5">
                      {INITIAL_COURSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  {!hasAccess(['student']) && (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => setGradeViewMode('edit')} className={`flex-1 md:flex-none px-3 py-2 rounded-xl text-xs font-bold transition-all ${gradeViewMode === 'edit' ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Nhập điểm</button>
                      <button onClick={() => setGradeViewMode('scoreboard')} className={`flex-1 md:flex-none px-3 py-2 rounded-xl text-xs font-bold transition-all ${gradeViewMode === 'scoreboard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>Thống kê</button>
                    </div>
                  )}
                </div>

                {!hasAccess(['student']) && (
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-100 pt-4">
                    <div className="relative w-full md:max-w-md">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input type="text" value={gradeSearchText} onChange={(e) => setGradeSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs" placeholder="Tìm kiếm theo mã, họ tên học viên..." />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => downloadExcelTemplate('grades')} className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center transition-all">
                        <Download className="w-4 h-4 mr-1.5" /> Tải mẫu điểm
                      </button>
                      {hasAccess(['admin', 'staff', 'teacher']) && (
                        <label className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 text-xs font-bold rounded-xl flex items-center cursor-pointer transition-all">
                          <Upload className="w-4 h-4 mr-1.5" /> Nhập Excel
                          <input type="file" accept=".xlsx, .xls" onChange={handleGradeExcelImport} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {gradeViewMode === 'edit' ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto text-xs max-w-full">
                    <table className="w-full text-left table-fixed">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                          <th className="py-3 px-4 w-32 sticky left-0 bg-slate-50 z-10 border-r border-slate-150">Mã Học Viên</th>
                          <th className="py-3 px-4 w-48 sticky left-32 bg-slate-50 z-10 border-r border-slate-150">Họ và Tên</th>
                          {subjectsOfSelectedMajorForGrades.map(sub => (
                            <th key={sub.id} className="py-3 px-2 w-20 text-center border-r border-slate-100" title={sub.name}>
                              <span className="block font-bold text-slate-900">{sub.id}</span>
                              <span className="text-[9px] text-indigo-650">({sub.credits}T)</span>
                            </th>
                          ))}
                          <th className="py-3 px-2 w-24 text-center sticky right-24 bg-slate-50 z-10 border-l border-slate-150 font-bold text-emerald-700">TBC (Hệ 10)</th>
                          <th className="py-3 px-2 w-24 text-center sticky right-0 bg-slate-50 z-10 border-l border-slate-100 font-bold text-indigo-700">GPA (Hệ 4)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 text-slate-700">
                        {studentsOfSelectedMajorForGrades.map((st) => {
                          const gpaInfo = getTermGPAOfStudent(st.id, selectedMajorForGrades, grades, subjects);
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/50">
                              <td className="py-2 px-4 font-mono font-bold text-slate-950 sticky left-0 bg-white z-10 border-r border-slate-150">{st.id}</td>
                              <td className="py-2 px-4 font-semibold sticky left-32 bg-white z-10 border-r border-slate-150">
                                <div className="flex justify-between items-center">
                                  <span className="truncate">{st.name}</span>
                                  {hasAccess(['admin', 'staff', 'teacher']) && <button onClick={() => handleOpenGradeEditModal(st.id)} className="text-indigo-600 p-1"><Edit className="w-3 h-3"/></button>}
                                </div>
                              </td>
                              {subjectsOfSelectedMajorForGrades.map(sub => {
                                const grade = grades.find(g => g.studentId === st.id && g.subjectId === sub.id);
                                return (
                                  <td key={sub.id} className="py-1 px-1 border-r border-slate-100 text-center">
                                    <input type="number" disabled={!hasAccess(['admin', 'staff', 'teacher'])} min="0" max="10" step="0.1" value={grade ? grade.score : ''} onChange={(e) => handleUpdateGradeDirectly(st.id, sub.id, e.target.value)} className="w-12 px-1 py-1 border border-slate-200 rounded text-center text-xs font-semibold focus:ring-1 focus:ring-indigo-500" placeholder="-" />
                                  </td>
                                );
                              })}
                              <td className="py-2 px-2 text-center sticky right-24 bg-white z-10 border-l border-slate-150 font-extrabold text-emerald-700 text-sm">{gpaInfo.avg10 > 0 ? gpaInfo.avg10 : '-'}</td>
                              <td className="py-2 px-2 text-center sticky right-0 bg-white z-10 border-l border-slate-100 font-extrabold text-indigo-700 text-sm">{gpaInfo.credits > 0 ? gpaInfo.gpa.toFixed(2) : '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="py-2.5 px-2">Mã HV</th>
                        <th className="py-2.5 px-2">Họ và Tên</th>
                        <th className="py-2.5 px-2 text-center">Tín Chỉ (Tính GPA)</th>
                        <th className="py-2.5 px-2 text-center text-emerald-700">TBC Tích Lũy (Hệ 10)</th>
                        <th className="py-2.5 px-2 text-center text-indigo-700">GPA Tích Lũy (Hệ 4)</th>
                        <th className="py-2.5 px-2 text-right">Xếp loại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {studentsOfSelectedMajorForGrades.map(st => {
                        const gpaInfo = getTermGPAOfStudent(st.id, selectedMajorForGrades, grades, subjects);
                        return (
                          <tr key={st.id}>
                            <td className="py-3 px-2 font-mono font-bold">{st.id}</td>
                            <td className="py-3 px-2 font-semibold text-slate-800">{st.name}</td>
                            <td className="py-3 px-2 text-center font-bold text-slate-600">{gpaInfo.credits} tín chỉ</td>
                            <td className="py-3 px-2 text-center font-extrabold text-emerald-700">{gpaInfo.avg10 > 0 ? gpaInfo.avg10 : '-'}</td>
                            <td className="py-3 px-2 text-center font-extrabold text-indigo-600">{gpaInfo.credits > 0 ? gpaInfo.gpa.toFixed(2) : '-'}</td>
                            <td className="py-3 px-2 text-right font-bold text-xs">{gpaInfo.credits > 0 ? gpaInfo.label : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p>Module Quản lý lịch học và điểm danh sẽ sớm ra mắt ở phiên bản tiếp theo.</p>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input type="text" value={subjectSearch} onChange={(e) => setSubjectSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs" placeholder="Tìm tên, mã môn..." />
                  </div>
                  <div className="flex items-center space-x-3 w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Ngành:</span>
                    <select value={studentFilterMajor} onChange={(e) => setStudentFilterMajor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2.5">
                      {INITIAL_COURSES.map(course => <option key={course.id} value={course.name}>{course.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => downloadExcelTemplate('subjects')} className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center transition-all">
                    <Download className="w-4 h-4 mr-1.5" /> File mẫu
                  </button>
                  {hasAccess(['admin', 'staff']) && (
                    <>
                      <label className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 text-xs font-bold rounded-xl flex items-center cursor-pointer transition-all">
                        <Upload className="w-4 h-4 mr-1.5" /> Nhập Excel
                        <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, 'subjects')} className="hidden" />
                      </label>
                      <button onClick={() => handleOpenSubjectModal('add')} className="py-2.5 px-4 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center shadow-md">
                        <Plus className="w-4 h-4 mr-1.5" /> Thêm môn
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                        <th className="py-3 px-4">Mã Môn</th>
                        <th className="py-3 px-4">Tên môn học / Mô đun môn</th>
                        <th className="py-3 px-4">Loại môn học</th>
                        <th className="py-3 px-4 text-center">Số tín chỉ</th>
                        <th className="py-3 px-4 text-center">Thời lượng học tập (Giờ)</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {filteredSubjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/20">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{sub.id}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{sub.name}</td>
                          <td className="py-2.5 px-4 text-slate-500">{sub.type}</td>
                          <td className="py-2.5 px-4 text-center font-bold text-indigo-650">{sub.credits} Tín</td>
                          <td className="py-2.5 px-4 text-center font-semibold">{sub.hours} Giờ</td>
                          <td className="py-2.5 px-4 text-right space-x-1.5">
                            {hasAccess(['admin', 'staff']) && (
                              <>
                                <button onClick={() => handleOpenSubjectModal('edit', sub)} className="p-1 text-indigo-600 rounded"><Edit className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteSubject(sub.id, sub.name, sub.major)} className="p-1 text-rose-600 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL MÔN HỌC */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="bg-indigo-950 text-white p-5 flex justify-between"><h3 className="font-bold">{subjectFormMode === 'add' ? 'Thêm môn học' : 'Cập nhật môn học'}</h3><button onClick={() => setIsSubjectModalOpen(false)}><X className="w-5 h-5"/></button></div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4 text-xs">
              <input type="text" disabled value={currentSubjectData.major} className="w-full px-3 py-2 border rounded-xl bg-slate-100 font-semibold" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required disabled={subjectFormMode === 'edit'} value={currentSubjectData.id} onChange={(e) => setCurrentSubjectData({...currentSubjectData, id: e.target.value.toUpperCase()})} placeholder="Mã môn (VD: MH01)" className="px-3 py-2 border rounded-xl font-mono font-bold disabled:bg-slate-50" />
                <select value={currentSubjectData.type} onChange={(e) => setCurrentSubjectData({...currentSubjectData, type: e.target.value})} className="px-3 py-2 border rounded-xl font-semibold">
                  <option>Các môn học chung</option><option>Môn học, mô đun cơ sở</option><option>Môn học, mô đun chuyên môn</option><option>Môn học, mô đun tự chọn</option>
                </select>
              </div>
              <input type="text" required value={currentSubjectData.name} onChange={(e) => setCurrentSubjectData({...currentSubjectData, name: e.target.value})} placeholder="Tên môn học" className="w-full px-3 py-2 border rounded-xl font-semibold" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.5" min="0.5" required value={currentSubjectData.credits} onChange={(e) => setCurrentSubjectData({...currentSubjectData, credits: parseFloat(e.target.value)})} placeholder="Tín chỉ" className="px-3 py-2 border rounded-xl font-bold" />
                <input type="number" min="15" required value={currentSubjectData.hours} onChange={(e) => setCurrentSubjectData({...currentSubjectData, hours: parseInt(e.target.value)})} placeholder="Giờ học" className="px-3 py-2 border rounded-xl font-bold" />
              </div>
              <div className="flex space-x-3 pt-4"><button type="button" onClick={() => setIsSubjectModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-slate-700">Hủy</button><button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Lưu</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HỌC VIÊN */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl">
            <div className="bg-indigo-950 text-white p-5 flex justify-between"><h3 className="font-bold">{studentFormMode === 'add' ? 'Thêm Học viên' : 'Cập nhật Học viên'}</h3><button onClick={() => setIsStudentModalOpen(false)}><X className="w-5 h-5"/></button></div>
            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs grid grid-cols-2 gap-4">
              <input type="text" required disabled={studentFormMode === 'edit'} value={currentStudentData.id} onChange={(e) => setCurrentStudentData({...currentStudentData, id: e.target.value.toUpperCase()})} placeholder="Mã HV" className="col-span-1 px-3 py-2 border rounded-xl font-mono disabled:bg-slate-50 mt-4" />
              <input type="text" required value={currentStudentData.name} onChange={(e) => setCurrentStudentData({...currentStudentData, name: e.target.value})} placeholder="Họ và tên" className="col-span-1 px-3 py-2 border rounded-xl" />
              <input type="date" required value={currentStudentData.dob} onChange={(e) => setCurrentStudentData({...currentStudentData, dob: e.target.value})} className="col-span-1 px-3 py-2 border rounded-xl" />
              <select value={currentStudentData.gender} onChange={(e) => setCurrentStudentData({...currentStudentData, gender: e.target.value})} className="col-span-1 px-3 py-2 border rounded-xl"><option>Nam</option><option>Nữ</option></select>
              <input type="text" required maxLength="12" value={currentStudentData.cccd} onChange={(e) => setCurrentStudentData({...currentStudentData, cccd: e.target.value})} placeholder="CCCD" className="col-span-1 px-3 py-2 border rounded-xl" />
              <input type="tel" value={currentStudentData.phone} onChange={(e) => setCurrentStudentData({...currentStudentData, phone: e.target.value})} placeholder="SĐT (Tùy chọn)" className="col-span-1 px-3 py-2 border rounded-xl" />
              <input type="email" value={currentStudentData.email} onChange={(e) => setCurrentStudentData({...currentStudentData, email: e.target.value})} placeholder="Email (Tùy chọn)" className="col-span-1 px-3 py-2 border rounded-xl" />
              <input type="text" required value={currentStudentData.class} onChange={(e) => setCurrentStudentData({...currentStudentData, class: e.target.value.toUpperCase()})} placeholder="Lớp" className="col-span-1 px-3 py-2 border rounded-xl" />
              <select value={currentStudentData.major} onChange={(e) => setCurrentStudentData({...currentStudentData, major: e.target.value})} className="col-span-2 px-3 py-2 border rounded-xl font-semibold">{INITIAL_COURSES.map(c => <option key={c.id}>{c.name}</option>)}</select>
              <select value={currentStudentData.status} onChange={(e) => setCurrentStudentData({...currentStudentData, status: e.target.value})} className="col-span-1 px-3 py-2 border rounded-xl"><option>Đang học</option><option>Bảo lưu</option><option>Tốt nghiệp</option><option>Buộc thôi học</option></select>
              <input type="text" required value={currentStudentData.password} onChange={(e) => setCurrentStudentData({...currentStudentData, password: e.target.value})} placeholder="Mật khẩu" className="col-span-1 px-3 py-2 border rounded-xl font-mono" />
              <div className="col-span-2 flex space-x-3 pt-4"><button type="button" onClick={() => setIsStudentModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold">Hủy</button><button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Lưu</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GIẢNG VIÊN */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-xl">
            <div className="bg-teal-950 text-white p-5 flex justify-between"><h3 className="font-bold">Hồ sơ Giảng viên</h3><button onClick={() => setIsTeacherModalOpen(false)}><X className="w-5 h-5"/></button></div>
            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs grid grid-cols-2 gap-4">
              <input type="text" required disabled={teacherFormMode === 'edit'} value={currentTeacherData.id} onChange={(e) => setCurrentTeacherData({...currentTeacherData, id: e.target.value.toUpperCase()})} placeholder="Mã GV" className="col-span-1 px-3 py-2 border rounded-xl font-mono disabled:bg-slate-50 mt-4" />
              <input type="text" required value={currentTeacherData.name} onChange={(e) => setCurrentTeacherData({...currentTeacherData, name: e.target.value})} placeholder="Họ và tên" className="col-span-1 px-3 py-2 border rounded-xl" />
              <select value={currentTeacherData.degree} onChange={(e) => setCurrentTeacherData({...currentTeacherData, degree: e.target.value})} className="col-span-1 px-3 py-2 border rounded-xl"><option>Tiến sĩ</option><option>Thạc sĩ</option><option>Cử nhân / Kỹ sư</option><option>Cao đẳng</option><option>Trung cấp</option></select>
              <select value={currentTeacherData.department} onChange={(e) => setCurrentTeacherData({...currentTeacherData, department: e.target.value})} className="col-span-1 px-3 py-2 border rounded-xl"><option>Khoa Kỹ thuật - Công nghệ</option><option>Khoa Dịch vụ  - Du lịch - Nhà hàng khách sạn</option><option>Khoa Ngôn ngữ</option></select>
              <input type="tel" required value={currentTeacherData.phone} onChange={(e) => setCurrentTeacherData({...currentTeacherData, phone: e.target.value})} placeholder="SĐT" className="col-span-1 px-3 py-2 border rounded-xl" />
              <input type="email" required value={currentTeacherData.email} onChange={(e) => setCurrentTeacherData({...currentTeacherData, email: e.target.value})} placeholder="Email" className="col-span-1 px-3 py-2 border rounded-xl" />
              <input type="text" required value={currentTeacherData.specialty} onChange={(e) => setCurrentTeacherData({...currentTeacherData, specialty: e.target.value})} placeholder="Chuyên môn" className="col-span-2 px-3 py-2 border rounded-xl" />
              <input type="text" required value={currentTeacherData.password} onChange={(e) => setCurrentTeacherData({...currentTeacherData, password: e.target.value})} placeholder="Mật khẩu" className="col-span-2 px-3 py-2 border rounded-xl font-mono" />
              <div className="col-span-2 flex space-x-3 pt-4"><button type="button" onClick={() => setIsTeacherModalOpen(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold">Hủy</button><button type="submit" className="flex-1 py-2 bg-teal-600 text-white rounded-xl font-bold">Lưu</button></div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NHẬP ĐIỂM HÀNG LOẠT (CHỈNH SỬA TẤT CẢ MÔN CỦA 1 HỌC VIÊN) */}
      {isGradeEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="bg-indigo-950 text-white p-5 flex justify-between">
              <div><h3 className="font-bold">Cập nhật bảng điểm học viên</h3><p className="text-xs text-slate-400 mt-1">HV: <strong className="text-white">{students.find(s => s.id === studentIdForGradeEdit)?.name}</strong></p></div>
              <button onClick={() => setIsGradeEditModalOpen(false)}><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveStudentGrades} className="flex flex-col h-[65vh]">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {subjectsOfSelectedMajorForGrades.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-150">
                    <div className="text-xs">
                      <span className="font-bold text-slate-800 block truncate">{sub.name}</span>
                      <span className="text-slate-500">{sub.id} • {sub.credits} tín chỉ</span>
                    </div>
                    <input type="number" min="0" max="10" step="0.1" value={tempGradeEditScores[sub.id] !== undefined ? tempGradeEditScores[sub.id] : ''} onChange={(e) => setTempGradeEditScores({...tempGradeEditScores, [sub.id]: e.target.value})} className="w-16 px-2 py-1.5 border rounded-lg text-center font-semibold text-xs focus:ring-1 focus:ring-indigo-500" placeholder="-" />
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex space-x-3">
                <button type="button" onClick={() => setIsGradeEditModalOpen(false)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-650 text-white rounded-xl text-xs font-bold shadow-md">Lưu điểm</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}