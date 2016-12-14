function createRightDrawer(dateArray){
   let month = parseInt(dateArray[0].replace(/\u200E/g,""), 10)-1;
   let year = parseInt(dateArray[2].replace(/\u200E/g,""), 10);
   let day = parseInt(dateArray[1].replace(/\u200E/g,""), 10);
   let selectedDay = new Date(year, month, day);
   let dateString = dayFormat.format(selectedDay) + " " + monthFormat.format(selectedDay) + " " + dateArray[1] + ", " + dateArray[2];
   $("#drawerDate").text(dateString);
   $("#drawerEvents").empty();
   $.each(eventMap, function(dateKey, eventList){
      if(dateKey == localeFormat.format(selectedDay)){
         $.each(eventList, function(i, eventObj){
            let eventDiv = "<div id=e" +  eventObj.eventID +">";
            let eventName = "<h4 class=text-center>" + eventObj.title + "</h4>";
            let eventTime = "<p class='text-center'>" + formatEventTime(eventObj.stime) + " - " + formatEventTime(eventObj.etime) + "</p>";
            eventDiv += eventName;
            eventDiv += eventTime;
            let delBtn = "<button class='deleteButton' data-eId=" + eventObj.eventID + ">Delete</button>";
            let updateBtn = "<button class='updateButton' data-eId=" + eventObj.eventID + ">Edit</button>";
            eventDiv += delBtn;
            eventDiv += updateBtn;
            eventDiv += "</div>";
            $("#drawerEvents").append(eventDiv);
            $("#e"+eventObj.eventID).css("background-color", eventObj.color);
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


$("#addEventBtn").click(function(){
   let eTitle = $("#eventTitle").val();
   let eDate = $("#eventDate").val();
   let sTime = $("#eventStartTime").val();
   let eTime = $("#eventEndTime").val();
   let eColor = $(".selectedColor").attr("name");
   let newDate = new Date(eDate);
   newDate = newDate.setDate(newDate.getDate() + 1);
   newDate = localeFormat.format(newDate);
   let startDateTime = new Date(eDate + " " + sTime);
   let endDateTime = new Date(eDate + " " + eTime);
   let newEvent={
      title: eTitle,
      date: newDate,
      stime: startDateTime.toISOString(),
      etime: endDateTime.toISOString(),
      color: eColor
   }
   $.ajax({//Add Events
      method: "POST",
      url: "http://localhost:3000/events",
      data: newEvent,
      success: function(e){
         let eventData = JSON.parse(JSON.stringify(e));
         let formatStartTime = new Date(eventData['stime']);
         let formatEndTime = new Date(eventData['etime']);
         events = {
            title: eventData['title'],
            date: eventData['date'],
            stime: formatStartTime.toLocaleTimeString('en-GB'),
            etime: formatEndTime.toLocaleTimeString('en-GB'),
            color: eventData['color'],
            eventID: eventData['_id']
         }
         if(eventMap[newDate] != undefined){
            eventMap[newDate].push(events);
         }else{
            eventMap[newDate] = [events];
         }
         if($("#calendar").hasClass("month")){
            addMonthEvent();
         }else if($("#calendar").hasClass("week")){
            addWeekEvent();
         }else if($("#calendar").hasClass("day")){
            addDayEvent();
         }
      },
      error: function(e, status){
         if(e.status == 500){
            alert("the event " + e.responseJSON[0].title + " is conflicting with the event you're trying to add.");
         }
      }
   });
   $("#eventTitle").val("");
   $("#eventDate").val("");
   $("#eventStartTime").val("");
   $("#eventEndTime").val("");
   $("#editMenu").addClass("hide");
   $("#calendar").removeClass("disable");
   $("#table-background").removeClass("opacity");
});

$("#addEventButton").click(function(){
   $("#editMenu").removeClass("hide");
   $("#calendar").addClass("disable");
   $("#table-background").addClass("opacity");
});

$("#table-background").click(function(){
   if($("#editMenu").hasClass("hide") === false){
      $("#editMenu").addClass("hide");
      $("#calendar").removeClass("disable");
      $("#table-background").removeClass("opacity");
   }
   if($("#eventMenu").hasClass("hide") === false){
      $("#eventMenu").addClass("hide");
      $("#calendar").removeClass("disable");
      $("#table-background").removeClass("opacity");
   }
   if(document.querySelector(".deleteButton") !== null){
      let idString;
      $(".deleteButton").click(function(e){
         $.each(eventMap, function(dateKey, eventList){
            $.each(eventList, function(i, eventObj){
               if(e.target.getAttribute("data-eId") == eventObj.eventID){
                  let eIndex = eventList.indexOf(eventObj);
                  $.ajax({
                     method: "DELETE",
                     url: "http://localhost:3000/events/" + eventObj.eventID,
                     success: function(data){
                        eventList.splice(eIndex, 1);
                        idString = "#e"+eventObj.eventID;
                        $(idString).remove();
                        if(eventList.length == 0){
                           $("[data-date='" + dateKey + "']").css("background-color", "white");
                           $("[data-date='" + dateKey + "']").text("");
                           delete eventMap[dateKey];
                        }
                     }
                  });
               }
            })
         })
      });
   }
   if($(".updateButton") !== null){
      $(".updateButton").click(function(e){
         e.stopPropagation();
         $.each(eventMap, function(dateKey, eventList){
            $.each(eventList, function(i, eventObj){
               if(e.target.getAttribute("data-eId") == eventObj.eventID){
                  let eIndex = eventList.indexOf(eventObj);
                  $("#editTitle").val(eventObj.title);
                  $("#editDate").val(eventObj.date.split("T")[0]);
                  $("#editStartTime").val(eventObj.stime);
                  $("#editEndTime").val(eventObj.etime);
                  $("#saveEventBtn").attr("data-eId", eventObj.eventID);
               }
            })
         })
         $("#eventMenu").removeClass("hide");
         $("#calendar").addClass("disable");
         $("#table-background").addClass("opacity");
      })
   }
});

$("#saveEventBtn").click(function(){
   let eTitle = $("#editTitle").val();
   let eDate = $("#editDate").val();
   let sTime = $("#editStartTime").val();
   let eTime = $("#editEndTime").val();
   let newDate = new Date(eDate);
   newDate = newDate.setDate(newDate.getDate() + 1);
   newDate = localeFormat.format(newDate);
   let newEvent={
      title: eTitle,
      date: newDate,
      stime: sTime,
      etime: eTime
   }
   let eId = $("#saveEventBtn").attr("data-eId");
   $.ajax({
      method: "PATCH",
      url: "http://localhost:3000/events/" + eId,
      data: newEvent,
      success: function(data){
         location.reload();
      },
      error: function(e, status){
         if(e.status == 500){
            alert("the event " + e[0].title + " is conflicting with the event you're trying to add.");
         }
      }
   });
   $("#eventMenu").addClass("hide");
   $("#calendar").removeClass("disable");
   $("#table-background").removeClass("opacity");
});

$(".colorBtn").click(function(e){
   $("#eventColors>input.selectedColor").removeClass("selectedColor");
   $(this).addClass("selectedColor");
})

$("#calendar").click(function(e){
   createRightDrawer(e.target.getAttribute("data-date").split("/"));
   let drawerWidth = $("#rightDrawer").width();
   $("#rightDrawer").animate({"right": 0}, "fast");
});

$("#deleteWindow").click(function(){
   let drawerWidth = $("#rightDrawer").width();
   $("#rightDrawer").animate({"right": "-25%"}, "fast");
});
