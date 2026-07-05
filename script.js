// =========================
// Job Application Form (Vanilla JS)
// =========================

const form = document.getElementById('applicationForm');
const submitBtn = document.getElementById('submitBtn');

const fields = {
  fullName: {
    input: document.getElementById('fullName'),
    errorEl: document.getElementById('fullNameError'),
    wrap: document.querySelector('[data-field="fullName"]'),
    validators: {
      required: (v) => v.trim().length > 0,
      min: (v) => v.trim().length >= 3,
      nameChars: (v) => /^[A-Za-z ]+$/.test(v.trim()),
    },
    messages: {
      required: 'Full Name is required.',
      min: 'Full Name must be at least 3 characters.',
      nameChars: 'Use alphabets and spaces only.',
    },
  },
  email: {
    input: document.getElementById('email'),
    errorEl: document.getElementById('emailError'),
    wrap: document.querySelector('[data-field="email"]'),
    validators: {
      required: (v) => v.trim().length > 0,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    },
    messages: {
      required: 'Email Address is required.',
      email: 'Please enter a valid email address.',
    },
  },
  phone: {
    input: document.getElementById('phone'),
    errorEl: document.getElementById('phoneError'),
    wrap: document.querySelector('[data-field="phone"]'),
    validators: {
      required: (v) => v.trim().length > 0,
      digits10: (v) => /^\d{10}$/.test(v.trim()),
    },
    messages: {
      required: 'Phone Number is required.',
      digits10: 'Phone Number must be exactly 10 digits.',
    },
  },
  message: {
    input: document.getElementById('message'),
    errorEl: document.getElementById('messageError'),
    wrap: document.querySelector('[data-field="message"]'),
    validators: {
      required: (v) => v.trim().length > 0,
      min20: (v) => v.trim().length >= 20,
      max250: (v) => v.trim().length <= 250,
    },
    messages: {
      required: 'Message is required.',
      min20: 'Message must be at least 20 characters.',
      max250: 'Message must be 250 characters or less.',
    },
  },
};

const counterCurrent = document.getElementById('counterCurrent');
const counterMax = document.getElementById('counterMax');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

const successModal = document.getElementById('successModal');
const closeModalEls = document.querySelectorAll('[data-close-modal]');

const LOADING_MS = 1200;

// Initialize counter max (in case you change it in HTML)
counterMax.textContent = '250';

function setFieldState(fieldKey, { valid, message }) {
  const field = fields[fieldKey];
  field.wrap.dataset.valid = valid ? 'true' : 'false';
  field.wrap.dataset.invalid = !valid ? 'true' : 'false';

  field.input.setAttribute('aria-invalid', valid ? 'false' : 'true');

  field.errorEl.textContent = message || '';
}

function validateField(fieldKey) {
  const field = fields[fieldKey];
  const value = field.input.value;

  // If empty, show required error only when user has interacted (handled by caller)
  if (!field.validators.required(value)) {
    return { valid: false, message: field.messages.required };
  }

  // Field-specific rules
  if (fieldKey === 'fullName') {
    if (!field.validators.min(value)) return { valid: false, message: field.messages.min };
    if (!field.validators.nameChars(value)) return { valid: false, message: field.messages.nameChars };
  }

  if (fieldKey === 'email') {
    if (!field.validators.email(value)) return { valid: false, message: field.messages.email };
  }

  if (fieldKey === 'phone') {
    if (!field.validators.digits10(value)) return { valid: false, message: field.messages.digits10 };
  }

  if (fieldKey === 'message') {
    if (!field.validators.min20(value)) return { valid: false, message: field.messages.min20 };
    if (!field.validators.max250(value)) return { valid: false, message: field.messages.max250 };
  }

  return { valid: true, message: '' };
}

// Track if user has interacted with each field
const touched = {
  fullName: false,
  email: false,
  phone: false,
  message: false,
};

function updateProgress() {
  const keys = Object.keys(fields);
  let validCount = 0;

  for (const key of keys) {
    const result = validateField(key);
    if (result.valid) validCount += 1;
  }

  const percent = Math.round((validCount / keys.length) * 100);

  // Defensive: ensure elements exist and reflect progress in both visual + accessibility.
  if (progressBar) {
    progressBar.style.width = `${percent}%`;
    progressBar.setAttribute('aria-valuenow', String(percent));
  }
  if (progressText) {
    progressText.textContent = `${percent}%`;
  }
}


