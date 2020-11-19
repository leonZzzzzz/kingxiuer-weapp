// 判断用户是否登录
function islogin(){
  if ( !wx.getStorageSync('userType') || wx.getStorageSync('userType') == '1') {
    // if ( !config.mobile) {
      return false
    } else {
      return true
    }
}

function formatRichText(html){
  let newContent= html.replace(/\<img/gi, '<img style="max-width:100%;height:auto;display:block;"');
  return newContent;
}

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 获取当前日期的前后推移｛N｝的日期
 * date 传入的日期
 * day 推移日期
 * type 判断前向还是向后
 * @param {number} n 
 */

function dateInterval(date, day) {
  var now = new Date(date);
  now.setDate(now.getDate() + day);
  var array = [now.getFullYear(), now.getMonth() + 1, now.getDate()];
  if (array[1] <= 9) {
    array[1] = '0' + array[1]
  }
  if (array[2] <= 9) {
    array[2] = '0' + array[2]
  }
  return array.join('-');
}

/**
 * 获取两个日期的所有时间
 */
function getDateArray(sDate, eDate) {
  let bd = new Date(sDate), be = new Date(eDate);
  let bd_time = bd.getTime(), be_time = be.getTime(), time_diff = be_time - bd_time;
  let dateArray = [];
  for (let i = 0; i <= time_diff; i += 86400000) {
    let ds = new Date(bd_time + i);
    dateArray.push(ds.getFullYear() + '-' + isNeedZero((ds.getMonth() + 1)) + '-' + isNeedZero(ds.getDate()))
  }
  return dateArray;
}


/**判断是否闰年 */
function isLeapYear(year) {
  var cond1 = year % 4 == 0;  //条件1：年份必须要能被4整除
  var cond2 = year % 100 != 0;  //条件2：年份不能是整百数
  var cond3 = year % 400 == 0;  //条件3：年份是400的倍数
  //当条件1和条件2同时成立时，就肯定是闰年，所以条件1和条件2之间为“与”的关系。
  //如果条件1和条件2不能同时成立，但如果条件3能成立，则仍然是闰年。所以条件3与前2项为“或”的关系。
  //所以得出判断闰年的表达式：
  var cond = cond1 && cond2 || cond3;
  if (cond) {
    return true;
  } else {
    return false;
  }
}

/**
 * 获取不同月有多少天数
 * year 某一年
 * month 某一月
 * return Number
 */
const getMonthday = (year, month) => {
  let day = new Date(year, month, 0);
  if (isLeapYear(year) && month == 2) {
    return 29
  }
  return day.getDate()
}
/**
 * 当前月份的一号是星期几
 * year 某一年
 * month 某一月
 * return Number
 */
const getMonthFirstDay = (year, month) => {
  month -= 1;
  let day = new Date(year, month, 1);
  return day.getDay()
}

function newDate(type) {
  let nowDate = new Date();
  let [year, month, day, hour, minute, second] = [nowDate.getFullYear(), nowDate.getMonth() + 1, nowDate.getDate(), nowDate.getHours(), nowDate.getMinutes(), nowDate.getSeconds()];
  switch (type) {
    case "yyyy-MM-dd":
      return `${year}-${isNeedZero(month)}-${isNeedZero(day)}`
    case "yyyy-MM":
      return `${year}-${isNeedZero(month)}`
    case "hh:mm":
      return `${isNeedZero(hour)}:${isNeedZero(minute)}`
  }
}

function isNeedZero(num) {
  if (num < 10) {
    return '0' + num.toString()
  } else {
    return num
  }
}

// 防抖立即执行版--触发事件后函数会立即执行，然后 n 秒内不触发事件才能继续执行函数
function debounce(func,wait) {
  let timeout;
  return function () {
      const context = this;
      const args = [...arguments];
      if (timeout) clearTimeout(timeout);
      const callNow = !timeout;
      timeout = setTimeout(() => {
          timeout = null;
      }, wait)
      if (callNow) func.apply(context, args)
  }
}

// 节流
function throttle(func, wait) {
    let timeout;
    return function() {
        let context = this;
        let args = arguments;
        if (!timeout) {
            timeout = setTimeout(() => {
                timeout = null;
                func.apply(context, args)
            }, wait)
        }

    }
}

module.exports = {
  formatRichText,
  formatTime,
  getMonthday,
  getDateArray,
  dateInterval,
  getMonthFirstDay,
  newDate,
  isNeedZero,
  islogin,
  debounce,
  throttle
}
