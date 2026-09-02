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

function RefreshStack(firstrun = false) {
    const selectedZone = document.querySelector('.b_ZoneSelectorMaster').innerHTML.trim();
    const zoneId = selectedZone.replace(/\s+/g, '_');

    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${zoneId}/1.json`)
      .then(response => response.json())
      .then(data => {
          const metrics = getMetrics(data);
          const zoneType = data.zone_type || metrics.zone_type || 'Unknown Zone';
          document.querySelector('.l_ZoneDetails').innerHTML = `${data.location_name || metrics.location_name || data.zone_id || zoneId}, ${data.city || metrics.city || ''} - ${String(zoneType).replace(/_/g, ' ')}`;
      })
      .catch(() => {});

    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${zoneId}/all.json`)
    .then(response => response.json())
    .then(data => {
        const timeline = Array.isArray(data.timeline) ? data.timeline : [];
        document.querySelector('.l_WeekCount').innerHTML = timeline.length;
        timelineData = timeline;
        drawTimeline();
        loadRanking();
        renderRiskMap(timeline);
    })
    .catch(() => {});

    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${zone.replace(/ /g,'_')}/${week}.json`)
    .then(response => response.json())
    .then(data => {
        updateCivilianSummary(data);
        const metrics = getMetrics(data);
        const risk = getRisk(data);
        const interventions = getInterventions(data);
        const primaryIntervention = interventions[0] || {};
        const populationDensity = readMessageValue(metrics, ['population_density', 'population_density_people_per_km2', 'population_density_people_per_sq_km']);
        const incidentCount = readMessageValue(metrics, ['incident_count', 'crashes', 'incident_count_total', 'actual_incident']);
        const trafficPressure = readMessageValue(metrics, ['traffic_pressure', 'congestion']);
        const congestion = readMessageValue(metrics, ['congestion', 'congestion_pct', 'congestion_percentage']);
        const vehicleDensity = readMessageValue(metrics, ['vehicle_density', 'density']);
        const congestionChange = readMessageValue(metrics, ['congestion_change', 'congestion_delta']);
        const densityChange = readMessageValue(metrics, ['vehicle_density_pct_change', 'density_delta']);
        const riskPercent = readMessageValue(risk, ['predicted_risk_percentage', 'risk_score']);
        const riskDelta = readMessageValue(risk, ['risk_delta_vs_prev_week', 'risk_change']);
        const riskLabel = readMessageValue(risk, ['risk_label', 'segment_risk_label']);
        const riskColor = readMessageValue(risk, ['risk_color', 'segment_risk_color']);

        document.querySelector('.l_data_disp_item_population_value').innerHTML = populationDensity ?? 'NA';
        document.querySelector('.l_data_disp_item_incident_value').innerHTML = incidentCount ?? 'NA';
        document.querySelector('.l_data_disp_item_traffic_prssure_value').innerHTML = trafficPressure == null ? 'NA' : `${(Number(trafficPressure) * (Number(trafficPressure) > 1 ? 1 : 100)).toFixed(1)}%`;

        const riskDeltaText = riskDelta != null ? `(${riskDelta > 0 ? '+' : ''}${Number(riskDelta).toFixed(1)}% vs W${week - 1})` : '';
        const riskHtml = riskPercent != null
            ? `${Number(riskPercent).toFixed(1)}% <span style="font-family: console-light; white-space: nowrap; font-size: small; color: #ffffff24">${riskDeltaText}</span>`
            : 'NA';
        document.querySelector('.l_data_disp_item_predicted_risk_value').innerHTML = riskHtml;

        document.querySelector('.l_data_disp_additional_predicted_risk').innerHTML = riskLabel || 'NA';
        document.querySelector('.l_data_disp_additional_predicted_risk').style.background = riskColor || 'transparent';
        document.querySelector('.l_banner_title').innerHTML = (primaryIntervention.title || primaryIntervention.id || 'No active intervention').replace(/_/g, ' ');
        document.querySelector('.l_data_disp_additional_severity').innerHTML = primaryIntervention.severity || primaryIntervention.priority || 'NA';
        document.querySelector('.l_data_disp_additional_descriptor').innerHTML = [primaryIntervention.description, primaryIntervention.action, primaryIntervention.target_reduction].filter(Boolean).join(' ');

        const congestionDeltaText = congestionChange != null ? `(${congestionChange > 0 ? '+' : ''}${Number(congestionChange).toFixed(1)}% vs W${week - 1})` : '';
        const densityDeltaText = densityChange != null ? `(${densityChange > 0 ? '+' : ''}${Number(densityChange).toFixed(1)}% vs W${week - 1})` : '';
        document.querySelector('.l_data_disp_item_congestion_value').innerHTML = `${congestion ?? 'NA'}${congestion != null ? '% ' : ''}<span style="font-family: console-light; white-space: nowrap; font-size: small; color: #ffffff24">${congestionDeltaText}</span>`;
        document.querySelector('.l_data_disp_item_vehicle_density_value').innerHTML = `${vehicleDensity ?? 'NA'}${vehicleDensity != null ? ' veh/km ' : ''}<span style="font-family: console-light; white-space: nowrap; font-size: small; color: #ffffff24">${densityDeltaText}</span>`;
    })
    .catch(() => {});

    if (firstrun) {
        first_run=false;
        Initialise();
    }
}

function loadRanking() {
    if (!availableZones.length) return;
    const rankingBody=document.querySelector('#ranking-body');
    rankingBody.innerHTML='<tr><td colspan="7">Loading ranking data...</td></tr>';
    Promise.all(availableZones.map(zoneInfo => {
        const zoneId=zoneInfo.zone_id;
        return fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${zoneId}/${week}.json`)
            .then(response => response.ok ? response.json() : null)
            .catch(() => null);
    })).then(records => {
        const ranking=records.filter(Boolean).sort((first, second) => Number(getPriority(second).priority_score ?? getMetrics(second).priority_score ?? 0) - Number(getPriority(first).priority_score ?? getMetrics(first).priority_score ?? 0));
        rankingBody.replaceChildren();
        ranking.forEach((record, index) => {
            const metrics=getMetrics(record);
            const row=document.createElement('tr');
            if (record.zone_id?.replace(/_/g, ' ') === zone) {
                row.classList.add('current-zone');
                row.setAttribute('aria-current', 'true');
            }
            const vehicleDensity = readMessageValue(metrics, ['vehicle_density', 'density']);
            const congestion = readMessageValue(metrics, ['congestion', 'congestion_pct']);
            const incidentOccurred = readMessageValue(metrics, ['incident_occurred', 'crashes', 'actual_incident']);
            row.innerHTML=`<td>${index+1}</td><td>${record.zone_id || 'NA'}</td><td>${record.location_name || metrics.location_name || 'NA'}</td><td>${record.city || metrics.city || 'NA'}</td><td>${formatNumber(vehicleDensity)}</td><td>${formatNumber(congestion)}</td><td>${incidentOccurred ?? 'NA'}</td>`;
            rankingBody.appendChild(row);
        });
        document.querySelector('#ranking-title').textContent=`Municipal 50-Zone Ranking - Week ${week}`;
        renderRiskMap(ranking);
    });
}

