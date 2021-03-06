var express = require('express');
var router = express.Router();
var moment = require('moment');
var sessionMiddleware = require('../session_middleware');

router.get('/', sessionMiddleware.requireLogin, function(req, res, next) {
   let queryDate = req.query.date;
   let currDate;
   if(queryDate){
      currDate = moment(new Date(queryDate));
      currDate.add(1, 'days');
      currDate = currDate.toISOString();
   }else{
      currDate = moment().toISOString();
   }
   res.render('monthly', {
      title: moment(currDate).format("MMMM"),
      calendarHeader: moment(currDate).format("MMMM YYYY"),
      currentDate: currDate
   });
});

router.get('/weekly', sessionMiddleware.requireLogin, function(req, res, next){
   let queryDate = req.query.date;
   let firstDate, lastDate, currDate, startDate, endDate;
   if(queryDate){
      firstDate = moment(new Date(queryDate));
      firstDate.add(1, 'days');
      lastDate = moment(new Date(queryDate));
      lastDate.add(1, 'days');
      currDate = moment(new Date(queryDate)).toISOString();
      startDate = firstDate.day("Sunday");
      endDate = lastDate.day("Saturday");
   }else{
      firstDate = moment();
      lastDate = moment();
      currDate = moment().toISOString();
      startDate = firstDate.day("Sunday");
      endDate = lastDate.day("Saturday");
   }
   let headerString = startDate.format("MMM. Do - ") + endDate.format("MMM. Do");
   res.render('weekly', {
      title: "Weekly View",
      calendarHeader: headerString,
      currentDate: firstDate
   })
})

router.get('/daily', sessionMiddleware.requireLogin, function(req, res, next){
   let queryDate = req.query.date;
   let currDate;
   if(queryDate){
      currDate = moment(queryDate, "YYYY-M-D HH:mm:ss").toISOString();
   }else{
      currDate = moment().toISOString();
   }
   res.render('daily', {
      title: moment(currDate).format("MMM. Do YYYY"),
      calendarHeader: moment(currDate).format("MMMM Do YYYY"),
      currentDate: currDate
   });
})



module.exports = router;
