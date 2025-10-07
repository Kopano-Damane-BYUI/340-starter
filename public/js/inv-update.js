// public/js/inv-update.js
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.edit-inventory-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  // disable submit button initially
  submitBtn.disabled = true;

  // enable the button when any input changes
  form.addEventListener('input', () => {
    submitBtn.disabled = false;
  });
});
