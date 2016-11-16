var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var date = new Date();
var month = date.getMonth();
var year = date.getFullYear();

function createMonthTable(){
   document.querySelector("#calendar").innerHTML = "";
   document.querySelector("#calendar").classList = "";
   document.querySelector("#calendar").classList.add("month");
   var tbl = document.querySelector('.month');
   for(var i=0; i<7; i++){
      var tr = tbl.insertRow(i);
      for(var j=0; j<7; j++){
         if(i === 0){
            tr.insertCell(j).outerHTML = "<th>"+ daysOfWeek[j]+"</th>";
         }else{
            tr.insertCell(j);
         }
      }
   }
};

function populateMonth(){
   var newDate = new Date(year, month+1, 0);
   var days = newDate.getDate();
   var count = 1;
   var calendar=document.querySelector(".month");
   var firstDayMonth = new Date(year, month, 1);
   var startDate = firstDayMonth.getDay();
   var cHead = document.querySelector(".calendarHeader").innerHTML = months[month%12] + " " + firstDayMonth.getFullYear();
   for(var i = 1; i < 7; i++){
      for(var j = 0; j < 7; j++){
         if(count <= days && (j >= startDate || i > 1)){
            calendar.rows[i].cells[j].innerHTML = count;
            count++;
         }
      }
   }
};

createMonthTable();
populateMonth();

var next = document.querySelector("#nextBtn");
var prev = document.querySelector("#prevBtn");

next.addEventListener("click", function(e){
   month = month + 1;
   createMonthTable();
   populateMonth();
});

prev.addEventListener("click", function(e){
   month = month - 1;
   createMonthTable();
   populateMonth();
})