const SUBJECTS = ['Mathematics', 'Programming', 'Database', 'Web Technology', 'English'];
const KEY = 'resultiq_students_v1';
const PASS_MARK = 40;

const seed = [
  { id: crypto.randomUUID(), name: 'Aarav Sharma', roll: 'BCA001', className: 'BCA 3A', section: 'A', marks: [92, 88, 90, 86, 84] },
  { id: crypto.randomUUID(), name: 'Priya Singh', roll: 'BCA002', className: 'BCA 3A', section: 'A', marks: [84, 91, 87, 89, 94] },
  { id: crypto.randomUUID(), name: 'Rohan Kumar', roll: 'BCA003', className: 'BCA 3A', section: 'A', marks: [72, 76, 81, 69, 78] },
  { id: crypto.randomUUID(), name: 'Ananya Verma', roll: 'BCA004', className: 'BCA 3B', section: 'B', marks: [96, 94, 92, 95, 91] },
  { id: crypto.randomUUID(), name: 'Kabir Mehta', roll: 'BCA005', className: 'BCA 3B', section: 'B', marks: [58, 61, 54, 63, 60] },
  { id: crypto.randomUUID(), name: 'Neha Gupta', roll: 'BCA006', className: 'BCA 3B', section: 'B', marks: [42, 38, 51, 45, 48] },
  { id: crypto.randomUUID(), name: 'Ishaan Patel', roll: 'BCA007', className: 'BCA 2A', section: 'A', marks: [67, 73, 71, 65, 69] },
  { id: crypto.randomUUID(), name: 'Meera Joshi', roll: 'BCA008', className: 'BCA 2A', section: 'A', marks: [89, 85, 88, 90, 87] }
];

let students;
try {
  const stored = JSON.parse(localStorage.getItem(KEY));
  students = Array.isArray(stored) ? stored : seed;
} catch {
  students = seed;
}

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const save = () => localStorage.setItem(KEY, JSON.stringify(students));

function calc(student) {
  const total = student.marks.reduce((sum, mark) => sum + Number(mark), 0);
  const percentage = total / SUBJECTS.length;
  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';
  const status = percentage >= PASS_MARK && student.marks.every(mark => Number(mark) >= PASS_MARK) ? 'Pass' : 'Fail';
  return { total, percentage, grade, status };
}

const initials = name => name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
const gradeColor = grade => ({ 'A+': '#4f46e5', A: '#6366f1', B: '#8b5cf6', C: '#a78bfa', D: '#c4b5fd', F: '#ef4444' }[grade]);
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

function stats() {
  const count = students.length;
  const average = count ? students.reduce((sum, student) => sum + calc(student).percentage, 0) / count : 0;
  const passed = students.filter(student => calc(student).status === 'Pass').length;
  const highest = count ? Math.max(...students.map(student => calc(student).percentage)) : 0;

  $('#stats').innerHTML = `
    <div class="stat"><div class="stat-label">TOTAL STUDENTS</div><div class="stat-value">${count}</div><div class="stat-sub">Across all classes</div></div>
    <div class="stat"><div class="stat-label">CLASS AVERAGE</div><div class="stat-value">${average.toFixed(1)}%</div><div class="stat-sub">Overall performance</div></div>
    <div class="stat"><div class="stat-label">PASS RATE</div><div class="stat-value">${count ? (passed / count * 100).toFixed(1) : '0.0'}%</div><div class="stat-sub">${passed} students passed</div></div>
    <div class="stat"><div class="stat-label">HIGHEST SCORE</div><div class="stat-value">${highest.toFixed(1)}%</div><div class="stat-sub">Best overall result</div></div>`;

  const topGrade = count ? [...students].sort((a, b) => calc(b).percentage - calc(a).percentage)[0] : null;
  const aPlus = students.filter(student => calc(student).grade === 'A+').length;
  $('#analyticsStats').innerHTML = `
    <div class="stat"><div class="stat-label">AVERAGE MARKS</div><div class="stat-value">${average.toFixed(1)}</div><div class="stat-sub">Out of 100</div></div>
    <div class="stat"><div class="stat-label">PASSING STUDENTS</div><div class="stat-value">${passed}</div><div class="stat-sub">${count - passed} need attention</div></div>
    <div class="stat"><div class="stat-label">TOP GRADE</div><div class="stat-value">${topGrade ? calc(topGrade).grade : '—'}</div><div class="stat-sub">${aPlus} students with A+</div></div>
    <div class="stat"><div class="stat-label">SUBJECTS</div><div class="stat-value">${SUBJECTS.length}</div><div class="stat-sub">Tracked per student</div></div>`;
}

