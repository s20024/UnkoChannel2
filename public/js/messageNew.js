const openDialog = document.getElementById("open_dialog")
const dialog = document.getElementById("dialog")
const cancelButton = document.getElementById("cancel")
const okButton = document.getElementById("ok")
const createForm = document.getElementById("create_form")

openDialog.addEventListener('click', function onOpen() {
    const inputMessage = document.getElementById("content").value
    console.log(inputMessage)

    if (inputMessage === "") {
        return
    }
    dialog.showModal()
})

cancelButton.addEventListener('click', function onClose() {
    console.log("close")
    dialog.close()
})

okButton.addEventListener('click', function onClose() {
    createForm.submit()
})