function formatNumber(value) {
    return value == null || Number.isNaN(Number(value)) ? 'NA' : Number(value).toFixed(2);
}

function updateCivilianSummary(data) {
    const metrics=getMetrics(data);
    const risk=getRisk(data);
    const intervention=getInterventions(data)[0] || {};
    const averageSpeed = readMessageValue(metrics, ['average_speed', 'average_speed_kmh', 'speed_mph']);
    const congestion = readMessageValue(metrics, ['congestion', 'congestion_pct']);
    const trafficPressure = readMessageValue(metrics, ['traffic_pressure', 'congestion']);
    const vehicleDensity = readMessageValue(metrics, ['vehicle_density', 'density']);
    const speedDelta = readMessageValue(metrics, ['speed_change', 'speed_delta']);
    const densityDelta = readMessageValue(metrics, ['vehicle_density_pct_change', 'density_delta']);
    const riskValue = readMessageValue(risk, ['predicted_risk_percentage', 'risk_score']);
    const riskLabel = readMessageValue(risk, ['risk_label', 'risk_badge']);
    const incidents = readMessageValue(metrics, ['incident_count', 'crashes', 'actual_incident']);
    const weather = readMessageValue(metrics, ['weather', 'dominant_weather']);
    const roadCondition = readMessageValue(metrics, ['road_condition', 'road_status']);
    const capacity = readMessageValue(metrics, ['effective_road_capacity', 'road_capacity']);
    const locationName = data.location_name || metrics.location_name || zone;

    document.querySelector('#civilian-summary-period').textContent=`${locationName} - Week ${data.week || metrics.week || week}`;
    document.querySelector('#summary-risk').textContent=`${riskLabel || 'Risk unavailable'} ${riskValue != null ? `(${Number(riskValue).toFixed(0)}%)` : ''}`.trim();
    document.querySelector('#summary-risk-text').textContent = riskValue == null ? 'No risk estimate is available for this week.' : `${riskLabel || 'Risk level'}. This is the forecast for the selected zone and week.`;
    document.querySelector('#summary-traffic').textContent = congestion == null ? 'NA' : `${Number(congestion).toFixed(0)}% congestion`;
    document.querySelector('#summary-traffic-text').textContent = averageSpeed == null ? 'NA' : `${Number(averageSpeed).toFixed(0)} km/h average speed`;
    document.querySelector('#summary-incidents').textContent = incidents == null ? 'NA' : incidents;
    document.querySelector('#summary-incidents-text').textContent = incidents != null && Number(incidents) > 0 ? 'At least one incident was recorded this week.' : 'No incident was recorded this week.';
    document.querySelector('#summary-conditions').textContent = weather || 'Weather unavailable';
    document.querySelector('#summary-conditions-text').textContent = roadCondition || 'Road condition unavailable';
    document.querySelector('#summary-speed').textContent = averageSpeed == null ? 'NA' : `${Number(averageSpeed).toFixed(1)} km/h`;
    document.querySelector('#summary-speed-text').textContent = speedDelta == null ? 'Typical speed in this zone' : `${Number(speedDelta) >= 0 ? '+' : ''}${Number(speedDelta).toFixed(1)} km/h versus the previous week`;
    document.querySelector('#summary-road-load').textContent = trafficPressure == null ? 'NA' : `${(Number(trafficPressure) * (Number(trafficPressure) > 1 ? 1 : 100)).toFixed(0)}%`;
    document.querySelector('#summary-road-load-text').textContent = trafficPressure == null ? 'Road load unavailable' : 'Estimated share of road capacity in use';
    document.querySelector('#summary-density').textContent = vehicleDensity == null ? 'NA' : `${Number(vehicleDensity).toFixed(1)} veh/km`;
    document.querySelector('#summary-density-text').textContent = densityDelta == null ? 'Vehicles per kilometre' : `${Number(densityDelta) >= 0 ? '+' : ''}${Number(densityDelta).toFixed(1)}% versus the previous week`;
    document.querySelector('#summary-capacity').textContent = capacity == null ? 'NA' : `${Number(capacity).toFixed(1)} lanes`;
    document.querySelector('#summary-capacity-text').textContent = 'Effective available road capacity';
    document.querySelector('#summary-guidance-text').textContent = [intervention.description, intervention.action, intervention.target_reduction].filter(Boolean).join(' ') || 'No specific guidance is available for this week.';
}

