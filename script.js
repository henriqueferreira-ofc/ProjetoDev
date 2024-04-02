function toggleMode() {
  const html = document.documentElement
  html.classList.toggle("light")

  //pegar a tag img
  const img = document.querySelector("#profile img")

  // substituir a imagem
  if (html.classList.contains("light")) {
    // se tiver o light, troca por essa imagem
    img.setAttribute("src", "./assets/avatar-light12.png")
  } else {
    // se não tiver o light, troca por essa imagem
    img.setAttribute("src", "./assets/avatar12.png")
  }
}
