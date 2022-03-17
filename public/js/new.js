const inputs = document.getElementsByClassName("new_input")

const now = 1647509382887 + 100

for(let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    if (now < input.value) {
        const test = document.getElementById(`new_${input.id}`)
        test.style = {opacity: 1}
    }
}