const monthFormat = new Intl.DateTimeFormat('en-US', {month: 'long'});
const localeFormat = new Intl.DateTimeFormat('en-US');
const monthAbv = new Intl.DateTimeFormat('en-US', {month: 'short'});
const dayFormat = new Intl.DateTimeFormat('en-US', {weekday: 'long'});
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const times = ["12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm",
               "7pm", "8pm", "9pm", "10pm", "11pm"];

let eventMap = {};
let events = {};
let countHour = 0;

let row = "<tr>";
$("#calendar").empty();
if(!$("#calendar").hasClass("day")){
   $("#calendar").removeClass();
   $("#calendar").addClass("day");
}
for(let i=0; i<25; i++){
   for(let j=0; j<8; j++){
      if(i===0 && j===0){
         row += "<th>Time</th>";
      }else if(i===0 && j===1){
         row += "<th colspan='9'>" + daysOfWeek[j-1] + (date.getMonth()+1) + "/" + date.getDate() + "</th>";
      }else if(i>0 && j===0){
         row += "<td>" + times[i-1] + "</td>";
      }else if(i>0 && j===1){
         row += "<td colspan='9' data-time=" + countHour + " data-date=" + localeFormat.format(date) + "></td>";
      }
   }
   if(i !== 0){
      countHour++;
   }
   row += "</tr>";
   $("#calendar").append(row);
   row = "<tr>";
}

$(document).ready(function(){
   $.ajax({
      method: "GET",
      url: "http://localhost:3000/events",
      success: function(eventData){
         $.each(eventData, function(i, e){
            let formatStartTime = new Date(e['stime']);
            let formatEndTime = new Date(e['etime']);
            events = {
               title: e['title'],
               date: e['date'],
               stime: formatStartTime.toLocaleTimeString('en-GB'),
               etime: formatEndTime.toLocaleTimeString('en-GB'),
               color: e['color'],
               eventID: e['_id']
            }
            let newDate = new Date(e['date']);
            let formatDate = localeFormat.format(newDate);
            if(eventMap[formatDate] != undefined){
               eventMap[formatDate].push(events);
            }else{
               eventMap[formatDate] = [events];
            }
         })
         addDayEvent();
      }
   });
});

function addDayEvent(){
   let calendar = $("#calendar").find("tr td");
   let startHour, endHour;
   $.each(eventMap, function(dateKey, eventList){
      $.each(eventList, function(i, eventObj){
         startHour = eventObj.stime.split(":")[0];
         endHour = eventObj.etime.split(":")[0];
         if(startHour[0] == 0){
            startHour = startHour.substring(1);
         }
         if(endHour[0] == 0){
            endHour = endHour.substring(1);
         }
         $.each(calendar, function(index, item){
            startHour = startHour.replace(/\u200E/g,"");
            endHour = endHour.replace(/\u200E/g,"");
            if(dateKey == item.getAttribute("data-date") && parseInt(startHour, 10) <= item.getAttribute("data-time") && parseInt(endHour, 10) > item.getAttribute("data-time")){
               if(startHour == item.getAttribute("data-time")){
                  $("[data-date='" + dateKey + "'][data-time='" + item.getAttribute("data-time") + "']").text(eventObj.title);
               }
               $("[data-date='" + dateKey + "'][data-time='" + item.getAttribute("data-time") + "']").css("background-color", eventObj.color);
            }
         })
      })
   })
}

$("#monthlyView").click(function(){
   let resetMonth = "http://"+window.location.host+"/calendar";
   window.location.replace(resetMonth);
});

$("#weeklyView").click(function(){
   let resetWeek = "http://"+window.location.host+"/calendar/weekly";
   window.location.replace(resetWeek);
});

$("#dailyView").click(function(){
   let resetDay = "http://"+window.location.host+"/calendar/daily";
   window.location.replace(resetDay);
});

$("#nextBtn").click(function(){
   date.setDate(date.getDate() + 1);
   let dayUrl = document.location.href.split("?")[0] + "?date=" + date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
   document.location = dayUrl;
});

$("#prevBtn").click(function(){
   date.setDate(date.getDate() - 1);
   let dayUrl = document.location.href.split("?")[0] + "?date=" + date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
   document.location = dayUrl;
});
