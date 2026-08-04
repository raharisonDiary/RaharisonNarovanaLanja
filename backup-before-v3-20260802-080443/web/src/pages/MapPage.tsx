import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { dwellingsApi } from '../api/resources'
import Loader from '../components/common/Loader'
import PageHeader from '../components/common/PageHeader'
import StatusBadge from '../components/common/StatusBadge'
import { useAsync } from '../hooks/useAsync'

const marker = L.divIcon({ className: 'map-dot', html: '<span></span>', iconSize: [24, 24], iconAnchor: [12, 12] })

export default function MapPage() {
  const dwellings = useAsync(() => dwellingsApi.list(), [])
  return <><PageHeader title="Carte de géolocalisation" subtitle="Habitations enregistrées sur le terrain"/>{dwellings.loading ? <Loader/> : <section className="map-layout"><aside className="card map-filters"><h2>Filtres</h2><label>Statut<select><option>Tous</option><option>Draft</option><option>Submitted</option><option>Validated</option></select></label><label>Campagne<select><option>Toutes</option></select></label><div className="map-legend"><span><i className="dot dot--gray"/>Non débuté</span><span><i className="dot dot--blue"/>En cours</span><span><i className="dot dot--green"/>Terminé</span></div></aside><div className="map-card"><MapContainer center={[-18.8792, 47.5079]} zoom={6} scrollWheelZoom><TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{dwellings.data?.filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)).map((item) => <Marker key={item.id} position={[item.latitude, item.longitude]} icon={marker}><Popup><strong>{item.referenceCode}</strong><br/>{item.localityName}<br/><StatusBadge value={item.recordStatus}/></Popup></Marker>)}</MapContainer></div></section>}</>
}
