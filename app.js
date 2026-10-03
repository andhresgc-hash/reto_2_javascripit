const STUDENT_COUNT = 10;
const EXAM_COUNT = 3;
const PASSING_GRADE = 55;

const studentNames = Array(STUDENT_COUNT).fill("");
const grades = Array.from({ length: STUDENT_COUNT }, () => Array(EXAM_COUNT).fill(null));
let registeredCount = 0;

const form = document.getElementById("student-form");
const nameInput = document.getElementById("student-name");
const gradeInputs = [
  document.getElementById("exam-one"),
  document.getElementById("exam-two"),
  document.getElementById("exam-three")
];
const formMessage = document.getElementById("form-message");
const progressText = document.getElementById("progress-text");
const progressTrack = document.querySelector(".progress-track");
const progressFill = document.getElementById("progress-fill");
const addButton = document.getElementById("add-button");
const reportSection = document.getElementById("report-section");

function formatGrade(value) {
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getStudents() {
  return studentNames.slice(0, registeredCount).map((name, index) => ({
    name,
    grades: grades[index],
    average: average(grades[index])
  }));
}

function updateProgress() {
  progressTrack.setAttribute("aria-valuenow", String(registeredCount));
  progressFill.style.width = `${registeredCount / STUDENT_COUNT * 100}%`;
  progressText.textContent = registeredCount === STUDENT_COUNT
    ? "Curso completo · 10 estudiantes"
    : `Estudiante ${registeredCount + 1} de ${STUDENT_COUNT}`;
  addButton.disabled = registeredCount === STUDENT_COUNT;
  addButton.textContent = registeredCount === STUDENT_COUNT ? "Curso completo" : "Agregar alumno";
}

function renderStudentResults(students) {
  const container = document.getElementById("student-results");
  const cards = students.map((student, index) => {
    const card = createElement("article", "student-result");
    card.append(createElement("h3", "", `Nombre ${index + 1}: ${student.name}`));

    student.grades.forEach((grade, index) => {
      const line = createElement("div", "result-line");
      line.append(
        createElement("span", "", `C${index + 1}`),
        createElement("strong", "", formatGrade(grade))
      );
      card.append(line);
    });

    const bottom = createElement("div", "result-bottom");
    bottom.append(
      createElement("span", "result-average", `Promedio final: ${formatGrade(student.average)}`),
      createElement("span", `status ${student.average >= PASSING_GRADE ? "pass" : "fail"}`, student.average >= PASSING_GRADE ? "Aprobado" : "Reprobado")
    );
    card.append(bottom);
    return card;
  });
  container.replaceChildren(...cards);
}

function renderReport() {
  const students = getStudents();
  document.getElementById("report-title").textContent = registeredCount === STUDENT_COUNT
    ? "Resultados del curso"
    : "Resultados parciales";
  document.querySelector(".complete-label").textContent = `${registeredCount} de ${STUDENT_COUNT} registrados`;
  renderStudentResults(students);
  reportSection.hidden = false;
}

function showValidationError(message, input) {
  formMessage.textContent = message;
  input.setAttribute("aria-invalid", "true");
  input.focus();
}

function validateForm() {
  const name = nameInput.value.trim();
  if (!name) {
    showValidationError("Escribe el nombre del estudiante.", nameInput);
    return null;
  }

  const values = [];
  for (const input of gradeInputs) {
    const value = input.value.trim() === "" ? NaN : Number(input.value);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      showValidationError("Ingresa una nota válida entre 0 y 100 en cada certamen.", input);
      return null;
    }
    values.push(value);
  }

  return { name, values };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const student = validateForm();
  if (!student) return;

  studentNames[registeredCount] = student.name;
  grades[registeredCount] = student.values;
  registeredCount += 1;

  form.reset();
  [...form.elements].forEach((element) => element.removeAttribute("aria-invalid"));
  updateProgress();
  renderReport();
  nameInput.focus();
});

form.addEventListener("input", (event) => {
  event.target.removeAttribute("aria-invalid");
  formMessage.textContent = "";
});

document.getElementById("edit-button").addEventListener("click", () => {
  if (registeredCount === 0) return;

  registeredCount -= 1;
  nameInput.value = studentNames[registeredCount];
  gradeInputs.forEach((input, index) => {
    input.value = String(grades[registeredCount][index]);
  });
  studentNames[registeredCount] = "";
  grades[registeredCount] = Array(EXAM_COUNT).fill(null);
  updateProgress();
  if (registeredCount > 0) renderReport();
  else reportSection.hidden = true;
  nameInput.focus();
});

updateProgress();
