const monthFormat = new Intl.DateTimeFormat('en-US', {month: 'long'});
const monthNumeric = new Intl.DateTimeFormat('en-US', {month: 'numeric'});
const localeFormat = new Intl.DateTimeFormat('en-US');
const monthAbv = new Intl.DateTimeFormat('en-US', {month: 'short'});
const dayFormat = new Intl.DateTimeFormat('en-US', {weekday: 'long'});
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const times = ["12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm",
               "7pm", "8pm", "9pm", "10pm", "11pm"];
let eventMap = {};
let events = {};

let month = date.getMonth();
let year = date.getFullYear();

$(document).ready(function(){
   createMonth();
   $.ajax({
      method: "GET",
      url: "http://localhost:3000/events",
      success: function(eventData){
         $.each(eventData, function(i, e){
            events = {
               title: e['title'],
               date: e['date'],
               stime: e['stime'],
               etime: e['etime'],
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
         //console.log(eventMap)
         addMonthEvent();
      }
   });
});

function createMonth(){
   let lastDateCurrMonth = new Date(year, month+1, 0);
   let firstDayCurrMonth = new Date(year, month, 1);
   let lastDatePrevMonth = new Date(year, month, 0);
   let currMonthDays = lastDateCurrMonth.getDate();
   let prevMonthDays = lastDatePrevMonth.getDate();
   let row = "<tr>";
   let count = 0;
   $("#calendar").empty();
   if(!$("#calendar").hasClass("month")){
      $("#calendar").removeClass();
      $("#calendar").addClass("month");
   }
   //$(".calendarHeader").text(monthFormat.format(firstDayCurrMonth) + " " + firstDayCurrMonth.getFullYear());
   for(let i=0; i<7; i++){
      row += "<th>" + daysOfWeek[i] + "</th>";
   }
   row += "</tr>";
   $("#calendar").append(row);
   row = "<tr>";
   for(let i=firstDayCurrMonth.getDay()-1; i>=0; i--){
      count = prevMonthDays - i;
      row += "<td class='grayDates' data-date=" + localeFormat.format(new Date(year, month-1, count)) + ">" + count + "</td>";
   }
   count = 1;
   for(let i = 1; i < 7; i++){
      for(let j = 0; j < 7; j++){
         if(count <= currMonthDays && (j >= firstDayCurrMonth.getDay() || i > 1)){
            row += "<td data-date=" + localeFormat.format(new Date(year, month, count)) + ">" + count + "</td>";
            count++;
         }
      }
      if(count <= currMonthDays){
         row += "</tr>";
         $("#calendar").append(row);
         row ="<tr>";
      }else{
         count = 1;
         for(let i=lastDateCurrMonth.getDay(); i<6; i++){
            row += "<td class='grayDates' data-date=" + localeFormat.format(new Date(year, month+1, count)) + ">" + count + "</td>";
            count++;
         }
         row += "</tr>";
         $("#calendar").append(row);
         break;
      }
   }
}

function createWeek(){
   let row = "<tr>";
   let countHour = 0;
   $("#calendar").empty();
   if(!$("#calendar").hasClass("week")){
      $("#calendar").removeClass();
      $("#calendar").addClass("week");
   }
   date.setDate(date.getDate()-date.getDay());
   let tempDate = new Date(date);
   $(".calendarHeader").text(monthAbv.format(date) + " " + date.getDate());
   for(let i=0; i<25; i++){
      for(let j=0; j<8; j++){
         if(i===0 && j===0){
            row += "<th>Time</th>";
         }else if(i===0 && j!==0){
            row += "<th>" + daysOfWeek[j-1] + (date.getMonth()+1) + "/" + date.getDate() + "</th>";
            date.setDate(date.getDate() + 1);
         }else if(i>0 && j===0){
            row += "<td>" + times[i-1] + "</td>";
         }else{
            row += "<td data-time=" + countHour + " " + "data-date=" + localeFormat.format(tempDate) + "></td>";
            tempDate.setDate(tempDate.getDate()+1);
         }
      }
      if(i!==0){
         countHour++;
         tempDate.setDate(tempDate.getDate()-7);
      }
      row += "</tr>";
      $("#calendar").append(row);
      row = "<tr>";
   }
   $(".calendarHeader").append(" - " + monthAbv.format(date) + " " + (date.getDate()-1));
}

function createDay(){
   let row = "<tr>";
   $("#calendar").empty();
   if(!$("#calendar").hasClass("day")){
      $("#calendar").removeClass();
      $("#calendar").addClass("day");
   }
   $(".calendarHeader").text(monthFormat.format(date) + " " + date.getDate() + " " + date.getFullYear());
   for(let i=0; i<25; i++){
      for(let j=0; j<8; j++){
         if(i===0 && j===0){
            row += "<th>Time</th>";
         }else if(i===0 && j===1){
            row += "<th colspan='9'>" + daysOfWeek[j-1] + (date.getMonth()+1) + "/" + date.getDate() + "</th>";
         }else if(i>0 && j===0){
            row += "<td>" + times[i-1] + "</td>";
         }else if(i>0 && j===1){
            row += "<td colspan='9' data-time=" + times[i-1] + " data-date=" + localeFormat.format(date) + "></td>";
         }
      }
      row += "</tr>";
      $("#calendar").append(row);
      row = "<tr>";
   }
}

function createRightDrawer(dateArray){
   let selectedDay = new Date(dateArray[2], dateArray[0]-1, dateArray[1]);
   let dateString = dayFormat.format(selectedDay) + " " + monthFormat.format(selectedDay) + " " + dateArray[1] + ", " + dateArray[2];
   $("#drawerDate").text(dateString);
   $("#drawerEvents").empty();
   $.each(eventMap, function(dateKey, eventList){
      if(dateKey == localeFormat.format(selectedDay)){
         $.each(eventList, function(i, eventObj){
            let eventDiv = "<div id=e" +  eventObj.eventID + ">";
            let eventName = "<h4 class=text-center>" + eventObj.title + "</h4>";
            let eventTime = "<p class='text-center'>" + formatEventTime(eventObj.stime) + " - " + formatEventTime(eventObj.etime) + "</p>";
            eventDiv += eventName;
            eventDiv += eventTime;
            let delBtn = "<button class='deleteButton' data-eId=" + eventObj.eventID + ">Delete</button>";
            let updateBtn = "<button class='updateButton' data-eId=" + eventObj.eventID + ">Edit</button>";
            eventDiv += delBtn;
            eventDiv += "</div>";
            $("#drawerEvents").append(eventDiv);
         })
      }
   })
}

function formatEventTime(t){
   let hour = t.split(":")[0];
   let minutes = t.split(":")[1];
   if(hour >= 12){
      if(hour != 12){
         hour -= 12;
      }
      hour += ":"+minutes;
      hour += "pm";
   }else{
      if(hour < 10){
         hour = hour.substring(1);
      }
      hour += ":"+minutes;
      hour += "am";
   }
   return hour;
}

$("#nextBtn").click(function(){
   if($("#calendar").hasClass("month")){
      month += 1;
      createMonth();
      addMonthEvent();
   }else if($("#calendar").hasClass("week")){
      createWeek();
      addWeekEvent();
   }else if($("#calendar").hasClass("day")){
      date.setDate(date.getDate() + 1);
      createDay();
   }
});

$("#prevBtn").click(function(){
   if($("#calendar").hasClass("month")){
      month -= 1;
      createMonth();
      addMonthEvent();
   }else if($("#calendar").hasClass("week")){
      date.setDate((date.getDate() - 14));
      createWeek();
      addWeekEvent();
   }else if($("#calendar").hasClass("day")){
      date.setDate(date.getDate() - 1);
      createDay();
   }
});

$("#monthlyView").click(function(){
   month = date.getMonth();
   year = date.getFullYear();
   createMonth();
   addMonthEvent();
});

$("#weeklyView").click(function(){
   date = new Date();
   month = date.getMonth();
   year = date.getFullYear();
   createWeek();
   addWeekEvent();
});

$("#dailyView").click(function(){
   date = new Date();
   month = date.getMonth();
   year = date.getFullYear();
   createDay();
});
