import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, GraduationCap, UserCheck, Search, Plus, Edit, Trash2, 
  Lock, LogOut, User, Shield, BookOpen, CheckCircle, AlertCircle,
  Menu, X, Key, Filter, Mail, Phone, Briefcase, Calendar, Layers, 
  Award, ClipboardList, ChevronRight, Download, Upload, Printer,
  MessageCircle, Send
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";

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
  { id: 'MH07', name: 'Kỹ năng làm việc nhóm', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH08', name: 'Lập trình cơ bản', credits: 2, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH09', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH15', name: 'Mạng máy tính', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH17', name: 'Cấu trúc và bảo trì máy tính', credits: 5, hours: 75, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH20', name: 'Thiết kế trang Web', credits: 2, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH98', name: 'Giáo dục thể chất', credits: 2, hours: 30, major: 'Công nghệ thông tin', type: 'Môn học chung' },
  { id: 'MH99', name: 'Giáo dục QP-AN', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học chung' }
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
  const [notification, setNotification] = useState(null);

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [accounts, setAccounts] = useState(USERS_ACCOUNTS);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi là Trợ lý AI (Gemini). Tôi có thể hỗ trợ gì cho bạn trong hệ thống đào tạo hôm nay?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilterStatus, setStudentFilterStatus] = useState('All');
  const [studentFilterMajor, setStudentFilterMajor] = useState('Công nghệ thông tin');
  
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherFilterDept, setTeacherFilterDept] = useState('All');

  const [classFilterMajor, setClassFilterMajor] = useState('All');
  const [classSearch, setClassSearch] = useState('');

  const [selectedMajorForGrades, setSelectedMajorForGrades] = useState('Công nghệ thông tin');
  const [gradeSearchText, setGradeSearchText] = useState('');
  const [gradeViewMode, setGradeViewMode] = useState('edit');

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

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    let unsubs = [];
    try {
      const loadCollection = (colName, setter) => {
        return onSnapshot(collection(db, colName), (snapshot) => {
          setter(snapshot.docs.map(doc => doc.data()));
        }, (error) => {
          console.warn(`[Firebase] Lỗi đọc ${colName}:`, error);
        });
      };

      unsubs.push(loadCollection('students', setStudents));
      unsubs.push(loadCollection('teachers', setTeachers));
      unsubs.push(loadCollection('subjects', setSubjects));
      unsubs.push(loadCollection('classes', setClasses));
      unsubs.push(loadCollection('grades', setGrades));
      unsubs.push(loadCollection('accounts', (accs) => {
        if (accs.length > 0) {
          const mergedAccs = [...USERS_ACCOUNTS, ...accs.filter(a => a.role !== 'admin' && a.role !== 'staff')];
          setAccounts(mergedAccs);
        }
      }));
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Firebase setup error", err);
    }
    return () => unsubs.forEach(unsub => unsub && unsub());
  }, []);

  useEffect(() => {
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const triggerConfirm = (title, message, callback) => {
    setConfirmModal({
      isOpen: true, title, message,
      onConfirm: () => { callback(); setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null }); }
    });
  };

  const parseYMDtoDMY = (ymd) => ymd ? ymd.split('-').reverse().join('/') : '';
  const parseDMYtoYMD = (dmy) => dmy ? dmy.split('/').reverse().join('-') : '';

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : teacherId;
  };

  const getTermGPAOfStudent = (studentId, studentMajor, gradeList, subjectList) => {
    let totalCredits = 0;
    let weightedScale4Sum = 0;
    let sum10 = 0;
    let count10 = 0;

    const majorSubjects = subjectList.filter(s => s.major === studentMajor);
    
    majorSubjects.forEach(sub => {
      const nameLower = sub.name.toLowerCase();
      const isExcluded = nameLower.includes("thể chất") || nameLower.includes("quốc phòng") || nameLower.includes("qp-an");

      const grade = gradeList.find(g => g.studentId === studentId && g.subjectId === sub.id);
      if (grade && grade.score !== undefined && grade.score !== null && grade.score !== '') {
        const final10 = parseFloat(grade.score);
        let scale4 = 0;
        if (final10 >= 8.5) scale4 = 4;
        else if (final10 >= 7.0) scale4 = 3;
        else if (final10 >= 5.5) scale4 = 2;
        else if (final10 >= 4.0) scale4 = 1;
        
        if (!isExcluded) {
          totalCredits += sub.credits;
          weightedScale4Sum += scale4 * sub.credits;
          sum10 += final10 * sub.credits;
          count10 += sub.credits;
        }
      }
    });

    if (totalCredits === 0) return { gpa: 0, credits: 0, label: 'Chưa xếp loại', avg10: '0.00' };
    const gpa = Math.round((weightedScale4Sum / totalCredits) * 100) / 100;
    const avg10 = (sum10 / count10).toFixed(2);
    
    let classification = 'Yếu';
    if (gpa >= 3.50) classification = 'Xuất sắc';
    else if (gpa >= 3.00) classification = 'Giỏi';
    else if (gpa >= 2.50) classification = 'Khá';
    else if (gpa >= 2.00) classification = 'Trung bình';

    return { gpa, credits: totalCredits, label: classification, avg10 };
  };

  const hasAccess = (roles) => currentUser && roles.includes(currentUser.role);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = accounts.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginError('');
      if (user.role === 'student' && user.studentId) {
        setActiveTab('grades');
        const stu = students.find(s => s.id === user.studentId);
        if (stu) setSelectedMajorForGrades(stu.major);
        setGradeViewMode('scoreboard');
      } else {
        setActiveTab('dashboard');
      }
      showToast(`Chào mừng ${user.name}!`, 'success');
    } else {
      setLoginError('Sai tài khoản hoặc mật khẩu.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setCurrentUser(null); setLoginForm({username: '', password: ''});
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const newMessages = [...chatMessages, { sender: 'user', text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      setTimeout(() => {
        setChatMessages([...newMessages, { sender: 'bot', text: 'Đây là tin nhắn phản hồi mẫu từ Gemini Flash 3.1. API thực tế chưa được gắn.' }]);
        setIsChatLoading(false);
      }, 1000);
    } catch (error) {
      setChatMessages([...newMessages, { sender: 'bot', text: 'Xin lỗi, không thể kết nối tới dịch vụ AI.' }]);
      setIsChatLoading(false);
    }
  };

  const handleOpenStudentModal = (mode, student = null) => {
    setStudentFormMode(mode);
    if (mode === 'edit' && student) {
      const acc = accounts.find(a => a.username === student.id);
      setCurrentStudentData({ ...student, dob: parseDMYtoYMD(student.dob), password: acc ? acc.password : '123' });
    } else {
      const lastIdNum = students.length > 0 ? Math.max(...students.map(s => { const num = parseInt(s.id.replace('HV', ''), 10); return isNaN(num) ? 0 : num; })) : 0;
      setCurrentStudentData({ id: `HV${String(lastIdNum + 1).padStart(3, '0')}`, name: '', dob: '', gender: 'Nam', cccd: '', phone: '', email: '', status: 'Đang học', class: 'CNTT-K15', major: 'Công nghệ thông tin', password: '123' });
    }
    setIsStudentModalOpen(true);
  };

  const handleOpenTeacherModal = (mode, teacher = null) => {
    setTeacherFormMode(mode);
    if (mode === 'edit' && teacher) {
      const acc = accounts.find(a => a.username === teacher.id);
      setCurrentTeacherData({ ...teacher, password: acc ? acc.password : '123' });
    } else {
      const lastIdNum = teachers.length > 0 ? Math.max(...teachers.map(t => { const num = parseInt(t.id.replace('GV', ''), 10); return isNaN(num) ? 0 : num; })) : 0;
      setCurrentTeacherData({ id: `GV${String(lastIdNum + 1).padStart(3, '0')}`, name: '', specialty: '', department: 'Khoa Kỹ thuật - Công nghệ', phone: '', email: '', degree: 'Thạc sĩ', password: '123' });
    }
    setIsTeacherModalOpen(true);
  };

  const handleOpenClassModal = (mode, cls = null) => {
    setClassFormMode(mode);
    if (mode === 'edit' && cls) {
      setCurrentClassData({ ...cls });
    } else {
      const lastIdNum = classes.length > 0 ? Math.max(...classes.map(c => { const num = parseInt(c.id.replace('LH', ''), 10); return isNaN(num) ? 0 : num; })) : 0;
      setCurrentClassData({ id: `LH${String(lastIdNum + 1).padStart(3, '0')}`, name: '', courseId: 'KH001', major: 'Công nghệ thông tin', teacherId: '', startDate: '', endDate: '', location: '', quota: 40, term: 'Học kỳ I' });
    }
    setIsClassModalOpen(true);
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

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!currentStudentData.name.trim()) return showToast('Vui lòng nhập tên!', 'error');
    const formattedStudent = {
      id: currentStudentData.id, name: currentStudentData.name, dob: parseYMDtoDMY(currentStudentData.dob),
      gender: currentStudentData.gender, cccd: currentStudentData.cccd, phone: currentStudentData.phone,
      email: currentStudentData.email, status: currentStudentData.status, class: currentStudentData.class, major: currentStudentData.major
    };
    const studentAccount = { username: formattedStudent.id, password: currentStudentData.password || '123', name: formattedStudent.name, role: 'student', studentId: formattedStudent.id };
    
    try {
      await setDoc(doc(db, 'students', formattedStudent.id), formattedStudent);
      await setDoc(doc(db, 'accounts', studentAccount.username), studentAccount);
      showToast('Lưu học viên thành công!', 'success');
      setIsStudentModalOpen(false);
    } catch (err) { showToast('Lỗi lưu: ' + err.message, 'error'); }
  };

  const handleDeleteStudent = (id, name) => {
    triggerConfirm('Xóa Học viên', `Xóa ${name}?`, async () => {
      try {
        await deleteDoc(doc(db, 'students', id));
        await deleteDoc(doc(db, 'accounts', id));
        showToast('Đã xóa.', 'warning');
      } catch (err) {}
    });
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    const tData = { ...currentTeacherData };
    const tAcc = { username: tData.id, password: currentTeacherData.password || '123', name: tData.name, role: 'teacher', teacherId: tData.id };
    try {
      await setDoc(doc(db, 'teachers', tData.id), tData);
      await setDoc(doc(db, 'accounts', tAcc.username), tAcc);
      showToast('Lưu giảng viên thành công!', 'success');
      setIsTeacherModalOpen(false);
    } catch (err) {}
  };

  const handleDeleteTeacher = (id, name) => {
    triggerConfirm('Xóa Giảng viên', `Xóa ${name}?`, async () => {
      try {
        await deleteDoc(doc(db, 'teachers', id));
        await deleteDoc(doc(db, 'accounts', id));
        showToast('Đã xóa.', 'warning');
      } catch (err) {}
    });
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'classes', currentClassData.id), currentClassData);
      showToast('Lưu lớp học thành công!', 'success');
      setIsClassModalOpen(false);
    } catch (err) {}
  };

  const handleDeleteClass = (id, name) => {
    triggerConfirm('Hủy Lớp học', `Hủy lớp ${name}?`, async () => {
      try {
        await deleteDoc(doc(db, 'classes', id));
        showToast('Đã xóa.', 'warning');
      } catch (err) {}
    });
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    try {
      const docId = `${currentSubjectData.major}_${currentSubjectData.id}`;
      await setDoc(doc(db, 'subjects', docId), currentSubjectData);
      showToast('Lưu môn học thành công!', 'success');
      setIsSubjectModalOpen(false);
    } catch (err) {}
  };

  const handleDeleteSubject = (subId, major) => {
    triggerConfirm('Xóa môn', `Bạn muốn xóa môn này?`, async () => {
      try {
        await deleteDoc(doc(db, 'subjects', `${major}_${subId}`));
        showToast('Đã xóa.', 'warning');
      } catch (err) {}
    });
  };

  const handleDownloadTemplate = (type) => {
    if (!window.XLSX) return showToast('Thư viện Excel chưa được tải.', 'error');
    let templateData = [];
    let fileName = '';

    if (type === 'students') {
      templateData = [
        ['Mã HV', 'Họ Tên', 'Ngày sinh (YYYY-MM-DD)', 'Giới tính', 'CCCD', 'Điện thoại', 'Email', 'Lớp', 'Ngành', 'Trạng thái'],
        ['HV001', 'Nguyễn Văn A', '2005-01-15', 'Nam', '012345678912', '0901234567', 'nva@abc.com', 'CNTT-K15', 'Công nghệ thông tin', 'Đang học']
      ];
      fileName = 'Mau_Nhap_Hoc_Vien.xlsx';
    } else if (type === 'teachers') {
      templateData = [
        ['Mã GV', 'Họ Tên', 'Trình độ', 'Chuyên môn', 'Khoa', 'Điện thoại', 'Email'],
        ['GV001', 'Trần Thị B', 'Thạc sĩ', 'Kỹ thuật phần mềm', 'Khoa Kỹ thuật - Công nghệ', '0912345678', 'ttb@abc.com']
      ];
      fileName = 'Mau_Nhap_Giang_Vien.xlsx';
    } else if (type === 'classes') {
      templateData = [
        ['Mã Lớp', 'Tên Lớp', 'Ngành', 'Mã GV Phụ trách', 'Sĩ số', 'Địa điểm', 'Học kỳ', 'Ngày bắt đầu (YYYY-MM-DD)', 'Ngày kết thúc (YYYY-MM-DD)'],
        ['LH001', 'Lớp Lập trình Web', 'Công nghệ thông tin', 'GV001', 40, 'HIC Campus', 'Học kỳ I', '2025-09-05', '2026-01-15']
      ];
      fileName = 'Mau_Nhap_Lop_Hoc.xlsx';
    } else if (type === 'subjects') {
      templateData = [
        ['Mã Môn', 'Tên Môn', 'Loại', 'Tín chỉ', 'Ngành', 'Số giờ'],
        ['MH01', 'Tiếng Anh', 'Các môn học chung', 3, 'Công nghệ thông tin', 90],
        ['MH08', 'Lập trình cơ bản', 'Môn học, mô đun cơ sở', 2, 'Công nghệ thông tin', 60]
      ];
      fileName = 'Mau_Nhap_Mon_Hoc.xlsx';
    }

    const ws = window.XLSX.utils.aoa_to_sheet(templateData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Mau_Data");
    window.XLSX.writeFile(wb, fileName);
    showToast('Đã tải file mẫu thành công!', 'success');
  };

  const handleDownloadGradeTemplate = () => {
    if (!window.XLSX) return showToast('Thư viện chưa sẵn sàng.', 'error');
    const templateData = [
      ['Mã HV', 'Mã Môn', 'Điểm số (Hệ 10)', 'Điểm rèn luyện (Nếu có)'], 
      ['HV001', 'MH01', 8.5, 90],         
      ['HV002', 'MH08', 9.0, 85]          
    ];
    const ws = window.XLSX.utils.aoa_to_sheet(templateData);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Diem");
    window.XLSX.writeFile(wb, "Mau_Nhap_Diem_HIC.xlsx");
    showToast('Đã tải file mẫu thành công!', 'success');
  };

  const handleExcelImport = (e, type) => {
    const file = e.target.files[0];
    if (!file || !window.XLSX) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rawData.length < 2) return showToast('File trống', 'error');

        const batch = writeBatch(db);
        const dataRows = rawData.slice(1);
        let count = 0;

        if (type === 'students') {
          dataRows.forEach(row => {
            if (!row[0]) return;
            const id = String(row[0]).trim();
            batch.set(doc(db, 'students', id), {
              id, name: String(row[1] || '').trim(), dob: parseYMDtoDMY(String(row[2] || '')),
              gender: String(row[3] || 'Nam'), cccd: String(row[4] || ''), phone: String(row[5] || ''),
              email: String(row[6] || ''), class: String(row[7] || 'CNTT-K15'), major: String(row[8] || 'Công nghệ thông tin'), status: String(row[9] || 'Đang học')
            });
            batch.set(doc(db, 'accounts', id), { username: id, password: '123', name: String(row[1]), role: 'student', studentId: id });
            count++;
          });
        } else if (type === 'teachers') {
          dataRows.forEach(row => {
            if (!row[0]) return;
            const id = String(row[0]).trim();
            batch.set(doc(db, 'teachers', id), {
              id, name: String(row[1] || '').trim(), degree: String(row[2] || 'Thạc sĩ'), specialty: String(row[3] || ''),
              department: String(row[4] || 'Khoa Kỹ thuật - Công nghệ'), phone: String(row[5] || ''), email: String(row[6] || '')
            });
            batch.set(doc(db, 'accounts', id), { username: id, password: '123', name: String(row[1]), role: 'teacher', teacherId: id });
            count++;
          });
        } else if (type === 'classes') {
          dataRows.forEach(row => {
            if (!row[0]) return;
            const id = String(row[0]).trim();
            batch.set(doc(db, 'classes', id), {
              id, name: String(row[1] || '').trim(), major: String(row[2] || 'Công nghệ thông tin'), teacherId: String(row[3] || 'GV001'),
              quota: parseInt(row[4]) || 40, location: String(row[5] || 'HIC Campus'), term: String(row[6] || 'Học kỳ I'),
              startDate: String(row[7] || ''), endDate: String(row[8] || ''), courseId: 'KH001'
            });
            count++;
          });
        } else if (type === 'subjects') {
           dataRows.forEach(row => {
            if (!row[0]) return;
            const id = String(row[0]).trim();
            const major = String(row[4] || 'Công nghệ thông tin').trim();
            batch.set(doc(db, 'subjects', `${major}_${id}`), {
              id, name: String(row[1] || '').trim(), type: String(row[2] || 'Môn học, mô đun chuyên môn'),
              credits: parseFloat(row[3]) || 3, major: major, hours: parseInt(row[5]) || 45
            });
            count++;
          });
        } else if (type === 'grades') {
          dataRows.forEach(row => {
            if (!row[0]) return;
            const studentId = String(row[0]).trim();
            
            if (row[1] && row[2] !== undefined) {
              const subjectId = String(row[1]).trim();
              const score = parseFloat(row[2]);
              if (!isNaN(score) && score >= 0 && score <= 10) {
                batch.set(doc(db, 'grades', `${studentId}_${subjectId}`), {
                  studentId, subjectId, score: Math.round(score * 10) / 10
                });
                count++;
              }
            }

            if (row[3] !== undefined) {
              const drlScore = parseFloat(row[3]);
              if (!isNaN(drlScore) && drlScore >= 0 && drlScore <= 100) {
                batch.set(doc(db, 'grades', `${studentId}_DRL`), {
                  studentId, subjectId: 'DRL', score: Math.round(drlScore)
                });
                count++;
              }
            }
          });
        }
        
        await batch.commit();
        showToast(`Import thành công ${count} dòng dữ liệu!`, 'success');
      } catch (err) { showToast('Lỗi import: ' + err.message, 'error'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleUpdateGradeDirectly = async (studentId, subjectId, val) => {
    const docId = `${studentId}_${subjectId}`;
    if (val === '') {
      try { await deleteDoc(doc(db, 'grades', docId)); } catch(e){}
      return;
    }
    
    let score = parseFloat(val);
    const maxScore = subjectId === 'DRL' ? 100 : 10;

    if (!isNaN(score) && score >= 0 && score <= maxScore) {
      score = subjectId === 'DRL' ? Math.round(score) : Math.round(score * 10) / 10;
      try {
        await setDoc(doc(db, 'grades', docId), { studentId, subjectId, score });
      } catch(e) {}
    }
  };

  const subjectsOfSelectedMajorForGrades = useMemo(() => subjects.filter(s => s.major === selectedMajorForGrades), [subjects, selectedMajorForGrades]);
  const studentsOfSelectedMajorForGrades = useMemo(() => students.filter(st => {
    if (currentUser?.role === 'student') return st.id === currentUser.studentId;
    return st.major === selectedMajorForGrades && (st.id.toLowerCase().includes(gradeSearchText.toLowerCase()) || st.name.toLowerCase().includes(gradeSearchText.toLowerCase()));
  }), [students, selectedMajorForGrades, gradeSearchText, currentUser]);

  const filteredStudents = useMemo(() => students.filter(st => 
    (st.id.toLowerCase().includes(studentSearch.toLowerCase()) || st.name.toLowerCase().includes(studentSearch.toLowerCase()) || (st.phone && st.phone.includes(studentSearch))) &&
    (studentFilterStatus === 'All' || st.status === studentFilterStatus) && (st.major === studentFilterMajor)
  ), [students, studentSearch, studentFilterStatus, studentFilterMajor]);

  const filteredTeachers = useMemo(() => teachers.filter(tc => 
    (tc.id.toLowerCase().includes(teacherSearch.toLowerCase()) || tc.name.toLowerCase().includes(teacherSearch.toLowerCase())) &&
    (teacherFilterDept === 'All' || tc.department === teacherFilterDept)
  ), [teachers, teacherSearch, teacherFilterDept]);

  const filteredClasses = useMemo(() => classes.filter(cl => 
    (cl.id.toLowerCase().includes(classSearch.toLowerCase()) || cl.name.toLowerCase().includes(classSearch.toLowerCase())) &&
    (classFilterMajor === 'All' || cl.major === classFilterMajor)
  ), [classes, classSearch, classFilterMajor]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 rounded-2xl shadow-xl border animate-bounce ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
            <h3 className="font-bold text-lg mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-slate-600 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3"><button onClick={confirmModal.onConfirm} className="flex-1 bg-rose-600 text-white py-2 rounded-xl font-bold">Xóa</button><button onClick={() => setConfirmModal({...confirmModal, isOpen: false})} className="flex-1 bg-slate-100 py-2 rounded-xl font-bold">Hủy</button></div>
          </div>
        </div>
      )}

      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center bg-slate-100 p-4">
          <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
            <div className="text-center mb-8"><div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl mx-auto flex items-center justify-center mb-4"><GraduationCap className="w-8 h-8" /></div><h2 className="text-xl font-bold">HIC LMS</h2></div>
            {loginError && <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded mb-4">{loginError}</p>}
            <input required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className="w-full mb-4 px-4 py-3 border rounded-xl" placeholder="Tên đăng nhập" />
            <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full mb-6 px-4 py-3 border rounded-xl" placeholder="Mật khẩu" />
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Đăng nhập</button>
            <div className="mt-6 text-xs text-slate-500 text-center"><p>Dữ liệu mẫu:</p><p>admin / 123 (Quản trị)</p></div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden relative">
          
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
             {isChatOpen && (
               <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border mb-4 flex flex-col overflow-hidden">
                 <div className="bg-indigo-600 text-white p-3 flex justify-between items-center font-bold">
                   <div className="flex items-center"><MessageCircle className="w-4 h-4 mr-2" /> Trợ lý AI</div>
                   <button onClick={() => setIsChatOpen(false)} className="hover:bg-indigo-700 p-1 rounded"><X className="w-4 h-4" /></button>
                 </div>
                 <div className="flex-1 p-3 overflow-y-auto bg-slate-50 space-y-3">
                   {chatMessages.map((msg, idx) => (
                     <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`text-xs px-3 py-2 rounded-xl max-w-[85%] ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border text-slate-700 rounded-bl-none shadow-sm'}`}>
                         {msg.text}
                       </div>
                     </div>
                   ))}
                   {isChatLoading && (
                     <div className="flex justify-start">
                       <div className="text-xs px-3 py-2 bg-white border text-slate-500 rounded-xl rounded-bl-none shadow-sm">Đang suy nghĩ...</div>
                     </div>
                   )}
                 </div>
                 <form onSubmit={handleSendChatMessage} className="p-2 bg-white border-t flex gap-2">
                   <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Nhập câu hỏi..." className="flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                   <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="bg-indigo-600 text-white p-2 rounded-lg disabled:opacity-50"><Send className="w-4 h-4" /></button>
                 </form>
               </div>
             )}
             <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 transition transform hover:scale-105">
               {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
             </button>
          </div>

          <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shrink-0">
            <div className="p-5 border-b border-slate-800 flex items-center space-x-3"><div className="p-2 bg-indigo-600 rounded text-white"><GraduationCap className="w-5 h-5" /></div><h1 className="font-bold text-white">HIC LMS</h1></div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {!hasAccess(['student']) && <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left flex items-center px-3 py-2 rounded-xl text-sm ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Layers className="w-4 h-4 mr-3" /> Tổng quan</button>}
              {hasAccess(['admin', 'staff']) && <button onClick={() => setActiveTab('students')} className={`w-full text-left flex items-center px-3 py-2 rounded-xl text-sm ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Users className="w-4 h-4 mr-3" /> Học viên</button>}
              {hasAccess(['admin', 'staff']) && <button onClick={() => setActiveTab('teachers')} className={`w-full text-left flex items-center px-3 py-2 rounded-xl text-sm ${activeTab === 'teachers' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><UserCheck className="w-4 h-4 mr-3" /> Giảng viên</button>}
              {hasAccess(['admin', 'staff']) && <button onClick={() => setActiveTab('classes')} className={`w-full text-left flex items-center px-3 py-2 rounded-xl text-sm ${activeTab === 'classes' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><ClipboardList className="w-4 h-4 mr-3" /> Lớp học</button>}
              
              <button onClick={() => setActiveTab('grades')} className={`w-full text-left flex items-center px-3 py-2 rounded-xl text-sm ${activeTab === 'grades' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Award className="w-4 h-4 mr-3" /> Điểm số</button>
              <button onClick={() => setActiveTab('schedule')} className={`w-full text-left flex items-center px-3 py-2 rounded-xl text-sm ${activeTab === 'schedule' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><Calendar className="w-4 h-4 mr-3" /> Lịch học & Điểm danh</button>
              {hasAccess(['admin', 'staff']) && <button onClick={() => setActiveTab('curriculum')} className={`w-full text-left flex items-center px-3 py-2 rounded-xl text-sm ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><BookOpen className="w-4 h-4 mr-3" /> Môn học / Mô đun</button>}
            </nav>
            <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full text-left flex items-center px-3 py-2 text-rose-400 hover:bg-slate-800 rounded-xl text-sm"><LogOut className="w-4 h-4 mr-3" /> Đăng xuất</button></div>
          </aside>

          <main className="flex-1 p-6 bg-slate-50 overflow-y-auto">
            <div className="mb-6"><h2 className="text-2xl font-bold text-slate-900">{activeTab.toUpperCase()}</h2></div>

            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-slate-500 text-xs">Học viên</p><h3 className="text-2xl font-bold">{students.length}</h3></div>
                <div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-slate-500 text-xs">Giảng viên</p><h3 className="text-2xl font-bold">{teachers.length}</h3></div>
                <div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-slate-500 text-xs">Lớp học</p><h3 className="text-2xl font-bold">{classes.length}</h3></div>
                <div className="bg-white p-5 rounded-2xl border shadow-sm"><p className="text-slate-500 text-xs">Ngành nghề</p><h3 className="text-2xl font-bold">{INITIAL_COURSES.length}</h3></div>
              </div>
            )}
            
            {activeTab === 'students' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="w-full md:w-64 pl-9 pr-4 py-2.5 border rounded-xl text-xs" placeholder="Tìm tên, mã..." /></div>
                  </div>
                  <div className="flex space-x-2">
                    {hasAccess(['admin', 'staff']) && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDownloadTemplate('students')} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border text-xs font-bold rounded-xl flex items-center transition-colors">
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Tải mẫu Excel
                        </button>
                        <label className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border text-xs font-bold rounded-xl flex items-center cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 mr-1.5" /> Nhập Excel
                          <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, 'students')} className="hidden" />
                        </label>
                        <button onClick={() => handleOpenStudentModal('add')} className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-xs font-bold rounded-xl shadow-md flex items-center"><Plus className="w-4 h-4 mr-1" /> Thêm học viên</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead><tr className="bg-slate-50 border-b text-slate-500"><th className="p-4">Mã HV</th><th className="p-4">Họ Tên</th><th className="p-4">Lớp/Ngành</th><th className="p-4">Trạng thái</th><th className="p-4 text-right">Sửa/Xóa</th></tr></thead>
                    <tbody className="divide-y">
                      {filteredStudents.map(st => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold">{st.id}</td><td className="p-4 font-bold">{st.name}</td>
                          <td className="p-4"><span className="text-indigo-600">{st.class}</span><br/><span className="text-slate-400 text-[10px]">{st.major}</span></td>
                          <td className="p-4">{st.status}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleOpenStudentModal('edit', st)} className="p-1 text-indigo-600 mr-2"><Edit className="w-4 h-4"/></button>
                            <button onClick={() => handleDeleteStudent(st.id, st.name)} className="p-1 text-rose-600"><Trash2 className="w-4 h-4"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'teachers' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="text" value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} className="w-64 pl-9 pr-4 py-2.5 border rounded-xl text-xs" placeholder="Tìm giảng viên..." /></div>
                  <div className="flex space-x-2">
                    {hasAccess(['admin', 'staff']) && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDownloadTemplate('teachers')} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border text-xs font-bold rounded-xl flex items-center transition-colors">
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Tải mẫu Excel
                        </button>
                        <label className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border text-xs font-bold rounded-xl flex items-center cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 mr-1.5" /> Nhập Excel
                          <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, 'teachers')} className="hidden" />
                        </label>
                        <button onClick={() => handleOpenTeacherModal('add')} className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-xs font-bold rounded-xl shadow-md flex items-center"><Plus className="w-4 h-4 mr-1 inline" /> Thêm giảng viên</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredTeachers.map(tc => (
                    <div key={tc.id} className="bg-white p-5 rounded-2xl border shadow-sm">
                      <div className="font-bold text-sm">{tc.name} <span className="text-[10px] text-indigo-600 ml-2">({tc.id})</span></div>
                      <div className="text-xs text-slate-500 mt-1">{tc.degree} • {tc.department}</div>
                      <div className="mt-3 flex justify-end">
                         <button onClick={() => handleOpenTeacherModal('edit', tc)} className="p-1 text-indigo-600 mr-2"><Edit className="w-4 h-4"/></button>
                         <button onClick={() => handleDeleteTeacher(tc.id, tc.name)} className="p-1 text-rose-600"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'classes' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                  <div className="flex gap-2">
                    <div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input type="text" value={classSearch} onChange={(e) => setClassSearch(e.target.value)} className="w-64 pl-9 pr-4 py-2.5 border rounded-xl text-xs" placeholder="Tìm lớp..." /></div>
                  </div>
                  <div className="flex space-x-2">
                    {hasAccess(['admin', 'staff']) && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDownloadTemplate('classes')} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border text-xs font-bold rounded-xl flex items-center transition-colors">
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Tải mẫu Excel
                        </button>
                        <label className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border text-xs font-bold rounded-xl flex items-center cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 mr-1.5" /> Nhập Excel
                          <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, 'classes')} className="hidden" />
                        </label>
                        <button onClick={() => handleOpenClassModal('add')} className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-xs font-bold rounded-xl shadow-md flex items-center"><Plus className="w-4 h-4 mr-1 inline" /> Thêm Lớp</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b text-slate-500">
                        <th className="p-4">Mã lớp</th>
                        <th className="p-4">Tên lớp / Ngành</th>
                        <th className="p-4">GV Phụ trách</th>
                        <th className="p-4">Thời gian</th>
                        <th className="p-4 text-center">Sĩ số</th>
                        <th className="p-4">Địa điểm</th>
                        <th className="p-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredClasses.map(cl => (
                        <tr key={cl.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold">{cl.id}</td>
                          <td className="p-4">
                            <span className="font-bold text-slate-800">{cl.name}</span><br/>
                            <span className="text-[10px] text-slate-500">{cl.major}</span>
                          </td>
                          <td className="p-4 font-semibold text-indigo-600">
                            {getTeacherName(cl.teacherId)} <br/>
                            <span className="text-[10px] text-slate-400">{cl.teacherId}</span>
                          </td>
                          <td className="p-4">{cl.startDate} <br/> {cl.endDate}</td>
                          <td className="p-4 text-center font-bold text-indigo-600">{cl.quota}</td>
                          <td className="p-4">{cl.location}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => handleOpenClassModal('edit', cl)} className="p-1 text-indigo-600 mr-2"><Edit className="w-4 h-4"/></button>
                            <button onClick={() => handleDeleteClass(cl.id, cl.name)} className="p-1 text-rose-600"><Trash2 className="w-4 h-4"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex space-x-3 items-center">
                       <span className="text-xs font-bold text-slate-500">Ngành:</span>
                       <select value={selectedMajorForGrades} disabled={hasAccess(['student'])} onChange={(e) => setSelectedMajorForGrades(e.target.value)} className="bg-slate-50 border text-xs font-bold px-3 py-2 rounded-xl focus:outline-none">
                          {INITIAL_COURSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                       </select>
                       
                       {!hasAccess(['student']) && (
                         <div className="relative ml-2">
                           <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                           <input 
                             type="text" 
                             value={gradeSearchText} 
                             onChange={(e) => setGradeSearchText(e.target.value)} 
                             className="w-48 pl-9 pr-4 py-2 border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                             placeholder="Tìm HV (Tên, Mã)..." 
                           />
                         </div>
                       )}
                    </div>
                    {!hasAccess(['student']) && (
                      <div className="flex gap-2">
                        {gradeViewMode === 'edit' && (
                          <div className="flex gap-2">
                            <button onClick={handleDownloadGradeTemplate} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border text-xs font-bold rounded-xl flex items-center transition-colors">
                              <Download className="w-3.5 h-3.5 mr-1.5" /> Tải mẫu Excel
                            </button>
                            <label className="px-3 py-2 bg-emerald-50 text-emerald-700 border text-xs font-bold rounded-xl flex items-center cursor-pointer">
                              <Upload className="w-3.5 h-3.5 mr-1.5" /> Nhập Excel Điểm
                              <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, 'grades')} className="hidden" />
                            </label>
                          </div>
                        )}
                        <button onClick={() => setGradeViewMode('edit')} className={`px-4 py-2 rounded-xl text-xs font-bold ${gradeViewMode === 'edit' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Nhập lưới</button>
                        <button onClick={() => setGradeViewMode('scoreboard')} className={`px-4 py-2 rounded-xl text-xs font-bold ${gradeViewMode === 'scoreboard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>Học bạ</button>
                      </div>
                    )}
                  </div>
                </div>
                {gradeViewMode === 'edit' ? (
                  <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
                    <table className="w-full text-left text-xs table-fixed">
                      <thead>
                        <tr className="bg-slate-50 border-b text-slate-500 uppercase"><th className="p-3 w-32 sticky left-0 bg-slate-50 border-r">Mã Học Viên</th><th className="p-3 w-40 sticky left-32 bg-slate-50 border-r">Họ Tên</th>
                          {subjectsOfSelectedMajorForGrades.map(sub => <th key={sub.id} className="p-3 w-20 text-center font-bold text-slate-900 border-r" title={sub.name}>{sub.id}</th>)}
                          <th className="p-3 w-20 text-center font-bold text-slate-900 border-r bg-orange-50" title="Điểm Rèn Luyện (Thang 100)">Điểm RL</th>
                          <th className="p-3 w-24 text-center bg-slate-50 sticky right-0 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">GPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {studentsOfSelectedMajorForGrades.map(st => {
                          const gpaInfo = getTermGPAOfStudent(st.id, selectedMajorForGrades, grades, subjects);
                          const drlGrade = grades.find(g => g.studentId === st.id && g.subjectId === 'DRL');
                          
                          return (
                            <tr key={st.id} className="hover:bg-slate-50">
                              <td className="p-2 font-bold sticky left-0 bg-white border-r">{st.id}</td><td className="p-2 sticky left-32 bg-white border-r font-semibold truncate">{st.name}</td>
                              {subjectsOfSelectedMajorForGrades.map(sub => {
                                const grade = grades.find(g => g.studentId === st.id && g.subjectId === sub.id);
                                const isBelowAverage = grade && grade.score !== '' && parseFloat(grade.score) < 4.0;
                                return (
                                  <td key={sub.id} className="p-1 border-r text-center">
                                    <input 
                                      type="number" 
                                      disabled={!hasAccess(['admin', 'staff', 'teacher'])} 
                                      value={grade ? grade.score : ''} 
                                      onChange={(e) => handleUpdateGradeDirectly(st.id, sub.id, e.target.value)} 
                                      className={`w-12 p-1 border rounded text-center text-xs focus:ring-1 focus:ring-indigo-500 ${isBelowAverage ? 'text-rose-600 bg-rose-50 border-rose-300 font-bold' : 'bg-white'}`} 
                                      placeholder="-" 
                                    />
                                  </td>
                                );
                              })}
                              <td className="p-1 border-r bg-orange-50 text-center">
                                <input type="number" max="100" min="0" disabled={!hasAccess(['admin', 'staff', 'teacher'])} value={drlGrade ? drlGrade.score : ''} onChange={(e) => handleUpdateGradeDirectly(st.id, 'DRL', e.target.value)} className="w-12 p-1 border rounded text-center text-xs font-bold text-orange-700 bg-white focus:ring-1 focus:ring-orange-500" placeholder="-" />
                              </td>
                              <td className="p-2 text-center sticky right-0 bg-white shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)] font-bold text-indigo-700">
                                {gpaInfo.credits > 0 ? <>{gpaInfo.gpa.toFixed(2)}<br/><span className="text-[9px] text-slate-500">TBC: {gpaInfo.avg10}</span></> : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border shadow-sm p-6 overflow-x-auto text-xs">
                     {hasAccess(['student']) ? (
                        <div>
                          <h3 className="font-bold text-lg mb-4 text-indigo-700 border-b pb-2">Bảng điểm tích lũy toàn khóa</h3>
                          <table className="w-full text-left mb-6">
                            <thead>
                              <tr className="border-b uppercase text-slate-500"><th className="py-2">Mã Môn</th><th className="py-2">Tên Môn</th><th className="py-2 text-center">Tín chỉ</th><th className="py-2 text-center">Điểm (Hệ 10)</th></tr>
                            </thead>
                            <tbody className="divide-y">
                              {subjectsOfSelectedMajorForGrades.map(sub => {
                                const grade = grades.find(g => g.studentId === currentUser.studentId && g.subjectId === sub.id);
                                const isBelowAverage = grade && grade.score !== undefined && parseFloat(grade.score) < 4.0;
                                return (
                                  <tr key={sub.id} className="hover:bg-slate-50">
                                    <td className="py-3 font-bold">{sub.id}</td>
                                    <td className="py-3 font-medium">{sub.name}</td>
                                    <td className="py-3 text-center text-slate-600">{sub.credits}</td>
                                    <td className={`py-3 text-center font-bold ${isBelowAverage ? 'text-rose-600 bg-rose-50 rounded-xl' : 'text-slate-800'}`}>
                                      {grade && grade.score !== undefined ? grade.score : '-'}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                          {(() => {
                              const gpaInfo = getTermGPAOfStudent(currentUser.studentId, selectedMajorForGrades, grades, subjects);
                              const drlGrade = grades.find(g => g.studentId === currentUser.studentId && g.subjectId === 'DRL');
                              return (
                                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-wrap justify-between font-bold text-sm text-slate-700">
                                      <span>Tổng tín chỉ: <span className="text-indigo-700">{gpaInfo.credits}</span></span>
                                      <span>TBC (Hệ 10): <span className="text-indigo-700">{gpaInfo.avg10}</span></span>
                                      <span>Điểm Rèn Luyện: <span className="text-orange-600">{drlGrade ? drlGrade.score : '-'}</span></span>
                                      <span>GPA (Hệ 4): <span className="text-indigo-700">{gpaInfo.gpa.toFixed(2)}</span></span>
                                      <span>Xếp loại: <span className="text-indigo-700 uppercase">{gpaInfo.label}</span></span>
                                  </div>
                              )
                          })()}
                        </div>
                     ) : (
                        <table className="w-full text-left">
                          <thead><tr className="border-b uppercase text-slate-500"><th className="py-2">Mã HV</th><th className="py-2">Họ Tên</th><th className="py-2 text-center">Điểm RL</th><th className="py-2 text-center">Tín Chỉ (Tính GPA)</th><th className="py-2 text-center">TBC (Hệ 10)</th><th className="py-2 text-center">GPA (Hệ 4)</th><th className="py-2 text-right">Xếp loại</th></tr></thead>
                          <tbody className="divide-y">
                            {studentsOfSelectedMajorForGrades.map(st => {
                              const gpaInfo = getTermGPAOfStudent(st.id, selectedMajorForGrades, grades, subjects);
                              const drlGrade = grades.find(g => g.studentId === st.id && g.subjectId === 'DRL');
                              return (
                                <tr key={st.id}>
                                  <td className="py-3 font-bold">{st.id}</td><td className="py-3 font-semibold">{st.name}</td>
                                  <td className="py-3 text-center font-bold text-orange-600">{drlGrade ? drlGrade.score : '-'}</td>
                                  <td className="py-3 text-center">{gpaInfo.credits} tín</td><td className="py-3 text-center font-bold text-slate-700">{gpaInfo.avg10}</td>
                                  <td className="py-3 text-center font-extrabold text-indigo-600">{gpaInfo.credits > 0 ? gpaInfo.gpa.toFixed(2) : '-'}</td>
                                  <td className="py-3 text-right font-bold uppercase">{gpaInfo.credits > 0 ? gpaInfo.label : '-'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                     )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl border shadow-sm p-6">
                <Calendar className="w-20 h-20 text-slate-200 mb-6" />
                <h3 className="text-2xl font-bold text-slate-700 mb-2">Nội dung này đang được cập nhật</h3>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Khung ngành:</span>
                    <select value={studentFilterMajor} onChange={(e) => setStudentFilterMajor(e.target.value)} className="bg-slate-50 border text-xs font-bold rounded-xl px-3 py-2.5">
                      {INITIAL_COURSES.map(course => <option key={course.id} value={course.name}>{course.name}</option>)}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    {hasAccess(['admin', 'staff']) && (
                      <div className="flex gap-2">
                        <button onClick={() => handleDownloadTemplate('subjects')} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border text-xs font-bold rounded-xl flex items-center transition-colors">
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Tải mẫu Excel
                        </button>
                        <label className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border text-xs font-bold rounded-xl flex items-center cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5 mr-1.5" /> Nhập Excel Môn
                          <input type="file" accept=".xlsx, .xls" onChange={(e) => handleExcelImport(e, 'subjects')} className="hidden" />
                        </label>
                        <button onClick={() => handleOpenSubjectModal('add')} className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center"><Plus className="w-4 h-4 mr-1 inline" /> Thêm Môn</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead><tr className="bg-slate-50 border-b"><th className="p-4">Mã Môn</th><th className="p-4">Tên môn học</th><th className="p-4">Loại</th><th className="p-4 text-center">Tín chỉ / Giờ</th><th className="p-4 text-right">Sửa/Xóa</th></tr></thead>
                    <tbody className="divide-y">
                      {subjects.filter(s => s.major === studentFilterMajor).map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50">
                          <td className="p-4 font-bold">{sub.id}</td><td className="p-4 font-bold">{sub.name}</td><td className="p-4 text-slate-500">{sub.type}</td>
                          <td className="p-4 text-center text-indigo-600 font-bold">{sub.credits} Tín / {sub.hours}h</td>
                          <td className="p-4 text-right">
                             {hasAccess(['admin', 'staff']) && (
                               <>
                                 <button onClick={() => handleOpenSubjectModal('edit', sub)} className="p-1 text-indigo-600 mr-2"><Edit className="w-4 h-4"/></button>
                                 <button onClick={() => handleDeleteSubject(sub.id, sub.major)} className="p-1 text-rose-600"><Trash2 className="w-4 h-4"/></button>
                               </>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* --- CÁC MODAL --- */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleSaveStudent} className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden text-xs">
            <div className="bg-indigo-900 text-white p-4 font-bold flex justify-between">Hồ sơ Học viên <button type="button" onClick={() => setIsStudentModalOpen(false)}><X className="w-4 h-4"/></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div><label className="block mb-1 font-bold text-slate-600">Mã HV *</label><input required disabled={studentFormMode==='edit'} value={currentStudentData.id} onChange={e=>setCurrentStudentData({...currentStudentData, id: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Họ Tên *</label><input required value={currentStudentData.name} onChange={e=>setCurrentStudentData({...currentStudentData, name: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Ngày sinh *</label><input type="date" required value={currentStudentData.dob} onChange={e=>setCurrentStudentData({...currentStudentData, dob: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Giới tính *</label><select value={currentStudentData.gender} onChange={e=>setCurrentStudentData({...currentStudentData, gender: e.target.value})} className="w-full p-2 border rounded"><option>Nam</option><option>Nữ</option></select></div>
              <div><label className="block mb-1 font-bold text-slate-600">Số CCCD *</label><input required value={currentStudentData.cccd} onChange={e=>setCurrentStudentData({...currentStudentData, cccd: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Điện thoại</label><input value={currentStudentData.phone} onChange={e=>setCurrentStudentData({...currentStudentData, phone: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Email</label><input type="email" value={currentStudentData.email} onChange={e=>setCurrentStudentData({...currentStudentData, email: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Lớp *</label><input required value={currentStudentData.class} onChange={e=>setCurrentStudentData({...currentStudentData, class: e.target.value.toUpperCase()})} className="w-full p-2 border rounded" /></div>
              <div className="col-span-2"><label className="block mb-1 font-bold text-slate-600">Ngành nghề *</label><select value={currentStudentData.major} onChange={e=>setCurrentStudentData({...currentStudentData, major: e.target.value})} className="w-full p-2 border rounded">{INITIAL_COURSES.map(c=><option key={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block mb-1 font-bold text-slate-600">Trạng thái *</label><select value={currentStudentData.status} onChange={e=>setCurrentStudentData({...currentStudentData, status: e.target.value})} className="w-full p-2 border rounded"><option>Đang học</option><option>Bảo lưu</option><option>Tốt nghiệp</option><option>Buộc thôi học</option></select></div>
              <div><label className="block mb-1 font-bold text-slate-600">Mật khẩu tra điểm *</label><input required value={currentStudentData.password} onChange={e=>setCurrentStudentData({...currentStudentData, password: e.target.value})} className="w-full p-2 border rounded" /></div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-2"><button type="button" onClick={() => setIsStudentModalOpen(false)} className="flex-1 py-2 bg-white border rounded font-bold">Hủy</button><button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold">Lưu lên hệ thống</button></div>
          </form>
        </div>
      )}

      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleSaveTeacher} className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden text-xs">
            <div className="bg-teal-700 text-white p-4 font-bold flex justify-between">Hồ sơ Giảng viên <button type="button" onClick={() => setIsTeacherModalOpen(false)}><X className="w-4 h-4"/></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div><label className="block mb-1 font-bold text-slate-600">Mã GV *</label><input required disabled={teacherFormMode==='edit'} value={currentTeacherData.id} onChange={e=>setCurrentTeacherData({...currentTeacherData, id: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Họ Tên *</label><input required value={currentTeacherData.name} onChange={e=>setCurrentTeacherData({...currentTeacherData, name: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Trình độ *</label><select value={currentTeacherData.degree} onChange={e=>setCurrentTeacherData({...currentTeacherData, degree: e.target.value})} className="w-full p-2 border rounded"><option>Tiến sĩ</option><option>Thạc sĩ</option><option>Cử nhân/Kỹ sư</option><option>Cao đẳng</option><option>Trung cấp</option></select></div>
              <div><label className="block mb-1 font-bold text-slate-600">Khoa *</label><select value={currentTeacherData.department} onChange={e=>setCurrentTeacherData({...currentTeacherData, department: e.target.value})} className="w-full p-2 border rounded"><option>Khoa Kỹ thuật - Công nghệ</option><option>Khoa Dịch vụ  - Du lịch - Nhà hàng khách sạn</option><option>Khoa Ngôn ngữ</option></select></div>
              <div><label className="block mb-1 font-bold text-slate-600">Điện thoại</label><input value={currentTeacherData.phone} onChange={e=>setCurrentTeacherData({...currentTeacherData, phone: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Email</label><input type="email" value={currentTeacherData.email} onChange={e=>setCurrentTeacherData({...currentTeacherData, email: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Chuyên môn *</label><input required value={currentTeacherData.specialty} onChange={e=>setCurrentTeacherData({...currentTeacherData, specialty: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Mật khẩu *</label><input required value={currentTeacherData.password} onChange={e=>setCurrentTeacherData({...currentTeacherData, password: e.target.value})} className="w-full p-2 border rounded" /></div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-2"><button type="button" onClick={() => setIsTeacherModalOpen(false)} className="flex-1 py-2 bg-white border rounded font-bold">Hủy</button><button type="submit" className="flex-1 py-2 bg-teal-600 text-white rounded font-bold">Lưu lên hệ thống</button></div>
          </form>
        </div>
      )}

      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleSaveClass} className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden text-xs">
            <div className="bg-amber-600 text-white p-4 font-bold flex justify-between">Lớp học <button type="button" onClick={() => setIsClassModalOpen(false)}><X className="w-4 h-4"/></button></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div><label className="block mb-1 font-bold text-slate-600">Mã Lớp *</label><input required disabled={classFormMode==='edit'} value={currentClassData.id} onChange={e=>setCurrentClassData({...currentClassData, id: e.target.value.toUpperCase()})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Tên Lớp *</label><input required value={currentClassData.name} onChange={e=>setCurrentClassData({...currentClassData, name: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div className="col-span-2"><label className="block mb-1 font-bold text-slate-600">Ngành *</label><select value={currentClassData.major} onChange={e=>setCurrentClassData({...currentClassData, major: e.target.value})} className="w-full p-2 border rounded">{INITIAL_COURSES.map(c=><option key={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block mb-1 font-bold text-slate-600">GV Phụ trách *</label><input required value={currentClassData.teacherId} onChange={e=>setCurrentClassData({...currentClassData, teacherId: e.target.value})} className="w-full p-2 border rounded" placeholder="VD: GV001" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Sĩ số *</label><input type="number" required value={currentClassData.quota} onChange={e=>setCurrentClassData({...currentClassData, quota: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Bắt đầu *</label><input type="date" required value={currentClassData.startDate} onChange={e=>setCurrentClassData({...currentClassData, startDate: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-1 font-bold text-slate-600">Kết thúc *</label><input type="date" required value={currentClassData.endDate} onChange={e=>setCurrentClassData({...currentClassData, endDate: e.target.value})} className="w-full p-2 border rounded" /></div>
              <div className="col-span-2"><label className="block mb-1 font-bold text-slate-600">Địa điểm *</label><input required value={currentClassData.location} onChange={e=>setCurrentClassData({...currentClassData, location: e.target.value})} className="w-full p-2 border rounded" /></div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-2"><button type="button" onClick={() => setIsClassModalOpen(false)} className="flex-1 py-2 bg-white border rounded font-bold">Hủy</button><button type="submit" className="flex-1 py-2 bg-amber-600 text-white rounded font-bold">Lưu lên hệ thống</button></div>
          </form>
        </div>
      )}

      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <form onSubmit={handleSaveSubject} className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden text-xs">
            <div className="bg-purple-700 text-white p-4 font-bold flex justify-between">Môn học <button type="button" onClick={() => setIsSubjectModalOpen(false)}><X className="w-4 h-4"/></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block mb-1 font-bold">Ngành</label><input disabled value={currentSubjectData.major} className="w-full p-2 border rounded bg-slate-50" /></div>
              <div><label className="block mb-1 font-bold">Mã Môn *</label><input required disabled={subjectFormMode==='edit'} value={currentSubjectData.id} onChange={e=>setCurrentSubjectData({...currentSubjectData, id: e.target.value.toUpperCase()})} className="w-full p-2 border rounded" /></div>
              <div>
                <label className="block mb-1 font-bold">Tên Môn *</label>
                <input required value={currentSubjectData.name} onChange={e=>setCurrentSubjectData({...currentSubjectData, name: e.target.value})} className="w-full p-2 border rounded" />
                <p className="text-[10px] text-slate-500 mt-1">* Nếu môn học có chứa chữ "thể chất" hoặc "QP-AN", hệ thống sẽ tự động bỏ qua khi tính GPA.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="block mb-1 font-bold">Tín chỉ *</label><input type="number" step="0.5" required value={currentSubjectData.credits} onChange={e=>setCurrentSubjectData({...currentSubjectData, credits: e.target.value})} className="w-full p-2 border rounded" /></div>
                <div className="flex-1"><label className="block mb-1 font-bold">Số giờ *</label><input type="number" required value={currentSubjectData.hours} onChange={e=>setCurrentSubjectData({...currentSubjectData, hours: e.target.value})} className="w-full p-2 border rounded" /></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex gap-2"><button type="button" onClick={() => setIsSubjectModalOpen(false)} className="flex-1 py-2 bg-white border rounded font-bold">Hủy</button><button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded font-bold">Lưu</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
