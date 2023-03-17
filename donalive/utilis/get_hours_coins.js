function hoursAndCoins(data){
  let count=0;
  return new Promise((resolve,reject)=>{
    if(data.length==0){
      let dataTosend={coins:0,durations:"00:00:00",days:0};
      resolve(dataTosend);
    }
    else{
    let dataToSend={};
    let coin=0;
    let totalHours=0;
    let totalMinutes=0;
    let totalSeconds=0;
    let days=0;
    data.forEach(ele=>{
      let date1=new Date(ele.live_streaming_end_time);
      let  date2=new Date(ele.live_streaming_start_time);
      if( ele.live_streaming_end_time!=undefined && ele.live_streaming_start_time!=undefined){
        let distance = Math.abs(date1 - date2);
      const hours = Math.floor(distance / 3600000);
      distance -= hours * 3600000;
      const minutes = Math.floor(distance / 60000);
      distance -= minutes * 60000;
      const seconds = Math.floor(distance / 1000);
      if(hours==1||hours>1){
        days++;
      }
      totalHours+=hours;
      totalMinutes+=minutes;
      totalSeconds+=seconds;
      if(totalMinutes>=60){
        totalHours++;
        totalMinutes-=60;
      }
      else if(totalSeconds>=60){
        totalMinutes++;
        totalSeconds-=60;
      }
      coin+=ele.coins
      count++;
      if(data.length==count){
        dataToSend.coins=coin;
        dataToSend.durations=`${totalHours<10?'0'+totalHours:totalHours}:${totalMinutes<10?'0'+totalMinutes:totalMinutes}:${totalSeconds<10?'0'+totalSeconds:totalSeconds}`;
        dataToSend.days=days;
        resolve(dataToSend);
      }
      }else{
        count++;
        if(data.length==count){
          dataToSend.coins=coin;
          dataToSend.durations=`${totalHours<10?'0'+totalHours:totalHours}:${totalMinutes<10?'0'+totalMinutes:totalMinutes}:${totalSeconds<10?'0'+totalSeconds:totalSeconds}`;
          dataToSend.days=days;
          resolve(dataToSend);
        }
      }
    })
    }
  })
 }


 function PrevstartAndendDate(getDays){
  return new Promise((resolve,reject)=>{
    let startDay=new Date().toISOString();
    let time1= startDay.split('T');
    let time2=time1[0].split('-');
    time2[2]="01";
    let newTime2=time2.join('-');
    time1[0]=newTime2;
    startDay=time1.join('T');
   let lastDay;
    if(getDays==15){
      lastDay=new Date().toISOString();
      let time1= startDay.split('T');
      let time2=time1[0].split('-');
      time2[2]="15";
      let newTime2=time2.join('-');
      time1[0]=newTime2;
      lastDay=time1.join('T');
    }else if(getDays==30){
      startDay=new Date().toISOString();
    let time11= startDay.split('T');
    let time22=time11[0].split('-');
    time22[2]="01";
    // time22[1]="02";
    // console.log(time22)
    let newTime12=time22.join('-');
    time11[0]=newTime12;
    startDay=time11.join('T');
      lastDay=new Date().toISOString();
      let time1= startDay.split('T');
      let time2=time1[0].split('-');
      time2[2]="15";
      let newTime2=time2.join('-');
      time1[0]=newTime2;
      lastDay=time1.join('T');
    }else if(getDays=="monthly"){
      lastDay=new Date().toISOString();
      let time1= startDay.split('T');
      let time2=time1[0].split('-');
      time2[2]="30";
      let newTime2=time2.join('-');
      time1[0]=newTime2;
      lastDay=time1.join('T');
    }
    let days={startDay,lastDay}
    resolve(days);
  })
}


function startAndendDate(getDays){
  return new Promise((resolve,reject)=>{
    let startDay=new Date().toISOString();
    let time1= startDay.split('T');
    let time2=time1[0].split('-');
    time2[2]="01";
    let newTime2=time2.join('-');
    time1[0]=newTime2;
    startDay=time1.join('T');
   let lastDay;
    if(getDays==15){
      lastDay=new Date().toISOString();
      let time1= startDay.split('T');
      let time2=time1[0].split('-');
      time2[2]="15";
      let newTime2=time2.join('-');
      time1[0]=newTime2;
      lastDay=time1.join('T');
    }else if(getDays==30){
      startDay=new Date().toISOString();
    let time11= startDay.split('T');
    let time22=time11[0].split('-');
    time22[2]="15";
    let newTime12=time22.join('-');
    time11[0]=newTime12;
    startDay=time11.join('T');
      lastDay=new Date().toISOString();
      let time1= startDay.split('T');
      let time2=time1[0].split('-');
      time2[2]="30";
      let newTime2=time2.join('-');
      time1[0]=newTime2;
      lastDay=time1.join('T');
    }else if(getDays=="monthly"){
      lastDay=new Date().toISOString();
      let time1= startDay.split('T');
      let time2=time1[0].split('-');
      time2[2]="30";
      let newTime2=time2.join('-');
      time1[0]=newTime2;
      lastDay=time1.join('T');
    }
    let days={startDay,lastDay}
    resolve(days);
  })
}