function renderRiskMap(records) {
    const mapElement=document.querySelector('#risk-map');
    if (!mapElement || !window.L || !availableZones.length) return;
    if (!riskMap) {
        riskMap=L.map(mapElement, {worldCopyJump:true, minZoom:2, maxZoom:13}).setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom:19,
            attribution:'&copy; OpenStreetMap contributors'
        }).addTo(riskMap);
        riskLayer=L.layerGroup().addTo(riskMap);
    }
    riskLayer.clearLayers();
    const points=[];
    const recordsByZone=new Map(records.filter(Boolean).map(record => [record.zone_id, record]));
    availableZones.forEach(zoneInfo => {
        const latitude=Number(zoneInfo.latitude);
        const longitude=Number(zoneInfo.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
        const record=recordsByZone.get(zoneInfo.zone_id);
        const metrics=getMetrics(record || {});
        const congestion=Number(readMessageValue(metrics, ['congestion', 'congestion_pct']) ?? 0);
        const color=heatColor(congestion);
        const marker=L.circleMarker([latitude, longitude], {
            radius:Math.max(6, Math.min(16, 6+congestion/10)),
            color,
            fillColor:color,
            fillOpacity:0.72,
            weight:2
        });
        const vehicleDensity = readMessageValue(metrics, ['vehicle_density','density']);
        const incidentOccurred = readMessageValue(metrics, ['incident_occurred','actual_incident','crashes']);
        marker.bindPopup(`<div class="risk-popup"><strong>${zoneInfo.location_name} (${zoneInfo.zone_id})</strong><br>Congestion: ${formatNumber(congestion)}<br>Vehicle density: ${formatNumber(vehicleDensity)}<br>Incident occurred: ${incidentOccurred ?? 'NA'}<br>Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>`);
        marker.addTo(riskLayer);
        points.push([latitude, longitude]);
    });
    document.querySelector('#map-title').textContent=`Geospatial Risk Radar - Week ${week}`;
    if (points.length) riskMap.fitBounds(points, {padding:[24, 24], maxZoom:9});
    setTimeout(() => riskMap.invalidateSize(), 0);
}

function heatColor(value) {
    const hue=270-(Math.max(0, Math.min(100, value))*270/100);
    return `hsl(${hue}, 85%, 52%)`;
}

