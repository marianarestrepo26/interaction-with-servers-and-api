// URL de la API
const API_URL = 'http://localhost:3000/students';

// Función corta para obtener elementos por id
const $ = id => document.getElementById(id);

// Referencias a los elementos del formulario y la grilla
const [studentForm, studentIdInput, nameInput, lastnameInput, ageInput, gradeInput, submitBtn, cancelBtn, cancelBtnContainer, studentsGridBody, errorMessage] = [
  'studentForm','studentId','name','lastname','age','grade','submitBtn','cancelBtn','cancelBtnContainer','studentsGridBody','errorMessage'
].map($);


// Muestra un mensaje de error o información
const showMessage = (element, message, error=false) => {
  element.textContent = message;
  element.style.display = 'block';
  element.classList.toggle('is-danger', error);
  element.classList.toggle('has-text-grey', !err);
};

// Oculta un mensaje
const hideMessage = element => { element.textContent = ''; element.style.display = 'none'; };

// Referencia al título del formulario
const formTitle = document.getElementById('formTitle');

// Limpia el formulario y reinicia el título
const clearForm = () => {
  [studentIdInput, nameInput, lastnameInput, ageInput, gradeInput].forEach(i=>i.value='');
  submitBtn.innerHTML = '<span class="icon is-small"><i class="fas fa-plus"></i></span><span>Añadir Estudiante</span>';
  cancelBtnContainer.style.display = 'none';
  hideMessage(errorMessage);
  if (formTitle) formTitle.textContent = 'Añadir Estudiante';
};


// Genera una fila de estudiante para la grilla
function studentRow(student) {
  const id = student.id;
  return `
    <div>${id}</div>
    <div>${student.name}</div>
    <div>${student.lastname}</div>
    <div>${student.age}</div>
    <div>${student.grade}</div>
    <div class="delete-btn-container">
      <div class="buttons are-small">
        <button class="button is-warning is-light edit-btn" data-id="${id}"><span class="icon"><i class="fas fa-edit"></i></span><span>Editar</span></button>
        <button class="button is-danger is-light delete-btn" data-id="${id}"><span class="icon"><i class="fas fa-trash-alt"></i></span><span>Eliminar</span></button>
      </div>
    </div>
  `;
}


// Muestra todos los estudiantes en la grilla
function displayStudents(students) {
  studentsGridBody.innerHTML = students.length
    ? students.map(s => `<div class="student-grid-row" data-id="${s.id}">${studentRow(s)}</div>`).join('')
    : '<div class="no-students-message">No hay estudiantes registrados.</div>';
}


// Hace peticiones a la API y retorna el resultado en JSON
async function fetchAPI(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  // Solo intenta parsear JSON si hay contenido
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}


// Trae los estudiantes de la API y los muestra
async function fetchStudents() {
  hideMessage(errorMessage);
  try {
    const students = await fetchAPI(API_URL);
    displayStudents(students);
  } catch (error) {
    showMessage(errorMessage, `Error al cargar estudiantes: ${error.message}`, true);
    studentsGridBody.innerHTML = '<div class="no-students-message has-text-danger">No se pudieron cargar los estudiantes.</div>';
  }
}


// Evento para guardar o actualizar estudiante
studentForm.addEventListener('submit', async e => {
  e.preventDefault();
  const id = studentIdInput.value;
  const name = nameInput.value.trim();
  const lastname = lastnameInput.value.trim();
  const age = parseInt(ageInput.value);
  const grade = gradeInput.value.trim();
  if (!name || !lastname || !grade || isNaN(age) || age <= 0) {
    showMessage(errorMessage, 'Por favor, completa todos los campos (Nombre, Apellido, Edad, Grado) y asegúrate de que la edad sea un número válido.', true);
    return;
  }
  hideMessage(errorMessage);
  const studentData = { name, lastname, age, grade };
  try {
    await fetchAPI(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    clearForm();
    fetchStudents();
  } catch (e) {
    showMessage(errorMessage, `Error al guardar estudiante: ${e.message}`, true);
  }
});


// Evento para eliminar o editar estudiante
studentsGridBody.addEventListener('click', async e => {
  const del = e.target.closest('.delete-btn');
  const edit = e.target.closest('.edit-btn');
  // Eliminar estudiante
  if (del) {
    const id = del.dataset.id;
    if (confirm(`¿Estás seguro de que quieres eliminar al estudiante con ID ${id}?`)) {
      try {
        await fetchAPI(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchStudents();
        hideMessage(errorMessage);
      } catch (e) {
        showMessage(errorMessage, `Error al eliminar estudiante: ${e.message}`, true);
      }
    }
  }
  // Editar estudiante
  if (edit) {
    const id = edit.dataset.id;
    try {
      const s = await fetchAPI(`${API_URL}/${id}`);
      studentIdInput.value = s.id;
      nameInput.value = s.name;
      lastnameInput.value = s.lastname || '';
      ageInput.value = s.age;
      gradeInput.value = s.grade || '';
      submitBtn.innerHTML = '<span class="icon is-small"><i class="fas fa-save"></i></span><span>Actualizar Estudiante</span>';
      cancelBtnContainer.style.display = 'block';
      if (formTitle) formTitle.textContent = 'Actualizar Estudiante';
      hideMessage(errorMessage);
    } catch (e) {
      showMessage(errorMessage, `Error al cargar datos para edición: ${e.message}`, true);
    }
  }
});


// Evento para cancelar edición y limpiar el formulario
cancelBtn.addEventListener('click', clearForm);

// Cargar estudiantes al iniciar la página
document.addEventListener('DOMContentLoaded', fetchStudents);