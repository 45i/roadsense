zone="";
week=1;
first_run=true;
let timelineData=[];

document.addEventListener('DOMContentLoaded', () => {
fetch('https://ayan786151.github.io/RoadSense-AI/api/v1/zones.json')
  .then(response => response.json())
  .then(data => {
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
    });
    fetch(`https://ayan786151.github.io/RoadSense-AI/api/v1/zones/${zone.replace(/ /g,'_')}/${week}.json`)
    .then(response => response.json())
    .then(data => {
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

window.addEventListener('resize', drawTimeline);

