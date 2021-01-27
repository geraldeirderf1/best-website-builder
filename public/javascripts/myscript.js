document.querySelector('.btn-close').addEventListener('click', (e) => {
    e.preventDefault();

    const alert = document.querySelector('.alert').parentElement;

    alert.remove();
})

const previousAlert = document.querySelector('.alert').parentElement;

function removeAlert() {
    if(previousAlert){
        setTimeout(() => {
            previousAlert.remove();
        }, 5000);
    }
}

removeAlert();