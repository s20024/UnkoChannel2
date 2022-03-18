const inputs = document.getElementsByClassName("new_input")

const id = new URL(window.location.href).pathname.split("/")[2]

const now = JSON.parse(localStorage.getItem(id)) || 0

for(let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (now < input.value) {
        const test = document.getElementById(`new_${input.id}`)
        test.style = {opacity: 1}
    }
}

localStorage.setItem(id, JSON.stringify(new Date().getTime()))


const dialog = document.getElementById("dialog")
const cancelButton = document.getElementById("cancel")
const okButton = document.getElementById("ok")

const delete_buttons = document.getElementsByClassName("delete_message")

for (let i = 0; i < delete_buttons.length; i++) {
    const delete_button = delete_buttons[i]
    delete_button.addEventListener('click', () => {
        const inputIdDialog = document.getElementById("id_dialog")
        inputIdDialog.value = delete_button.id
        console.log(inputIdDialog.value)
        dialog.showModal()
    })
}

cancelButton.addEventListener('click', () => {
    dialog.close()
})

okButton.addEventListener('click', () => {
    const inputIdDialog = document.getElementById("id_dialog")
    const form = document.getElementById(`delete_form_${inputIdDialog.value}`)
    console.log(form)
    form.submit()
    dialog.close()
})