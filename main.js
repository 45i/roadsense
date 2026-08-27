zone="";
week=1;
first_run=true;

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
        document.querySelector('.l_data_disp_item_predicted_risk_value').innerHTML = `${(data.risk_analysis.predicted_risk_percentage!=null)? `${Number(data.risk_analysis.predicted_risk_percentage).toFixed(1)}% <span style="font-family: console-light; white-space: nowrap;font-size: small; color: #ffffff24">${data.risk_analysis.risk_delta_vs_prev_week !=null? `(${data.risk_analysis.risk_delta_vs_prev_week > 0 ? '+' : ''}${Number(data.risk_analysis.risk_delta_vs_prev_week).toFixed(1)}% vs W${week-1}) `:""}`: 'data not available'}</span>`;
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

