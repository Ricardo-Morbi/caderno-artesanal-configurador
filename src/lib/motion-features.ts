// Arquivo separado obrigatório para que o Webpack/Turbopack
// consiga fazer code-split do framer-motion como chunk assíncrono.
// Importar diretamente em LazyMotion features={() => import('./motion-features')}
// reduz o bundle inicial de ~34 KB para ~4.6 KB.
import { domAnimation } from 'framer-motion'

export default domAnimation
