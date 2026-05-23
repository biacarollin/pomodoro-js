const botoes = document.querySelectorAll("button")
const visor = document.getElementById("visor")

botoes.forEach(function(botao) {
  botao.addEventListener("click", function() {

    const tecla = botao.textContent

    if (tecla === "C") {
      visor.textContent = "0"

    } else if (tecla === "=") {
      try {
        visor.textContent = eval(visor.textContent)
      } catch {
        visor.textContent = "Erro"
      }

    } else {
      if (visor.textContent === "0") {
        visor.textContent = tecla
      } else {
        visor.textContent = visor.textContent + tecla
     }
    }

  })
})