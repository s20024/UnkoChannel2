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