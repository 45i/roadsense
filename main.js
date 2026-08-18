document.addEventListener('DOMContentLoaded', () => {
fetch('https://ayan786151.github.io/RoadSense-AI/api/v1/zones.json')
  .then(response => response.json())
  .then(data => {
      document.querySelector('.b_ZoneSelector').innerHTML = data.zones[0].replace(/_/g, ' ');
      document.querySelector('.b_ZoneSelector').onclick = () => {
        document.querySelector('.l_ZoneSelector').classList.toggle('active');
    }
    RefreshStack();
    data.zones.forEach(element => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'b_ZoneSelector';
        button.innerHTML = element.replace(/_/g, ' ');
        button.onclick = () => {
            document.querySelector('.b_ZoneSelector').innerHTML = element.replace(/_/g, ' ');
            document.querySelector('.l_ZoneSelector').classList.toggle('active');
                RefreshStack();
            }
            listItem.appendChild(button);
            document.querySelector('.l_ZoneSelector').appendChild(listItem);
        });

  });

  
});

function RefreshStack() {
    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${document.querySelector('.b_ZoneSelector').innerHTML.replace(' ','_')}/1.json`)
  .then(response => response.json())
    .then(data => {
        document.querySelector('.l_ZoneDetails').innerHTML = `${data.metrics.location_name}, ${data.metrics.city} - ${data.metrics.zone_type.replace(/_/g, ' ')}`;
    });
    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${document.querySelector('.b_ZoneSelector').innerHTML.replace(' ','_')}/all.json`)
}