function renderDashboard() {
  stats();
  const averages = SUBJECTS.map((_, index) => students.length ? students.reduce((sum, student) => sum + Number(student.marks[index]), 0) / students.length : 0);
  $('#subjectChart').innerHTML = students.length
    ? averages.map((average, index) => `<div class="bar-col"><span class="bar-value">${average.toFixed(0)}%</span><div class="bar" style="height:${Math.max(4, average)}%"></div><span class="bar-label">${SUBJECTS[index].slice(0, 5)}</span></div>`).join('')
    : '<div class="empty-state">Add students to see subject performance.</div>';

  const counts = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  students.forEach(student => counts[calc(student).grade]++);
  if (!students.length) {
    $('#gradeChart').innerHTML = '<div class="empty-state">No results available yet.</div>';
  } else {
    let degrees = 0;
    const segments = Object.entries(counts).map(([grade, count]) => {
      const start = degrees;
      degrees += count / students.length * 360;
      return `${gradeColor(grade)} ${start}deg ${degrees}deg`;
    });
    $('#gradeChart').innerHTML = `<div class="donut" style="background:conic-gradient(${segments.join(',')})"><div class="donut-center">${students.length}<small>students</small></div></div><div class="grade-legend">${Object.entries(counts).map(([grade, count]) => `<span>● ${grade}: ${count}</span>`).join('')}</div>`;
  }

  const top = [...students].sort((a, b) => calc(b).percentage - calc(a).percentage).slice(0, 5);
  $('#topStudents').innerHTML = top.length ? `<div class="student-list">${top.map(rowHtml).join('')}</div>` : '<div class="empty-state">No students yet.</div>';
  const risk = students.filter(student => calc(student).percentage < 50).sort((a, b) => calc(a).percentage - calc(b).percentage).slice(0, 5);
  $('#riskStudents').innerHTML = risk.length ? `<div class="student-list">${risk.map(rowHtml).join('')}</div>` : '<div class="empty-state">No students below 50%.</div>';
}

function rowHtml(student) {
  const result = calc(student);
  return `<div class="student-row"><div class="student-meta"><div class="avatar">${escapeHtml(initials(student.name))}</div><div><div class="student-name">${escapeHtml(student.name)}</div><div class="student-roll">${escapeHtml(student.roll)} · ${escapeHtml(student.className)}</div></div></div><div><span class="score">${result.percentage.toFixed(1)}%</span> <span class="pill ${result.status === 'Pass' ? 'pass' : 'fail'}">${result.grade}</span></div></div>`;
}

function renderTable() {
  const query = $('#searchInput').value.toLowerCase().trim();
  const selectedClass = $('#classFilter').value;
  const filtered = students.filter(student => {
    const matchesClass = selectedClass === 'all' || student.className === selectedClass;
    const matchesSearch = !query || student.name.toLowerCase().includes(query) || student.roll.toLowerCase().includes(query);
    return matchesClass && matchesSearch;
  });

  $('#resultCount').textContent = `${filtered.length} of ${students.length} students`;
  $('#resultsTable').innerHTML = filtered.map(student => {
    const result = calc(student);
    return `<tr><td><b>${escapeHtml(student.name)}</b><div class="muted-small">${escapeHtml(student.roll)}</div></td><td>${escapeHtml(student.className)}</td><td>${SUBJECTS.length}</td><td>${result.total}/${SUBJECTS.length * 100}</td><td><b>${result.percentage.toFixed(1)}%</b></td><td><span class="pill">${result.grade}</span></td><td><span class="pill ${result.status === 'Pass' ? 'pass' : 'fail'}">${result.status}</span></td><td><button class="action" data-edit="${student.id}" type="button">Edit</button><button class="action danger-action" data-delete="${student.id}" type="button">Delete</button></td></tr>`;
  }).join('') || '<tr><td colspan="8" class="empty-table">No matching students found.</td></tr>';

  const classes = [...new Set(students.map(student => student.className))].sort();
  const current = $('#classFilter').value;
  $('#classFilter').innerHTML = `<option value="all">All classes</option>${classes.map(className => `<option value="${escapeHtml(className)}">${escapeHtml(className)}</option>`).join('')}`;
  $('#classFilter').value = classes.includes(current) ? current : 'all';
}

function renderAnalytics() {
  const breakdown = SUBJECTS.map((subject, index) => {
    const average = students.length ? students.reduce((sum, student) => sum + Number(student.marks[index]), 0) / students.length : 0;
    const passRate = students.length ? students.filter(student => Number(student.marks[index]) >= PASS_MARK).length / students.length * 100 : 0;
    return { subject, average, passRate };
  });

  $('#subjectBreakdown').innerHTML = students.length ? breakdown.map(item => `<div class="progress-row"><b>${escapeHtml(item.subject)}</b><div class="progress"><i style="width:${item.average}%"></i></div><span>${item.average.toFixed(1)}%</span></div><div class="sub-stat">Pass rate: ${item.passRate.toFixed(0)}%</div>`).join('') : '<div class="empty-state">Add students to see analytics.</div>';

  const classes = [...new Set(students.map(student => student.className))].sort();
  $('#classBreakdown').innerHTML = classes.length ? classes.map(className => {
    const group = students.filter(student => student.className === className);
    const average = group.reduce((sum, student) => sum + calc(student).percentage, 0) / group.length;
    return `<div class="progress-row"><b>${escapeHtml(className)}</b><div class="progress"><i style="width:${average}%"></i></div><span>${average.toFixed(1)}%</span></div>`;
  }).join('') : '<div class="empty-state">No class data.</div>';
}