function getTotal_salary(balance,data){
  // console.log("this is called");
  return new Promise((resolve,reject)=>{
    let tk1=0.00485;
    let tk2=0.0097;
    let temp=970;
    let day=Number(data.total_days);
    let hours=Number(data.total_hours.split(':')[0]);
    if(balance<350000){
      data.basic_pay=0;
      data.day_time_bonus=0;
      data.extra_coins=0;
      data.extra_coin_host=0;
      data.extra_coin_agency=0;
      data.two_round_host=0;
      data.agency_commision=0;
      data.host_total_bonus_salary=0;
      data.total_agency_commision=0;
      data.total_salary=0;
      resolve(data);
    }else if(balance>=350000&&balance<550000){
      let basic_pay=Math.floor((3.5*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-350000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-350000)*tk2)*0.20);
      let agency_commision=Math.floor((3.5*temp)*0.0958);
      data.basic_pay=basic_pay;
      if(day>=8 && hours>=10){
        data.day_time_bonus=Math.floor((3.5*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-350000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=550000&&balance<750000){
      let basic_pay=Math.floor((5.5*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-550000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-550000)*tk2)*0.20);
      let agency_commision=Math.floor((5.5*temp)*0.0958);
      data.basic_pay=basic_pay;
      if(day>=8 && hours>=10){
        data.day_time_bonus=Math.floor((5.5*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-550000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=750000&&balance<1150000){
      let basic_pay=Math.floor((7.5*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-750000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-750000)*tk2)*0.20);
      let agency_commision=Math.floor((7.5*temp)*0.0958);
      data.basic_pay=basic_pay;
      if(day>=8 && hours>=10){
        data.day_time_bonus=Math.floor((7.5*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-750000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=1150000&&balance<1650000){
      let basic_pay=Math.floor((11.5*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-1150000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-1150000)*tk2)*0.20);
      let agency_commision=Math.floor((11.5*temp)*0.12);
      data.basic_pay=basic_pay;
      if(day>=8 && hours>=10){
        data.day_time_bonus=Math.floor((11.5*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-1150000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }
    else if(balance>=1650000&&balance<2250000){
      let basic_pay=Math.floor((16.5*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-1650000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-1650000)*tk2)*0.20);
      let agency_commision=Math.floor((16.5*temp)*0.14);
      data.basic_pay=basic_pay;
      if(day>=7 && hours>=8){
        data.day_time_bonus=Math.floor((16.5*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-1650000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    } else if(balance>=2250000&&balance<2850000){
      let basic_pay=Math.floor((22.5*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-2250000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-2250000)*tk2)*0.20);
      let agency_commision=Math.floor((22.5*temp)*0.14);
      data.basic_pay=basic_pay;
      if(day>=7 && hours>=8){
        data.day_time_bonus=Math.floor((22.5*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-2250000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    } else if(balance>=2850000&&balance<3500000){
      let basic_pay=Math.floor((28.5*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-2850000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-2850000)*tk2)*0.20);
      let agency_commision=Math.floor((28.5*temp)*0.14);
      data.basic_pay=basic_pay;
      if(day>=7 && hours>=8){
        data.day_time_bonus=Math.floor((28.5*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-2850000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=3500000&&balance<4500000){
      let basic_pay=Math.floor((35.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-3500000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-3500000)*tk2)*0.20);
      let agency_commision=Math.floor((35.0*temp)*0.14);
      data.basic_pay=basic_pay;
      if(day>=7 && hours>=8){
        data.day_time_bonus=Math.floor((35.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-3500000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }
    else if(balance>=4500000&&balance<5500000){
      let basic_pay=Math.floor((45.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-4500000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-4500000)*tk2)*0.20);
      let agency_commision=Math.floor((45.0*temp)*0.14);
      data.basic_pay=basic_pay;
      if(day>=7 && hours>=7){
        data.day_time_bonus=Math.floor((45.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-4500000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=5500000&&balance<7000000){
      let basic_pay=Math.floor((55.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-5500000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-5500000)*tk2)*0.20);
      let agency_commision=Math.floor((55.0*temp)*0.14);
      data.basic_pay=basic_pay;
      if(day>=6 && hours>=7){
        data.day_time_bonus=Math.floor((55.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-5500000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=7000000&&balance<8500000){
      let basic_pay=Math.floor((70.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-7000000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-7000000)*tk2)*0.20);
      let agency_commision=Math.floor((70.0*temp)*0.14);
      data.basic_pay=basic_pay;
      if(day>=6 && hours>=7){
        data.day_time_bonus=Math.floor((70.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-7000000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=8500000&&balance<11000000){
      let basic_pay=Math.floor((85.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-8500000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-8500000)*tk2)*0.20);
      let agency_commision=Math.floor((85.0*temp)*0.16);
      data.basic_pay=basic_pay;
      if(day>=6 && hours>=6){
        data.day_time_bonus=Math.floor((85.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-8500000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=11000000&&balance<13500000){
      let basic_pay=Math.floor((110.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-11000000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-11000000)*tk2)*0.20);
      let agency_commision=Math.floor((110.0*temp)*0.16);
      data.basic_pay=basic_pay;
      if(day>=6 && hours>=6){
        data.day_time_bonus=Math.floor((100.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-11000000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=13500000&&balance<17000000){
      let basic_pay=Math.floor((135.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-13500000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-13500000)*tk2)*0.20);
      let agency_commision=Math.floor((135.0*temp)*0.16);
      data.basic_pay=basic_pay;
      if(day>=3 && hours>=5){
        data.day_time_bonus=Math.floor((135.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-13500000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=17000000&&balance<21000000){
      let basic_pay=Math.floor((170.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-17000000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-17000000)*tk2)*0.20);
      let agency_commision=Math.floor((170.0*temp)*0.16);
      data.basic_pay=basic_pay;
      if(day>=3 && hours>=5){
        data.day_time_bonus=Math.floor((170.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-17000000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=21000000&&balance<25000000){
      let basic_pay=Math.floor((210.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-21000000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-21000000)*tk2)*0.20);
      let agency_commision=Math.floor((210.0*temp)*0.16);
      data.basic_pay=basic_pay;
      if(day>=2 && hours>=4){
        data.day_time_bonus=Math.floor((210.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-21000000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=25000000&&balance<50000000){
      let basic_pay=Math.floor((250.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-25000000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-25000000)*tk2)*0.20);
      let agency_commision=Math.floor((250.0*temp)*0.16);
      data.basic_pay=basic_pay;
      if(day>=2 && hours>=4){
        data.day_time_bonus=Math.floor((250.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-25000000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=50000000&&balance<100000000){
      let basic_pay=Math.floor((500.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-50000000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-50000000)*tk2)*0.20);
      let agency_commision=Math.floor((500.0*temp)*0.16);
      data.basic_pay=basic_pay;
      if(day>=1 && hours>=3){
        data.day_time_bonus=Math.floor((500.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-50000000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }else if(balance>=100000000&&balance<200000000){
      let basic_pay=Math.floor((1000.0*temp)*0.53);
      let extra_coin_host=Math.floor(((balance-100000000)*tk2)*0.50);
      let extra_coin_agency=Math.floor(((balance-100000000)*tk2)*0.20);
      let agency_commision=Math.floor((1000.0*temp)*0.16);
      data.basic_pay=basic_pay;
      if(day>=1 && hours>=2){
        data.day_time_bonus=Math.floor((1000.0*temp)*0.21);
      }else{
        data.day_time_bonus=0;
      }
      data.extra_coins=balance-100000000;
      data.extra_coin_host=extra_coin_host;
      data.extra_coin_agency=extra_coin_agency;
      data.two_round_host=400;
      data.agency_commision=agency_commision;
      data.host_total_bonus_salary=basic_pay + extra_coin_host + 400 + data.day_time_bonus;
      data.total_agency_commision=agency_commision+extra_coin_agency;
      data.total_salary=basic_pay + extra_coin_host + extra_coin_agency + 400 + data.day_time_bonus + agency_commision;
      resolve(data);
    }
    else{
      resolve(data);
    }
  })
}


module.exports={hoursAndCoins,startAndendDate,getTotal_salary,PrevstartAndendDate};