function drawTimeline() {
    const canvas=document.querySelector('#timeline-chart');
    if (!canvas || !timelineData.length) return;

    const context=canvas.getContext('2d');
    const bounds=canvas.getBoundingClientRect();
    const ratio=window.devicePixelRatio || 1;
    const width=Math.max(1, bounds.width);
    const height=Math.max(1, bounds.height);
    canvas.width=width*ratio;
    canvas.height=height*ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const padding={top:34, right:18, bottom:30, left:46};
    const chartWidth=width-padding.left-padding.right;
    const chartHeight=height-padding.top-padding.bottom;
    const xFor=index => padding.left + (timelineData.length === 1 ? chartWidth/2 : index*chartWidth/(timelineData.length-1));
    const yFor=value => padding.top + chartHeight - Math.max(0, Math.min(100, Number(value) || 0))*chartHeight/100;
    const series=[
        {color:'#f1f1f1', values:item => readMessageValue(getMetrics(item), ['congestion','congestion_pct']) ?? item.telemetry?.congestion, dashed:false},
        {color:'#85858d', values:item => readMessageValue(getMetrics(item), ['average_speed','average_speed_kmh']) ?? item.telemetry?.average_speed_kmh, dashed:true},
        {color:'#f04444', values:item => readMessageValue(getRisk(item), ['predicted_risk_percentage','risk_score']) ?? item.risk_analysis?.predicted_risk_percentage, dashed:false}
    ];

    context.clearRect(0, 0, width, height);
    context.font='12px console-light';
    context.textAlign='right';
    context.textBaseline='middle';
    for (let tick=0; tick<=100; tick+=20) {
        const y=yFor(tick);
        context.strokeStyle='#ffffff12';
        context.lineWidth=1;
        context.beginPath();
        context.moveTo(padding.left, y);
        context.lineTo(width-padding.right, y);
        context.stroke();
        context.fillStyle='#ffffffa8';
        context.fillText(tick, padding.left-9, y);
    }

    const currentIndex=timelineData.findIndex(item => Number(item.week) === Number(week));
    if (currentIndex >= 0) {
        const x=xFor(currentIndex);
        context.strokeStyle='#ffffff9c';
        context.setLineDash([7, 7]);
        context.beginPath();
        context.moveTo(x, padding.top);
        context.lineTo(x, height-padding.bottom);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle='#ffffffd0';
        context.textAlign='left';
        context.textBaseline='alphabetic';
        context.fillText(`W${week}`, Math.min(x+5, width-42), padding.top-9);
    }

    series.forEach(line => {
        context.strokeStyle=line.color;
        context.lineWidth=line.dashed ? 1.5 : 2.5;
        context.setLineDash(line.dashed ? [3, 4] : []);
        context.beginPath();
        timelineData.forEach((item,index) => {
            const x=xFor(index);
            const y=yFor(line.values(item));
            if (index===0) context.moveTo(x,y); else context.lineTo(x,y);
        });
        context.stroke();
        context.setLineDash([]);
    });

    context.fillStyle='#ffffff8a';
    context.textAlign='center';
    context.textBaseline='alphabetic';
    timelineData.forEach((item,index) => {
        if (index===0 || index===timelineData.length-1 || Number(item.week)%10===0) {
            context.fillText(`W${item.week}`, xFor(index), height-9);
        }
    });
}

function setupTimelineHover() {
    const canvas=document.querySelector('#timeline-chart');
    const tooltip=document.querySelector('#timeline-tooltip');
    if (!canvas || !tooltip) return;

    canvas.addEventListener('mousemove', event => {
        if (!timelineData.length) return;
        const bounds=canvas.getBoundingClientRect();
        const padding={left:46, right:18};
        const chartWidth=Math.max(1, bounds.width-padding.left-padding.right);
        const position=Math.max(0, Math.min(chartWidth, event.clientX-bounds.left-padding.left));
        const index=timelineData.length === 1 ? 0 : Math.round(position/chartWidth*(timelineData.length-1));
        const item=timelineData[index];
        const metrics=getMetrics(item);
        const risk=getRisk(item);
        timelineHoverIndex=index;
        tooltip.innerHTML=`<strong>Week ${item.week}</strong><span class="tooltip-congestion">Congestion: ${Number(readMessageValue(metrics,['congestion','congestion_pct']) ?? 0).toFixed(1)}</span><span class="tooltip-speed">Average speed: ${Number(readMessageValue(metrics,['average_speed','average_speed_kmh']) ?? 0).toFixed(1)} km/h</span><span class="tooltip-risk">Incident risk: ${Number(readMessageValue(risk,['predicted_risk_percentage','risk_score']) ?? 0).toFixed(1)}%</span>`;
        tooltip.style.left=`${padding.left + index*chartWidth/(Math.max(1, timelineData.length-1))}px`;
        tooltip.style.top=`${Math.max(58, event.clientY-bounds.top)}px`;
        tooltip.classList.add('visible');
        drawTimeline();
    });
    canvas.addEventListener('mouseleave', () => {
        timelineHoverIndex=-1;
        tooltip.classList.remove('visible');
        drawTimeline();
    });
}

document.addEventListener('DOMContentLoaded', setupTimelineHover);
window.addEventListener('resize', drawTimeline);

