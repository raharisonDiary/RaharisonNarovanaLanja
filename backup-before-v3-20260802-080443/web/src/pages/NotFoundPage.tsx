import { Link } from 'react-router-dom'
export default function NotFoundPage(){return <main className="not-found"><strong>404</strong><h1>Page introuvable</h1><p>La page demandée n’existe pas.</p><Link className="button button--primary" to="/dashboard">Retour au tableau de bord</Link></main>}
