

// URL de la API (json-server)
const API_URL = 'http://localhost:3000/students';

// Función corta para obtener elementos por id
const $ = id => document.getElementById(id);

// Referencias a los elementos del formulario y la grilla
const [studentForm, studentIdInput, nameInput, lastnameInput, ageInput, majorInput, gradeInput, submitBtn, cancelBtn, cancelBtnContainer, studentsGridBody, loadingMessage, errorMessage] = [
  'studentForm','studentId','name','lastname','age','major','grade','submitBtn','cancelBtn','cancelBtnContainer','studentsGridBody','loadingMessage','errorMessage'
].map($);


// Muestra un mensaje de error o información
const showMessage = (el, msg, err=false) => {
  el.textContent = msg;
  el.style.display = 'block';
  el.classList.toggle('is-danger', err);
  el.classList.toggle('has-text-grey', !err);
};

// Oculta un mensaje
const hideMessage = el => { el.textContent = ''; el.style.display = 'none'; };

// Referencia al título del formulario
const formTitle = document.getElementById('formTitle');

// Limpia el formulario y reinicia el título
const clearForm = () => {
  [studentIdInput, nameInput, lastnameInput, ageInput, majorInput, gradeInput].forEach(i=>i.value='');
  submitBtn.innerHTML = '<span class="icon is-small"><i class="fas fa-plus"></i></span><span>Añadir Estudiante</span>';
  cancelBtnContainer.style.display = 'none';
  hideMessage(errorMessage);
  if (formTitle) formTitle.textContent = 'Añadir Estudiante';
};


// Genera una fila de estudiante para la grilla
function studentRow(student) {
  const id = student.id || 'N/A';
  return `
    <div>${id}</div>
    <div>${student.name || 'N/A'}</div>
    <div>${student.lastname || 'N/A'}</div>
    <div>${student.age || 'N/A'}</div>
    <div>${student.grade || 'N/A'}</div>
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
  return res.json ? res.json() : null;
}


// Trae los estudiantes de la API y los muestra
async function fetchStudents() {
  showMessage(loadingMessage, 'Cargando estudiantes...');
  hideMessage(errorMessage);
  try {
    const students = await fetchAPI(API_URL);
    displayStudents(students);
  } catch (e) {
    showMessage(errorMessage, `Error al cargar estudiantes: ${e.message}`, true);
    studentsGridBody.innerHTML = '<div class="no-students-message has-text-danger">No se pudieron cargar los estudiantes.</div>';
  } finally {
    hideMessage(loadingMessage);
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