zone="";
week=1;
first_run=true;
let timelineData=[];
let timelineHoverIndex=-1;
let availableZones=[];
let riskMap=null;
let riskLayer=null;

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
    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${document.querySelector('.b_ZoneSelectorMaster').innerHTML.replace(' ','_')}/1.json`)
  .then(response => response.json())
    .then(data => {
        document.querySelector('.l_ZoneDetails').innerHTML = `${data.raw_metrics.location_name}, ${data.raw_metrics.city} - ${data.raw_metrics.zone_type.replace(/_/g, ' ')}`;
    });
    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${document.querySelector('.b_ZoneSelectorMaster').innerHTML.replace(' ','_')}/all.json`)
    .then(response => response.json())
    .then(data => {
        document.querySelector('.l_WeekCount').innerHTML = data.timeline.length;
        timelineData=data.timeline;
        drawTimeline();
        loadRanking();
        renderRiskMap(data.timeline);
    });
    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${zone.replace(/ /g,'_')}/${week}.json`)
    .then(response => response.json())
    .then(data => {
        updateCivilianSummary(data);
        document.querySelector('.l_data_disp_item_population_value').innerHTML = data.raw_metrics.population_density;
        document.querySelector('.l_data_disp_item_incident_value').innerHTML = data.raw_metrics.incident_count;
        // if (data.raw_metrics.incident_count_change > 0) {
        //     document.querySelector('.l_data_disp_item_incident').classList.add('negative');
        // } else if (data.raw_metrics.incident_count_change < 0) {
        //     document.querySelector('.l_data_disp_item_incident').classList.add('positive');
        // }
        // else {
        //     document.querySelector('.l_data_disp_item_incident').classList.remove('positive');
        //     document.querySelector('.l_data_disp_item_incident').classList.remove('negative');
        // }
        document.querySelector('.l_data_disp_item_traffic_prssure_value').innerHTML = Number(data.raw_metrics.traffic_pressure*100).toFixed(1) + "%";
        document.querySelector('.l_data_disp_item_predicted_risk_value').innerHTML = `${(data.risk_analysis.predicted_risk_percentage!=null)? `${Number(data.risk_analysis.predicted_risk_percentage).toFixed(1)}% <span style="font-family: console-light; white-space: nowrap;font-size: small; color: #ffffff24">${data.risk_analysis.risk_delta_vs_prev_week !=null? `(${data.risk_analysis.risk_delta_vs_prev_week > 0 ? '+' : ''}${Number(data.risk_analysis.risk_delta_vs_prev_week).toFixed(1)}% vs W${week-1}) `:""}`: 'NA'}</span>`;
        document.querySelector('.l_data_disp_additional_predicted_risk').innerHTML = data.risk_analysis.risk_label;
        document.querySelector('.l_data_disp_additional_predicted_risk').style.background = data.risk_analysis.risk_color;
        document.querySelector('.l_banner_title').innerHTML = data.interventions[0].id.replace(/_/g, ' ');
        document.querySelector('.l_data_disp_additional_severity').innerHTML = data.interventions[0].severity;
        document.querySelector('.l_data_disp_additional_descriptor').innerHTML = data.interventions[0].description + " " +data.interventions[0].action;
        document.querySelector('.l_data_disp_item_congestion_value').innerHTML = data.raw_metrics.congestion + `% <span style="font-family: console-light; white-space: nowrap;font-size: small; color: #ffffff24">${data.raw_metrics.congestion_change !=null? `(${data.raw_metrics.congestion_change > 0 ? '+' : ''}${Number(data.raw_metrics.congestion_change).toFixed(1)}% vs W${week-1}) `:""}</span>`; 
        document.querySelector('.l_data_disp_item_vehicle_density_value').innerHTML = data.raw_metrics.vehicle_density + ` veh/km <span style="font-family: console-light; white-space: nowrap;font-size: small; color: #ffffff24">${data.raw_metrics.vehicle_density_pct_change !=null? `(${data.raw_metrics.vehicle_density_pct_change > 0 ? '+' : ''}${Number(data.raw_metrics.vehicle_density_pct_change).toFixed(1)}% vs W${week-1}) `:""}</span>`; 

        // document.querySelector('.l_data_disp_additional_predicted_risk').style.display= (data.risk_analysis.risk_label != null)?"block": "none";
    });


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
        const ranking=records.filter(Boolean).sort((first, second) => Number(second.priority?.priority_score ?? second.raw_metrics?.priority_score ?? 0) - Number(first.priority?.priority_score ?? first.raw_metrics?.priority_score ?? 0));
        rankingBody.replaceChildren();
        ranking.forEach((record, index) => {
            const metrics=record.raw_metrics || {};
            const row=document.createElement('tr');
            if (record.zone_id?.replace(/_/g, ' ') === zone) {
                row.classList.add('current-zone');
                row.setAttribute('aria-current', 'true');
            }
            row.innerHTML=`<td>${index+1}</td><td>${record.zone_id || 'NA'}</td><td>${record.location_name || metrics.location_name || 'NA'}</td><td>${record.city || metrics.city || 'NA'}</td><td>${formatNumber(metrics.vehicle_density)}</td><td>${formatNumber(metrics.congestion)}</td><td>${metrics.incident_occurred ?? 'NA'}</td>`;
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
    const metrics=data.raw_metrics || {};
    const risk=data.risk_analysis || {};
    const intervention=data.interventions?.[0] || {};
    const riskValue=risk.predicted_risk_percentage == null ? 'NA' : `${Number(risk.predicted_risk_percentage).toFixed(0)}%`;
    const riskLabel=risk.risk_label || 'Risk unavailable';
    const incidents=metrics.incident_count == null ? 'NA' : metrics.incident_count;
    const congestion=metrics.congestion == null ? 'NA' : `${Number(metrics.congestion).toFixed(0)}% congestion`;
    const speed=metrics.average_speed == null ? 'NA' : `${Number(metrics.average_speed).toFixed(0)} km/h average speed`;
    const roadLoad=metrics.traffic_pressure == null ? 'NA' : `${(Number(metrics.traffic_pressure)*100).toFixed(0)}%`;
    const density=metrics.vehicle_density == null ? 'NA' : `${Number(metrics.vehicle_density).toFixed(1)} veh/km`;
    const capacity=metrics.effective_road_capacity == null ? metrics.road_capacity : metrics.effective_road_capacity;
    const weather=metrics.weather || 'Weather unavailable';
    const roadCondition=metrics.road_condition || 'Road condition unavailable';
    const riskText=risk.predicted_risk_percentage == null ? 'No risk estimate is available for this week.' : `${riskLabel}. This is the forecast for the selected zone and week.`;
    const incidentText=metrics.incident_occurred ? 'At least one incident was recorded this week.' : 'No incident was recorded this week.';
    const guidance=[intervention.description, intervention.action].filter(Boolean).join(' ');

    document.querySelector('#civilian-summary-period').textContent=`${metrics.location_name || data.location_name || zone} - Week ${metrics.week || data.week || week}`;
    document.querySelector('#summary-risk').textContent=`${riskLabel} (${riskValue})`;
    document.querySelector('#summary-risk-text').textContent=riskText;
    document.querySelector('#summary-traffic').textContent=congestion;
    document.querySelector('#summary-traffic-text').textContent=speed;
    document.querySelector('#summary-incidents').textContent=incidents;
    document.querySelector('#summary-incidents-text').textContent=incidentText;
    document.querySelector('#summary-conditions').textContent=weather;
    document.querySelector('#summary-conditions-text').textContent=roadCondition;
    document.querySelector('#summary-speed').textContent=metrics.average_speed == null ? 'NA' : `${Number(metrics.average_speed).toFixed(1)} km/h`;
    document.querySelector('#summary-speed-text').textContent=metrics.speed_change == null ? 'Typical speed in this zone' : `${Number(metrics.speed_change) >= 0 ? '+' : ''}${Number(metrics.speed_change).toFixed(1)} km/h versus the previous week`;
    document.querySelector('#summary-road-load').textContent=roadLoad;
    document.querySelector('#summary-road-load-text').textContent=metrics.traffic_pressure == null ? 'Road load unavailable' : 'Estimated share of road capacity in use';
    document.querySelector('#summary-density').textContent=density;
    document.querySelector('#summary-density-text').textContent=metrics.vehicle_density_pct_change == null ? 'Vehicles per kilometre' : `${Number(metrics.vehicle_density_pct_change) >= 0 ? '+' : ''}${Number(metrics.vehicle_density_pct_change).toFixed(1)}% versus the previous week`;
    document.querySelector('#summary-capacity').textContent=capacity == null ? 'NA' : `${Number(capacity).toFixed(1)} lanes`;
    document.querySelector('#summary-capacity-text').textContent='Effective available road capacity';
    document.querySelector('#summary-guidance-text').textContent=guidance || 'No specific guidance is available for this week.';
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
        const congestion=Number(record?.raw_metrics?.congestion ?? 0);
        const color=heatColor(congestion);
        const marker=L.circleMarker([latitude, longitude], {
            radius:Math.max(6, Math.min(16, 6+congestion/10)),
            color,
            fillColor:color,
            fillOpacity:0.72,
            weight:2
        });
        marker.bindPopup(`<div class="risk-popup"><strong>${zoneInfo.location_name} (${zoneInfo.zone_id})</strong><br>Congestion: ${formatNumber(congestion)}<br>Vehicle density: ${formatNumber(record?.raw_metrics?.vehicle_density)}<br>Incident occurred: ${record?.raw_metrics?.incident_occurred ?? 'NA'}<br>Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>`);
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
        {color:'#f1f1f1', values:item => item.raw_metrics?.congestion, dashed:false},
        {color:'#85858d', values:item => item.raw_metrics?.average_speed, dashed:true},
        {color:'#f04444', values:item => item.risk_analysis?.predicted_risk_percentage, dashed:false}
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
        timelineHoverIndex=index;
        tooltip.innerHTML=`<strong>Week ${item.week}</strong><span class="tooltip-congestion">Congestion: ${Number(item.raw_metrics?.congestion ?? 0).toFixed(1)}</span><span class="tooltip-speed">Average speed: ${Number(item.raw_metrics?.average_speed ?? 0).toFixed(1)} km/h</span><span class="tooltip-risk">Incident risk: ${Number(item.risk_analysis?.predicted_risk_percentage ?? 0).toFixed(1)}%</span>`;
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

