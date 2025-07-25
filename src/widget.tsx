import ReactDOM from 'react-dom/client'
import App from './App'

// Cria um container flutuante no corpo da página
const container = document.createElement('div')
container.id = 'tawkee-widget-root'
container.style.position = 'fixed'
container.style.bottom = '20px'
container.style.right = '20px'
container.style.zIndex = '999999' // bem alto para sobrepor
document.body.appendChild(container)

// Renderiza o app normalmente
const root = ReactDOM.createRoot(container)
root.render(<App />)
