import React, { useState, useMemo, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { 
  Users, GraduationCap, UserCheck, Search, Plus, Edit, Trash2, Lock, LogOut, 
  User, Shield, BookOpen, CheckCircle, AlertCircle, Menu, X, Key, Filter, 
  Mail, Phone, Briefcase, Calendar, Layers, Award, ClipboardList, ChevronRight, 
  Download, Upload, Printer, Bot, Sparkles, Send, Loader2
} from 'lucide-react';

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
    // === NGÀNH: CÔNG NGHỆ THÔNG TIN (image_304889.png) ===
  { id: 'MH01', name: 'Tiếng Anh', credits: 3, hours: 90, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH02', name: 'Tin học', credits: 2, hours: 45, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH03', name: 'Giáo dục chính trị', credits: 2, hours: 30, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH04', name: 'Pháp luật', credits: 1, hours: 15, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH05', name: 'Giáo dục QP-AN', credits: 2, hours: 45, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH06', name: 'Giáo dục Thể chất', credits: 1, hours: 30, major: 'Công nghệ thông tin', type: 'Các môn học chung' },
  { id: 'MH07', name: 'Kỹ năng làm việc nhóm', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH08', name: 'Lập trình cơ bản', credits: 2, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH09', name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH10', name: 'Cơ sở dữ liệu', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MĐ11', name: 'Soạn thảo văn bản', credits: 1.5, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun cơ sở' },
  { id: 'MH12', name: 'Phân tích và thiết kế hệ thống thông tin', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MĐ13', name: 'Bảng tính Excel', credits: 1.5, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MĐ14', name: 'Thiết kế bài thuyết trình', credits: 1.5, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH15', name: 'Mạng máy tính', credits: 3, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH16', name: 'Quản trị cơ sở dữ liệu với Access', credits: 2, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH17', name: 'Cấu trúc và bảo trì máy tính', credits: 5, hours: 75, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MĐ18', name: 'Photoshop cơ bản', credits: 1.5, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH19', name: 'AutoCAD cơ bản', credits: 1.5, hours: 45, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH20', name: 'Thiết kế trang Web', credits: 2, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH21', name: 'Thiết kế và lắp đặt hệ thống mạng', credits: 2, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH22', name: 'Quản trị CSDL với SQL server', credits: 2, hours: 60, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH23', name: 'Thực hành nghề nghiệp 1', credits: 4, hours: 120, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MĐ24', name: 'Thực hành nghề nghiệp 2', credits: 4, hours: 180, major: 'Công nghệ thông tin', type: 'Môn học, mô đun chuyên môn' },
  { id: 'MH25', name: 'Kỹ năng giao tiếp', credits: 2, hours: 30, major: 'Công nghệ thông tin', type: 'Môn học, mô đun tự chọn' },
  { id: 'MH26', name: 'Khởi tạo doanh nghiệp', credits: 2, hours: 30, major: 'Công nghệ thông tin', type: 'Môn học, mô đun tự chọn' },
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

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // --- AI Chat Assistant States ---
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([
    { role: 'model', text: 'Xin chào! Tôi là AI Assistant của hệ thống HIC LMS. Tôi có thể giúp gì cho bạn?' }
  ]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [isAiChatLoading, setIsAiChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- AI Student Analysis States ---
  const [isAiAnalysisModalOpen, setIsAiAnalysisModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState('');
  const [isAiAnalysisLoading, setIsAiAnalysisLoading] = useState(false);
  const [analyzingStudent, setAnalyzingStudent] = useState(null);

  useEffect(() => {
    // Scroll chat to bottom when messages update
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatMessages, isAiChatOpen]);

  useEffect(() => {
    const unsubAccounts = onSnapshot(collection(db, 'accounts'), (snap) => {
      if (snap.empty) {
        const batch = writeBatch(db);
        USERS_ACCOUNTS.forEach(acc => {
          batch.set(doc(collection(db, 'accounts'), acc.username), acc);
        });
        batch.commit();
      } else {
        setAccounts(snap.docs.map(d => d.data()));
      }
    });

    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => setStudents(snap.docs.map(d => d.data())));
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snap) => setTeachers(snap.docs.map(d => d.data())));
    const unsubClasses = onSnapshot(collection(db, 'classes'), (snap) => {
      const cls = snap.docs.map(d => d.data());
      setClasses(cls);
      if (cls.length > 0 && !selectedClassIdForAttendance) setSelectedClassIdForAttendance(cls[0].id);
    });

    const unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      if (snap.empty) {
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

    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      unsubAccounts(); unsubStudents(); unsubTeachers(); unsubClasses(); 
      unsubSubjects(); unsubGrades();
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

  // Helper render markdown-like bold text for AI Responses
  const renderMarkdownText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-indigo-800">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          <br />
        </span>
      );
    });
  };

  // --- GEMINI API INTEGRATION ---
  const callGeminiAPI = async (prompt, systemInstruction = null, isMultiTurn = false, chatHistory = []) => {
    const apiKey = ""; // API key passed via runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    let contents = [];
    
    if (isMultiTurn && chatHistory.length > 0) {
      contents = chatHistory.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: prompt }] });
    } else {
      contents = [{ parts: [{ text: prompt }] }];
    }

    const payload = {
      contents: contents,
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ AI.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Xin lỗi, đã xảy ra lỗi kết nối đến máy chủ AI. Vui lòng thử lại sau.";
    }
  };

  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMessage = { role: 'user', text: aiChatInput };
    const updatedHistory = [...aiChatMessages, userMessage];
    setAiChatMessages(updatedHistory);
    setAiChatInput('');
    setIsAiChatLoading(true);

    const sysInstruction = "Bạn là trợ lý AI chuyên nghiệp của Hệ thống quản lý đào tạo (HIC LMS). Bạn được tạo ra để hỗ trợ quản trị viên, giảng viên và học viên giải đáp các thắc mắc. Hãy trả lời ngắn gọn, lịch sự, có định dạng bằng tiếng Việt.";
    
    const responseText = await callGeminiAPI(aiChatInput, sysInstruction, true, aiChatMessages);
    
    setAiChatMessages([...updatedHistory, { role: 'model', text: responseText }]);
    setIsAiChatLoading(false);
  };

  const handleAnalyzeStudent = async (student) => {
    setAnalyzingStudent(student);
    setIsAiAnalysisModalOpen(true);
    setIsAiAnalysisLoading(true);
    setAiAnalysisResult('');

    const gpaInfo = getTermGPAOfStudent(student.id, student.major, grades, subjects);
    const studentGrades = subjects.filter(s => s.major === student.major).map(sub => {
      const g = grades.find(gd => gd.studentId === student.id && gd.subjectId === sub.id);
      return `${sub.name} (${sub.credits} tín chỉ): ${g ? g.score : 'Chưa học'}`;
    }).join('\n');

    const prompt = `
      Bạn là cố vấn học tập xuất sắc của trường. Hãy phân tích kết quả học tập của học viên sau đây:
      - Tên: ${student.name}
      - Chuyên ngành: ${student.major}
      - Điểm trung bình tích lũy (Hệ 10): ${gpaInfo.avg10 > 0 ? gpaInfo.avg10 : 'Chưa có'}
      - Điểm GPA (Hệ 4): ${gpaInfo.credits > 0 ? gpaInfo.gpa.toFixed(2) : 'Chưa có'} (${gpaInfo.label})
      
      Danh sách điểm chi tiết các môn:
      ${studentGrades}

      Yêu cầu: Đánh giá ngắn gọn ưu/nhược điểm, và đề xuất 1 lộ trình hoặc chiến lược học tập hiệu quả, mang tính động viên trong 3-4 đoạn văn ngắn. Dùng markdown để bôi đậm các ý chính.
    `;

    const sysInstruction = "Bạn là Cố vấn học tập AI tại trường Trung cấp Quốc tế Hà Nội (HIC). Bạn luôn đưa ra lời khuyên thiết thực, chuyên nghiệp và có tính khích lệ.";

    const response = await callGeminiAPI(prompt, sysInstruction);
    setAiAnalysisResult(response);
    setIsAiAnalysisLoading(false);
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
      } catch(err) { showToast('Lỗi xóa Firebase.', 'error'); }
    });
  };

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

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      // 1. Lưu hồ sơ học viên lên Cloud
      await setDoc(doc(db, 'students', currentStudentData.id), currentStudentData);
      
      // 2. Tự động khởi tạo tài khoản hệ thống
      await setDoc(doc(db, 'accounts', currentStudentData.id), {
        username: currentStudentData.id,
        password: currentStudentData.password || '123',
        name: currentStudentData.name,
        role: 'student',
        email: currentStudentData.email || '',
        studentId: currentStudentData.id
      });
      showToast(`Đã lưu học viên "${currentStudentData.name}" lên máy chủ Cloud`, 'success');
      setIsStudentModalOpen(false);
    } catch(err) {
      showToast('Lỗi kết nối Firebase: ' + err.message, 'error');
    }
  };

  const handleDeleteStudent = (id, name) => {
    triggerConfirm('Xóa học viên', `Xóa vĩnh viễn học viên "${name}" khỏi cơ sở dữ liệu?`, async () => {
      try {
        await deleteDoc(doc(db, 'students', id));
        await deleteDoc(doc(db, 'accounts', id));
        showToast('Đã xóa dữ liệu học viên.', 'warning');
      } catch(err) { showToast('Lỗi Firebase.', 'error'); }
    });
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'teachers', currentTeacherData.id), currentTeacherData);
      await setDoc(doc(db, 'accounts', currentTeacherData.id), {
        username: currentTeacherData.id,
        password: currentTeacherData.password || '123',
        name: currentTeacherData.name,
        role: 'teacher',
        email: currentTeacherData.email || '',
        teacherId: currentTeacherData.id
      });
      showToast(`Đã lưu giảng viên "${currentTeacherData.name}" lên máy chủ Cloud`, 'success');
      setIsTeacherModalOpen(false);
    } catch(err) {
      showToast('Lỗi kết nối Firebase: ' + err.message, 'error');
    }
  };

  const handleDeleteTeacher = (id, name) => {
    triggerConfirm('Xóa giảng viên', `Xóa giảng viên "${name}" khỏi cơ sở dữ liệu?`, async () => {
      try {
        await deleteDoc(doc(db, 'teachers', id));
        await deleteDoc(doc(db, 'accounts', id));
        showToast('Đã xóa dữ liệu giảng viên.', 'warning');
      } catch(err) { showToast('Lỗi Firebase.', 'error'); }
    });
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'classes', currentClassData.id), currentClassData);
      showToast(`Đã lưu lớp "${currentClassData.name}" lên máy chủ Cloud`, 'success');
      setIsClassModalOpen(false);
    } catch(err) {
      showToast('Lỗi kết nối Firebase: ' + err.message, 'error');
    }
  };

  const handleDeleteClass = (id, name) => {
    triggerConfirm('Hủy lớp', `Hủy lớp học "${name}"?`, async () => {
      try {
        await deleteDoc(doc(db, 'classes', id));
        showToast('Đã hủy lớp học.', 'warning');
      } catch(err) { showToast('Lỗi Firebase.', 'error'); }
    });
  };

  const handleOpenStudentModal = (mode, student = null) => {
    setStudentFormMode(mode);
    if (mode === 'edit' && student) {
      setCurrentStudentData({ ...student });
    } else {
      setCurrentStudentData({ id: `HV${Date.now().toString().slice(-4)}`, name: '', dob: '', gender: 'Nam', cccd: '', phone: '', email: '', status: 'Đang học', class: 'CNTT-K15', major: 'Công nghệ thông tin', password: '123' });
    }
    setIsStudentModalOpen(true);
  };

  const handleOpenTeacherModal = (mode, teacher = null) => {
    setTeacherFormMode(mode);
    if (mode === 'edit' && teacher) {
      setCurrentTeacherData({ ...teacher });
    } else {
      setCurrentTeacherData({ id: `GV${Date.now().toString().slice(-4)}`, name: '', specialty: '', department: 'Khoa Kỹ thuật - Công nghệ', phone: '', email: '', degree: 'Thạc sĩ', password: '123' });
    }
    setIsTeacherModalOpen(true);
  };

  const handleOpenClassModal = (mode, cls = null) => {
    setClassFormMode(mode);
    if (mode === 'edit' && cls) {
      setCurrentClassData({ ...cls });
    } else {
      setCurrentClassData({ id: `LH${Date.now().toString().slice(-4)}`, name: '', courseId: 'KH001', major: 'Công nghệ thông tin', teacherId: '', startDate: '', endDate: '', location: '', quota: 40, term: 'Học kỳ I' });
    }
    setIsClassModalOpen(true);
  };

  const subjectsOfSelectedMajorForGrades = useMemo(() => subjects.filter(s => s.major === selectedMajorForGrades), [subjects, selectedMajorForGrades]);
  
  const studentsOfSelectedMajorForGrades = useMemo(() => {
    return students.filter(st => {
      if (currentUser?.role === 'student') return st.id === currentUser.studentId;
      return st.major === selectedMajorForGrades && (st.id.toLowerCase().includes(gradeSearchText.toLowerCase()) || st.name.toLowerCase().includes(gradeSearchText.toLowerCase()));
    });
  }, [students, selectedMajorForGrades, gradeSearchText, currentUser]);

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 relative">
      
      {/* Toast Notification */}
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

      {/* Floating AI Assistant Chat Window */}
      {isAiChatOpen && (
        <div className="fixed bottom-24 right-5 w-80 md:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in" style={{ height: '500px' }}>
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-lg"><Sparkles className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="font-bold text-sm">Trợ lý AI HIC LMS</h3>
                <p className="text-[10px] text-indigo-200">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsAiChatOpen(false)} className="hover:bg-indigo-700 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {aiChatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                }`}>
                  {msg.role === 'model' ? renderMarkdownText(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {isAiChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-xs">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendAiMessage} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
            <input 
              type="text" 
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              placeholder="Hỏi AI bất kỳ điều gì..." 
              className="flex-1 px-4 py-2.5 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500"
              disabled={isAiChatLoading}
            />
            <button 
              type="submit" 
              disabled={isAiChatLoading || !aiChatInput.trim()}
              className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating AI Button */}
      <button 
        onClick={() => setIsAiChatOpen(!isAiChatOpen)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-200 transition-transform hover:scale-105 flex items-center justify-center group"
      >
        {isAiChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          Hỏi AI Trợ lý
        </span>
      </button>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden">
        
        {}
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
            <button onClick={() => setActiveTab('curriculum')} className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><BookOpen className="w-4 h-4 mr-3" /> QL Môn học / Mô-đun</button>
          </nav>
          <div className="p-4 border-t border-slate-800 text-xs">
            <button onClick={handleLogout} className="w-full flex items-center p-2 text-rose-400 hover:bg-rose-900 rounded-lg mt-1"><LogOut className="w-4 h-4 mr-2" /> Đăng xuất</button>
          </div>
        </aside>

        <header className="md:hidden bg-slate-900 text-slate-200 flex items-center justify-between p-4 shrink-0">
          <div className="font-bold text-white flex items-center"><GraduationCap className="w-5 h-5 mr-2" /> HIC LMS</div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </header>

        {}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-full relative">
          
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {activeTab === 'dashboard' && 'Bảng điều khiển hệ thống'}
                {activeTab === 'students' && 'Quản lý Hồ sơ Học viên'}
                {activeTab === 'teachers' && 'Danh mục hồ sơ Giảng viên'}
                {activeTab === 'classes' && 'Quản lý Lớp học phần'}
                {activeTab === 'grades' && 'Quản lý điểm số học tập tích lũy'}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {}
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 text-slate-700">
                        {studentsOfSelectedMajorForGrades.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-4 font-mono font-bold text-slate-950 sticky left-0 bg-white z-10 border-r border-slate-150">{st.id}</td>
                            <td className="py-2 px-4 font-semibold sticky left-32 bg-white z-10 border-r border-slate-150">{st.name}</td>
                            {subjectsOfSelectedMajorForGrades.map(sub => {
                              const grade = grades.find(g => g.studentId === st.id && g.subjectId === sub.id);
                              return (
                                <td key={sub.id} className="py-1 px-1 border-r border-slate-100 text-center">
                                  <input type="number" disabled={!hasAccess(['admin', 'staff', 'teacher'])} min="0" max="10" step="0.1" value={grade ? grade.score : ''} onChange={(e) => handleUpdateGradeDirectly(st.id, sub.id, e.target.value)} className="w-12 px-1 py-1 border border-slate-200 rounded text-center text-xs font-semibold focus:ring-1 focus:ring-indigo-500" placeholder="-" />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
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
                        <th className="py-2.5 px-2 text-center text-emerald-700">TBC Tích Lũy (Hệ 10)</th>
                        <th className="py-2.5 px-2 text-center text-indigo-700">GPA Tích Lũy (Hệ 4)</th>
                        <th className="py-2.5 px-2 text-right">Thao tác AI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {studentsOfSelectedMajorForGrades.map(st => {
                        const gpaInfo = getTermGPAOfStudent(st.id, selectedMajorForGrades, grades, subjects);
                        return (
                          <tr key={st.id}>
                            <td className="py-3 px-2 font-mono font-bold">{st.id}</td>
                            <td className="py-3 px-2 font-semibold text-slate-800">{st.name}</td>
                            <td className="py-3 px-2 text-center font-extrabold text-emerald-700">{gpaInfo.avg10 > 0 ? gpaInfo.avg10 : '-'}</td>
                            <td className="py-3 px-2 text-center font-extrabold text-indigo-600">{gpaInfo.credits > 0 ? gpaInfo.gpa.toFixed(2) : '-'}</td>
                            <td className="py-3 px-2 text-right">
                              <button 
                                onClick={() => handleAnalyzeStudent(st)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI Phân tích</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {}
          {isAiAnalysisModalOpen && analyzingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
                <div className="bg-indigo-600 text-white p-5 flex justify-between items-center shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-xl"><Sparkles className="w-6 h-6 text-white" /></div>
                    <div>
                      <h3 className="font-bold text-lg">AI Phân tích Học tập</h3>
                      <p className="text-xs text-indigo-200">Học viên: <strong className="text-white">{analyzingStudent.name}</strong> • Lớp: {analyzingStudent.class}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAiAnalysisModalOpen(false)} className="hover:bg-indigo-700 p-2 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 text-sm text-slate-700 leading-relaxed space-y-4">
                  {isAiAnalysisLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-4">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                      <p className="font-semibold text-center">AI đang tổng hợp và đánh giá kết quả học tập...<br/><span className="text-xs font-normal">Quá trình này có thể mất vài giây.</span></p>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      {renderMarkdownText(aiAnalysisResult)}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-white shrink-0 text-right text-xs text-slate-500 flex justify-between items-center">
                  <span className="flex items-center"><Bot className="w-4 h-4 mr-1.5 opacity-50" /> Nội dung được tự động tạo bởi HIC Gemini AI.</span>
                  <button onClick={() => setIsAiAnalysisModalOpen(false)} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Đóng lại</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