function buildSubjectInputs(student = null) {
  $('#subjectInputs').innerHTML = SUBJECTS.map((subject, index) => `<label for="mark-${index}">${escapeHtml(subject)}<input id="mark-${index}" class="mark-input" type="number" min="0" max="100" step="1" inputmode="numeric" required value="${student?.marks?.[index] ?? ''}" /></label>`).join('');
}

function openModal(student = null) {
  $('#studentForm').reset();
  $('#formError').textContent = '';
  $('#studentId').value = student?.id || '';
  $('#modalTitle').textContent = student ? 'Edit Student' : 'Add Student';
  $('#name').value = student?.name || '';
  $('#roll').value = student?.roll || '';
  $('#studentClass').value = student?.className || '';
  $('#section').value = student?.section || '';
  buildSubjectInputs(student);
  $('#studentModal').showModal();
  setTimeout(() => $('#name').focus(), 0);
}

function closeModal() {
  const dialog = $('#studentModal');
  if (dialog.open) dialog.close();
  $('#studentForm').reset();
  $('#formError').textContent = '';
}

$('#addStudentBtn').addEventListener('click', () => openModal());
$('#cancelModalBtn').addEventListener('click', closeModal);
$('#closeModalBtn').addEventListener('click', closeModal);
$('#studentModal').addEventListener('click', event => {
  if (event.target === $('#studentModal')) closeModal();
});

$('#studentForm').addEventListener('submit', event => {
  event.preventDefault();
  const error = $('#formError');
  error.textContent = '';

  if (!$('#studentForm').reportValidity()) return;

  const name = $('#name').value.trim();
  const roll = $('#roll').value.trim();
  const className = $('#studentClass').value.trim();
  const section = $('#section').value.trim();
  const marks = $$('.mark-input').map(input => Number(input.value));
  const id = $('#studentId').value || crypto.randomUUID();

  if (!name || !roll || !className) {
    error.textContent = 'Name, roll number and class are required.';
    return;
  }
  if (marks.some(mark => !Number.isFinite(mark) || mark < 0 || mark > 100)) {
    error.textContent = 'Each mark must be between 0 and 100.';
    return;
  }
  const duplicate = students.some(student => student.roll.toLowerCase() === roll.toLowerCase() && student.id !== id);
  if (duplicate) {
    error.textContent = 'A student with this roll number already exists.';
    $('#roll').focus();
    return;
  }

  const student = { id, name, roll, className, section, marks };
  students = students.some(item => item.id === id) ? students.map(item => item.id === id ? student : item) : [student, ...students];
  save();
  closeModal();
  renderAll();
});

$('#resultsTable').addEventListener('click', event => {
  const edit = event.target.closest('[data-edit]');
  const del = event.target.closest('[data-delete]');
  if (edit) openModal(students.find(student => student.id === edit.dataset.edit));
  if (del) {
    const student = students.find(item => item.id === del.dataset.delete);
    if (!student || !confirm(`Delete ${student.name}'s result? This cannot be undone.`)) return;
    students = students.filter(item => item.id !== student.id);
    save();
    renderAll();
  }
});

$('#searchInput').addEventListener('input', renderTable);
$('#classFilter').addEventListener('change', renderTable);

$('#exportBtn').addEventListener('click', () => {
  const rows = [['Name', 'Roll Number', 'Class', 'Section', ...SUBJECTS, 'Total', 'Percentage', 'Grade', 'Status']];
  students.forEach(student => {
    const result = calc(student);
    rows.push([student.name, student.roll, student.className, student.section, ...student.marks, result.total, result.percentage.toFixed(2), result.grade, result.status]);
  });
  const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'student-results.csv';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
});

$$('.nav-item').forEach(button => button.addEventListener('click', () => showSection(button.dataset.section)));
$$('[data-section-jump]').forEach(button => button.addEventListener('click', () => showSection(button.dataset.sectionJump)));

function showSection(id) {
  $$('.section').forEach(section => section.classList.toggle('active', section.id === id));
  $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.section === id));
  $('#pageTitle').textContent = id.charAt(0).toUpperCase() + id.slice(1);
  if (id === 'results') renderTable();
  if (id === 'analytics') renderAnalytics();
  if (id === 'dashboard') renderDashboard();
}

function renderAll() {
  renderDashboard();
  renderTable();
  renderAnalytics();
}

renderAll();