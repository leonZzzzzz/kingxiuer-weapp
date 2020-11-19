import { dateInterval, getDateArray,getMonthday,getMonthFirstDay,isNeedZero } from '../utils/util.js'
/**
 * 判断使用哪一种算法
 * mc1 最短经周期（天数）
 * mc2 最长月经周期（天数）
 */
function isRule(mc1, mc2) {
  if (mc2 - mc1 <= 2) {
    // 第一种算法
    return true
  } else {
    // 第二种算法
    return false
  }
};
/**  获取月经期最后一天后的15天
* md 月经开始日期;
* bd 持续时间
*/
function periodcome(md, bd) {
  return getDateArray(md, dateInterval(md, bd - 1))
};

/**
 * 获取月经的周期
 * md 月经开始日期;
 * bd 持续时间
 */
function menses(md, bd) {
  return getDateArray(md, dateInterval(md, bd - 1))
};

/**
 * 获取排卵的周期
 * md 月经开始日期;
 * mc1 最短经周期（天数）
 * mc2 最长月经周期（天数）
 */

//  旧的算法
function oldovluate(md, mc1, mc2) {
  if (isRule(mc1, mc2)) {
    return getDateArray(dateInterval(md, mc1 - 19), dateInterval(md, mc2 - 12))
  } else {
    return getDateArray(dateInterval(md, mc1 - 19), dateInterval(md, mc2 - 10))
  }
}


// 新的算法
function ovluate(md, mc1, mc2) {
  console.log(md, mc1, mc2)
  if (isRule(mc1, mc2)) {
    return getDateArray(dateInterval(md, mc1 - 23), dateInterval(md, mc2 - 16))
  } else {
    return getDateArray(dateInterval(md, mc1 - 23), dateInterval(md, mc2 - 14))
  }
}
/**
 * 获取卵泡的周期
 * md 月经开始日期;
 * bd 持续时间
 */
function follicle(md, bd) {
  console.log(md,bd)
  return getDateArray(md, dateInterval(md, bd-2))
};
/**
 * 获取排卵的周期的前一天 用来发短信的
 * md 月经开始日期;
 * mc1 最短经周期（天数）
 * mc2 最长月经周期（天数）
 */
function theDayBefore(md, mc1, mc2) {
  return dateInterval(ovluate(md, mc1, mc2)[0],-1);
}

/**
 * 获取排卵的日
 * md 月经开始日期;
 * mc1 最短经周期（天数）
 */
function ovluateDay(md, mc1, mc2) {
  return dateInterval(md, Math.floor(((mc1 + mc2) / 2 - 15)));
}

/**
 * 建议同房日期
 */
// 旧的建议同房
function oldmlDay(md, mc1, mc2) {
  if(mc1<mc2){
    mc1=Math.floor((mc1+mc2)/2)
    mc2=mc1
  }
  return getDateArray(dateInterval(md, mc1 - 16), dateInterval(md, mc2 - 14))
}
// 新的建议同房
function mlDay(md, mc1, mc2) {
  if(mc1<mc2){
    mc1=Math.floor((mc1+mc2)/2)
    mc2=mc1
  }
  // return dateInterval(md, Math.floor(((mc1 + mc2) / 2 - 16)));
  return getDateArray(dateInterval(md, mc1 - 4), dateInterval(md, mc2 - 2))
}
// 获取当前月份天数
function getNowDays(year,month){
  let firstInterval, day, lastInterval, dayList = [];
  // 保存当前月份的天数的间隔时间
  firstInterval = getMonthFirstDay(year, month)
  day = getMonthday(year, month)
  // 获取后面间隔时间
  if (35 - (day + firstInterval) >= 0) {
    lastInterval = 35 - (day + firstInterval)
  } else {
    lastInterval = 42 - (day + firstInterval)
  }
  //返回日历数组
  for (let i = 1; i <= day; i++) {
    dayList.push({
      day: i,
      full: `${year}-${isNeedZero(month)}-${isNeedZero(i)}`,
      index: i - 1,
    })
  }
  return dayList
}
//获取两日期之间日期列表函数
function getMiddle(stime, etime) {
  var middleData = [];
  var i = 0;
  while (stime <= etime) {
    var stime_ts = new Date(stime).getTime();
    var next_date = stime_ts + (24 * 60 * 60 * 1000);
    //拼接年月日，这里的月份会返回（0-11），所以要+1
    var next_dates_y = new Date(next_date).getFullYear() + '-';
    var next_dates_m = (new Date(next_date).getMonth() + 1 < 10) ? '0' + (new Date(next_date).getMonth() + 1) + '-' : (new Date(next_date).getMonth() + 1) + '-';
    var next_dates_d = (new Date(next_date).getDate() < 10) ? '0' + new Date(next_date).getDate() : new Date(next_date).getDate();
    stime = next_dates_y + next_dates_m + next_dates_d;
    i++;
    middleData.push(stime)
  }
  return middleData
}
function getDaysBetween(dateString1,dateString2){
  //获取起始时间的毫秒数  	 
  //其中dateString1.replace('/-/g','/')是将日期格式为yyyy-mm-dd转换成yyyy/mm/dd  
  //Date.parse()静态方法的返回值为1970年1月1日午时到当前字符串时间的毫秒数，返回值为整数  
	//如果传入的日期只包含年月日不包含时分秒，则默认取的毫秒数为yyyy/mm/dd 00:00:00  
	//取的是0时0分0秒的毫秒数，如果传入的是2015/07/03 12:20:12则取值为该时间点的毫秒数  
  var startDate=Date.parse(dateString1.replace('/-/g','/'));  
  var endDate=Date.parse(dateString2.replace('/-/g','/'));  
  //因为不传时分秒的时候 默认取值到dateString2的0时0分0秒时的毫秒数，这样就不包含当前天数的毫秒数  
  var diffDate=(endDate-startDate)+1*24*60*60*1000;  
  //计算出两个日期字符串之间的相差的天数  
  var days=diffDate/(1*24*60*60*1000); 
  return  days;
}

function formatDateTime(date) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  var minute = date.getMinutes();
  minute = minute < 10 ? ('0' + minute) : minute;
  return y + '-' + m + '-' + d;
}

// 时间戳转日期
function format(shijianchuo){
  //shijianchuo是整数，否则要parseInt转换
  var time = new Date(shijianchuo*1000);
  var y = time.getFullYear();
  var m = time.getMonth()+1;
  var d = time.getDate();
  var h = time.getHours();
  var mm = time.getMinutes();
  var s = time.getSeconds();
  m=m<10?'0'+m:m
  d=d<10?'0'+d:d
  return y+'-'+m+'-'+d;
}

module.exports = {
  menses, ovluate, ovluateDay, mlDay, theDayBefore,follicle,periodcome,oldovluate,oldmlDay,getNowDays,getMiddle,formatDateTime,format,getDaysBetween
}