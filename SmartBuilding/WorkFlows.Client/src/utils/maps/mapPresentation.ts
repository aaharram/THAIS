// RMANew (Classes/Carte.vb, cMapStyle) : même palette bleu/marine RMA (#1c4d8c /
// #0b1f3a) plutôt que le style Google Maps par défaut, reprise à l'identique ici.
export const RMA_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f7fa' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4b5563' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#c9d3e0' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#eef1f6' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e3e9f2' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dbe7d8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d7dee8' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#5b6a80' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1c4d8c' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#0b1f3a' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#0b1f3a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e3e9f2' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#aecbe8' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4b6fa5' }] },
];

// RMANew (Classes/Carte.vb, WebForm2.vb pinIcon()) : pin SVG en data URI (les
// marker-bleu.png/marker-green.png originaux venaient d'un chemin externe qui ne résout
// pas ici) - repris tel quel, en bleu RMA uniquement : Smart-Building n'a pas
// d'équivalent au NoProprieteType numérique de RMANew (mono/co-propriété) qui pilotait
// la couleur verte là-bas - son champ du même nom porte un tout autre sens ici
// (Immeuble | Bien).
export function pinIcon(color = '#1c4d8c'): google.maps.Icon {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='34' height='46' viewBox='0 0 34 46'>" +
    `<path d='M17 0C7.6 0 0 7.6 0 17c0 12.7 17 29 17 29s17-16.3 17-29C34 7.6 26.4 0 17 0z' fill='${color}'/>` +
    "<circle cx='17' cy='17' r='7' fill='#ffffff'/>" +
    '</svg>';
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(34, 46),
    anchor: new google.maps.Point(17, 46),
  };
}