function showValidationFor(fieldKey) {
  const result = validateField(fieldKey);
  setFieldState(fieldKey, result);
  return result.valid;
}

function shakeFirstInvalidField() {
  const formFields = form.querySelectorAll('.form__field');
  let firstInvalid = null;

  for (const formField of formFields) {
    const wrap = formField.querySelector('.input-wrap');
    if (!wrap) continue;
    if (wrap.dataset.invalid === 'true') {
      firstInvalid = formField;
      break;
    }
  }

  if (!firstInvalid) return;

  firstInvalid.classList.remove('form__field--shake');
  // Trigger reflow so animation re-runs
  void firstInvalid.offsetWidth;
  firstInvalid.classList.add('form__field--shake');
}

function setSubmitting(isSubmitting) {
  submitBtn.setAttribute('aria-busy', isSubmitting ? 'true' : 'false');
  submitBtn.disabled = isSubmitting;
}

function openModal() {
  successModal.setAttribute('aria-hidden', 'false');
  // Focus close button for accessibility
  const closeBtn = document.querySelector('[data-close-modal]');
  closeBtn?.focus();
}

function closeModal() {
  successModal.setAttribute('aria-hidden', 'true');
}

function resetFormToInitial() {
  form.reset();

  // Reset validation UI
  for (const key of Object.keys(fields)) {
    touched[key] = false;
    fields[key].wrap.dataset.valid = 'false';
    fields[key].wrap.dataset.invalid = 'false';
    fields[key].input.setAttribute('aria-invalid', 'false');
    fields[key].errorEl.textContent = '';
  }

  // Reset counter
  counterCurrent.textContent = '0';

  // Reset progress
  updateProgress();
}

// =========================
// Event listeners
// =========================

// Real-time message counter
fields.message.input.addEventListener('input', () => {
  const len = fields.message.input.value.length;
  counterCurrent.textContent = String(len);

  // If user already touched, validate while typing
  if (touched.message) {
    showValidationFor('message');
    updateProgress();
  }
});

// Validate on blur + while typing where appropriate
for (const key of Object.keys(fields)) {
  const field = fields[key];

  field.input.addEventListener('blur', () => {
    touched[key] = true;
    showValidationFor(key);
    updateProgress();
  });

  field.input.addEventListener('input', () => {
    if (!touched[key]) return;
    showValidationFor(key);
    updateProgress();
  });
}

// Phone: keep only digits (without being aggressive to cursor position)
fields.phone.input.addEventListener('input', () => {
  const cleaned = fields.phone.input.value.replace(/\D/g, '');
  if (fields.phone.input.value !== cleaned) {
    fields.phone.input.value = cleaned;
  }

  // Limit to 10 digits
  if (fields.phone.input.value.length > 10) {
    fields.phone.input.value = fields.phone.input.value.slice(0, 10);
  }

  if (touched.phone) {
    showValidationFor('phone');
    updateProgress();
  }
});

// Modal close handlers
closeModalEls.forEach((el) => {
  el.addEventListener('click', () => {
    closeModal();
    resetFormToInitial();
  });
});

successModal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    resetFormToInitial();
  }
});

// Submit
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Mark all as touched so errors are shown
  for (const key of Object.keys(fields)) touched[key] = true;

  let allValid = true;
  for (const key of Object.keys(fields)) {
    const ok = showValidationFor(key);
    if (!ok) allValid = false;
  }

  updateProgress();

  if (!allValid) {
    shakeFirstInvalidField();
    return;
  }

  // Simulate loading state before success
  setSubmitting(true);

  window.setTimeout(() => {
    setSubmitting(false);
    openModal();
  }, LOADING_MS);
});

// Close on overlay click
successModal.addEventListener('click', (e) => {
  const target = e.target;
  if (target && target.matches('[data-close-modal], .modal__overlay')) {
    closeModal();
    resetFormToInitial();
  }
});

// Initial counter/progress
counterCurrent.textContent = '0';
for (const key of Object.keys(fields)) {
  fields[key].wrap.dataset.valid = 'false';
  fields[key].wrap.dataset.invalid = 'false';
  fields[key].input.setAttribute('aria-invalid', 'false');
}
updateProgress();

