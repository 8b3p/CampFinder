// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.validated-form')
  const files = document.getElementById('image');
  const invalid = document.getElementById('invalid');

  // Loop over them and prevent submission
  Array.from(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        if (files.files.length > 2) {
          event.preventDefault()
          event.stopPropagation()
          invalid.style.display = 'block'
          invalid.nextElementSibling.style.display = 'none'
        } else {
          invalid.style.display = 'none'
          invalid.nextElementSibling.style.display = 'block'
        }

        form.classList.add('was-validated')
      }, false)
    })
})()