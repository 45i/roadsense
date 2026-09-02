zone="";
week=1;
first_run=true;
let timelineData=[];
let timelineHoverIndex=-1;
let availableZones=[];
let riskMap=null;
let riskLayer=null;

function getSafeNumber(value, fallback = null) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function readMessageValue(record, fallbackKeys, preferredKeys = []) {
    const source = record || {};
    for (const key of preferredKeys) {
        if (source[key] != null && source[key] !== '') return source[key];
    }
    for (const key of fallbackKeys) {
        if (source[key] != null && source[key] !== '') return source[key];
    }
    return null;
}

function getMetrics(data = {}) {
    return data.telemetry || data.raw_metrics || {};
}

function getRisk(data = {}) {
    return data.risk_analysis || {};
}

function getInterventions(data = []) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.interventions)) return data.interventions;
    return [];
}

function getPriority(data = {}) {
    return data.priority || {};
}

document.addEventListener('DOMContentLoaded', () => {
fetch('https://ayan786151.github.io/RoadSense-AI/api/v1/zones.json')
  .then(response => response.json())
  .then(data => {
        availableZones=data.zones;
    //   console.log(data.zones[0].zone_id);
      document.querySelector('.b_ZoneSelectorMaster').innerHTML = data.zones[0].zone_id.replace(/_/g, ' ');
      zone=data.zones[0].zone_id.replace(/_/g,' ');

      document.querySelector('.b_ZoneSelectorMaster').onclick = () => {
        document.querySelector('.l_ZoneSelector').classList.toggle('active');
    }
    document.querySelector('.l_ZoneSelector').replaceChildren();
    data.zones.forEach(element => {
        const listItem = document.createElement('li');
        const button = document.createElement('button');
        button.className = 'b_ZoneSelector b_generic';
        button.innerHTML = element.zone_id.replace(/_/g, ' ');
        button.onclick = () => {
            document.querySelector('.b_ZoneSelectorMaster').innerHTML = element.zone_id.replace(/_/g, ' ');
            document.querySelector('.l_ZoneSelector').classList.toggle('active');

            zone=element.zone_id.replace(/_/g,' ');
            document.querySelector('.data_disp').classList.add('active');
            RefreshStack(first_run);

        }
        listItem.appendChild(button);
        document.querySelector('.l_ZoneSelector').appendChild(listItem);
    });
    if (zone!=""){
        document.querySelector('.data_disp').classList.add('active');
    }
    RefreshStack(first_run);
  });
//   Initialise();

});
function Initialise(){
  fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${document.querySelector('.b_ZoneSelectorMaster').innerHTML.replace(' ','_')}/all.json`)
    .then(response => response.json())
    .then(data => {
        week=data.timeline[0].week;
        timelineData=data.timeline;
        drawTimeline();
        document.querySelector(".b_WeekSelectorMaster").innerHTML = data.timeline[0].week;
        document.querySelector('.b_WeekSelectorMaster').onclick = () => {
            document.querySelector('.l_WeekSelector').classList.toggle('active');
        }
        document.querySelector('.l_WeekSelector').replaceChildren();
        
        data.timeline.forEach(element => {
            const listItem = document.createElement('li');
            const button = document.createElement('button');
            button.className = 'b_WeekSelector b_generic';
            button.innerHTML = element.week;
            button.onclick = () => {
                document.querySelector('.b_WeekSelectorMaster').innerHTML = element.week;
                document.querySelector('.l_WeekSelector').classList.toggle('active');   
                week=element.week;
                RefreshStack();
            }
            listItem.appendChild(button);
            document.querySelector('.l_WeekSelector').appendChild(listItem);
        });

    });
}